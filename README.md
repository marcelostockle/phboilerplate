# phboilerplate

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
firebase login
firebase init
```

Initialize Firebase Functions in Firebase Console. Install and deploy getFirebaseConfig to your project with

```sh
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

Go to src/firebase.js and replace

```
const cloudfunctionsDomain = "https://southamerica-west1-midominio.cloudfunctions.net";
```

with your cloud functions domain.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
## PWA 
```sh
npm install vite-plugin-pwa --save-dev
```
configurar archivo **vite.config.js**
#### Ejemplo Basico:
```sh
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', // Para que el service worker se actualice automáticamente
      manifest: {
        name: 'Mi App PWA',
        short_name: 'MiApp',
        description: 'Mi aplicación PWA con Vue 3',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```
## Instalación y Configuración de Firebase
#### 1. Crear un Proyecto en Firebase
 Ingresa a la Consola de Firebase y crea un nuevo proyecto.
 Una vez creado el proyecto, agrega una aplicación web para obtener la configuración (los parámetros como apiKey, authDomain, projectId, etc.).
#### 2. Instalar Firebase en el Proyecto
 En la raíz del proyecto, ejecuta el siguiente comando:

```sh
npm install firebase
```

### 3. Configurar Firebase
 Crea un archivo, src/firebase.js, y añade la configuración obtenida desde la consola de Firebase.

### 4. configura la functions de firebase para extraer las variables de entorno.
Inicializar Firebase Functions, si aún no has inicializado Firebase Functions en tu proyecto, ejecuta:
```sh
firebase init functions
```
### Configuración de Variables de Entorno desde Google Cloud Console
 ingresa a Google Cloud Console y asegúrate de estar en el mismo proyecto de Firebase que estás utilizando para tus funciones.

En el menú de navegación, selecciona Cloud Functions. Aquí verás la lista de funciones desplegadas en tu proyecto.

#### Selecciona la Función a Configurar:
 Haz clic en el nombre de la función a la que deseas agregar o modificar variables de entorno.

#### Editar Configuración:
 Dentro de la vista de detalles de la función, busca y haz clic en el botón Editar (o una opción similar). Esto te llevará a la página de configuración de la función.

#### Agregar Variables de Entorno:
  En la sección de Variables de entorno encontrarás un formulario donde puedes ingresar pares clave-valor. Aquí puedes:

 Agregar una nueva variable: Introduce el nombre de la variable y su valor.
 Modificar o eliminar variables existentes: Actualiza o elimina las variables según lo necesites.
#### Guardar y Desplegar:

Ten en cuenta que, al modificar las variables de entorno directamente desde la consola, deberás asegurarte de que dichos cambios se reflejen en tu flujo de despliegue y en la documentación del proyecto, para mantener la coherencia con los valores utilizados en desarrollo.

## configura las reglas de acceso en firestore.rules
### Para actualizar y desplegar las reglas de acceso a Firestore, utiliza el siguiente comando:

```sh
firebase deploy --only firestore:rules
```

### Desplegar Hosting:

```sh
firebase deploy --only hosting
```
### Desplegar Fuctions:

```sh
firebase deploy --only functions
```
### install component vue3 select

```sh
npm add vue3-select-component
```
### Installando PrimeVue
```sh
npm install @primeuix/themes --save
```
#### Configurar el archivo primevue-config.js
```sh
// primevue-config.js
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import Select from 'primevue/select';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import AutoComplete from 'primevue/autocomplete';

export function setupPrimeVue(app) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura, //Aura, Material, Lara, Nara
      options: {
        prefix: 'p',
        darkModeSelector: false,
        cssLayer: false
      }
    }
  });

  // Registro global de componentes de PrimeVue
  app.component('Select', Select);
  app.component('Dropdown', Dropdown);
  app.component('MultiSelect', MultiSelect);
  app.component('AutoComplete', AutoComplete);
}
```
### Installar apexCharts:
```sh
npm install vue3-apexcharts apexcharts --save
```
## TaildWind CSS
#### 1. Instalar dependencias necesarias:
```sh
npm install tailwindcss@^3 autoprefixer postcss postcss-import tailwindcss-primeui
```
<blockquote>
Asegúrate de tener Tailwind v3 y NO Tailwind v4, porque tailwindcss-primeui no es compatible con Tailwind 4 aún.
</blockquote>

#### 2. Crea tailwind.config.js y postcss.config.js:
```sh
npx tailwindcss init -p
```
#### 3. Configurar tailwind.config.js
```sh
// tailwind.config.js
import primeui from 'tailwindcss-primeui';

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/primevue/**/*.{js,vue}'
  ],
  darkMode: ['class'], // o 'media' según tu preferencia
  theme: {
    extend: {},
  },
  plugins: [primeui],
}

```
#### 4. Crear y usar postcss.config.js
```sh
// postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  }
};
```
<blockquote>
En caso de error<br>
Renombra tu archivo postcss.config.js a postcss.config.cjs.
Esto le indica a Node que debe interpretar ese archivo como CommonJS, lo cual es lo esperado por PostCSS.
</blockquote>

#### 5. CSS principal (src/assets/tailwind.css)
```sh
@tailwind base;
@tailwind components;
@tailwind utilities;
```
#### 6. Install Forms
```sh
npm install @primevue/forms
```
### agregar a main.js
```sh
import { Form, FormField } from '@primevue/forms'; 

app.component(Form);
app.component(FormField);
```
#### 7. Install lodash.set
```sh
npm install lodash.set
```
#### 8. validacion con Zod
```sh
npm install zod
```
#### 9. Notification
# 📲 Notificaciones Push Web con Firebase Cloud Messaging (FCM) y Vue

Este README documenta el **paso a paso completo** para habilitar, guardar y enviar notificaciones push web en un proyecto Vue usando Firebase y Cloud Functions. Incluye ejemplos de código, estructura de Firestore, y troubleshooting para el equipo de desarrollo.

---

## Tabla de Contenidos

- [Resumen del Flujo](#resumen-del-flujo)
- [Archivos y Servicios Utilizados](#archivos-y-servicios-utilizados)
- [Estructura en Firestore](#estructura-en-firestore)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Implementación Paso a Paso](#implementación-paso-a-paso)
- [Fragmentos de Código Relevantes](#fragmentos-de-código-relevantes)
- [Cloud Function: sendNotification](#cloud-function-sendnotification)
- [Cómo probar el envío de notificaciones](#cómo-probar-el-envío-de-notificaciones)
- [Requisitos previos y notas](#requisitos-previos-y-notas)
- [Troubleshooting](#troubleshooting)
- [Notas de Seguridad](#notas-de-seguridad)

---

## Resumen del Flujo

1. **El usuario activa las notificaciones:**
   - Se solicita permiso en el navegador.
   - Se obtiene el token FCM con la VAPID Key.
   - El token se guarda en Firestore bajo `/users/<userId>/tokens/<token>`.
2. **El usuario desactiva las notificaciones:**
   - El token se elimina de Firestore y (opcionalmente) de FCM.
3. **Un backend (Cloud Function) envía una notificación:**
   - Se consulta Firestore para obtener los tokens activos del usuario.
   - Se envía la notificación a esos tokens usando Firebase Admin SDK.

---

## Archivos y Servicios Utilizados

### Frontend

- `notificationService.js`: Servicio para gestionar permisos, obtener/guardar/eliminar token y enviar notificaciones.
- `SideBarMenu.vue`: Botón campanita para activar/desactivar notificaciones.
- `.env`: Variables de entorno (incluye VAPID Key).
- `firebase-messaging-sw.js`: Service Worker de FCM para web.
- `firebase.js`: Inicialización de Firebase en el proyecto.

### Backend

- `sendNotification.js`: Cloud Function para enviar notificaciones usando tokens de Firestore.

---

## Estructura en Firestore

```plaintext
users
 └─ <userId>
     └─ tokens
          └─ <token>
               ├─ token: "string"
               └─ createdAt: <timestamp>
```

Cada usuario puede tener uno o varios tokens (por navegador o dispositivo).

---

## Configuración de Variables de Entorno

En tu `.env` (usa `VITE_` si usas Vite, o `VUE_APP_` en Vue CLI):

```env
VITE_FIREBASE_VAPID_KEY=TU_VAPID_KEY_DE_FIREBASE
VUE_APP_FIREBASE_API_KEY=...
VUE_APP_FIREBASE_AUTH_DOMAIN=...
VUE_APP_FIREBASE_PROJECT_ID=...
VUE_APP_FIREBASE_STORAGE_BUCKET=...
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=...
VUE_APP_FIREBASE_APP_ID=...
VUE_APP_FIREBASE_MEASUREMENT_ID=...
```

La VAPID Key se encuentra en Firebase Console → Project Settings → Cloud Messaging.

---

## Implementación Paso a Paso

### 1. **Registrar Service Worker**

Asegúrate de registrar `firebase-messaging-sw.js` en tu `main.js`:

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => console.log('Service Worker registrado correctamente'))
    .catch(err => console.error('Error registrando Service Worker:', err));
}
```

### 2. **Solicitar permiso y guardar el token**

Desde un botón en la UI, llama a `notificationService.requestPermissionAndSaveToken()`. Esto pide permiso, obtiene el token y lo guarda en Firestore bajo el usuario autenticado.

### 3. **Eliminar el token (desactivar notificaciones)**

Cuando el usuario desactive las notificaciones (campanita), llama a `notificationService.deleteCurrentUserToken()`. Esto elimina el token en Firestore.

### 4. **Enviar una notificación desde el backend**

Haz un POST a la Cloud Function con el `userId` y el mensaje.

```http
POST https://southamerica-east1-hexbd-4ee52.cloudfunctions.net/sendNotification
Content-Type: application/json

{
  "userId": "<userId>",
  "title": "Título de la notificación",
  "body": "Mensaje para mostrar"
}
```

---

## Fragmentos de Código Relevantes

### notificationService.js (extracto)

```js
export const requestPermissionAndSaveToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permiso de notificaciones denegado');
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  const registration = await navigator.serviceWorker.ready;
  const { app } = await getFirebaseServices();
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  // Guarda el token en Firestore bajo users/<userId>/tokens/<token>
  // ...
  return token;
}

export const deleteCurrentUserToken = async () => {
  // Obtiene el token actual y lo elimina de Firestore
  // ...
}
```

### SideBarMenu.vue (fragmento relevante)

```vue
<template>
  <button @click="toggleNotifications">
    <i :class="notificationsEnabled ? 'pi pi-bell' : 'pi pi-bell-slash'"></i>
  </button>
</template>

<script>
methods: {
  async toggleNotifications() {
    if (!this.notificationsEnabled) {
      await notificationService.requestPermissionAndSaveToken();
      this.notificationsEnabled = true;
      localStorage.setItem('notificationsEnabled', 'true');
    } else {
      await notificationService.deleteCurrentUserToken();
      this.notificationsEnabled = false;
      localStorage.setItem('notificationsEnabled', 'false');
    }
  },
}
</script>
```

---

## Cloud Function: sendNotification

```js
const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');
const cors = require('cors');
if (!admin.apps.length) admin.initializeApp();
exports.sendNotification = functions.https.onRequest({ region: 'southamerica-east1' }, async (req, res) => {
  // ... validaciones y CORS
  const { userId, title, body } = req.body;
  const tokenSnap = await admin.firestore().collection('users').doc(userId).collection('tokens').get();
  const tokens = tokenSnap.docs.map(d => d.data().token).filter(Boolean);
  const messaging = admin.messaging();
  const message = { notification: { title, body }, tokens };
  const response = await messaging.sendMulticast(message);
  res.json({ success: true, messageCount: response.successCount, failureCount: response.failureCount });
});
```

---

## Cómo probar el envío de notificaciones

1. **Asegúrate de tener un usuario autenticado y con token guardado en Firestore** en `/users/<userId>/tokens/<token>`.
2. **Usa Postman o cURL** para llamar a la función:

```http
POST https://southamerica-east1-hexbd-4ee52.cloudfunctions.net/sendNotification
Content-Type: application/json
{
  "userId": "8J4zDrQkExbasBzh2Na2ODHsAHX2",
  "title": "Notificación de Prueba",
  "body": "¿Ves esto en tu navegador? ¡Todo está bien!"
}
```

3. **Verifica en tu navegador** que la notificación aparece, incluso si la web no está abierta (mientras tenga Service Worker activo).
4. **Revisa Firestore** para ver si el token está creado y actualizado.

---

## Requisitos previos y notas

- El proyecto debe tener habilitada la API de Firebase Cloud Messaging en Google Cloud Console.
- La cuenta de servicio de las funciones debe tener permisos para FCM.
- La VAPID Key debe estar bien configurada.
- El Project ID debe ser el mismo en Firebase y en la Cloud Function.
- El Service Worker debe estar bien registrado.

---

## Troubleshooting

- **No recibo notificaciones:**
  - Verifica permisos del navegador y el estado del token en Firestore.
  - Asegúrate de que la función Cloud Function está corriendo y el endpoint responde.
  - Consulta los logs con: `firebase functions:log --only sendNotification`
- **Error 404 **``**:**
  - Revisa la versión del SDK de `firebase-admin` y la compatibilidad del método `sendMulticast`.
  - Asegúrate de tener la versión adecuada en `package.json` y que el token esté correcto (string, no array vacío).
- **No hay token guardado:**
  - El usuario debe dar permiso en el navegador y tener un usuario autenticado para asociar el token.

---

## Notas de Seguridad

- Nunca expongas la VAPID Key ni los tokens FCM fuera del flujo autenticado.
- Protege el endpoint de la función con autenticación en producción.
- Borra los tokens en Firestore cuando el usuario cierre sesión o desactive notificaciones.
- Usa HTTPS en producción.

---