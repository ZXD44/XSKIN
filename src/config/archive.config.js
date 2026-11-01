/**
 * Archive & Security Configuration
 * SafeZip archive boundaries, size limits, and UUID regex patterns.
 */

export const ARCHIVE_LIMITS = {
  MAX_ARCHIVE_SIZE: 25 * 1024 * 1024,        // 25 MB
  MAX_FILE_COUNT: 250,                      // max 250 files
  MAX_TOTAL_UNCOMPRESSED: 50 * 1024 * 1024, // 50 MB
  MAX_SINGLE_FILE_SIZE: 15 * 1024 * 1024,   // 15 MB
  MAX_JSON_SIZE: 2 * 1024 * 1024            // 2 MB
};

export const ALLOWED_EXTENSIONS = [
  '.png', '.json', '.lang', '.tga', '.material', '.txt'
];

export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
