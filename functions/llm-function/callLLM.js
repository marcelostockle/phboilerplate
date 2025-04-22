const functions = require("firebase-functions");
const axios = require("axios");

exports.callLLM = functions.https.onRequest({ region: 'southamerica-west1' }, async(req, res) => {
    
      const prompt = req.body.prompt;

      if (!prompt) {
        return res.status(400).json({ error: "El campo 'prompt' es requerido" });
      }

      try {
        const response = await axios.post("https://dominio-de-la-api.app/generate", {
          prompt: prompt,
        });
    
        res.status(200).send(response.data);
      } catch (error) {
        console.error("Error al enviar el prompt:", error);
        res.status(500).send("Error al generar respuesta.");
      }
  });
