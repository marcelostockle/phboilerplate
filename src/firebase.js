import axios from "axios";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

let firebaseInstance = null;
const cloudfunctionsDomain = "https://southamerica-west1-midominio.cloudfunctions.net";

const fetchFirebaseConfig = async () => {
  try {
    const response = await axios.get(
      `${cloudfunctionsDomain}/getFirebaseConfig`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    return null;
  }
};

export const initFirebase = async () => {
  if (firebaseInstance) return firebaseInstance; // Prevent re-initialization

  const config = await fetchFirebaseConfig();
  if (!config) throw new Error("Failed to fetch Firebase config");

  const app = initializeApp(config);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);

  firebaseInstance = { app, db, auth, storage };
  return firebaseInstance;
};

// Ensure Firebase is initialized before any access
export const getFirebaseServices = async () => {
  if (!firebaseInstance) await initFirebase();
  return firebaseInstance;
};