import { firebase } from '@react-native-firebase/app-check';
import { copyText } from 'utils';

export const getAppCheckToken = async (): Promise<string> => {
  try {
    const { token } = await firebase.appCheck().getToken();
    console.log('appcheck token!!!', token);

    if (token?.length > 0) {
      console.log('AppCheck verification passed');
      await copyText(token);
    }

    return token || '';
  } catch (error) {
    console.log('AppCheck verification failed', error);
    return '';
  }
};

export async function setupAppCheck() {
  const appCheckProvider = firebase.appCheck().newReactNativeFirebaseAppCheckProvider();
  appCheckProvider.configure({
    android: {
      provider: __DEV__ ? 'debug' : 'playIntegrity',
      debugToken: '698956B2-187B-49C6-9E25-C3F3530EEBAF',
    },
    apple: {
      provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
      debugToken: 'D04D5C23-41F1-450E-BD02-C70B1E6D9F95',
    },
    web: {
      provider: 'reCaptchaV3',
      siteKey: 'unknown',
    },
  });
  firebase.appCheck().initializeAppCheck({ provider: appCheckProvider, isTokenAutoRefreshEnabled: true });
}
