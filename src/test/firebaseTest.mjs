// firebaseTest.mjs
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACto2hBVADZibEYoSpXSQF0z6TeDhwOcc",
  authDomain: "curlai.firebaseapp.com",
  projectId: "curlai",
  storageBucket: "curlai.firebasestorage.app", // ✅ fixed
  messagingSenderId: "942693885359",
  appId: "1:942693885359:web:a735fe345498389cd57b5a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("🔥 Testing Firebase connection...");

try {
  const user = await signInWithEmailAndPassword(auth, "manasba22@gmail.com", "Manas123");
  console.log("✅ Firebase login successful:", user.user.email);
} catch (error) {
  console.error("❌ Firebase test failed:", error.code, error.message);
}
