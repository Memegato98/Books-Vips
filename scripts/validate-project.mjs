import { existsSync, readFileSync } from 'node:fs';

const required = [
  'config.xml',
  'www/index.html',
  'www/js/app.js',
  'www/js/services/firebaseService.js',
  'www/js/utils/exporters.js',
  'www/css/styles.css',
  'www/assets/logos/logo.svg',
  'firestore.rules',
  'README.md'
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error(`Missing required files: ${missing.join(', ')}`);
  process.exit(1);
}
const index = readFileSync('www/index.html', 'utf8');
for (const token of ['VIPS Books UGB', 'app.js', 'styles.css']) {
  if (!index.includes(token)) {
    console.error(`index.html does not include ${token}`);
    process.exit(1);
  }
}
const app = readFileSync('www/js/app.js', 'utf8');
for (const token of ['CatalogView', 'SettingsView', 'csv-import', 'DashboardView']) {
  if (!app.includes(token)) {
    console.error(`app.js does not register ${token}`);
    process.exit(1);
  }
}
console.log('Project validation passed.');
