import { describe, it, expect } from 'vitest';
import { getHumanoidBones, getStandardHumanoidGeometryJson } from '../../src/core/addon/humanoidGeometry.js';

describe('Standard Bedrock Humanoid Geometry Generator', () => {
  it('generates correct Steve bones (4px arm)', () => {
    const bones = getHumanoidBones(false);
    expect(bones.length).toBe(9);

    const boneNames = bones.map(b => b.name);
    expect(boneNames).toContain('root');
    expect(boneNames).toContain('waist');
    expect(boneNames).toContain('body');
    expect(boneNames).toContain('head');
    expect(boneNames).toContain('hat');
    expect(boneNames).toContain('rightArm');
    expect(boneNames).toContain('leftArm');
    expect(boneNames).toContain('rightLeg');
    expect(boneNames).toContain('leftLeg');

    const rightArm = bones.find(b => b.name === 'rightArm');
    expect(rightArm.cubes[0].size[0]).toBe(4); // 4px arm width
  });

  it('generates correct Alex bones (3px slim arm)', () => {
    const bones = getHumanoidBones(true);
    const rightArm = bones.find(b => b.name === 'rightArm');
    const leftArm = bones.find(b => b.name === 'leftArm');

    expect(rightArm.cubes[0].size[0]).toBe(3); // 3px slim arm width
    expect(leftArm.cubes[0].size[0]).toBe(3);
  });

  it('generates full geometry json with both custom and customSlim identifiers', () => {
    const geoJson = getStandardHumanoidGeometryJson();
    expect(geoJson.format_version).toBe('1.12.0');
    expect(geoJson['minecraft:geometry'].length).toBe(2);

    const steve = geoJson['minecraft:geometry'][0];
    const alex = geoJson['minecraft:geometry'][1];

    expect(steve.description.identifier).toBe('geometry.humanoid.custom');
    expect(alex.description.identifier).toBe('geometry.humanoid.customSlim');
  });

  it('supports anti-clipping inflation offset to prevent z-fighting with player skin', () => {
    const bonesWithOffset = getHumanoidBones(false, 0.05);
    const body = bonesWithOffset.find(b => b.name === 'body');

    // Inner layer has 0.05 offset
    expect(body.cubes[0].inflate).toBe(0.05);
    // Outer layer has 0.25 + 0.05 = 0.3 offset
    expect(body.cubes[1].inflate).toBe(0.3);
  });
});
