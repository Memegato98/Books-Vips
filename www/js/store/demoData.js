export const demoCategories = [
  { id: 'cat-1', name: 'Investigación', active: true, order: 1 },
  { id: 'cat-2', name: 'Literatura', active: true, order: 2 }
];
export const demoCollections = [
  { id: 'col-1', name: 'Investigaciones Científicas', description: 'Línea científica institucional', banner: '', active: true, visibility: 'public' },
  { id: 'col-2', name: 'Documentos Institucionales', description: 'Normativas y memorias', banner: '', active: true, visibility: 'private' }
];
export const demoBooks = [
  { id: 'bk-1', title: 'Investigación Aplicada UGB', year: 2026, isbn: '978-99961-0001', type: 'Libro', subject: 'Ciencia', categories: ['Investigación'], collectionIds: ['col-1'], status: 'Publicado', visibility: 'public', authors: ['Equipo UGB'], summary: 'Compendio de investigación.', files: [{ label: 'Drive', url: 'https://drive.google.com', kind: 'preview' }] },
  { id: 'bk-2', title: 'Memoria Institucional 2025', year: 2025, isbn: '', type: 'Memoria', subject: 'Institucional', categories: ['Investigación'], collectionIds: ['col-2'], status: 'Borrador', visibility: 'private', authors: ['Secretaría General'], summary: 'Memoria anual institucional.', files: [] }
];
export const demoUser = { uid: 'master-1', displayName: 'SaulBonilla', email: 'saulbonilla@ugb.edu.sv', role: 'Master', mustChangePassword: true, active: true };
export const demoUsers = [demoUser];
