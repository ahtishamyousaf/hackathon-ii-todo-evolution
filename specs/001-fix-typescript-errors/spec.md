# Feature Specification: TypeScript Build Errors Resolution

**Feature Branch**: `001-fix-typescript-errors`
**Created**: 2025-12-23
**Status**: Completed
**Type**: Technical Debt / Bug Fix
**Input**: User description: "TypeScript Build Errors Resolution - Fixed OAuth callback, API client types, recurring tasks types, and missing pg types"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developers Can Build Frontend Successfully (Priority: P1)

As a developer working on Phase II, I need the Next.js frontend to build without TypeScript errors so that I can deploy the application and verify my work.

**Why this priority**: Without a successful build, the application cannot be deployed, tested, or demonstrated. This blocks all development progress.

**Independent Test**: Run `npm run build` in the frontend directory. Success = zero TypeScript compilation errors, build completes successfully with production-ready output.

**Acceptance Scenarios**:

1. **Given** I'm in the frontend directory, **When** I run `npm run build`, **Then** the build completes with exit code 0 and no TypeScript errors
2. **Given** I've made changes to the codebase, **When** I run the build command, **Then** all type errors are caught at compile time (not runtime)
3. **Given** TypeScript strict mode is enabled, **When** I build the project, **Then** no implicit any types or missing type definitions cause failures

---

### User Story 2 - OAuth Callback Works Without Type Errors (Priority: P1)

As a developer implementing OAuth authentication, I need the OAuth callback handler to be type-safe so that authentication flows work correctly without runtime errors.

**Why this priority**: Authentication is a core feature. Type errors in authentication code can lead to security vulnerabilities and runtime failures.

**Independent Test**: Navigate to the OAuth callback page after authentication. Success = page loads without errors, proper type checking in IDE/compiler.

**Acceptance Scenarios**:

1. **Given** a user completes OAuth authentication, **When** they're redirected to /auth/callback, **Then** the callback handler processes the token without type errors
2. **Given** Better Auth manages authentication state, **When** the callback tries to set auth state, **Then** TypeScript prevents accessing non-existent methods like `setIsAuthenticated`
3. **Given** the callback receives a valid token, **When** storing it for API calls, **Then** all type contracts are satisfied

---

### User Story 3 - API Client Has Proper Type Safety (Priority: P1)

As a developer using the API client, I need proper TypeScript types for headers so that API requests are type-safe and maintainable.

**Why this priority**: The API client is used throughout the application. Type errors here propagate to every feature that makes API calls.

**Independent Test**: Make an authenticated API call using the API client. Success = request headers are properly typed, no TypeScript errors.

**Acceptance Scenarios**:

1. **Given** I'm making an authenticated API request, **When** setting the Authorization header, **Then** TypeScript accepts the header assignment without errors
2. **Given** the API client uses `HeadersInit` type, **When** adding custom headers, **Then** the type system correctly validates header keys and values
3. **Given** I'm using the API client methods, **When** IDE provides autocomplete, **Then** all available methods and their signatures are correctly typed

---

### User Story 4 - Recurring Tasks Have Type-Safe Pattern Handling (Priority: P2)

As a developer working with recurring tasks, I need proper type validation for recurrence patterns so that only valid patterns are processed.

**Why this priority**: Incorrect recurrence patterns could cause runtime errors when generating next task instances. Type safety prevents invalid data.

**Independent Test**: Create a recurring task and mark it complete. Success = next instance is generated with properly typed recurrence pattern.

**Acceptance Scenarios**:

1. **Given** a task has a recurrence pattern from the database, **When** generating the next instance, **Then** TypeScript validates the pattern is one of: daily, weekly, monthly, yearly
2. **Given** an invalid recurrence pattern, **When** attempting to process it, **Then** TypeScript compilation fails with clear error message
3. **Given** the recurrence utility function, **When** called with a pattern string, **Then** TypeScript ensures type safety through validation and casting

---

### User Story 5 - PostgreSQL Types Are Available (Priority: P2)

As a developer using Better Auth with PostgreSQL, I need TypeScript definitions for the `pg` module so that database connection code is type-safe.

**Why this priority**: Missing type definitions cause TypeScript to fall back to `any` types, reducing type safety for all database operations.

**Independent Test**: Import `Pool` from `pg` in `lib/auth.ts`. Success = no TypeScript errors, full IntelliSense support for pg types.

**Acceptance Scenarios**:

1. **Given** I'm importing from the `pg` module, **When** TypeScript compiles the code, **Then** all imports have proper type definitions
2. **Given** I'm creating a new Pool instance, **When** passing configuration, **Then** TypeScript validates the config object structure
3. **Given** I'm using Pool methods, **When** writing database code, **Then** IDE provides accurate autocomplete and type checking

---

### Edge Cases

- What happens when a developer adds new code that violates these type constraints?
  - Build will fail with clear TypeScript error messages
  - CI/CD pipeline will catch the error before deployment

- How does the system handle future updates to type definitions?
  - Package.json tracks @types packages with specific versions
  - Regular dependency updates will be type-checked during build

- What if OAuth flow changes and setIsAuthenticated is actually needed?
  - Better Auth's session hook manages state automatically
  - If needed, AuthContext interface must be updated to include the method

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Frontend build MUST complete without TypeScript compilation errors
- **FR-002**: OAuth callback page MUST work with Better Auth's automatic session management (no manual setIsAuthenticated)
- **FR-003**: API client MUST use properly typed headers (Record<string, string> instead of HeadersInit) for Authorization header assignment
- **FR-004**: Recurring task pattern validation MUST enforce type safety with explicit casting to union type: "daily" | "weekly" | "monthly" | "yearly"
- **FR-005**: PostgreSQL type definitions (@types/pg) MUST be installed as dev dependency for Better Auth database integration
- **FR-006**: All fixed type errors MUST not regress (enforced by TypeScript strict mode)

### Key Entities *(technical debt - no new entities)*

This is a technical debt feature fixing type errors in existing code. No new entities are introduced. The following existing code areas were affected:

- **OAuth Callback Handler** (`app/auth/callback/page.tsx`): Removed invalid method call
- **API Client** (`lib/api.ts`): Updated header type from HeadersInit to Record<string, string>
- **Recurring Tasks Utility** (`utils/recurringTasks.ts`): Added type validation and casting for recurrence patterns
- **Build Configuration** (`package.json`): Added @types/pg dev dependency

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Frontend build completes in under 2 minutes with zero TypeScript errors (verified by `npm run build` exit code 0)
- **SC-002**: All 13 route pages compile successfully (verified in Next.js build output)
- **SC-003**: TypeScript strict mode remains enabled with no type violations (verified in tsconfig.json and successful build)
- **SC-004**: 100% of API client method signatures are properly typed (verified by IDE type checking and successful build)
- **SC-005**: Developer experience improves with accurate IntelliSense for pg module (verified by IDE autocomplete working)

## Scope *(mandatory)*

### In Scope

- Fix TypeScript compilation errors blocking frontend build
- Update OAuth callback to work with Better Auth's session management
- Correct API client header types for proper type safety
- Add type validation for recurring task patterns
- Install missing PostgreSQL type definitions
- Ensure all fixes maintain existing functionality

### Out of Scope

- Refactoring unrelated code
- Adding new features
- Updating Better Auth version
- Changing authentication flow logic
- Modifying recurring tasks business logic
- Database schema changes

## Implementation Notes *(optional but recommended)*

### Technical Context

This feature resolves TypeScript build errors introduced during Phase II development. The errors were discovered when attempting to create a production build, which revealed:

1. **OAuth Callback Error**: Attempted to use `setIsAuthenticated()` method that doesn't exist in AuthContext because Better Auth manages state automatically
2. **API Client Error**: HeadersInit type doesn't support string index assignment for the Authorization header
3. **Recurring Tasks Error**: Database returns string type for recurrence_pattern, but function expects literal union type
4. **Missing Types Error**: @types/pg package wasn't installed, causing implicit any types for PostgreSQL imports

### Why These Fixes Matter

- **Build Pipeline**: Enables CI/CD pipeline to build and deploy the application
- **Type Safety**: Prevents runtime errors by catching type mismatches at compile time
- **Developer Experience**: Provides accurate IntelliSense and autocomplete in IDEs
- **Code Quality**: Maintains TypeScript strict mode benefits throughout the codebase
- **Future-Proofing**: Ensures type safety for all future development on this codebase

## Assumptions *(optional but recommended)*

1. Better Auth v1.4.7 correctly manages authentication state through its session hook
2. Record<string, string> type is sufficient for all current and planned API headers
3. Recurring task patterns will only ever be: daily, weekly, monthly, yearly
4. @types/pg version compatible with current pg version is available in npm registry
5. No other type errors exist in the codebase beyond these four issues
6. TypeScript strict mode should remain enabled (not downgraded to fix errors)

## Dependencies *(optional but recommended)*

### Technical Dependencies

- **Better Auth v1.4.7**: OAuth callback must align with Better Auth's session management patterns
- **TypeScript 5+**: Strict type checking that caught these errors
- **@types/pg**: Required for type-safe PostgreSQL operations in Better Auth config
- **Next.js 16**: Build system that enforces TypeScript compilation

### Knowledge Dependencies

- Understanding of Better Auth session management (why setIsAuthenticated isn't needed)
- TypeScript type system (Record types, union types, type assertions)
- Next.js build process (how TypeScript errors block production builds)

## Risks & Mitigations *(optional but recommended)*

### Risks

1. **Risk**: Type casting for recurrence patterns could hide bugs if invalid patterns exist in database
   **Mitigation**: Added validation check before casting, throws error for invalid patterns

2. **Risk**: Changing header types might break existing API calls
   **Mitigation**: Record<string, string> is compatible with all current usage, tested all API endpoints

3. **Risk**: Removing setIsAuthenticated might break OAuth flow
   **Mitigation**: Better Auth automatically manages state, tested OAuth authentication flow works

4. **Risk**: Missing @types packages might exist for other dependencies
   **Mitigation**: Full build verifies all type definitions are present

## References *(optional but recommended)*

### Documentation

- [Better Auth Session Management](https://better-auth.com/docs/session-management)
- [TypeScript Handbook - Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [Next.js TypeScript Configuration](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

### Related Specifications

- Phase II Constitution: `phase-2-web/constitution.md` - See Principle V (Clean Code Standards)
- Better Auth Setup Guide: `phase-2-web/frontend/BETTER_AUTH_SETUP.md`

### Code Changes

All fixes made in branch `001-fix-typescript-errors`:
1. `app/auth/callback/page.tsx`: Removed `useAuth` import and `setIsAuthenticated` call
2. `lib/api.ts`: Changed headers type from `HeadersInit` to `Record<string, string>`
3. `utils/recurringTasks.ts`: Added pattern validation and type assertion
4. `package.json`: Added `@types/pg` to devDependencies

---

**Status Update**: This specification documents work that was completed during initial testing. All fixes have been implemented and verified through successful production build.
