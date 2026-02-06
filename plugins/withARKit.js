const { withInfoPlist } = require('expo/config-plugins');

const withARKit = (config) => {
  // Add required permissions to Info.plist
  config = withInfoPlist(config, (config) => {
    // Camera permission for AR
    config.modResults.NSCameraUsageDescription =
      config.modResults.NSCameraUsageDescription ||
      'Camera is required for AR Qibla direction feature';

    // Motion permission for device tracking
    config.modResults.NSMotionUsageDescription =
      config.modResults.NSMotionUsageDescription ||
      'Motion data is used to track device orientation for AR Qibla direction';

    return config;
  });

  return config;
};

module.exports = withARKit;
