import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { initFirebase } from "@/firebase";

let auth;

const initializeAuth = async () => {
  if (!auth) {
    const { auth: initializedAuth } = await initFirebase();
    auth = initializedAuth;
  }
};

const registerUser = async (email, password) => {
  await initializeAuth();
  return createUserWithEmailAndPassword(auth, email, password);
};

const loginUser = async (email, password) => {
  await initializeAuth();
  return signInWithEmailAndPassword(auth, email, password);
};

const logoutUser = async () => {
  await initializeAuth();
  return signOut(auth);
};

const isUserLoggedIn = async () => {
  await initializeAuth();
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(!!user);  // Resolves to true if user is logged in, otherwise false
    });
  });
};

export { registerUser, loginUser, logoutUser, isUserLoggedIn };