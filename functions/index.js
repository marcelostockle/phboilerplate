const functions = require("firebase-functions");
const cors = require("cors");

const corsHandler = cors({ origin: true });

exports.getFirebaseConfig = functions.
  https.onRequest({ region: 'southamerica-west1' },(req, res) => {
    corsHandler(req, res, () => {
      try {
        const config = {
          apiKey: process.env.firebase_api_key,
          authDomain: process.env.firebase_auth_domain,
          projectId: process.env.firebase_project_id,
          storageBucket: process.env.firebase_storage_bucket,
          messagingSenderId: process.env.firebase_messaging_sender_id,
          appId: process.env.firebase_app_id,
        };

        if (!config.apiKey) {
          throw new Error("Las variables de entorno de Firebase no están configuradas correctamente");
        }

        res.json(config);
      } catch (error) {
        console.error("Error al obtener la configuración de Firebase:", error.message);
        res.status(500).json({ error: error.message });
      }
    }
  );
});
const { callLLM } = require('./llm-function/callLLM');
exports.callLLM = callLLM;

const { sendNotification } = require("./notification/sendNotification");
exports.sendNotification = sendNotification;