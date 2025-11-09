<!-- firebase.js -->
<script type="module">
  // SDKs de Firebase (module) – cargamos las 3 que ocupamos
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
  import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
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

  // ⚙️ Tu config
  const firebaseConfig = {
    apiKey: "AIzaSyCK5X7a9It59rd4Sdac9fxH6bCkhZR62bE",
    authDomain: "photosynthesis-arcade.firebaseapp.com",
    projectId: "photosynthesis-arcade",
    storageBucket: "photosynthesis-arcade.firebasestorage.app",
    messagingSenderId: "912988711333",
    appId: "1:912988711333:web:b964d63e4b27cc3708604c",
    measurementId: "G-9CM26QYCJN",
  };

  // 🔌 init
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

  // lo ponemos global para que lobby y juegos lo usen
  window.firebaseStuff = {
    auth,
    db,

    // 👉 login con filtro de dominio
    async signInHarkness() {
      const res = await signInWithPopup(auth, provider);
      const email = res.user.email || "";
      if (!email.endsWith("@harknessinstitute.com")) {
        alert("Solo se permiten @harknessinstitute.com");
        await signOut(auth);
        return null;
      }
      return res.user;
    },

    signOut: () => signOut(auth),

    onAuth(cb) {
      return onAuthStateChanged(auth, cb);
    },

    // 👉 guardar score
    // game: "snake" | "catchthelight"
    // score: número
    // extraName: opcional (por si luego quieres poner displayName manual)
    async saveScore({ game, score, user }) {
      if (!user) return;
      try {
        await addDoc(collection(db, "scores"), {
          game,
          score,
          userEmail: user.email || null,
          userName: user.displayName || null,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("Error saving score", e);
      }
    },

    // 👉 escuchar top 10 de un juego
    // callback recibe arreglo de docs ya ordenados
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
