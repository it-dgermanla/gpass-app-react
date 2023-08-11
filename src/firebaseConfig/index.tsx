import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const app = initializeApp({
  apiKey: "AIzaSyBBkMNS8fgV_2V6L7cCyi3jNn0HBsoMD9w",
  authDomain: "gpass-apps.firebaseapp.com",
  projectId: "gpass-apps",
  storageBucket: "gpass-apps.appspot.com",
  messagingSenderId: "381264813025",
  appId: "1:381264813025:web:6823bcec692b543c95d0a0",
  measurementId: "G-SL8J8CRFPW"
});

const auth = getAuth(app);
const storage = getStorage(app);

export {
  auth,
  storage
};
