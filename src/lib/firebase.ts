import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCiLjVpvK7avQ7tox3eFXf1wtzMNd-3PZc",
  authDomain: "cocrear-leads.firebaseapp.com",
  projectId: "cocrear-leads",
  storageBucket: "cocrear-leads.firebasestorage.app",
  messagingSenderId: "851738056892",
  appId: "1:851738056892:web:cfed39ef7be3ab044858b9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);