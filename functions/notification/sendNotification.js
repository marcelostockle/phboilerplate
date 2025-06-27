const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');
const cors = require('cors');

if (!admin.apps.length) {
  admin.initializeApp();
}

const { getMessaging } = require('firebase-admin/messaging');

const corsHandler = cors({
  origin: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
});

exports.sendNotification = functions.https.onRequest({ region: 'southamerica-east1' }, async (req, res) => {
  await new Promise((resolve, reject) => {
    corsHandler(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { userId, title, body } = req.body;
  if (!userId || !title || !body) {
    return res.status(400).send('Missing parameters');
  }

  try {
    // Obtén los tokens del usuario desde Firestore
    const tokenSnap = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('tokens')
      .get();

    const tokens = tokenSnap.docs.map(d => d.data().token).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(404).json({ success: false, error: 'No tokens found' });
    }

    const messaging = getMessaging();
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // ENVÍA LA NOTIFICACIÓN A CADA TOKEN (WEB)
    for (const token of tokens) {
      try {
        const response = await messaging.send({
          token,
          notification: { title, body },
          webpush: {
            notification: {
              title,
              body,
            }
          }
        });
        console.log('Enviado con éxito a:', token, response);
        results.push({ token, success: true, response });
        successCount++;
      } catch (err) {
        console.error('Error enviando a:', token, err.message || err);
        results.push({ token, success: false, error: err.message || err });
        failureCount++;
      }
    }

    // Devuelve los resultados detallados
    return res.json({
      success: true,
      results,
      successCount,
      failureCount
    });

  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
