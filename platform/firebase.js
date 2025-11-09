<!-- ✅ firebase.js -->
<script type="module">
  // ================================
  // 🔥 Firebase core imports (v10)
  // ================================
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

  // ================================
  // ⚙️ Your Firebase configuration
  // ================================
  const firebaseConfig = {
    apiKey: "AIzaSyCK5X7a9It59rd4Sdac9fxH6bCkhZR62bE",
    authDomain: "photosynthesis-arcade.firebaseapp.com",
    projectId: "photosynthesis-arcade",
    storageBucket: "photosynthesis-arcade.appspot.com",
    messagingSenderId: "912988711333",
    appId: "1:912988711333:web:b964d63e4b27cc3708604c",
    measurementId: "G-9CM26QYCJN",
  };

  // ================================
  // 🚀 Initialize Firebase
  // ================================
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

  // ================================
  // 🌿 Global firebase object
  // ================================
  window.firebaseStuff = {
    auth,
    db,

    // -------------------------------
    // 🔐 Google Sign-In with popup → redirect fallback
    // -------------------------------
    async signInHarkness() {
      try {
        let res;
        try {
          // 🪟 Try popup first
          res = await signInWithPopup(auth, provider);
          console.log("✅ Popup login successful:", res.user.email);
        } catch (err) {
          // 🧩 If popup blocked, fallback to redirect
          if (
            err.code === "auth/popup-blocked" ||
            err.code === "auth/popup-closed-by-user"
          ) {
            console.warn(
              "⚠️ Popup was blocked or closed — switching to redirect login."
            );
            await signInWithRedirect(auth, provider);
            return;
          } else {
            console.error("❌ Unexpected sign-in error:", err);
            return null;
          }
        }

        // ✅ Return user if login worked
        return res.user;
      } catch (e) {
        console.error("🔥 Sign-in failed:", e);
        // No alerts here — errors only logged
        return null;
      }
    },

    // -------------------------------
    // 🚪 Sign-out
    // -------------------------------
    async signOutUser() {
      try {
        await signOut(auth);
        console.log("👋 User signed out.");
      } catch (e) {
        console.error("❌ Error signing out:", e);
      }
    },

    // -------------------------------
    // 👀 Auth listener
    // -------------------------------
    onAuth(cb) {
      return onAuthStateChanged(auth, cb);
    },

    // -------------------------------
    // 💾 Save score to Firestore
    // -------------------------------
    async saveScore({ game, score, user }) {
      if (!user) return;
      try {
        await addDoc(collection(db, "scores"), {
          game,
          score,
          userEmail: user.email || null,
          userName: user.displayName || "Anonymous",
          createdAt: serverTimestamp(),
        });
        console.log("✅ Score saved:", game, score);
      } catch (e) {
        console.error("❌ Error saving score:", e);
      }
    },

    // -------------------------------
    // 🏆 Listen to top 10 scores
    // -------------------------------
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

  // -------------------------------
  // 🌐 Handle redirect result
  // -------------------------------
  getRedirectResult(auth)
    .then((result) => {
      if (result && result.user) {
        console.log("✅ Redirect login successful:", result.user.email);
      }
    })
    .catch((err) => {
      // 👇 This only logs in console; no alert
      console.warn("⚠️ Redirect sign-in issue (safe to ignore):", err.message);
    });
</script>

