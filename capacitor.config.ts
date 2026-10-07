import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ugconnect.app',
  appName: 'UG Connect',
  webDir: 'out',
  ios: {
    contentInset: 'always',
  },
  android: {
    // force portrait in native
    // we handle unlock in JS for fullscreen
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0f1f16',
    },
    SplashScreen: {
      launchShowDuration: 0
    }
  },
};

export default config;
