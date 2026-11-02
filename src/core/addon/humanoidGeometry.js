/**
 * Standard Bedrock Humanoid Geometry Generator
 * Generates genuine Minecraft Bedrock 1.12.0+ humanoid player geometry (Steve & Alex)
 * for wearable attachables, ensuring 100% compatibility without black box glitches.
 */

export function getHumanoidBones(isSlim = false, inflateOffset = 0) {
  const armWidth = isSlim ? 3 : 4;
  const armPivotX = 5;
  const armPivotY = isSlim ? 21.5 : 22;
  const rightArmOriginX = isSlim ? -7 : -8;
  const leftArmOriginX = 4;

  const innerBody = { origin: [-4, 12, -2], size: [8, 12, 4], uv: [16, 16] };
  if (inflateOffset > 0) innerBody.inflate = +inflateOffset.toFixed(3);

  const innerHead = { origin: [-4, 24, -4], size: [8, 8, 8], uv: [0, 0] };
  if (inflateOffset > 0) innerHead.inflate = +inflateOffset.toFixed(3);

  const innerRightArm = { origin: [rightArmOriginX, 12, -2], size: [armWidth, 12, 4], uv: [40, 16] };
  if (inflateOffset > 0) innerRightArm.inflate = +inflateOffset.toFixed(3);

  const innerLeftArm = { origin: [leftArmOriginX, 12, -2], size: [armWidth, 12, 4], uv: [32, 48] };
  if (inflateOffset > 0) innerLeftArm.inflate = +inflateOffset.toFixed(3);

  const innerRightLeg = { origin: [-3.9, 0, -2], size: [4, 12, 4], uv: [0, 16] };
  if (inflateOffset > 0) innerRightLeg.inflate = +inflateOffset.toFixed(3);

  const innerLeftLeg = { origin: [-0.1, 0, -2], size: [4, 12, 4], uv: [16, 48] };
  if (inflateOffset > 0) innerLeftLeg.inflate = +inflateOffset.toFixed(3);

  return [
    { name: 'root', pivot: [0, 0, 0] },
    { name: 'waist', parent: 'root', pivot: [0, 12, 0] },
    {
      name: 'body',
      parent: 'waist',
      pivot: [0, 24, 0],
      cubes: [
        innerBody,
        { origin: [-4, 12, -2], size: [8, 12, 4], inflate: +(0.25 + inflateOffset).toFixed(3), uv: [16, 32] }
      ]
    },
    {
      name: 'head',
      parent: 'body',
      pivot: [0, 24, 0],
      cubes: [
        innerHead
      ]
    },
    {
      name: 'hat',
      parent: 'head',
      pivot: [0, 24, 0],
      cubes: [
        { origin: [-4, 24, -4], size: [8, 8, 8], inflate: +(0.5 + inflateOffset).toFixed(3), uv: [32, 0] }
      ]
    },
    {
      name: 'rightArm',
      parent: 'body',
      pivot: [-armPivotX, armPivotY, 0],
      cubes: [
        innerRightArm,
        { origin: [rightArmOriginX, 12, -2], size: [armWidth, 12, 4], inflate: +(0.25 + inflateOffset).toFixed(3), uv: [40, 32] }
      ]
    },
    {
      name: 'leftArm',
      parent: 'body',
      pivot: [armPivotX, armPivotY, 0],
      cubes: [
        innerLeftArm,
        { origin: [leftArmOriginX, 12, -2], size: [armWidth, 12, 4], inflate: +(0.25 + inflateOffset).toFixed(3), uv: [48, 48] }
      ]
    },
    {
      name: 'rightLeg',
      parent: 'root',
      pivot: [-1.9, 12, 0],
      cubes: [
        innerRightLeg,
        { origin: [-3.9, 0, -2], size: [4, 12, 4], inflate: +(0.25 + inflateOffset).toFixed(3), uv: [0, 32] }
      ]
    },
    {
      name: 'leftLeg',
      parent: 'root',
      pivot: [1.9, 12, 0],
      cubes: [
        innerLeftLeg,
        { origin: [-0.1, 0, -2], size: [4, 12, 4], inflate: +(0.25 + inflateOffset).toFixed(3), uv: [0, 48] }
      ]
    }
  ];
}

/**
 * Returns complete Bedrock 1.12.0+ geometry containing both Steve and Alex models
 * @param {number} [inflateOffset=0] optional inflation offset (e.g. 0.05) to prevent z-fighting with player skin
 */
export function getStandardHumanoidGeometryJson(inflateOffset = 0) {
  return {
    format_version: '1.12.0',
    'minecraft:geometry': [
      {
        description: {
          identifier: 'geometry.humanoid.custom',
          texture_width: 64,
          texture_height: 64,
          visible_bounds_width: 3,
          visible_bounds_height: 3,
          visible_bounds_offset: [0, 1.5, 0]
        },
        bones: getHumanoidBones(false, inflateOffset)
      },
      {
        description: {
          identifier: 'geometry.humanoid.customSlim',
          texture_width: 64,
          texture_height: 64,
          visible_bounds_width: 3,
          visible_bounds_height: 3,
          visible_bounds_offset: [0, 1.5, 0]
        },
        bones: getHumanoidBones(true, inflateOffset)
      }
    ]
  };
}
