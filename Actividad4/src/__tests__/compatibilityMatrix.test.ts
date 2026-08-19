import { validateCompatibility } from '../compatibilityMatrix';

describe('Device compatibility matrix', () => {
  it('accepts a supported Android device', () => {
    expect(validateCompatibility({
      platform: 'Android',
      version: '14',
      screenWidth: 1080,
      screenHeight: 2400,
      density: 'xxhdpi',
    })).toEqual({
      isSupportedPlatform: true,
      isSupportedResolution: true,
      isSupportedDensity: true,
      isCompatible: true,
    });
  });

  it('rejects unsupported platform, resolution, or density', () => {
    expect(validateCompatibility({
      platform: 'Android',
      version: '13',
      screenWidth: 320,
      screenHeight: 567,
      density: 'unknown',
    })).toEqual({
      isSupportedPlatform: false,
      isSupportedResolution: false,
      isSupportedDensity: false,
      isCompatible: false,
    });
  });
});
