import { existsSync, readFileSync } from 'node:fs';

const required = [
  'config.xml','www/index.html','www/js/app.js','www/js/services/firebaseService.js','www/js/firebase/config.js','www/js/firebase/firebaseConnection.js','scripts/create-master-user.mjs','www/js/utils/exporters.js','www/css/styles.css','www/assets/logos/logo.svg','firestore.rules','README.md'
];
const missing = required.filter((f) => !existsSync(f));
if (missing.length) { console.error(`Missing required files: ${missing.join(', ')}`); process.exit(1); }

const index = readFileSync('www/index.html', 'utf8');
for (const token of ['VIPS Books UGB', 'js/app.js', 'Catálogo', 'Gestión Editorial', 'Configuración']) {
  if (!index.includes(token)) { console.error(`index.html missing token: ${token}`); process.exit(1); }
}

const app = readFileSync('www/js/app.js', 'utf8');
for (const token of ['catalog', 'editorial', 'categories', 'collections', 'sharePrivate', 'exportPdf']) {
  if (!app.includes(token)) { console.error(`app.js missing token: ${token}`); process.exit(1); }
}

console.log('Project validation passed.');
