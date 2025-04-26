
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp // Use serverTimestamp if storing dates as Timestamps
} from "firebase/firestore";
import type { Evento, Noticia } from '@/lib/types';
import { format, parse, compareAsc, isToday, isFuture } from 'date-fns';

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
const eventosCol = collection(db, "eventos");
const noticiasCol = collection(db, "noticias");

// --- Sample Data (Fallback if Firestore is empty) ---
const sampleEventos: Omit<Evento, 'id'>[] = [
  { "titulo": "Jogo vs. Leoas", "data": "20/05/2025", "horario": "16:00", "local": "Campo Municipal" },
  { "titulo": "Treino Semanal", "data": "22/05/2025", "horario": "18:00", "local": "Campo Municipal" },
  { "titulo": "Amistoso", "data": "25/05/2025", "horario": "15:00", "local": "Estádio Central" },
  { "titulo": "Jogo vs. Tigresas", "data": "30/05/2025", "horario": "17:00", "local": "Campo Municipal" },
  { "titulo": "Treino Tático", "data": "01/06/2025", "horario": "19:00", "local": "Campo Municipal" },
];

const sampleNoticias: Omit<Noticia, 'id'>[] = [
  { "titulo": "Vitória por 3x1!", "texto": "Grande jogo contra as Leoas!", "data": "20/05/2025", "imagem": "https://via.placeholder.com/100/22C55E/FFFFFF?text=Vitória" },
  { "titulo": "Novo Uniforme!", "texto": "Confira o novo uniforme verde e ouro!", "data": "22/05/2025", "imagem": "https://via.placeholder.com/100/FBBF24/1F2937?text=Uniforme" },
  { "titulo": "Treino Aberto!", "texto": "Venha apoiar as Estrelas!", "data": "25/05/2025", "imagem": "https://via.placeholder.com/100/cccccc/000000?text=Treino" },
];

// Helper function to parse DD/MM/YYYY string to Date object
// Ensures robustness against invalid formats
const parseDateString = (dateStr: string): Date | null => {
  try {
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
        return null;
    }
    // Optional: Check if the formatted date matches the input to catch month/day rollovers
    if (format(parsedDate, 'dd/MM/yyyy') !== dateStr) {
        return null;
    }
    return parsedDate;
  } catch (e) {
    console.error("Error parsing date string:", dateStr, e);
    return null;
  }
};

// --- Data Fetching Functions ---

// Fetch Events
export async function getEventos(): Promise<Evento[]> {
  let eventos: Evento[] = [];
  try {
    // Attempt to fetch from Firestore
    // NOTE: Ordering by string 'data' is not reliable for date sorting.
    // Fetching all and sorting client-side is necessary with this data format.
    // Consider using Firestore Timestamps for 'data' field in the future.
    const q = query(eventosCol); // Fetch all, sort later
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty && process.env.NODE_ENV === 'development') {
       // Use sample data if Firestore is empty (useful for development)
       console.log("Firestore 'eventos' empty, using sample data.");
       eventos = sampleEventos.map((evento, index) => ({ ...evento, id: `sample-${index}` }));
    } else {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Basic validation
        if (data.titulo && data.data && data.horario && data.local) {
            eventos.push({
                id: doc.id,
                titulo: data.titulo,
                data: data.data,
                horario: data.horario,
                local: data.local,
            });
        } else {
            console.warn(`Invalid event data found for doc id: ${doc.id}`, data);
        }
      });
    }
  } catch (error) {
    console.error("Error fetching events from Firestore:", error);
     if (process.env.NODE_ENV === 'development') {
        console.log("Using sample event data due to fetch error.");
        eventos = sampleEventos.map((evento, index) => ({ ...evento, id: `sample-${index}` }));
     } else {
        // In production, you might want to throw the error or return an empty array
        return []; // Return empty array on error in production
     }
  }

  // Filter for today or future dates and sort client-side
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for comparison

  const filteredAndSortedEventos = eventos
    .map(evento => ({
      ...evento,
      parsedDate: parseDateString(evento.data) // Parse date for filtering/sorting
    }))
    .filter(evento => evento.parsedDate && (isToday(evento.parsedDate) || isFuture(evento.parsedDate)))
    .sort((a, b) => {
        // Should not happen if filter works, but check anyway
        if (!a.parsedDate || !b.parsedDate) return 0;
        return compareAsc(a.parsedDate, b.parsedDate); // Sort ascending by date
    })
    // Remove the temporary parsedDate property before returning
    .map(({ parsedDate, ...rest }) => rest);


  return filteredAndSortedEventos.slice(0, 20); // Limit to 20
}


// Fetch News
export async function getNoticias(): Promise<Noticia[]> {
  let noticias: Noticia[] = [];
  try {
     // Fetching with string date ordering is still suboptimal. Fetch all and sort.
    const q = query(noticiasCol); // Fetch all, sort later
    const querySnapshot = await getDocs(q);

     if (querySnapshot.empty && process.env.NODE_ENV === 'development') {
       console.log("Firestore 'noticias' empty, using sample data.");
       noticias = sampleNoticias.map((noticia, index) => ({ ...noticia, id: `sample-${index}` }));
    } else {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
             if (data.titulo && data.texto && data.data) {
                 noticias.push({
                    id: doc.id,
                    titulo: data.titulo,
                    texto: data.texto,
                    imagem: data.imagem || null,
                    data: data.data,
                 });
             } else {
                 console.warn(`Invalid noticia data found for doc id: ${doc.id}`, data);
             }
        });
    }

  } catch (error) {
    console.error("Error fetching news from Firestore:", error);
      if (process.env.NODE_ENV === 'development') {
        console.log("Using sample news data due to fetch error.");
        noticias = sampleNoticias.map((noticia, index) => ({ ...noticia, id: `sample-${index}` }));
     } else {
        return [];
     }
  }

   // Sort client-side by parsed date (descending for news)
    const sortedNoticias = noticias
        .map(noticia => ({
            ...noticia,
            parsedDate: parseDateString(noticia.data)
        }))
        .sort((a, b) => {
            if (!a.parsedDate || !b.parsedDate) return 0;
            return compareAsc(b.parsedDate, a.parsedDate); // Sort descending
        })
        .map(({ parsedDate, ...rest }) => rest);


  return sortedNoticias.slice(0, 10); // Limit to 10
}

// --- CMS Functions ---

// Add Event
export async function addEvento(eventoData: Omit<Evento, 'id'>): Promise<string> {
  try {
    // Optional: Add server timestamp if needed
    // const dataWithTimestamp = { ...eventoData, createdAt: serverTimestamp() };
    const docRef = await addDoc(eventosCol, eventoData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding event:", error);
    throw new Error("Falha ao adicionar evento."); // Re-throw error for handling in UI
  }
}

// Update Event
export async function updateEvento(id: string, eventoData: Partial<Omit<Evento, 'id'>>): Promise<void> {
  try {
    const eventDoc = doc(db, "eventos", id);
    await updateDoc(eventDoc, eventoData);
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("Falha ao atualizar evento.");
  }
}

// Delete Event
export async function deleteEvento(id: string): Promise<void> {
  try {
    const eventDoc = doc(db, "eventos", id);
    await deleteDoc(eventDoc);
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Falha ao deletar evento.");
  }
}

// Fetch All Events for CMS (no date filtering/sorting needed here initially)
export async function getAllEventosCMS(): Promise<Evento[]> {
    let eventos: Evento[] = [];
    try {
        const q = query(eventosCol, orderBy("data", "desc")); // Order by date string desc for CMS view
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
             if (data.titulo && data.data && data.horario && data.local) {
                 eventos.push({
                     id: doc.id,
                     titulo: data.titulo,
                     data: data.data,
                     horario: data.horario,
                     local: data.local,
                 });
             }
        });
         // No sample data fallback needed for CMS usually
    } catch (error) {
        console.error("Error fetching all events for CMS:", error);
        throw new Error("Falha ao carregar eventos para o CMS.");
    }
     // Sort by actual date descending for CMS view
    return eventos
        .map(evento => ({
            ...evento,
            parsedDate: parseDateString(evento.data)
        }))
        .sort((a, b) => {
            if (!a.parsedDate || !b.parsedDate) return 0;
            return compareAsc(b.parsedDate, a.parsedDate); // Sort descending
        })
        .map(({ parsedDate, ...rest }) => rest);
}


export { db };

// Enable Firestore offline persistence
// This is typically done closer to the Firestore initialization,
// but placing it here ensures it's called.
// Note: Offline persistence might require specific Firebase SDK setup or might be enabled by default in newer web SDKs.
// Check Firebase documentation for enabling persistence in Web Modular SDK.
// Example (might need adjustments based on Firebase version):
/*
import { enableIndexedDbPersistence } from "firebase/firestore";

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.warn("Firestore persistence failed: Multiple tabs open?");
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.warn("Firestore persistence failed: Browser not supported?");
    }
  });
*/
// For simplicity in MVP, we rely on standard browser caching and Next.js revalidation.
// Explicit Firestore offline cache can be added later if needed.
