import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: 'music-player-b46c4.firebaseapp.com',
  projectId: 'music-player-b46c4',
  storageBucket: 'music-player-b46c4.appspot.com',
  messagingSenderId: '680563393229',
  appId: import.meta.env.VITE_API_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const storage = getStorage()
