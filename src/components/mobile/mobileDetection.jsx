// Detect if the app is running on a native mobile app (Android/iOS)
// Checks for platform-specific APIs that only exist in mobile wrappers
export const isMobileApp = () => {
  // Check for Capacitor (modern native mobile wrapper)
  if (window.Capacitor) {
    return true;
  }

  // Check for Cordova (older mobile wrapper)
  if (window.cordova) {
    return true;
  }

  // Check for React Native WebView (if using React Native)
  if (window.RNWebViewBridge) {
    return true;
  }

  // Check for platform-specific properties that might be added
  if (window.isNativeApp === true) {
    return true;
  }

  return false;
};

// Detect if device is mobile (browser or app)
export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};