export type DeviceMatrix = {
  platform: 'iOS' | 'Android';
  version: string;
  screenWidth: number;
  screenHeight: number;
  density: string;
};

export function validateCompatibility(device: DeviceMatrix) {
  const supportedIosVersions = ['17.0', '17.5', '18.0'];
  const supportedAndroidVersions = ['14', '15'];

  const isSupportedPlatform =
    (device.platform === 'iOS' && supportedIosVersions.includes(device.version)) ||
    (device.platform === 'Android' && supportedAndroidVersions.includes(device.version));

  const isSupportedResolution = device.screenWidth >= 320 && device.screenHeight >= 568;
  const isSupportedDensity = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'].includes(device.density);

  return {
    isSupportedPlatform,
    isSupportedResolution,
    isSupportedDensity,
    isCompatible: isSupportedPlatform && isSupportedResolution && isSupportedDensity,
  };
}
