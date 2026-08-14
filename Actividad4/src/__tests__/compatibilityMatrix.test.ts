import { validateCompatibility } from '../compatibilityMatrix';

describe('Compatibility matrix validation', () => {
  it('accepts a supported iPhone configuration', () => {
    const result = validateCompatibility({
      platform: 'iOS',
      version: '17.5',
      screenWidth: 390,
      screenHeight: 844,
      density: 'xhdpi',
    });

    expect(result.isCompatible).toBe(true);
  });

  it('rejects unsupported Android versions or incompatible screens', () => {
    const result = validateCompatibility({
      platform: 'Android',
      version: '13',
      screenWidth: 200,
      screenHeight: 400,
      density: 'ldpi',
    });

    expect(result.isCompatible).toBe(false);
  });
});
