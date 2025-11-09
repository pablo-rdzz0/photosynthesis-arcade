<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCK5X7a9It59rd4Sdac9fxH6bCkhZR62bE",
  authDomain: "photosynthesis-arcade.firebaseapp.com",
  projectId: "photosynthesis-arcade",
  storageBucket: "photosynthesis-arcade.firebasestorage.app",
  messagingSenderId: "912988711333",
  appId: "1:912988711333:web:b964d63e4b27cc3708604c",
  measurementId: "G-9CM26QYCJN",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window.firebaseStuff = {
  auth,
  db,
  async signIn() {
    try {
      // Attempt popup first
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
        // fallback to redirect
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Sign-in error:", error);
        alert("Error signing in. Check console for details.");
      }
    }
  },
  async checkRedirect() {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) console.log("Redirect login success:", result.user.email);
    } catch (e) {
      console.error("Redirect error", e);
    }
  },
  onAuth(callback) {
    return onAuthStateChanged(auth, callback);
  },
  signOut() {
    return signOut(auth);
  },
  async saveScore({ game, score, user }) {
    if (!user) return;
    try {
      await addDoc(collection(db, "scores"), {
        game,
        score,
        userEmail: user.email,
        userName: user.displayName,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error saving score", e);
    }
  },
  listenTop(game, cb) {
    const q = query(
      collection(db, "scores"),
      where("game", "==", game),
      orderBy("score", "desc"),
      limit(10)
    );
    return onSnapshot(q, (snap) => {
      const rows = [];
      snap.forEach((doc) => rows.push({ id: doc.id, ...doc.data() }));
      cb(rows);
    });
  },
};
</script>
