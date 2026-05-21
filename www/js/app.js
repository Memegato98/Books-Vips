import { createApp, reactive, ref, computed, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';
import { firebaseService } from './services/firebaseService.js';
import { demoBooks, demoCategories, demoCollections } from './store/demoData.js';
import { openPdfReport, bookColumns, exportCsv, exportExcel } from './utils/exporters.js';

const state = reactive({ books: [], categories: [], collections: [], users: [], user: null, loading: true, theme: localStorage.getItem('theme') || 'light', connection: { connected: false, mode: 'demo', lastSyncAt: null, recommendation: '' }, toasts: [] });
const route = reactive({ name: 'catalog' });
const ui = reactive({ navOpen: false, cardSize: localStorage.getItem('cardSize') || 'md' });

const can = (perm) => state.user?.role === 'Master' || (state.user?.role === 'Administrador' && perm !== 'master');
const toast = (m, t='success') => { const id = crypto.randomUUID(); state.toasts.push({id,m,t}); setTimeout(()=> state.toasts = state.toasts.filter(x=>x.id!==id), 3500); };
const go = (name) => { route.name = name; location.hash = `#/${name}`; ui.navOpen=false; };
const syncRoute = () => { route.name = location.hash.replace('#/','') || 'catalog'; };
const emptyBook = () => ({ title:'', year: new Date().getFullYear(), isbn:'', type:'', subject:'', categories:[], collectionIds:[], authors:[], status:'Publicado', visibility:'public', summary:'', files:[], privateLinks:[] });

const app = createApp({
  setup() {
    const catalogFilters = reactive({ q:'', category:'', collection:'', visibility:'all' });
    const editorialForm = reactive(emptyBook());
    const categoryForm = reactive({ id:'', name:'', active:true, order:1 });
    const collectionForm = reactive({ id:'', name:'', description:'', banner:'', active:true, visibility:'public' });

    const filteredBooks = computed(() => state.books.filter((b) => {
      const qOk = !catalogFilters.q || [b.title,b.isbn,b.subject,(b.authors||[]).join(' ')].join(' ').toLowerCase().includes(catalogFilters.q.toLowerCase());
      const cOk = !catalogFilters.category || (b.categories||[]).includes(catalogFilters.category);
      const colOk = !catalogFilters.collection || (b.collectionIds||[]).includes(catalogFilters.collection);
      const vOk = catalogFilters.visibility==='all' || b.visibility===catalogFilters.visibility;
      return qOk && cOk && colOk && vOk && (b.visibility !== 'private' || can('admin'));
    }));

    const categoryCounts = computed(() => state.categories.map((c)=>({ ...c, count: state.books.filter((b)=>(b.categories||[]).includes(c.name)).length })));

    function toggleTheme() { state.theme = state.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('theme', state.theme); document.documentElement.dataset.theme = state.theme; }
    function setCardSize(size) { ui.cardSize = size; localStorage.setItem('cardSize', size); }

    function saveBook() {
      if (!editorialForm.title || !editorialForm.type) return toast('Título y tipo son obligatorios.', 'error');
      const payload = { ...editorialForm, id: editorialForm.id || crypto.randomUUID(), authors: String(editorialForm.authors||'').split(',').map(s=>s.trim()).filter(Boolean), categories: String(editorialForm.categories||'').split(',').map(s=>s.trim()).filter(Boolean), collectionIds: String(editorialForm.collectionIds||'').split(',').map(s=>s.trim()).filter(Boolean), updatedAt: new Date().toISOString().slice(0,10), createdAt: editorialForm.createdAt || new Date().toISOString().slice(0,10) };
      const idx = state.books.findIndex(b=>b.id===payload.id); idx>=0 ? state.books.splice(idx,1,payload) : state.books.unshift(payload);
      Object.assign(editorialForm, emptyBook());
      toast('Producción guardada.');
    }

    function editBook(book) { Object.assign(editorialForm, JSON.parse(JSON.stringify(book))); go('editorial'); }
    function removeBook(id) { state.books = state.books.filter((b)=>b.id!==id); toast('Producción eliminada.'); }

    function saveCategory() { if (!categoryForm.name) return; const payload = { ...categoryForm, id: categoryForm.id || crypto.randomUUID() }; const idx=state.categories.findIndex(c=>c.id===payload.id); idx>=0?state.categories.splice(idx,1,payload):state.categories.push(payload); Object.assign(categoryForm,{id:'',name:'',active:true,order:state.categories.length+1}); toast('Categoría guardada.'); }
    function saveCollection() { if (!collectionForm.name) return; const payload={ ...collectionForm, id: collectionForm.id || crypto.randomUUID()}; const idx=state.collections.findIndex(c=>c.id===payload.id); idx>=0?state.collections.splice(idx,1,payload):state.collections.push(payload); Object.assign(collectionForm,{id:'',name:'',description:'',banner:'',active:true,visibility:'public'}); toast('Colección guardada.'); }
    function sharePrivate(book) { const token = crypto.randomUUID().replaceAll('-','').slice(0,24); const expiresAt = new Date(Date.now()+7*86400000).toISOString(); book.privateLinks = [...(book.privateLinks||[]), { token, expiresAt, active:true, url:`${location.origin}${location.pathname}#/catalog?token=${token}` }]; toast('Enlace privado generado.'); }

    function exportData(type, format) {
      const rows = type==='categories' ? categoryCounts.value : type==='collections' ? state.collections : state.books;
      const cols = type==='categories' ? [{label:'Categoría', value:r=>r.name},{label:'Activa',value:r=>r.active?'Sí':'No'},{label:'Publicaciones',value:r=>r.count}] : type==='collections' ? [{label:'Colección',value:r=>r.name},{label:'Visibilidad',value:r=>r.visibility}] : bookColumns;
      format==='csv' ? exportCsv(rows, cols, `vips-${type}.csv`) : exportExcel(rows, cols, `vips-${type}.xlsx`);
    }

    async function load() {
      document.documentElement.dataset.theme = state.theme;
      syncRoute(); addEventListener('hashchange', syncRoute);
      try { await firebaseService.init(); state.connection = await firebaseService.getConnectionStatus(); state.user = await firebaseService.login({ email:'saulbonilla@ugb.edu.sv', password:'demo' }); }
      catch { state.connection = { connected:false, mode:'error', recommendation:'No se pudo conectar a Firebase.' }; }
      state.books = demoBooks; state.categories = demoCategories; state.collections = demoCollections; state.loading=false;
    }

    onMounted(load);
    return { state, ui, route, can, go, toggleTheme, setCardSize, catalogFilters, filteredBooks, editorialForm, saveBook, editBook, removeBook, categoryForm, saveCategory, categoryCounts, collectionForm, saveCollection, sharePrivate, exportData, exportPdf: () => openPdfReport({ title:'Reporte VIPS Books UGB', subtitle:`${filteredBooks.value.length} registros`, rows: filteredBooks.value, columns: bookColumns }) };
  }
});

app.mount('#app');
