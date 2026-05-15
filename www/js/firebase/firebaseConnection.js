/**
 * Firebase/Firestore connection settings for VIPS Books UGB.
 *
 * Keep the connection definition isolated from HTML and UI code. For production,
 * replace these placeholders during deployment or keep a private environment-specific
 * copy of this file outside public source control.
 */
export const firebaseConfig = Object.freeze({
  apiKey: 'REEMPLAZAR_EN_DESPLIEGUE',
  authDomain: 'REEMPLAZAR.firebaseapp.com',
  projectId: 'REEMPLAZAR',
  storageBucket: 'REEMPLAZAR.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000000000'
});

export const databaseSettings = Object.freeze({
  demoMode: true,
  forcePasswordChangeClaim: 'mustChangePassword',
  collections: Object.freeze({
    books: 'books',
    categories: 'categories',
    subjects: 'subjects',
    publicationTypes: 'publicationTypes',
    users: 'users',
    activity: 'activity'
  })
});

let firebaseConnection;

export function isFirebaseConfigured(config = firebaseConfig) {
  return Boolean(config.apiKey) && !config.apiKey.includes('REEMPLAZAR') && Boolean(config.projectId) && !config.projectId.includes('REEMPLAZAR');
}

export function shouldUseDemoMode() {
  return databaseSettings.demoMode || !isFirebaseConfigured();
}

export function getDatabaseSettings() {
  return databaseSettings;
}

export async function getFirebaseConnection() {
  if (firebaseConnection) return firebaseConnection;
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase no está configurado. Actualice www/js/firebase/firebaseConnection.js o active demoMode.');
  }

  const [{ initializeApp }, authSdk, firestoreSdk, storageSdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-storage.js')
  ]);

  const app = initializeApp(firebaseConfig);
  firebaseConnection = Object.freeze({
    app,
    auth: authSdk.getAuth(app),
    db: firestoreSdk.getFirestore(app),
    storage: storageSdk.getStorage(app),
    authSdk,
    firestoreSdk,
    storageSdk
  });
  return firebaseConnection;
}
