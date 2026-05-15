import { sanitizeText } from './security.js';
const aliases = {
  isbn: ['isbn'], requestDate: ['fecha de solicitud', 'fecha solicitud', 'request date'], title: ['titulo', 'título', 'title'],
  type: ['tipo de publicacion', 'tipo de publicación', 'tipo'], subject: ['materia', 'subject'], collaborators: ['colaboradores', 'contributors']
};
export function parseCsv(text) {
  const rows = text.split(/\r?\n/).filter(Boolean).map((line) => line.match(/("[^"]*(""[^"]*)*"|[^,;]+)/g)?.map((cell) => sanitizeText(cell.replace(/^"|"$/g, '').replace(/""/g, '"'))) ?? []);
  const headers = rows.shift()?.map((h) => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()) ?? [];
  const map = Object.fromEntries(Object.entries(aliases).map(([field, names]) => [field, headers.findIndex((h) => names.map((n) => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '')).includes(h))]));
  const errors = [];
  const books = rows.map((row, index) => ({
    isbn: row[map.isbn] ?? '', requestDate: row[map.requestDate] ?? '', title: row[map.title] ?? '', type: row[map.type] ?? '',
    subject: row[map.subject] ?? '', collaborators: row[map.collaborators] ?? '', authors: (row[map.collaborators] ?? '').split('|').filter(Boolean), year: new Date().getFullYear(), categories: []
  })).filter((book, index) => { const valid = book.isbn && book.title; if (!valid) errors.push(`Fila ${index + 2}: ISBN y título son obligatorios.`); return valid; });
  return { books, errors, map };
}
export function findDuplicates(existing, incoming) {
  const isbns = new Set(existing.map((book) => book.isbn).filter(Boolean));
  return incoming.filter((book) => isbns.has(book.isbn));
}
