/**
 * Standard Bedrock Humanoid Geometry Generator
 * Generates genuine Minecraft Bedrock 1.12.0+ humanoid player geometry (Steve & Alex)
 * for wearable attachables, ensuring 100% compatibility without black box glitches.
 */

export function getHumanoidBones(isSlim = false) {
  const armWidth = isSlim ? 3 : 4;
  const armPivotX = 5;
  const armPivotY = isSlim ? 21.5 : 22;
  const rightArmOriginX = isSlim ? -7 : -8;
  const leftArmOriginX = 4;

  return [
    { name: 'root', pivot: [0, 0, 0] },
    { name: 'waist', parent: 'root', pivot: [0, 12, 0] },
    {
      name: 'body',
      parent: 'waist',
      pivot: [0, 24, 0],
      cubes: [
        { origin: [-4, 12, -2], size: [8, 12, 4], uv: [16, 16] },
        { origin: [-4, 12, -2], size: [8, 12, 4], inflate: 0.25, uv: [16, 32] }
      ]
    },
    {
      name: 'head',
      parent: 'body',
      pivot: [0, 24, 0],
      cubes: [
        { origin: [-4, 24, -4], size: [8, 8, 8], uv: [0, 0] }
      ]
    },
    {
      name: 'hat',
      parent: 'head',
      pivot: [0, 24, 0],
      cubes: [
        { origin: [-4, 24, -4], size: [8, 8, 8], inflate: 0.5, uv: [32, 0] }
      ]
    },
    {
      name: 'rightArm',
      parent: 'body',
      pivot: [-armPivotX, armPivotY, 0],
      cubes: [
        { origin: [rightArmOriginX, 12, -2], size: [armWidth, 12, 4], uv: [40, 16] },
        { origin: [rightArmOriginX, 12, -2], size: [armWidth, 12, 4], inflate: 0.25, uv: [40, 32] }
      ]
    },
    {
      name: 'leftArm',
      parent: 'body',
      pivot: [armPivotX, armPivotY, 0],
      cubes: [
        { origin: [leftArmOriginX, 12, -2], size: [armWidth, 12, 4], uv: [32, 48] },
        { origin: [leftArmOriginX, 12, -2], size: [armWidth, 12, 4], inflate: 0.25, uv: [48, 48] }
      ]
    },
    {
      name: 'rightLeg',
      parent: 'root',
      pivot: [-1.9, 12, 0],
      cubes: [
        { origin: [-3.9, 0, -2], size: [4, 12, 4], uv: [0, 16] },
        { origin: [-3.9, 0, -2], size: [4, 12, 4], inflate: 0.25, uv: [0, 32] }
      ]
    },
    {
      name: 'leftLeg',
      parent: 'root',
      pivot: [1.9, 12, 0],
      cubes: [
        { origin: [-0.1, 0, -2], size: [4, 12, 4], uv: [16, 48] },
        { origin: [-0.1, 0, -2], size: [4, 12, 4], inflate: 0.25, uv: [0, 48] }
      ]
    }
  ];
}

/**
 * Returns complete Bedrock 1.12.0+ geometry containing both Steve and Alex models
 */
export function getStandardHumanoidGeometryJson() {
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
        bones: getHumanoidBones(false)
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
        bones: getHumanoidBones(true)
      }
    ]
  };
}
