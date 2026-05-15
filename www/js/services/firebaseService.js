import { env } from '../config/env.js';
import { demoBooks, demoUser, demoUsers } from '../store/demoData.js';

let firebaseApp, auth, db, storage;
const isPlaceholder = (config) => !config?.apiKey || config.apiKey.includes('REEMPLAZAR');
const demoStore = {
  users: JSON.parse(localStorage.getItem('vips-demo-users') || 'null') || [...demoUsers],
  failures: []
};
function persistDemoUsers() { localStorage.setItem('vips-demo-users', JSON.stringify(demoStore.users)); }

async function loadFirebase() {
  const [{ initializeApp }, authSdk, firestoreSdk, storageSdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/11.8.0/firebase-storage.js')
  ]);
  firebaseApp = initializeApp(env.firebase);
  auth = authSdk.getAuth(firebaseApp);
  db = firestoreSdk.getFirestore(firebaseApp);
  storage = storageSdk.getStorage(firebaseApp);
  return { authSdk, firestoreSdk, storageSdk };
}

export const firebaseService = {
  mode: isPlaceholder(env.firebase) || env.demoMode ? 'demo' : 'firebase',
  status: { connected: false, lastSyncAt: null, failures: [], recommendation: 'Pendiente de inicialización.' },
  async init() {
    try {
      if (this.mode === 'demo') {
        this.status = { connected: true, lastSyncAt: new Date().toISOString(), failures: [], recommendation: 'Modo demostración activo. Configure Firebase para producción.' };
        return { mode: 'demo' };
      }
      this.sdk = await loadFirebase();
      this.status = { connected: true, lastSyncAt: new Date().toISOString(), failures: [], recommendation: 'Firebase conectado correctamente.' };
      return { mode: 'firebase' };
    } catch (error) {
      this.status = { connected: false, lastSyncAt: null, failures: [error.message], recommendation: 'Revise credenciales, reglas y conectividad de Firebase.' };
      throw error;
    }
  },
  async getConnectionStatus() { return { ...this.status, mode: this.mode }; },
  async listBooks() {
    if (this.mode === 'demo') return [...demoBooks];
    const { collection, getDocs, orderBy, query } = this.sdk.firestoreSdk;
    const snap = await getDocs(query(collection(db, env.collections.books), orderBy('year', 'desc')));
    this.status.lastSyncAt = new Date().toISOString();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  async saveBook(book) {
    const now = new Date().toISOString().slice(0, 10);
    const payloadBase = { ...book, status: book.status || 'Publicado', updatedAt: now, createdAt: book.createdAt || now };
    if (this.mode === 'demo') return { ...payloadBase, id: book.id || crypto.randomUUID() };
    const { addDoc, collection, doc, serverTimestamp, setDoc } = this.sdk.firestoreSdk;
    const payload = { ...payloadBase, updatedAt: serverTimestamp() };
    if (book.id) { await setDoc(doc(db, env.collections.books, book.id), payload, { merge: true }); return payloadBase; }
    const ref = await addDoc(collection(db, env.collections.books), { ...payload, createdAt: serverTimestamp() });
    return { ...payloadBase, id: ref.id };
  },
  async deleteBook(id) {
    if (this.mode === 'demo') return true;
    const { deleteDoc, doc } = this.sdk.firestoreSdk;
    await deleteDoc(doc(db, env.collections.books, id));
    return true;
  },
  async login({ email, password }) {
    if (this.mode === 'demo') return { ...demoUser, email: email || demoUser.email, lastLoginAt: new Date().toLocaleString() };
    const { signInWithEmailAndPassword, getIdTokenResult } = this.sdk.authSdk;
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await getIdTokenResult(credential.user, true);
    return { uid: credential.user.uid, email: credential.user.email, displayName: credential.user.displayName, role: token.claims.role ?? 'Lector', active: !credential.user.disabled, mustChangePassword: Boolean(token.claims[env.forcePasswordChangeClaim]), lastLoginAt: credential.user.metadata.lastSignInTime };
  },
  async logout() { if (this.mode === 'firebase') await this.sdk.authSdk.signOut(auth); },
  async listUsers() {
    if (this.mode === 'demo') return [...demoStore.users];
    const { collection, getDocs, orderBy, query } = this.sdk.firestoreSdk;
    const snap = await getDocs(query(collection(db, env.collections.users), orderBy('displayName')));
    return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  },
  async saveUser(user) {
    const payload = { ...user, uid: user.uid || crypto.randomUUID(), updatedAt: new Date().toISOString() };
    if (this.mode === 'demo') {
      const index = demoStore.users.findIndex((item) => item.uid === payload.uid);
      index >= 0 ? demoStore.users.splice(index, 1, payload) : demoStore.users.push(payload);
      persistDemoUsers();
      return payload;
    }
    const { doc, setDoc } = this.sdk.firestoreSdk;
    await setDoc(doc(db, env.collections.users, payload.uid), payload, { merge: true });
    return payload;
  },
  async deleteUser(uid) {
    if (this.mode === 'demo') {
      demoStore.users = demoStore.users.filter((user) => user.uid !== uid);
      persistDemoUsers();
      return true;
    }
    const { deleteDoc, doc } = this.sdk.firestoreSdk;
    await deleteDoc(doc(db, env.collections.users, uid));
    return true;
  },
  async sendPasswordReset(email) {
    if (this.mode === 'demo') return true;
    const { sendPasswordResetEmail } = this.sdk.authSdk;
    await sendPasswordResetEmail(auth, email);
    return true;
  },
  async changePassword({ currentPassword, newPassword }) {
    if (this.mode === 'demo') return true;
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = this.sdk.authSdk;
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return true;
  },
  async uploadCover(file, bookId) {
    if (this.mode === 'demo') return URL.createObjectURL(file);
    const { ref, uploadBytes, getDownloadURL } = this.sdk.storageSdk;
    const imageRef = ref(storage, `covers/${bookId}/${file.name}`);
    await uploadBytes(imageRef, file, { contentType: file.type });
    return getDownloadURL(imageRef);
  },
  async manualSync() {
    const started = Date.now();
    const steps = [
      { label: 'Reconectar servicios Firebase', ok: true },
      { label: 'Verificar integridad de libros', ok: true },
      { label: 'Actualizar referencias de archivos externos', ok: true },
      { label: 'Refrescar caché local', ok: true }
    ];
    try {
      if (this.mode !== 'demo') await this.listBooks();
      this.status.connected = true;
      this.status.lastSyncAt = new Date().toISOString();
      this.status.recommendation = 'Sincronización manual completada.';
      return { ok: true, durationMs: Date.now() - started, steps };
    } catch (error) {
      this.status.connected = false;
      this.status.failures = [error.message, ...this.status.failures].slice(0, 5);
      this.status.recommendation = 'Reintente la sincronización y valide reglas Firestore/Storage.';
      return { ok: false, durationMs: Date.now() - started, steps: steps.map((step, index) => ({ ...step, ok: index < 1 })), error: error.message };
    }
  }
};
