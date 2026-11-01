import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildAddonItems } from '../../src/modules/standalone/standaloneItemBuilder.js';

describe('Standalone Item Builder', () => {
  const dummyBlob = new Blob(['dummy'], { type: 'image/png' });
  const mockCreateSkinBlob = async () => dummyBlob;

  beforeAll(() => {
    // Lightweight canvas mock for Node environment
    globalThis.document = {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({
          imageSmoothingEnabled: false,
          drawImage: () => {},
          clearRect: () => {},
          getImageData: () => ({ data: new Uint8ClampedArray(16 * 16 * 4) })
        }),
        toBlob: (cb) => cb(new Blob(['icon'], { type: 'image/png' }))
      })
    };
  });

  afterAll(() => {
    delete globalThis.document;
  });

  it('builds single item correctly for head slot', async () => {
    const mockImg = { width: 64, height: 64 };

    const items = await buildAddonItems({
      itemName: 'Diamond Crown',
      itemSlotType: 'head',
      skinImg: mockImg,
      skinResolution: 64,
      parts: { head: true, body: true, arms: false, legs: false },
      hasCustomUploadedIcon: false,
      itemIconDataUrl: null,
      createSkinBlobFn: mockCreateSkinBlob
    });

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Diamond Crown');
    expect(items[0].slot).toBe('slot.armor.head');
    expect(items[0].group).toBe('itemGroup.name.helmet');
    expect(items[0].isHead).toBe(true);
    expect(items[0].id).toMatch(/^skin_diamond_crown_[a-z0-9]{6}_head$/);
  });

  it('builds dual items (head + suit) for both slot type', async () => {
    const mockImg = { width: 64, height: 64 };

    const items = await buildAddonItems({
      itemName: 'Dragon Armor',
      itemSlotType: 'both',
      skinImg: mockImg,
      skinResolution: 64,
      parts: { head: true, body: true, arms: true, legs: true },
      hasCustomUploadedIcon: false,
      itemIconDataUrl: null,
      createSkinBlobFn: mockCreateSkinBlob
    });

    expect(items).toHaveLength(2);
    expect(items[0].name).toBe('Dragon Armor (หัว)');
    expect(items[0].slot).toBe('slot.armor.head');
    expect(items[0].isHead).toBe(true);
    expect(items[0].id).toMatch(/^skin_dragon_armor_[a-z0-9]{6}_head$/);

    expect(items[1].name).toBe('Dragon Armor (ชุด)');
    expect(items[1].slot).toBe('slot.armor.chest');
    expect(items[1].isHead).toBe(false);
    expect(items[1].id).toMatch(/^skin_dragon_armor_[a-z0-9]{6}_suit$/);
  });
});
