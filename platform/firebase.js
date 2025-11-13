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
  getDocs,
  doc,
  setDoc,
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
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ Restrict to Harkness domain
    const email = user.email || "";
    if (!email.endsWith("@harknessinstitute.com")) {
      alert("Access restricted to Harkness Institute accounts only.");
      await signOut(auth);
      return;
    }
  } catch (error) {
    if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
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
    if (result?.user) {
      const email = result.user.email || "";
      if (!email.endsWith("@harknessinstitute.com")) {
        alert("Access restricted to Harkness Institute accounts only.");
        await signOut(auth);
        return;
      }
      console.log("Redirect login success:", result.user.email);
    }
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
      const scoresRef = collection(db, "scores");
      const q = query(scoresRef, where("game", "==", game), where("userEmail", "==", user.email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        // solo mehorar con mejores ountajes
        const docRef = snap.docs[0].ref;
        const prevScore = snap.docs[0].data().score;
        if (score > prevScore) {
          await setDoc(docRef, { game, score, userEmail: user.email, userName: user.displayName });
        }
      } else {
 
        await addDoc(scoresRef, {
          game,
          score,
          userEmail: user.email,
          userName: user.displayName,
        });
      }
    } catch (e) {
      console.error("Error saving score", e);
    }
  },

 
  listenTop(game, cb) {
    const q = query(
      collection(db, "scores"),
      where("game", "==", game),
      orderBy("score", "desc"),
      limit(200)
    );

    return onSnapshot(q, (snap) => {
      const bestScores = {};

      snap.forEach((doc) => {
        const data = doc.data();
        const name = data.userName || "Anonymous";
        const score = data.score;

        if (!bestScores[name] || score > bestScores[name].score) {
          bestScores[name] = { ...data, id: doc.id };
        }
      });

      const rows = Object.values(bestScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      cb(rows);
    });
  },
};
