import { getDatabaseSettings, firebaseConfig, shouldUseDemoMode } from '../firebase/firebaseConnection.js';

const settings = getDatabaseSettings();

export const env = {
  firebase: firebaseConfig,
  demoMode: shouldUseDemoMode(),
  forcePasswordChangeClaim: settings.forcePasswordChangeClaim,
  collections: settings.collections
};
