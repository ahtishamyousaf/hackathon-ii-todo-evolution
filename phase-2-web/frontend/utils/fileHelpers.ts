/**
 * File helper utilities for file attachments.
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return '📄';
    case 'doc': case 'docx': return '📝';
    case 'xls': case 'xlsx': return '📊';
    case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
    case 'zip': case 'rar': return '📦';
    default: return '📎';
  }
}

export function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc', '.docx', '.pdf', '.txt', '.jpg', '.jpeg', '.png', '.gif'
];
