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
      return { success: true, data: { id: docSnap.id, ...resolveFirestoreTypes(docSnap.data()) } };
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

async function queryCollection(collectionName, filters = [], options = {}) {
  const { db } = await getFirebaseServices();
  try {
    let q = collection(db, collectionName);

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


const createOrUpdateDocument = async (pathArray, data) => {
  // pathArray:
  // For top-level collection: ['collectionName', 'docId']
  // For subcollection: ['parentCollection', 'parentDocId', 'subcollection', 'docId']
  // For nested subcollections: ['col1', 'doc1', 'col2', 'doc2', 'col3', 'doc3']
  const { db } = await getFirebaseServices();
  
  try {
    let docRef;
    
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
  queryCollection,
  createOrUpdateDocument,
  updateDocument,
  deleteDocument,
  uploadFile,
  getFileURL,
  deleteFile,
};
