import { getFirebaseServices } from "./firebase";
import { reactive, readonly } from "vue";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, DocumentReference, Timestamp, GeoPoint } from "firebase/firestore";
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

const fetchCollection = async (collectionPath) => {
  const { db } = await getFirebaseServices();
  try {
    const colRef = collection(db, ...collectionPath.replace(/^\/+|\/+$/g, '').split('/'));
    const colSnap = await getDocs(colRef);
    const documents = colSnap.docs.map(doc => ({
      id: doc.id,
      ...resolveFirestoreTypes(doc.data())
    }));
    return { success: true, data: documents };
  } catch (error) {
    console.error("Fetch collection error:", error);
    return { success: false, message: error.code };
  }
};

async function queryCollection(collectionPath, filters = [], options = {}) {
  const { db } = await getFirebaseServices();
  try {
    let q = collection(db, ...collectionPath.replace(/^\/+|\/+$/g, '').split('/'));

    // Filters (AND logic only)
    filters.forEach(({ field, operator, value }) => {
      q = query(q, where(field, operator, value));
    });

    // Sorting
    if (options.orderBy) {
      const { field, direction = "asc" } = options.orderBy;
      q = query(q, orderBy(field, direction));
    }

    // Pagination
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }

    // Execute query
    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...resolveFirestoreTypes(doc.data()) }));
    return { success: true, data: documents };
  } catch (error) {
    console.error("Error querying collection:", error);
    return { success: false, message: error.code };
  }
}

const fetchDocument = async (collectionPath, docId) => {
  const { db } = await getFirebaseServices();
  try {
    const pathArray = collectionPath.replace(/^\/+|\/+$/g, '').split('/');
    const docRef = doc(db, ...pathArray, docId);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...resolveFirestoreTypes(docSnap.data()) } };
    } else {
      return { success: false, message: "Document not found" };
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return { success: false, message: error.code };
  }
};

const createOrUpdateDocument = async (collectionPath, data) => {
  const { db } = await getFirebaseServices();
  
  try {
    let docRef;
    const pathArray = collectionPath.replace(/^\/+|\/+$/g, '').split('/');

    // If path ends with collection (odd length), use addDoc for auto-ID
    if (pathArray.length % 2 === 1) {
      const colRef = collection(db, ...pathArray);
      const result = await addDoc(colRef, data);
      return { 
        success: true, 
        message: "Document created with auto-generated ID",
        id: result.id 
      };
    } 
    // If path ends with document ID (even length), use setDoc
    else {
      docRef = doc(db, ...pathArray);
      await setDoc(docRef, data, { merge: true });
      return { 
        success: true, 
        message: "Document created/updated successfully",
        id: pathArray[pathArray.length - 1] 
      };
    }
  } catch (error) {
    console.error("Firestore operation error:", error);
    return { 
      success: false, 
      message: error.message,
      code: error.code 
    };
  }
};

const deleteDocument = async (collectionPath, docId) => {
  const { db } = await getFirebaseServices();
  try {
    const pathArray = collectionPath.replace(/^\/+|\/+$/g, '').split('/');
    const docRef = doc(db, ...pathArray, docId);
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
  queryCollection,
  createOrUpdateDocument,
  deleteDocument,
  uploadFile,
  getFileURL,
  deleteFile,
};