function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCell(value = '') {
  const text = Array.isArray(value) ? value.join('; ') : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export function exportCsv(rows, columns, filename) {
  const header = columns.map((column) => escapeCell(column.label)).join(',');
  const body = rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(',')).join('\n');
  downloadBlob(`${header}\n${body}`, filename, 'text/csv;charset=utf-8');
}

export function exportExcel(rows, columns, filename) {
  const header = columns.map((column) => `<th>${column.label}</th>`).join('');
  const body = rows.map((row) => `<tr>${columns.map((column) => `<td>${column.value(row) ?? ''}</td>`).join('')}</tr>`).join('');
  const workbook = `<!doctype html><html><head><meta charset="utf-8"></head><body><table>${header}${body}</table></body></html>`;
  downloadBlob(workbook, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8');
}

export function openPdfReport({ title, subtitle, rows, columns, logo = 'assets/logos/logo.svg' }) {
  const header = columns.map((column) => `<th>${column.label}</th>`).join('');
  const body = rows.map((row) => `<tr>${columns.map((column) => `<td>${column.value(row) ?? ''}</td>`).join('')}</tr>`).join('');
  const toc = columns.map((column, index) => `<li>${index + 1}. ${column.label}</li>`).join('');
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return false;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
    @page { margin: 18mm; } body { font-family: Arial, sans-serif; color: #172033; }
    header { display:flex; align-items:center; gap:16px; border-bottom:3px solid #0f3b70; padding-bottom:14px; margin-bottom:18px; }
    header img { width:70px; height:70px; } h1 { color:#0f3b70; margin:0; } .subtitle { color:#667085; margin-top:4px; }
    .toc { background:#f6f8fb; border:1px solid #d9e2ef; border-radius:10px; padding:12px 18px; margin:18px 0; }
    table { width:100%; border-collapse:collapse; font-size:11px; } th { background:#0f3b70; color:#fff; }
    th, td { border:1px solid #d9e2ef; padding:7px; text-align:left; vertical-align:top; }
    tr:nth-child(even) { background:#f8fafc; } footer { position:fixed; bottom:0; left:0; right:0; font-size:10px; color:#667085; display:flex; justify-content:space-between; }
  </style></head><body><header><img src="${logo}" alt="UGB"><div><h1>${title}</h1><div class="subtitle">${subtitle}</div></div></header><section class="toc"><strong>Tabla de contenidos</strong><ol>${toc}</ol></section><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table><footer><span>Editorial Universidad Gerardo Barrios</span><span>Generado ${new Date().toLocaleString()}</span></footer><script>window.onload=()=>setTimeout(()=>window.print(),250)</script></body></html>`);
  win.document.close();
  return true;
}

export const bookColumns = [
  { label: 'ISBN', value: (book) => book.isbn },
  { label: 'Título', value: (book) => book.title },
  { label: 'Autores', value: (book) => book.authors },
  { label: 'Año', value: (book) => book.year },
  { label: 'Tipo', value: (book) => book.type },
  { label: 'Materia', value: (book) => book.subject },
  { label: 'Categorías', value: (book) => book.categories },
  { label: 'Estado', value: (book) => book.status || 'Publicado' },
  { label: 'Archivos', value: (book) => (book.files || []).map((file) => file.url).join('; ') }
];

export const userColumns = [
  { label: 'Nombre', value: (user) => user.displayName },
  { label: 'Correo', value: (user) => user.email },
  { label: 'Rol', value: (user) => user.role },
  { label: 'Estado', value: (user) => user.active === false ? 'Inactivo' : 'Activo' },
  { label: 'Último acceso', value: (user) => user.lastLoginAt || 'Sin registro' }
];
