#!/bin/bash
# Post-Reorganization Verification Script
# Feature: 002-organize-folder-structure
# Purpose: Verify successful folder structure reorganization

set -e  # Exit on any error

echo "======================================"
echo "Folder Structure Verification"
echo "======================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# FR-001: Migrations directory exists and has 10 files
echo "Checking FR-001: Migration files organization..."
if [ -d "phase-2-web/backend/app/migrations" ]; then
  COUNT=$(ls -1 phase-2-web/backend/app/migrations/*.py phase-2-web/backend/app/migrations/*.sql 2>/dev/null | wc -l)
  if [ "$COUNT" -eq 10 ]; then
    echo -e "${GREEN}✅ FR-001 PASS:${NC} 10 migration files in backend/app/migrations/"
  else
    echo -e "${RED}❌ FR-001 FAIL:${NC} Expected 10 migration files, found $COUNT"
    echo "   Files found:"
    ls -1 phase-2-web/backend/app/migrations/ 2>/dev/null || echo "   (none)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}❌ FR-001 FAIL:${NC} backend/app/migrations/ directory not found"
  ERRORS=$((ERRORS + 1))
fi

# Verify NO migration files in backend root
BACKEND_MIGRATIONS=$(ls -1 phase-2-web/backend/*.py 2>/dev/null | grep -i migration | wc -l)
if [ "$BACKEND_MIGRATIONS" -eq 0 ]; then
  echo -e "${GREEN}✅ SC-001 PASS:${NC} Zero migration files in backend root"
else
  echo -e "${RED}❌ SC-001 FAIL:${NC} Found $BACKEND_MIGRATIONS migration files in backend root (should be 0)"
  ls -1 phase-2-web/backend/*.py 2>/dev/null | grep -i migration
  ERRORS=$((ERRORS + 1))
fi

echo ""

# FR-002: Auth pages under (auth)/ route group
echo "Checking FR-002: Auth route consolidation..."
AUTH_PAGES_FOUND=0
AUTH_PAGES_EXPECTED=5  # login, register, callback, forgot-password, reset-password

if [ -d "phase-2-web/frontend/app/(auth)/login" ]; then
  AUTH_PAGES_FOUND=$((AUTH_PAGES_FOUND + 1))
fi
if [ -d "phase-2-web/frontend/app/(auth)/register" ]; then
  AUTH_PAGES_FOUND=$((AUTH_PAGES_FOUND + 1))
fi
if [ -d "phase-2-web/frontend/app/(auth)/callback" ]; then
  AUTH_PAGES_FOUND=$((AUTH_PAGES_FOUND + 1))
fi
if [ -d "phase-2-web/frontend/app/(auth)/forgot-password" ]; then
  AUTH_PAGES_FOUND=$((AUTH_PAGES_FOUND + 1))
fi
if [ -d "phase-2-web/frontend/app/(auth)/reset-password" ]; then
  AUTH_PAGES_FOUND=$((AUTH_PAGES_FOUND + 1))
fi

if [ "$AUTH_PAGES_FOUND" -eq "$AUTH_PAGES_EXPECTED" ]; then
  echo -e "${GREEN}✅ FR-002 PASS:${NC} All $AUTH_PAGES_EXPECTED auth pages under (auth)/ route group"
else
  echo -e "${RED}❌ FR-002 FAIL:${NC} Expected $AUTH_PAGES_EXPECTED auth pages, found $AUTH_PAGES_FOUND"
  echo "   Pages found in (auth)/:"
  ls -1d phase-2-web/frontend/app/\(auth\)/*/ 2>/dev/null || echo "   (none)"
  ERRORS=$((ERRORS + 1))
fi

# Verify NO duplicate auth directory
if [ -d "phase-2-web/frontend/app/auth" ]; then
  echo -e "${RED}❌ FR-002 FAIL:${NC} Duplicate /app/auth/ directory still exists (should be removed)"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ FR-002 PASS:${NC} No duplicate auth directory"
fi

# Verify forgot-password and reset-password NOT at root
if [ -d "phase-2-web/frontend/app/forgot-password" ] || [ -d "phase-2-web/frontend/app/reset-password" ]; then
  echo -e "${RED}❌ FR-002 FAIL:${NC} Auth pages still at root level (should be in (auth)/)"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ SC-002 PASS:${NC} No auth pages at root level"
fi

echo ""

# FR-003: Documentation in /docs/
echo "Checking FR-003: Documentation centralization..."
DOCS_FOUND=0
if [ -f "phase-2-web/docs/BETTER_AUTH_SETUP.md" ]; then
  DOCS_FOUND=$((DOCS_FOUND + 1))
fi
if [ -f "phase-2-web/docs/BETTER_AUTH_QUICK_REFERENCE.md" ]; then
  DOCS_FOUND=$((DOCS_FOUND + 1))
fi

if [ "$DOCS_FOUND" -eq 2 ]; then
  echo -e "${GREEN}✅ FR-003 PASS:${NC} Documentation files in /docs/"
  echo -e "${GREEN}✅ SC-003 PASS:${NC} All documentation centralized"
else
  echo -e "${RED}❌ FR-003 FAIL:${NC} Expected 2 doc files in /docs/, found $DOCS_FOUND"
  ERRORS=$((ERRORS + 1))
fi

# Verify docs NOT in frontend root
if [ -f "phase-2-web/frontend/BETTER_AUTH_SETUP.md" ] || [ -f "phase-2-web/frontend/BETTER_AUTH_QUICK_REFERENCE.md" ]; then
  echo -e "${RED}❌ FR-003 FAIL:${NC} Documentation still in frontend root (should be in /docs/)"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# FR-005: .gitignore updated
echo "Checking FR-005: .gitignore configuration..."
if grep -q "^\*.log" .gitignore && grep -q "Zone\.Identifier" .gitignore; then
  echo -e "${GREEN}✅ FR-005 PASS:${NC} .gitignore excludes log files and OS artifacts"
  echo -e "${GREEN}✅ SC-005 PASS:${NC} Repository cleanup rules in place"
else
  echo -e "${RED}❌ FR-005 FAIL:${NC} .gitignore missing log file or OS artifact patterns"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# FR-004: Component naming clarity
echo "Checking FR-004: Component naming..."
if [ -f "phase-2-web/frontend/components/TaskListOld.tsx" ] && [ -f "phase-2-web/frontend/components/TasksList.tsx" ]; then
  echo -e "${GREEN}✅ FR-004 PASS:${NC} Component naming clarified (TaskListOld + TasksList)"
elif [ ! -f "phase-2-web/frontend/components/TaskList.tsx" ] && [ -f "phase-2-web/frontend/components/TasksList.tsx" ]; then
  echo -e "${GREEN}✅ FR-004 PASS:${NC} TaskList removed, TasksList is canonical"
else
  echo -e "${YELLOW}⚠️  FR-004 WARNING:${NC} Component naming may need review"
  echo "   TaskList.tsx exists: $([ -f "phase-2-web/frontend/components/TaskList.tsx" ] && echo "yes" || echo "no")"
  echo "   TaskListOld.tsx exists: $([ -f "phase-2-web/frontend/components/TaskListOld.tsx" ] && echo "yes" || echo "no")"
  echo "   TasksList.tsx exists: $([ -f "phase-2-web/frontend/components/TasksList.tsx" ] && echo "yes" || echo "no")"
fi

echo ""

# TypeScript Build Verification
echo "Checking SC-006: Frontend build verification..."
echo "Running: cd phase-2-web/frontend && npm run build"
cd phase-2-web/frontend
if npm run build > /tmp/build-output.log 2>&1; then
  echo -e "${GREEN}✅ SC-006 PASS:${NC} Frontend build succeeds (npm run build exit code 0)"
  echo -e "${GREEN}✅ Import Verification:${NC} No broken import statements"
else
  echo -e "${RED}❌ SC-006 FAIL:${NC} Frontend build failed"
  echo "   Build output:"
  tail -20 /tmp/build-output.log
  ERRORS=$((ERRORS + 1))
fi
cd - > /dev/null

echo ""

# Git History Verification
echo "Checking git history preservation..."
SAMPLE_FILE="phase-2-web/backend/app/migrations/add_categories_migration.py"
if [ -f "$SAMPLE_FILE" ]; then
  HISTORY_COUNT=$(git log --follow --oneline "$SAMPLE_FILE" 2>/dev/null | wc -l)
  if [ "$HISTORY_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Git History:${NC} File history preserved (git log --follow works)"
  else
    echo -e "${YELLOW}⚠️  Git History:${NC} No history found for sample file (may not be committed yet)"
  fi
else
  echo -e "${YELLOW}⚠️  Git History:${NC} Sample file not found for history check"
fi

echo ""
echo "======================================"
echo "Verification Summary"
echo "======================================"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo ""
  echo "Project structure is now constitution-compliant:"
  echo "  ✅ Migration files organized"
  echo "  ✅ Auth routes consolidated"
  echo "  ✅ Documentation centralized"
  echo "  ✅ .gitignore configured"
  echo "  ✅ Build succeeds"
  echo ""
  exit 0
else
  echo -e "${RED}❌ $ERRORS CHECK(S) FAILED${NC}"
  echo ""
  echo "Please review errors above and fix before proceeding."
  echo ""
  exit 1
fi
