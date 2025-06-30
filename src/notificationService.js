import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import axios from 'axios'
import { getFirebaseServices } from '@/firebase/firebase'
import authService from './authService'
import dbService from './dbService'
import {
  collection, query, where, getDocs, doc, updateDoc, orderBy, limit, onSnapshot
} from "firebase/firestore"

const cloudfunctionsDomain = 'https://southamerica-east1-remplazarruta.cloudfunctions.net' // Cambia esto por tu dominio de Cloud Functions
let messagingInstance = null

const initMessaging = async () => {
  if (!messagingInstance) {
    const { app } = await getFirebaseServices()
    messagingInstance = getMessaging(app)
  }
  return messagingInstance
}

/**
 * Solicita permisos, obtiene el token y lo guarda en Firestore bajo el usuario autenticado.
 */
export const requestPermissionAndSaveToken = async () => {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Permiso de notificaciones denegado')
  await initMessaging()
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) throw new Error('VAPID_KEY no está definido en las variables de entorno')
  const registration = await navigator.serviceWorker.ready
  const token = await getToken(messagingInstance, {
    vapidKey,
    serviceWorkerRegistration: registration
  })
  const user = authService.state.user
  if (token) {
    console.log('Token FCM obtenido:', token)
    if (user && user.id) {
      try {
        await dbService.createOrUpdateDocument(['users', user.id, 'tokens', token], {
          token,
          createdAt: new Date()
        })
        console.log('Token guardado en Firestore')
      } catch (e) {
        console.error('Error guardando token en Firestore:', e)
      }
    }
  } else {
    console.warn('No se pudo obtener un token FCM')
  }
  return token
}

/**
 * Elimina el token actual del usuario autenticado en Firestore.
 */
export const deleteCurrentUserToken = async () => {
  const user = authService.state.user
  if (!user || !user.id) return
  await initMessaging()
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) throw new Error('VAPID_KEY no está definido en las variables de entorno')
  const registration = await navigator.serviceWorker.ready
  const token = await getToken(messagingInstance, { vapidKey, serviceWorkerRegistration: registration })
  if (token) {
    await dbService.deleteDocument(`users/${user.id}/tokens`, token)
    console.log('Token eliminado de Firestore')
  }
}

/**
 * Escucha notificaciones en primer plano.
 */
export const onForegroundMessage = (callback) => {
  initMessaging().then(() => {
    onMessage(messagingInstance, (payload) => {
      if (callback) callback(payload)
    })
  })
}

/**
 * Envía una notificación a un usuario (Cloud Function).
 * @param {object} params { userId, title, body, categoria }
 */
export const sendNotification = async ({ userId, title, body, categoria = "general" }) => {
  const response = await axios.post(`${cloudfunctionsDomain}/sendNotification`, {
    userId,
    title,
    body,
    categoria
  })
  return response.data
}

/**
 * Obtiene el conteo de notificaciones NO LEÍDAS
 */
export const getUnreadNotificationsCount = async (userId) => {
  const { db } = await getFirebaseServices();
  const notiQuery = query(
    collection(db, "users", userId, "notifications"),
    where("estado", "==", false)
  );
  const snapshot = await getDocs(notiQuery);
  return snapshot.size;
}

/**
 * Suscribe en tiempo real al badge de no leídas.
 * callback recibe el conteo actualizado.
 */
export const subscribeToUnreadNotifications = (userId, callback) => {
  // Retorna función para desuscribirse (después del primer then)
  let unsub = null
  getFirebaseServices().then(({ db }) => {
    const q = query(collection(db, "users", userId, "notifications"), where("estado", "==", false))
    unsub = onSnapshot(q, snap => callback(snap.size))
  })
  return () => unsub && unsub()
}

/**
 * Devuelve el listado de notificaciones (opcional: solo no leídas).
 */
export const getUserNotifications = async (userId, { onlyUnread = false } = {}) => {
  const { db } = await getFirebaseServices();
  let notifQuery = collection(db, "users", userId, "notifications");
  if (onlyUnread) {
    notifQuery = query(notifQuery, where("estado", "==", false), orderBy('fechaEnviado', 'desc'));
  } else {
    notifQuery = query(notifQuery, orderBy('fechaEnviado', 'desc'));
  }
  const snapshot = await getDocs(notifQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Suscribe en tiempo real a las 10 últimas notificaciones para el menú de la campana.
 */
export const subscribeToNotifications = (userId, callback) => {
  // Retorna función para desuscribirse (después del primer then)
  let unsub = null
  getFirebaseServices().then(({ db }) => {
    const q = query(
      collection(db, "users", userId, "notifications"),
      orderBy("fechaEnviado", "desc"),
      limit(10)
    )
    unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      callback(data)
    })
  })
  return () => unsub && unsub()
}

/**
 * Marca como leída una notificación
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  const { db } = await getFirebaseServices();
  const docRef = doc(db, "users", userId, "notifications", notificationId);
  await updateDoc(docRef, { estado: true });
}

export default {
  requestPermissionAndSaveToken,
  onForegroundMessage,
  sendNotification,
  deleteCurrentUserToken,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  getUserNotifications,
  subscribeToUnreadNotifications,
  subscribeToNotifications
}
