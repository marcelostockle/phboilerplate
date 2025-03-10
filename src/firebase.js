import axios from "axios";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const fetchFirebaseConfig = async () => {
  try {
    const response = await axios.get(
      "https://southamerica-west1-termolaboral.cloudfunctions.net/getFirebaseConfig"
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener la configuración de Firebase:", error);
    return null;
  }
};

const initFirebase = async () => {
  const config = await fetchFirebaseConfig();
  if (!config) throw new Error("Failed to fetch Firebase config");
  
  const app = initializeApp(config);
  const db = getFirestore(app);
  const auth = getAuth(app); 

  return { app, auth, db };
};

export { initFirebase };