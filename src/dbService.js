import { getFirebaseServices } from "./firebase";
import { reactive, readonly } from "vue";
import { collection, doc, getDoc, getDocs, setDoc,
  updateDoc, deleteDoc, DocumentReference } from "firebase/firestore";

const state = reactive({
  data: {},
});

const fetchDocument = async (collectionNameOrRef, docId) => {
  const { db } = await getFirebaseServices();
  try {
    let docRef;
    if (collectionNameOrRef instanceof DocumentReference) {
      docRef = collectionNameOrRef;
    } else if (typeof collectionNameOrRef === "string" && docId) {
      docRef = doc(db, collectionNameOrRef, docId);
    } else {
      throw new Error("Invalid document reference or collection/docId pair");
    }

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, message: "Document not found" };
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return { success: false, message: error.code };
  }
};

const fetchCollection = async (collectionName) => {
  const { db } = await getFirebaseServices();
  try {
    const colRef = collection(db, collectionName);
    const colSnap = await getDocs(colRef);
    const documents = colSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: documents };
  } catch (error) {
    console.error("Fetch collection error:", error);
    return { success: false, message: error.code };
  }
};

const createOrUpdateDocument = async (collectionName, docId, data) => {
  const { db } = await getFirebaseServices();
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
    return { success: true, message: "Document saved successfully" };
  } catch (error) {
    console.error("Create/Update error:", error);
    return { success: false, message: error.code };
  }
};

const updateDocument = async (collectionName, docId, data) => {
  const { db } = await getFirebaseServices();
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    return { success: true, message: "Document updated successfully" };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, message: error.code };
  }
};

const deleteDocument = async (collectionName, docId) => {
  const { db } = await getFirebaseServices();
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true, message: "Document deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, message: error.code };
  }
};

export default {
  state: readonly(state),
  fetchDocument,
  fetchCollection,
  createOrUpdateDocument,
  updateDocument,
  deleteDocument,
};
