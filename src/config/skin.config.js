/**
 * Skin Configuration & Pixel Mathematics
 * Resolution limits, standard UV sizes, and alpha inference defaults.
 */

export const SKIN_RESOLUTIONS = {
  STANDARD: 64,
  LEGACY_HEIGHT: 32,
  MIN: 32,
  MAX: 4096,
  SUPPORTED_HD: [64, 128, 192, 256, 320, 384, 448, 512, 1024, 2048, 4096]
};

export const ALPHA_CONFIG = {
  DEFAULT_TOLERANCE: 28,
  OPAQUE_THRESHOLD: 180,
  TRANSPARENT_THRESHOLD: 50,
  DOMINANT_CLUSTER_DISTANCE: 38,
  VOID_SAMPLE_POINTS: [
    [0, 0], [1, 0], [2, 1], [33, 1], [58, 1],
    [58, 20], [62, 25], [60, 40], [2, 18], [58, 45]
  ]
};
