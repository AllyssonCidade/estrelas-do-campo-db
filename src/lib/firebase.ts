
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore";
import type { Evento, Noticia } from '@/lib/types';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Helper function to parse DD/MM/YYYY string to Date object
const parseDateString = (dateStr: string): Date | null => {
  const parts = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!parts) return null;
  // Note: months are 0-indexed in JavaScript Date objects
  return new Date(parseInt(parts[3], 10), parseInt(parts[2], 10) - 1, parseInt(parts[1], 10));
};

// Fetch Events
export async function getEventos(): Promise<Evento[]> {
  const eventosCol = collection(db, "eventos");
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Firestore doesn't directly support string comparison for dates in DD/MM/YYYY format.
  // Ideally, store dates as Firestore Timestamps or ISO strings.
  // Workaround: Fetch all events and filter client-side, or adjust data model.
  // For MVP, let's fetch all and filter. If performance is an issue, use Timestamps.
  const q = query(eventosCol, orderBy("data")); // Order by the string date - might not be perfect
  const querySnapshot = await getDocs(q);
  const eventos: Evento[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const eventDate = parseDateString(data.data); // Parse the DD/MM/YYYY string

    if (eventDate && eventDate >= today) { // Filter for today or future dates
      eventos.push({
        id: doc.id,
        titulo: data.titulo,
        data: data.data,
        horario: data.horario,
        local: data.local,
      });
    }
  });

  // Sort again by actual date after parsing
  eventos.sort((a, b) => {
      const dateA = parseDateString(a.data) ?? new Date(0);
      const dateB = parseDateString(b.data) ?? new Date(0);
      return dateA.getTime() - dateB.getTime();
  });


  return eventos.slice(0, 20); // Limit to 20
}


// Fetch News
export async function getNoticias(): Promise<Noticia[]> {
  const noticiasCol = collection(db, "noticias");
   // Again, ideally store dates as Timestamps. Ordering by string date is suboptimal.
  const q = query(noticiasCol, orderBy("data", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  const noticias: Noticia[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    noticias.push({
      id: doc.id,
      titulo: data.titulo,
      texto: data.texto,
      imagem: data.imagem || null, // Handle optional image
      data: data.data,
    });
  });
  return noticias;
}

export { db };
