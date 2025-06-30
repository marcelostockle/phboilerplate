import { getFirebaseServices } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier
 } from "firebase/auth";
import { reactive, readonly } from "vue";
import dbService from "./dbService";

const state = reactive({
  user: null,
  isLoggedIn: false,
});

let confirmationResult = null;

const initAuthListener = async () => {
  const { auth } = await getFirebaseServices();
  onAuthStateChanged(auth, async (user) => {
    state.isLoggedIn = !!user;
    state.emailVerified = user?.emailVerified || false;
    if (user) {
      const res = await dbService.fetchDocument('users', user.uid);
      if (res.success) {
        state.user = res.data;
      }
    } else {
      state.user = null;
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
    sendEmailVerification(user);

    // Crear usuario en Firestore DB
    dbService.createOrUpdateDocument(`users/${userCredential.user.uid}`, {
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

const verifyEmail = async () => {
  const { auth } = await getFirebaseServices();
  if (!auth.currentUser) {
    return { success: false, message: "No user logged in" };
  }
  if (auth.currentUser.emailVerified) {
    return { success: false, message: "Email already verified" };
  }

  try {
    await sendEmailVerification(auth.currentUser);
    return { success: true, message: "Verification email sent!" };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, message: error.code };
  }
}

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

const startPhoneSignIn = async (phoneNumber, recaptchaContainerId = "recaptcha-container") => {
  const { auth } = await getFirebaseServices();

  try {
    // Only create reCAPTCHA once
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(recaptchaContainerId, {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved
        }
      }, auth);
    }

    const appVerifier = window.recaptchaVerifier;

    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

    return { success: true, message: "Code sent successfully" };
  } catch (error) {
    console.error("Phone sign-in error:", error);
    return { success: false, message: error.code };
  }
};

const confirmPhoneCode = async (code) => {
  if (!confirmationResult) {
    return { success: false, message: "No confirmation available" };
  }

  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;

    await dbService.createOrUpdateDocument(`users/${user.uid}`, {
      phoneNumber: user.phoneNumber,
      createdAt: new Date(),
    });

    return { success: true, user, message: "Signed in successfully" };
  } catch (error) {
    console.error("Code confirmation error:", error);
    return { success: false, message: error.code };
  } finally {
    // Clean up recaptcha
    if (window.recaptchaVerifier?.clear) {
      window.recaptchaVerifier.clear();
    }
    confirmationResult = null;
    window.recaptchaVerifier = null;
  }
};

// Prematurely stop phone sign-in
// This is useful if the user decides to cancel the sign-in process
const stopPhoneSignIn = () => {
  if (window.recaptchaVerifier?.clear) {
    window.recaptchaVerifier.clear();
  }
  confirmationResult = null;
  window.recaptchaVerifier = null;
};

const refreshUserData = async () => {
  const { auth } = await getFirebaseServices();
  if (!auth.currentUser) {
    return { success: false, message: "No user logged in" };
  }
  try {
    const user = auth.currentUser;
    let res = await dbService.fetchDocument('users', user.uid);
    if (res.success) {
      state.user = res.data;
      return { success: true, user: state.user, message: "User data refreshed" };
    } else {
      return { success: false, message: "Failed to fetch user data" };
    }
  } catch (error) {
    console.error("Error refreshing user data:", error);
  }
}

export default {
  state: readonly(state),
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resetPassword,
  startPhoneSignIn,
  stopPhoneSignIn,
  confirmPhoneCode,
  refreshUserData,
};
