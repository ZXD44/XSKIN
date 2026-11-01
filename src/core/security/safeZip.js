/**
 * Safe ZIP Archive Loader and Inspector
 * Prevents zip bombs, memory exhaustion, path traversal, and malformed files.
 */
import JSZip from 'jszip';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { ARCHIVE_LIMITS, ALLOWED_EXTENSIONS } from '../../config/archive.config.js';

export { ARCHIVE_LIMITS, ALLOWED_EXTENSIONS };

/**
 * Validate path against directory traversal and dangerous characters
 */
export function validateEntryPath(name) {
  if (!name || typeof name !== 'string') {
    throw new AppError(ErrorCode.IMPORT_PATH_TRAVERSAL, { path: name });
  }

  // Normalize backslashes
  const normalized = name.replace(/\\/g, '/');

  // Prevent path traversal
  if (
    normalized.includes('../') ||
    normalized.includes('/..') ||
    normalized === '..' ||
    normalized.startsWith('/') ||
    /^[a-zA-Z]:/.test(normalized) || // Windows drive letter
    normalized.includes('\0')
  ) {
    throw new AppError(ErrorCode.IMPORT_PATH_TRAVERSAL, { path: name });
  }

  return normalized;
}

/**
 * Safely load and inspect a zip archive with strict bounds checking
 * @param {ArrayBuffer|Blob|File} data
 * @param {Object} options custom limit overrides
 * @returns {Promise<JSZip>} loaded JSZip instance
 */
export async function loadSafeArchive(data, options = {}) {
  const limits = { ...ARCHIVE_LIMITS, ...options };

  // 1. Check input size
  const byteLength = typeof data.byteLength === 'number'
    ? data.byteLength
    : (typeof data.size === 'number' ? data.size : 0);

  if (byteLength === 0) {
    throw new AppError(ErrorCode.IMPORT_EMPTY_FILE);
  }
  if (byteLength > limits.MAX_ARCHIVE_SIZE) {
    throw new AppError(ErrorCode.IMPORT_FILE_TOO_LARGE, {
      size: byteLength,
      max: limits.MAX_ARCHIVE_SIZE
    });
  }

  const arrayBuffer = data instanceof ArrayBuffer
    ? data
    : (ArrayBuffer.isView(data)
      ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      : await data.arrayBuffer());

  // 2. Load into JSZip
  let zip;
  try {
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch (err) {
    throw new AppError(ErrorCode.IMPORT_INVALID_IMAGE, { error: err.message }, 'ไม่สามารถเปิดอ่านไฟล์บีบอัดได้ ไฟล์อาจเสียหาย');
  }

  // 3. Inspect entries
  const entries = Object.values(zip.files);
  if (entries.length > limits.MAX_FILE_COUNT) {
    throw new AppError(ErrorCode.IMPORT_TOO_MANY_FILES, {
      count: entries.length,
      max: limits.MAX_FILE_COUNT
    });
  }

  let totalUncompressed = 0;
  for (const entry of entries) {
    // Validate entry path
    validateEntryPath(entry.name);

    if (entry.dir) continue;

    const entryUncompressed = entry._data?.uncompressedSize || 0;
    if (entryUncompressed > limits.MAX_SINGLE_FILE_SIZE) {
      throw new AppError(ErrorCode.IMPORT_TOTAL_SIZE_EXCEEDED, {
        file: entry.name,
        size: entryUncompressed,
        max: limits.MAX_SINGLE_FILE_SIZE
      });
    }

    totalUncompressed += entryUncompressed;
    if (totalUncompressed > limits.MAX_TOTAL_UNCOMPRESSED) {
      throw new AppError(ErrorCode.IMPORT_TOTAL_SIZE_EXCEEDED, {
        total: totalUncompressed,
        max: limits.MAX_TOTAL_UNCOMPRESSED
      });
    }
  }

  return zip;
}
