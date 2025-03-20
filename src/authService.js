import { getFirebaseServices } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
 } from "firebase/auth";
import { reactive, readonly } from "vue";
import dbService from "./dbService";

const state = reactive({
  user: null,
  isLoggedIn: false,
});

const initAuthListener = async () => {
  const { auth } = await getFirebaseServices();
  onAuthStateChanged(auth, async (user) => {
    state.user = user;
    state.isLoggedIn = !!user;
    if (state.isLoggedIn) {
      const res = await dbService.fetchDocument('users', state.user.uid);
      if (res.success) {
        state.user = res.data;
      }
    }
  });
};

// Ensure Firebase auth state listener starts
initAuthListener();

const registerUser = async (email, password) => {
  const { auth, db } = await getFirebaseServices();
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Crear usuario en Firestore DB
    dbService.createOrUpdateDocument('users', userCredential.user.uid, {
        email: user.email,
        displayName: user.displayName || "Nuevo usuario",
        createdAt: new Date(),
      })
    return { success: true, user, message: "OK" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: error.code };
  }
};

const loginUser = async (email, password) => {
  const { auth } = await getFirebaseServices();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user, message: "OK" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: error.code };
  }
};

const logoutUser = async () => {
  const { auth } = await getFirebaseServices();
  return signOut(auth);
};

const resetPassword = async (email) => {
  const { auth } = await getFirebaseServices();
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent!" };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, message: error.code };
  }
};

export default {
  state: readonly(state),
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
};
