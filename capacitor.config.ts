import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ugconnect.app',
  appName: 'UG Connect',
  webDir: 'out',
  ios: {
    contentInset: 'always', // <— FIX: was 'never'
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0a0a0a', // <— FIX: match your --bg so no white flash
    },
    SplashScreen: {
      launchShowDuration: 0
    }
  },
};

export default config;
