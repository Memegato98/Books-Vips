# VIPS Books UGB

Aplicación híbrida multiplataforma basada en **Apache Cordova**, **Vue 3**, **Bootstrap 5** y **Firebase** para consultar y administrar el catálogo editorial de la Editorial Universidad Gerardo Barrios. La versión web usa módulos ES y CDN para mantenerse desplegable en Cordova/Vercel sin proceso de compilación obligatorio.

## Funcionalidades incluidas

- Catálogo público responsive con búsqueda en tiempo real, filtros, ordenamiento, vista grid/lista, lazy loading, paginación incremental y skeleton loaders.
- Vista individual de libro con metadatos editoriales, palabras clave, portada, enlaces externos Drive/OneDrive y visor embebido mediante `iframe`.
- Panel administrativo protegido con flujo de login Firebase/demo, roles, permisos, CRUD de libros, taxonomías preparadas y gestión de enlaces externos.
- Centro de configuración rediseñado con navegación por secciones, estado visual de Firebase/Firestore, sincronización manual, exportaciones y gestión de usuarios Master.
- Registro rápido de libros desde catálogo para usuarios Master mediante botón flotante y formulario modal con validación inmediata.
- Cambio y recuperación de contraseña desde perfil, indicadores de fortaleza y soporte para obligación de cambio en primer inicio.
- Importación masiva CSV con detección de columnas, validación mínima, previsualización y reporte de errores/duplicados.
- Dashboard con KPI y gráficas CSS para libros por categoría/año, autores, archivos, estados y publicaciones recientes.
- Exportación de datos en CSV/Excel y reportes PDF institucionales imprimibles con logo, tabla de contenidos y filtros.
- Configuración global desacoplada mediante `www/js/firebase/firebaseConnection.js`, modo claro/oscuro, servicios reutilizables y reglas Firebase.
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
│   ├── js/firebase/firebaseConnection.js
│   ├── js/services/firebaseService.js
│   ├── js/store/demoData.js
│   ├── js/utils/exporters.js
│   └── assets/
└── scripts/validate-project.mjs
```

## Configuración Firebase

1. Cree un proyecto Firebase.
2. Active Authentication con proveedor correo/contraseña.
3. Cree Firestore y Firebase Storage.
4. Publique `firestore.rules` y `storage.rules`.
5. Reemplace la configuración `firebaseConfig` en `www/js/firebase/firebaseConnection.js` o sustituya ese archivo desde el pipeline de despliegue.
6. Cambie `demoMode` a `false` en `databaseSettings` para usar Firebase real.


### Archivo dedicado de conexión

La conexión a Firebase/Firestore está centralizada en `www/js/firebase/firebaseConnection.js`. El HTML ya no contiene credenciales ni parámetros de conexión. El servicio `firebaseService` solo importa y solicita la conexión desde ese módulo.

> Importante: las claves web de Firebase identifican el proyecto, pero no sustituyen las reglas de seguridad. Mantenga reglas Firestore/Storage estrictas y use variables del pipeline para reemplazar este archivo en producción.

### Usuario inicial Master

El usuario Master se crea con Firebase Admin SDK desde un entorno seguro, nunca desde el frontend. El proyecto incluye el script `scripts/create-master-user.mjs` para crear o actualizar el usuario inicial, asignar custom claims y registrar su perfil en Firestore.

1. En Firebase Console, abra **Project settings → Service accounts** y genere una llave privada JSON.
2. Guarde el archivo fuera de `www/` y no lo suba al repositorio.
3. Instale temporalmente Admin SDK si aún no está disponible:

```bash
npm install --no-save firebase-admin
```

4. Ejecute el script con la ruta del service account:

```bash
FIREBASE_SERVICE_ACCOUNT="/ruta/segura/service-account.json" \
MASTER_EMAIL="saulbonilla@ugb.edu.sv" \
MASTER_DISPLAY_NAME="SaulBonilla" \
MASTER_PASSWORD="#Contra123" \
npm run firebase:create-master
```

También puede usar `FIREBASE_SERVICE_ACCOUNT_JSON` si el JSON viene desde una variable segura del pipeline. El script asigna:

```js
{
  role: 'Master',
  mustChangePassword: true
}
```

La contraseña temporal `#Contra123` debe entregarse por un canal seguro y forzar cambio en el primer inicio. No se hardcodea en el frontend. El módulo de configuración permite solicitar restablecimiento por correo y cambiar contraseña con reautenticación cuando Firebase real está activo.

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


## Configuración avanzada

El centro de configuración incluye:

- **General:** parámetros visuales, tema activo y referencia a configuración desacoplada.
- **Perfil y contraseña:** cambio de contraseña, recuperación por correo e indicador de fortaleza.
- **Usuarios:** disponible para rol Master; permite crear/editar perfiles, asignar roles, activar/desactivar, obligar cambio de contraseña, restablecer contraseñas y revisar último acceso registrado.
- **Base de datos:** estado de conexión Firebase/Firestore, última sincronización, fallos detectados, recomendaciones y sincronización manual con progreso.
- **Exportaciones:** descarga de libros, usuarios y estadísticas en CSV/Excel, y reportes PDF institucionales imprimibles para resultados filtrados, libros con ISBN o sin ISBN.

> Nota: la creación real de usuarios de Authentication y el cambio de custom claims deben ejecutarse desde Admin SDK o Cloud Functions. El frontend gestiona perfiles, roles funcionales y solicitudes de recuperación sin exponer credenciales administrativas.


## Reestructuración 2026-05-21

- El catálogo público se separó de la gestión editorial: ahora la creación/edición de publicaciones está en un módulo independiente (**Gestión Editorial**).
- El panel de configuración opera como pantalla independiente con estado de conexión Firebase/Firestore, herramientas de exportación y mantenimiento.
- Se añadió módulo de **Categorías** y módulo de **Colecciones** con visibilidad pública/privada.
- Se agregó control de privacidad en publicaciones y generación de enlaces privados con token y expiración para compartir contenido oculto.
- Se agregó personalización de vista del catálogo (compacta, mediana, ampliada) con preferencia persistida en `localStorage`.
- La configuración base de Firebase se centraliza en `www/js/firebase/config.js`, y `firebaseConnection.js` prepara la integración para Firestore/Auth/Storage y validación automática al iniciar.
