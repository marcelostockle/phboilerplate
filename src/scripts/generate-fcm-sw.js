import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

async function generateServiceWorker() {
  try {
    const { data: config } = await axios.get('https://southamerica-east1-hexbd-4ee52.cloudfunctions.net/getFirebaseConfig');

    const content = `
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
`;

    const filePath = path.resolve('public', 'firebase-messaging-sw.js');
    await fs.writeFile(filePath, content);
    console.log('firebase-messaging-sw.js generado correctamente en:', filePath);
  } catch (error) {
    console.error('Error generando firebase-messaging-sw.js:', error);
  }
}

generateServiceWorker();
