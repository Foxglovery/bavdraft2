import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Authentication functions
export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Products collection
export const addProduct = async (productData) => {
  return addDoc(collection(db, 'products'), {
    ...productData,
    createdAt: serverTimestamp()
  });
};

export const getProducts = async () => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateProduct = async (productId, productData) => {
  const productRef = doc(db, 'products', productId);
  return updateDoc(productRef, productData);
};

export const deleteProduct = async (productId) => {
  const productRef = doc(db, 'products', productId);
  return deleteDoc(productRef);
};

// Oil batches collection
export const addOilBatch = async (oilBatchData) => {
  return addDoc(collection(db, 'oilBatches'), {
    ...oilBatchData,
    createdAt: serverTimestamp()
  });
};

export const getOilBatches = async () => {
  const querySnapshot = await getDocs(collection(db, 'oilBatches'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteOilBatch = async (oilBatchId) => {
  const oilBatchRef = doc(db, 'oilBatches', oilBatchId);
  return deleteDoc(oilBatchRef);
};

// Batches collection
export const addBatch = async (batchData) => {
  return addDoc(collection(db, 'batches'), {
    ...batchData,
    createdAt: serverTimestamp()
  });
};

export const getBatches = async () => {
  const querySnapshot = await getDocs(collection(db, 'batches'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBatchesByProduct = async (productId) => {
  const q = query(collection(db, 'batches'), where('productId', '==', productId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateBatch = async (batchId, batchData) => {
  const batchRef = doc(db, 'batches', batchId);
  return updateDoc(batchRef, batchData);
};

// Inventory collection
export const getInventory = async () => {
  const querySnapshot = await getDocs(collection(db, 'inventory'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateInventory = async (productId, inventoryData) => {
  const inventoryRef = doc(db, 'inventory', productId);
  return updateDoc(inventoryRef, {
    ...inventoryData,
    lastUpdated: serverTimestamp()
  });
};

export const addInventory = async (inventoryData) => {
  return addDoc(collection(db, 'inventory'), {
    ...inventoryData,
    lastUpdated: serverTimestamp()
  });
};

// Fulfillment logs collection
export const addFulfillmentLog = async (fulfillmentData) => {
  return addDoc(collection(db, 'fulfillmentLogs'), {
    ...fulfillmentData,
    createdAt: serverTimestamp()
  });
};

export const getFulfillmentLogs = async () => {
  const querySnapshot = await getDocs(collection(db, 'fulfillmentLogs'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFulfillmentLogsByDate = async (date) => {
  const q = query(collection(db, 'fulfillmentLogs'), where('date', '==', date));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Retail requests collection
export const addRetailRequest = async (requestData) => {
  return addDoc(collection(db, 'retailRequests'), {
    ...requestData,
    createdAt: serverTimestamp()
  });
};

export const getRetailRequests = async () => {
  const querySnapshot = await getDocs(collection(db, 'retailRequests'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPendingRetailRequests = async () => {
  const q = query(collection(db, 'retailRequests'), where('status', '==', 'pending'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateRetailRequest = async (requestId, requestData) => {
  const requestRef = doc(db, 'retailRequests', requestId);
  return updateDoc(requestRef, requestData);
};

// Users collection
export const addUser = async (userData) => {
  return addDoc(collection(db, 'users'), {
    ...userData,
    createdAt: serverTimestamp()
  });
};

export const getUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUser = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  return updateDoc(userRef, userData);
};

export const deleteUser = async (userId) => {
  const userRef = doc(db, 'users', userId);
  return deleteDoc(userRef);
};

// Utility function for batch code generation
export const generateBatchCode = (productCode, oilBatchNumber, date = new Date()) => {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${productCode}-DC${oilBatchNumber}-${mm}-${dd}-${yy}`;
};

export { db, auth };
