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
