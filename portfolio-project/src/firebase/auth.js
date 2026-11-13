import {
    auth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from './init.js';

// Google Authentication Login ↓
const googleLogin = document.getElementById('google-login');
const logout = document.getElementById('logout');
const userInfo = document.getElementById('user-info');

googleLogin.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider);
});

// Signout event Listener ↓
logout.addEventListener('click', async () => {
    const confirmed = confirm('Are you sure you want to log out?');

    if (!confirmed) {
        return;
    }

    await signOut(auth);
});

// Authentication state ↓
onAuthStateChanged(auth, (user) => {
    if (user) {
        userInfo.textContent = `Signed in as ${user.displayName}`;
        googleLogin.style.display = 'none';
        logout.style.display = 'inline-block';
    } else {
        userInfo.textContent = 'Not signed in';
        googleLogin.style.display = 'inline-block';
        logout.style.display = 'none';
    }
});