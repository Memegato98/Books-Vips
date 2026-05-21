import baseConfig from './config.js';

const envOverride = globalThis?.VIPS_RUNTIME_FIREBASE_CONFIG || null;
const runtimeConfig = envOverride && typeof envOverride === 'object' ? envOverride : baseConfig;

export const firebaseConfig = Object.freeze(runtimeConfig);

export const databaseSettings = Object.freeze({
  demoMode: false,
  forcePasswordChangeClaim: 'mustChangePassword',
  collections: Object.freeze({
    books: 'books', categories: 'categories', collections: 'collections', users: 'users'
  })
});

let firebaseConnection;
export function isFirebaseConfigured(config = firebaseConfig) {
  return Boolean(config.apiKey && config.projectId && config.authDomain);
}
export function shouldUseDemoMode() { return databaseSettings.demoMode || !isFirebaseConfigured(); }
export function getDatabaseSettings() { return databaseSettings; }

export async function getFirebaseConnection() {
  if (firebaseConnection) return firebaseConnection;
  const [{ initializeApp }, authSdk, firestoreSdk, storageSdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-storage.js')
  ]);
  const app = initializeApp(firebaseConfig);
  firebaseConnection = {
    app,
    auth: authSdk.getAuth(app),
    db: firestoreSdk.getFirestore(app),
    storage: storageSdk.getStorage(app),
    authSdk,
    firestoreSdk,
    storageSdk
  };
  return firebaseConnection;
}
