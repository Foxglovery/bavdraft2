import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration - using environment variables
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

// Test Firebase connection
console.log('Firebase initialized with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
});

// ----------------------
// Schema helpers
// ----------------------

const assertHasFields = (obj, requiredKeys, context) => {
  const missing = requiredKeys.filter((k) => obj[k] === undefined || obj[k] === null);
  if (missing.length > 0) {
    throw new Error(`${context} missing required field(s): ${missing.join(', ')}`);
  }
};

// Products
const normalizeProduct = (data) => {
  assertHasFields(data, ['acronym', 'active', 'inventoryCount', 'name'], 'Product');
  return {
    acronym: String(data.acronym).trim(),
    active: Boolean(data.active),
    inventoryCount: Number(data.inventoryCount),
    name: String(data.name).trim()
  };
};

// Oil Batches
const normalizeOilBatch = (data) => {
  assertHasFields(
    data,
    ['amountGrams', 'dateRecieved', 'oilBatchCode', 'potencyPercent', 'remainingGrams', 'type'],
    'OilBatch'
  );
  return {
    amountGrams: Number(data.amountGrams),
    dateRecieved: data.dateRecieved,
    oilBatchCode: String(data.oilBatchCode).trim(),
    potencyPercent: Number(data.potencyPercent),
    remainingGrams: Number(data.remainingGrams),
    type: String(data.type).trim()
  };
};

// Product Batches
const withCollectionPath = (value, collectionPath) => {
  if (typeof value !== 'string' || value.length === 0) return value;
  return value.startsWith(`/${collectionPath}/`) ? value : `/${collectionPath}/${value}`;
};

const normalizeProductBatch = (data) => {
  assertHasFields(
    data,
    [
      'batchCode',
      'dateMade',
      'dateStr',
      'dosageMg',
      'oilBatchCode',
      'oilBatchId',
      'oilType',
      'productAcronym',
      'productId',
      'quantityProduced'
    ],
    'ProductBatch'
  );
  return {
    batchCode: String(data.batchCode).trim(),
    dateMade: data.dateMade,
    dateStr: String(data.dateStr).trim(),
    dosageMg: Number(data.dosageMg),
    oilBatchCode: String(data.oilBatchCode).trim(),
    oilBatchId: withCollectionPath(String(data.oilBatchId).trim(), 'oilBatches'),
    oilType: String(data.oilType).trim(),
    productAcronym: String(data.productAcronym).trim(),
    productId: withCollectionPath(String(data.productId).trim(), 'products'),
    quantityProduced: Number(data.quantityProduced)
  };
};

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
    ...normalizeProduct(productData),
    createdAt: serverTimestamp()
  });
};

export const getProducts = async () => {
  try {
    console.log('Fetching products from Firestore...');
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Products fetched:', products.length);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  const productRef = doc(db, 'products', productId);
  return updateDoc(productRef, normalizeProduct({ ...productData }));
};

export const deleteProduct = async (productId) => {
  const productRef = doc(db, 'products', productId);
  return deleteDoc(productRef);
};

// Oil batches collection
export const addOilBatch = async (oilBatchData) => {
  return addDoc(collection(db, 'oilBatches'), {
    ...normalizeOilBatch(oilBatchData),
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

export const updateOilBatch = async (oilBatchId, oilBatchData) => {
  const oilBatchRef = doc(db, 'oilBatches', oilBatchId);
  return updateDoc(oilBatchRef, normalizeOilBatch({ ...oilBatchData }));
};

// Product batches collection
export const addBatch = async (batchData) => {
  return addDoc(collection(db, 'productBatches'), {
    ...normalizeProductBatch(batchData),
    createdAt: serverTimestamp()
  });
};

export const getBatches = async () => {
  const querySnapshot = await getDocs(collection(db, 'productBatches'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBatchesByProduct = async (productId) => {
  const q = query(collection(db, 'productBatches'), where('productId', '==', productId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateBatch = async (batchId, batchData) => {
  const batchRef = doc(db, 'productBatches', batchId);
  return updateDoc(batchRef, normalizeProductBatch({ ...batchData }));
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
export const addUser = async (userData, uid) => {
  if (!uid) {
    throw new Error('UID is required to create a user document');
  }
  const userRef = doc(db, 'users', uid);
  return setDoc(userRef, {
    ...userData,
    uid: uid,
    createdAt: serverTimestamp()
  });
};

export const getUsers = async () => {
  try {
    console.log('Fetching users from Firestore...');
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Users fetched:', users.length);
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserByUid = async (uid) => {
  if (!uid) {
    throw new Error('UID is required to get a user document');
  }
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
};

export const updateUser = async (uid, userData) => {
  if (!uid) {
    throw new Error('UID is required to update a user document');
  }
  const userRef = doc(db, 'users', uid);
  return updateDoc(userRef, {
    ...userData,
    lastUpdated: serverTimestamp()
  });
};

export const deleteUser = async (uid) => {
  if (!uid) {
    throw new Error('UID is required to delete a user document');
  }
  const userRef = doc(db, 'users', uid);
  return deleteDoc(userRef);
};

// Utility function to create or update user document on signup
export const createOrUpdateUserDocument = async (uid, userData) => {
  if (!uid) {
    throw new Error('UID is required to create or update a user document');
  }
  const userRef = doc(db, 'users', uid);
  return setDoc(userRef, {
    ...userData,
    uid: uid,
    lastUpdated: serverTimestamp()
  }, { merge: true }); // merge: true will update existing document or create new one
};

// Utility function for batch code generation
export const generateBatchCode = (productCode, oilBatchNumber, date = new Date()) => {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${productCode}-DC${oilBatchNumber}-${mm}-${dd}-${yy}`;
};

console.log("Firebase config:", firebaseConfig);

export { db, auth };
