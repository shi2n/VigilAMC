import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vigilamc',
  appName: 'VigilAMC Field',
  webDir: 'public',
  backgroundColor: '#FFF8F2',
  server: {
    url: 'https://www.vigilamc.com/technician',
    allowNavigation: ['www.vigilamc.com', 'vigilamc.com', '*.vigilamc.com'],
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#FFF8F2',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_fire',
      iconColor: '#EA580C',
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
  },
};

export default config;
