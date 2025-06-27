import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import axios from 'axios'
import { getFirebaseServices } from '@/firebase/firebase'
import authService from './authService'
import dbService from './dbService'

const cloudfunctionsDomain = 'https://southamerica-east1-hexbd-4ee52.cloudfunctions.net'
let messagingInstance = null

const initMessaging = async () => {
  if (!messagingInstance) {
    const { app } = await getFirebaseServices()
    messagingInstance = getMessaging(app)
  }
  return messagingInstance
}

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

export const onForegroundMessage = (callback) => {
  initMessaging().then(() => {
    onMessage(messagingInstance, (payload) => {
      if (callback) callback(payload)
    })
  })
}

export const sendNotification = async ({ userId, title, body }) => {
  const response = await axios.post(`${cloudfunctionsDomain}/sendNotification`, {
    userId,
    title,
    body
  })
  return response.data
}

export default {
  requestPermissionAndSaveToken,
  onForegroundMessage,
  sendNotification,
  deleteCurrentUserToken
}
