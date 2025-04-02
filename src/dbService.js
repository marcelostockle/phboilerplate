import { getFirebaseServices } from "./firebase";
import { reactive, readonly } from "vue";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  DocumentReference, Timestamp, GeoPoint } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const state = reactive({
  data: {},
});

const resolveFirestoreTypes = (data) => {
  if (!data || typeof data !== "object") return data;
  
  for (const key in data) {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate();
    } else if (data[key] instanceof GeoPoint) {
      data[key] = { latitude: data[key].latitude, longitude: data[key].longitude };
    } else if (data[key] instanceof DocumentReference) {
      data[key] = { refPath: data[key].path };
    } else if (typeof data[key] === "object") {
      data[key] = resolveFirestoreTypes(data[key]);
    }
  }
  return data;
};

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
      return { success: true, data: resolveFirestoreTypes(docSnap.data()) };
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
    const documents = colSnap.docs.map(doc => ({ id: doc.id, ...resolveFirestoreTypes(doc.data()) }));
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

const uploadFile = async (filePath, file) => {
  const storage = getStorage();
  try {
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    return { success: true, message: "File uploaded successfully" };
  } catch (error) {
    console.error("File upload error:", error);
    return { success: false, message: error.code };
  }
};

const getFileURL = async (filePath) => {
  const storage = getStorage();
  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return { success: true, url };
  } catch (error) {
    console.error("Get file URL error:", error);
    return { success: false, message: error.code };
  }
};

const deleteFile = async (filePath) => {
  const storage = getStorage();
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error("Delete file error:", error);
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
  uploadFile,
  getFileURL,
  deleteFile,
};
