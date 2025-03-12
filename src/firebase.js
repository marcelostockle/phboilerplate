import axios from "axios";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let app = null;
let db = null;
let auth = null;
const midominio = "https://mi-dominio.net/getFirebaseConfig";

const fetchFirebaseConfig = async () => {
  try {
    const response = await axios.get(midominio);
    return response.data;
  } catch (error) {
    console.error("Error al obtener la configuración de Firebase:", error);
    return null;
  }
};

const initFirebase = async () => {
  const config = await fetchFirebaseConfig();
  if (!config) throw new Error("Failed to fetch Firebase config");

  if (!app) {
    app = initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
  }

  return { app, auth, db };
};

export { initFirebase };