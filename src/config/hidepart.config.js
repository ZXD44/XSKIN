/**
 * Configuration and presets for Hidepart Editor (สกินล่องหน)
 */
export const HIDEPART_PRESETS = {
  all: { head: true, body: true, arms: true, legs: true },
  'head-only': { head: true, body: false, arms: false, legs: false },
  'hide-all': { head: false, body: false, arms: false, legs: false },
  'hide-arms-legs': { head: true, body: true, arms: false, legs: false },
  'body-only': { head: false, body: true, arms: false, legs: false },
  'hide-head': { head: false, body: true, arms: true, legs: true },
  'hide-body': { head: true, body: false, arms: true, legs: true }
};

export const VIEWER_CONFIG = {
  CAMERA_Z: 70,
  DEFAULT_WIDTH: 320,
  DEFAULT_HEIGHT: 300,
  WALK_SPEED: 0.6,
  RUN_SPEED: 0.8
};
