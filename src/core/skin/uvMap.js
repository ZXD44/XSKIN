/**
 * Minecraft Skin UV Coordinate Mapping
 * Dynamically maps UV bounds for inner layers, outer layers, and natural void regions.
 * Supports standard 64x64 up to 4096x4096 HD resolutions.
 */

/**
 * Calculate UV bounds for inner and outer layers of Minecraft skin parts
 * @param {number} resolution
 */
export function getPartUVRectangles(resolution) {
  const t = resolution / 64;
  const r = (x, y, w, h) => ({
    x: Math.round(x * t),
    y: Math.round(y * t),
    w: Math.round(w * t),
    h: Math.round(h * t)
  });

  return {
    head: [
      r(0, 0, 32, 16),   // Head Base (Inner)
      r(32, 0, 32, 16)   // Head Hat (Outer Layer)
    ],
    body: [
      r(16, 16, 24, 16), // Body Base (Inner)
      r(16, 32, 24, 16)  // Body Jacket (Outer Layer)
    ],
    arms: [
      r(40, 16, 16, 16), // Right Arm Base
      r(40, 32, 16, 16), // Right Arm Sleeve (Outer)
      r(32, 48, 16, 16), // Left Arm Base
      r(48, 48, 16, 16)  // Left Arm Sleeve (Outer)
    ],
    legs: [
      r(0, 16, 16, 16),  // Right Leg Base
      r(0, 32, 16, 16),  // Right Leg Pants (Outer)
      r(16, 48, 16, 16), // Left Leg Base
      r(0, 48, 16, 16)   // Left Leg Pants (Outer)
    ]
  };
}

/**
 * Erase parts in-place on a 2D Canvas context or pixel data
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} resolution
 * @param {{ head: boolean, body: boolean, arms: boolean, legs: boolean }} partsToKeep
 */
export function applyPartClippingToContext(ctx, resolution, partsToKeep) {
  const rects = getPartUVRectangles(resolution);

  if (!partsToKeep.head) {
    rects.head.forEach(box => ctx.clearRect(box.x, box.y, box.w, box.h));
  }
  if (!partsToKeep.body) {
    rects.body.forEach(box => ctx.clearRect(box.x, box.y, box.w, box.h));
  }
  if (!partsToKeep.arms) {
    rects.arms.forEach(box => ctx.clearRect(box.x, box.y, box.w, box.h));
  }
  if (!partsToKeep.legs) {
    rects.legs.forEach(box => ctx.clearRect(box.x, box.y, box.w, box.h));
  }
}

/**
 * Calculate UV bounds for Minecraft Outer (Overlay) layers
 * @param {number} resolution
 */
export function getOuterLayerUVRectangles(resolution) {
  const t = resolution / 64;
  const r = (x, y, w, h) => ({
    x: Math.round(x * t),
    y: Math.round(y * t),
    w: Math.round(w * t),
    h: Math.round(h * t)
  });

  return [
    r(32, 0, 32, 16),  // Head Hat (Outer Layer)
    r(16, 32, 24, 16), // Body Jacket (Outer Layer)
    r(40, 32, 16, 16), // Right Arm Sleeve (Outer Layer)
    r(48, 48, 16, 16), // Left Arm Sleeve (Outer Layer)
    r(0, 32, 16, 16),  // Right Leg Pants (Outer Layer)
    r(0, 48, 16, 16)   // Left Leg Pants (Outer Layer)
  ];
}

/**
 * Calculate UV bounds for naturally unused void regions in Minecraft skins
 * @param {number} resolution
 */
export function getVoidUVRectangles(resolution) {
  const t = resolution / 64;
  const r = (x, y, w, h) => ({
    x: Math.round(x * t),
    y: Math.round(y * t),
    w: Math.round(w * t),
    h: Math.round(h * t)
  });

  return [
    r(0, 0, 8, 8),     // Head Base top-left void
    r(24, 0, 8, 8),    // Head Base top-right void
    r(32, 0, 8, 8),    // Hat top-left void
    r(56, 0, 8, 8),    // Hat top-right void
    r(56, 16, 8, 32),  // 8x32 natural unused strip on right
    r(0, 16, 4, 4),    // Right leg unused top-left
    r(12, 16, 4, 4),   // Right leg unused top-right
    r(40, 16, 4, 4),   // Right arm unused top-left
    r(52, 16, 4, 4),   // Right arm unused top-right
    r(0, 32, 4, 4),    // Right pants unused
    r(12, 32, 4, 4),   // Right pants unused
    r(40, 32, 4, 4),   // Right sleeve unused
    r(52, 32, 4, 4),   // Right sleeve unused
    r(0, 48, 4, 4),    // Left pants unused
    r(12, 48, 4, 4),   // Left pants unused
    r(16, 48, 4, 4),   // Left leg unused
    r(28, 48, 4, 4),   // Left leg unused
    r(32, 48, 4, 4),   // Left arm unused
    r(44, 48, 4, 4),   // Left arm unused
    r(48, 48, 4, 4),   // Left sleeve unused
    r(60, 48, 4, 4)    // Left sleeve unused
  ];
}
