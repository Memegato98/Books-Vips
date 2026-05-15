# VIPS Books UGB

Aplicación híbrida multiplataforma basada en **Apache Cordova**, **Vue 3**, **Bootstrap 5** y **Firebase** para consultar y administrar el catálogo editorial de la Editorial Universidad Gerardo Barrios. La versión web usa módulos ES y CDN para mantenerse desplegable en Cordova/Vercel sin proceso de compilación obligatorio.

## Funcionalidades incluidas

- Catálogo público responsive con búsqueda en tiempo real, filtros, ordenamiento, vista grid/lista, lazy loading, paginación incremental y skeleton loaders.
- Vista individual de libro con metadatos editoriales, palabras clave, portada, enlaces externos Drive/OneDrive y visor embebido mediante `iframe`.
- Panel administrativo protegido con flujo de login Firebase/demo, roles, permisos, CRUD de libros, taxonomías preparadas y gestión de enlaces externos.
- Importación masiva CSV con detección de columnas, validación mínima, previsualización y reporte de errores/duplicados.
- Dashboard con KPI y gráficas CSS para libros por categoría/año, autores y publicaciones recientes.
- Configuración global desacoplada mediante `window.VIPS_ENV`, modo claro/oscuro, servicios reutilizables y reglas Firebase.
- Assets de marca: logo, icono adaptable SVG, splash screen y portadas demo.

## Estructura

```text
VIPSBooksUGB/
├── config.xml
├── package.json
├── firestore.rules
├── storage.rules
├── www/
│   ├── index.html
│   ├── css/styles.css
│   ├── js/app.js
│   ├── js/config/env.js
│   ├── js/services/firebaseService.js
│   ├── js/store/demoData.js
│   ├── js/utils/
│   └── assets/
└── scripts/validate-project.mjs
```

## Configuración Firebase

1. Cree un proyecto Firebase.
2. Active Authentication con proveedor correo/contraseña.
3. Cree Firestore y Firebase Storage.
4. Publique `firestore.rules` y `storage.rules`.
5. Reemplace la configuración `window.VIPS_ENV.firebase` en `www/index.html` o inyéctela desde el pipeline de despliegue.
6. Cambie `demoMode` a `false` para usar Firebase real.

### Usuario inicial

Cree el usuario inicial en Firebase Authentication con correo institucional para **SaulBonilla** y asigne custom claims desde un entorno seguro de servidor/Admin SDK:

```js
await admin.auth().setCustomUserClaims(uid, {
  role: 'Master',
  mustChangePassword: true
});
```

La contraseña temporal `#Contra123` debe entregarse por un canal seguro y forzar cambio en el primer inicio. No se hardcodea en el frontend.

## CSV

Campos base soportados por alias:

- ISBN
- Fecha de Solicitud
- Título
- Tipo de Publicación
- Materia
- Colaboradores

Los colaboradores pueden separarse con `|` para generar autores iniciales.

## Desarrollo local

```bash
npm install
npm run validate
npm run serve
```

Abra `http://localhost:8080`.

## Android con Cordova

```bash
npm install
npm install -g cordova
npm run cordova:android
```

El APK se generará dentro de `platforms/android/app/build/outputs/apk/` después de instalar Android SDK y Gradle compatibles.

## Despliegue web / Vercel

- Framework preset: **Other**.
- Build command: `npm run vercel-build`.
- Output directory: `www`.

## Manual básico de identidad visual

- Azul institucional: `#0f3b70`.
- Azul secundario: `#19589d`.
- Dorado editorial: `#d9a441`.
- Estilo: académico, minimalista, tecnológico y editorial universitario.
- Usar el logo SVG sobre fondos claros u oscuros manteniendo área de seguridad equivalente al 15% del ancho del isotipo.
- El splash screen debe conservar fondo azul degradado, logotipo centrado y nombre completo de la aplicación.

## Preparación para módulos futuros

La arquitectura deja servicios, utilidades, store, router lógico y configuración modular para agregar préstamos digitales, EPUB, favoritos, API REST, IA, citas bibliográficas, exportación APA y multidioma.
