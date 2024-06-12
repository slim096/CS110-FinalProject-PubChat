import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


async function openGoogleAuthPopup() {
    const response = await fetch('/env');
    const firebaseConfig = await response.json();

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
        .then((result) => {
            window.location.href = '/join';
        })
        .catch((error) => {
            console.error("Error during sign-in:", error);
        });
}

window.openGoogleAuthPopup = openGoogleAuthPopup;
