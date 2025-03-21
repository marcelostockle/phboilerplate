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
### Instalación y Configuración de Firebase
### 1. Crear un Proyecto en Firebase
### Ingresa a la Consola de Firebase y crea un nuevo proyecto.
### Una vez creado el proyecto, agrega una aplicación web para obtener la configuración (los parámetros como apiKey, authDomain, projectId, etc.).
### 2. Instalar Firebase en el Proyecto
### En la raíz del proyecto, ejecuta el siguiente comando:

```sh
npm install firebase
```

### 3. Configurar Firebase
### Crea un archivo, src/firebase.js, y añade la configuración obtenida desde la consola de Firebase.

### 4. configura la functions de firebase para extraer las variables de entorno.
### Inicializar Firebase Functions, si aún no has inicializado Firebase Functions en tu proyecto, ejecuta:
```sh
firebase init functions
```
### Configuración de Variables de Entorno desde Google Cloud Console
### ingresa a Google Cloud Console y asegúrate de estar en el mismo proyecto de Firebase que estás utilizando para tus funciones.

### En el menú de navegación, selecciona Cloud Functions. Aquí verás la lista de funciones desplegadas en tu proyecto.

### Selecciona la Función a Configurar:
### Haz clic en el nombre de la función a la que deseas agregar o modificar variables de entorno.

### Editar Configuración:
### Dentro de la vista de detalles de la función, busca y haz clic en el botón Editar (o una opción similar). Esto te llevará a la página de configuración de la función.

### Agregar Variables de Entorno:
### En la sección de Variables de entorno encontrarás un formulario donde puedes ingresar pares clave-valor. Aquí puedes:

### Agregar una nueva variable: Introduce el nombre de la variable y su valor.
### Modificar o eliminar variables existentes: Actualiza o elimina las variables según lo necesites.
### Guardar y Desplegar:

### Ten en cuenta que, al modificar las variables de entorno directamente desde la consola, deberás asegurarte de que dichos cambios se reflejen en tu flujo de despliegue y en la documentación del proyecto, para mantener la coherencia con los valores utilizados en desarrollo.

### configura las reglas de acceso en firestore.rules
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