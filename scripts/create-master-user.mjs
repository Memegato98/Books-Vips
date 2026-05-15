#!/usr/bin/env node
/**
 * Creates or updates the initial Master user for VIPS Books UGB.
 *
 * Required environment variables:
 * - FIREBASE_SERVICE_ACCOUNT: path to a Firebase Admin SDK service account JSON file, OR
 * - FIREBASE_SERVICE_ACCOUNT_JSON: full JSON content of the service account.
 *
 * Optional environment variables:
 * - MASTER_EMAIL (default: saulbonilla@ugb.edu.sv)
 * - MASTER_DISPLAY_NAME (default: SaulBonilla)
 * - MASTER_PASSWORD (default: #Contra123)
 * - MASTER_MUST_CHANGE_PASSWORD (default: true)
 * - MASTER_DISABLED (default: false)
 */
import { readFileSync } from 'node:fs';
import process from 'node:process';

function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, 'utf8'));
  }
  throw new Error('Defina FIREBASE_SERVICE_ACCOUNT o FIREBASE_SERVICE_ACCOUNT_JSON antes de ejecutar este script.');
}

let admin;
try {
  const firebaseAdmin = await import('firebase-admin');
  admin = firebaseAdmin.default ?? firebaseAdmin;
} catch {
  console.error('Falta firebase-admin. Instálelo temporalmente con: npm install --no-save firebase-admin');
  process.exit(1);
}

const serviceAccount = readServiceAccount();
const email = process.env.MASTER_EMAIL || 'saulbonilla@ugb.edu.sv';
const displayName = process.env.MASTER_DISPLAY_NAME || 'SaulBonilla';
const password = process.env.MASTER_PASSWORD || '#Contra123';
const mustChangePassword = process.env.MASTER_MUST_CHANGE_PASSWORD !== 'false';
const disabled = process.env.MASTER_DISABLED === 'true';

if (!password || password.length < 8) {
  throw new Error('MASTER_PASSWORD debe tener al menos 8 caracteres.');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function getOrCreateUser() {
  try {
    const existing = await admin.auth().getUserByEmail(email);
    return admin.auth().updateUser(existing.uid, { email, displayName, password, disabled });
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    return admin.auth().createUser({ email, displayName, password, disabled, emailVerified: false });
  }
}

const user = await getOrCreateUser();
await admin.auth().setCustomUserClaims(user.uid, {
  role: 'Master',
  mustChangePassword
});

const projectId = serviceAccount.project_id || 'firebase-project';
const userProfile = {
  uid: user.uid,
  email,
  displayName,
  role: 'Master',
  active: !disabled,
  mustChangePassword,
  lastLoginAt: user.metadata?.lastSignInTime || 'Sin acceso registrado',
  updatedAt: new Date().toISOString()
};
await admin.firestore().collection('users').doc(user.uid).set(userProfile, { merge: true });

console.log(`Usuario Master listo en ${projectId}:`);
console.log(`- UID: ${user.uid}`);
console.log(`- Email: ${email}`);
console.log(`- Rol: Master`);
console.log(`- Debe cambiar contraseña: ${mustChangePassword ? 'sí' : 'no'}`);
console.log('Entregue la contraseña temporal por un canal seguro y solicite cambio en el primer acceso.');
