import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

interface IMusicData {
  author: string
  src: string
  title: string
}

interface Imusic extends IMusicData {
  id: string
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: 'music-player-b46c4.firebaseapp.com',
  projectId: 'music-player-b46c4',
  storageBucket: 'music-player-b46c4.appspot.com',
  messagingSenderId: '680563393229',
  appId: import.meta.env.VITE_API_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export const storage = getStorage()

export const getMusics = async () => {
  const querySnapshot = await getDocs(collection(db, 'musics'))
  const musics: Imusic[] = []
  querySnapshot.forEach((doc) => {
    const data = doc.data() as IMusicData
    const music: Imusic = {
      title: data.title,
      author: data.author,
      src: data.src,
      id: doc.id
    }
    musics.push(music)
  })
  return musics
}
