import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.theotherside.app',
  appName: 'THE OTHER SIDE',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
