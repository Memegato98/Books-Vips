import { env } from '../config/env.js';
import { demoBooks, demoUser } from '../store/demoData.js';

let firebaseApp, auth, db, storage;
const isPlaceholder = (config) => !config?.apiKey || config.apiKey.includes('REEMPLAZAR');

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
  async init() {
    if (this.mode === 'demo') return { mode: 'demo' };
    this.sdk = await loadFirebase();
    return { mode: 'firebase' };
  },
  async listBooks() {
    if (this.mode === 'demo') return [...demoBooks];
    const { collection, getDocs, orderBy, query } = this.sdk.firestoreSdk;
    const snap = await getDocs(query(collection(db, env.collections.books), orderBy('year', 'desc')));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  async saveBook(book) {
    if (this.mode === 'demo') return { ...book, id: book.id || crypto.randomUUID() };
    const { addDoc, collection, doc, serverTimestamp, setDoc } = this.sdk.firestoreSdk;
    const payload = { ...book, updatedAt: serverTimestamp() };
    if (book.id) { await setDoc(doc(db, env.collections.books, book.id), payload, { merge: true }); return book; }
    const ref = await addDoc(collection(db, env.collections.books), { ...payload, createdAt: serverTimestamp() });
    return { ...book, id: ref.id };
  },
  async deleteBook(id) {
    if (this.mode === 'demo') return true;
    const { deleteDoc, doc } = this.sdk.firestoreSdk;
    await deleteDoc(doc(db, env.collections.books, id));
    return true;
  },
  async login({ email, password }) {
    if (this.mode === 'demo') return { ...demoUser, email: email || demoUser.email };
    const { signInWithEmailAndPassword, getIdTokenResult } = this.sdk.authSdk;
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await getIdTokenResult(credential.user, true);
    return { uid: credential.user.uid, email: credential.user.email, displayName: credential.user.displayName, role: token.claims.role ?? 'Lector', mustChangePassword: Boolean(token.claims[env.forcePasswordChangeClaim]) };
  },
  async logout() {
    if (this.mode === 'firebase') await this.sdk.authSdk.signOut(auth);
  },
  async uploadCover(file, bookId) {
    if (this.mode === 'demo') return URL.createObjectURL(file);
    const { ref, uploadBytes, getDownloadURL } = this.sdk.storageSdk;
    const imageRef = ref(storage, `covers/${bookId}/${file.name}`);
    await uploadBytes(imageRef, file, { contentType: file.type });
    return getDownloadURL(imageRef);
  }
};
