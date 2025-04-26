
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
  serverTimestamp, // Use serverTimestamp if storing dates as Timestamps
  enableIndexedDbPersistence // Import for offline persistence
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

// Enable Firestore offline persistence
// Call this early, ideally right after initializing Firestore
try {
    enableIndexedDbPersistence(db)
      .then(() => console.log("Firestore offline persistence enabled."))
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // This means persistence is already enabled in another tab or failed initialization.
          // Multiple tabs open is the most common cause.
          console.warn("Firestore persistence failed: Multiple tabs open? Only enable in one tab.");
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the features required to enable persistence
          console.warn("Firestore persistence failed: Browser not supported?");
        } else {
           console.error("Firestore persistence failed with error code:", err.code, err);
        }
      });
} catch (error) {
    console.error("Error enabling Firestore persistence:", error);
}


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
    // Ensure the input is a string
    if (typeof dateStr !== 'string') {
        console.warn("parseDateString received non-string input:", dateStr);
        return null;
    }
    // Basic regex check for DD/MM/YYYY format before parsing
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        console.warn("Invalid date format string:", dateStr);
        return null;
    }
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    // Check if the parsed date is valid (e.g., doesn't result in NaN)
    if (isNaN(parsedDate.getTime())) {
        console.warn("Parsed date resulted in NaN:", dateStr);
        return null;
    }
    // Optional: Check if the formatted date matches the input to catch month/day rollovers (e.g., 31/04/2025)
    // This check might be too strict depending on whether date-fns automatically corrects invalid days/months.
    // If date-fns corrects (e.g., 31/04 becomes 01/05), this check prevents that.
    // If correction is acceptable, remove this check.
    if (format(parsedDate, 'dd/MM/yyyy') !== dateStr) {
        console.warn("Date string mismatch after parsing (potential day/month rollover):", dateStr, format(parsedDate, 'dd/MM/yyyy'));
        // Decide if this should be treated as an error or allowed
        // return null; // Treat as error
    }
    return parsedDate;
  } catch (e) {
    console.error("Error parsing date string:", dateStr, e);
    return null;
  }
};

// --- Data Fetching Functions ---

// Fetch Events (for public view)
export async function getEventos(): Promise<Evento[]> {
  let eventos: Evento[] = [];
  try {
    // Fetching all and sorting client-side because string date 'data' requires it.
    // Consider using Firestore Timestamps for 'data' field for server-side filtering/sorting.
    const q = query(eventosCol); // Fetch all, sort later
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty && process.env.NODE_ENV === 'development') {
       console.log("Firestore 'eventos' empty, using sample data for public view.");
       eventos = sampleEventos.map((evento, index) => ({ ...evento, id: `sample-${index}` }));
    } else {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.titulo && data.data && data.horario && data.local && typeof data.data === 'string') {
            eventos.push({
                id: doc.id,
                titulo: data.titulo,
                data: data.data,
                horario: data.horario,
                local: data.local,
            });
        } else {
            console.warn(`Invalid or missing event data found for doc id: ${doc.id}`, data);
        }
      });
    }
  } catch (error: any) {
    // Check if the error is due to being offline and persistence is enabled
    if (error.code === 'unavailable') {
        console.warn("Network unavailable. Firestore data may be stale or unavailable if cache is empty.");
        // Attempt to return potentially stale data from cache or fallback
    } else {
      console.error("Error fetching events from Firestore:", error);
    }

     if (process.env.NODE_ENV === 'development' && eventos.length === 0) { // Only use sample if Firestore fetch failed AND events array is still empty
        console.log("Using sample event data due to fetch error or offline state.");
        eventos = sampleEventos.map((evento, index) => ({ ...evento, id: `sample-${index}` }));
     } else if (eventos.length === 0) { // Return empty array on error in production if cache is empty
        return [];
     }
      // If there's cached data, it will be in the 'eventos' array here, proceed with filtering/sorting
  }

  // Filter for today or future dates and sort client-side
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for comparison

  const filteredAndSortedEventos = eventos
    .map(evento => ({
      ...evento,
      parsedDate: parseDateString(evento.data) // Parse date for filtering/sorting
    }))
    .filter(evento => evento.parsedDate && (isToday(evento.parsedDate) || isFuture(evento.parsedDate))) // Keep only valid future/today dates
    .sort((a, b) => {
        if (!a.parsedDate || !b.parsedDate) return 0; // Should not happen after filter
        return compareAsc(a.parsedDate, b.parsedDate); // Sort ascending by date
    })
    // Remove the temporary parsedDate property before returning
    .map(({ parsedDate, ...rest }) => rest);


  return filteredAndSortedEventos.slice(0, 20); // Limit to 20 for public view
}


// Fetch News
export async function getNoticias(): Promise<Noticia[]> {
  let noticias: Noticia[] = [];
  try {
     // Fetching with string date ordering is suboptimal. Fetch all and sort client-side.
    const q = query(noticiasCol); // Fetch all, sort later
    const querySnapshot = await getDocs(q);

     if (querySnapshot.empty && process.env.NODE_ENV === 'development') {
       console.log("Firestore 'noticias' empty, using sample data.");
       noticias = sampleNoticias.map((noticia, index) => ({ ...noticia, id: `sample-${index}` }));
    } else {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
             if (data.titulo && data.texto && data.data && typeof data.data === 'string') {
                 noticias.push({
                    id: doc.id,
                    titulo: data.titulo,
                    texto: data.texto,
                    imagem: data.imagem || null,
                    data: data.data,
                 });
             } else {
                 console.warn(`Invalid or missing noticia data found for doc id: ${doc.id}`, data);
             }
        });
    }

  } catch (error: any) {
     if (error.code === 'unavailable') {
        console.warn("Network unavailable. Firestore news data may be stale or unavailable if cache is empty.");
     } else {
        console.error("Error fetching news from Firestore:", error);
     }

      if (process.env.NODE_ENV === 'development' && noticias.length === 0) {
        console.log("Using sample news data due to fetch error or offline state.");
        noticias = sampleNoticias.map((noticia, index) => ({ ...noticia, id: `sample-${index}` }));
     } else if (noticias.length === 0) {
        return [];
     }
  }

   // Sort client-side by parsed date (descending for news)
    const sortedNoticias = noticias
        .map(noticia => ({
            ...noticia,
            parsedDate: parseDateString(noticia.data)
        }))
        .filter(noticia => noticia.parsedDate) // Keep only valid dates
        .sort((a, b) => {
            if (!a.parsedDate || !b.parsedDate) return 0; // Should not happen after filter
            return compareAsc(b.parsedDate, a.parsedDate); // Sort descending
        })
        .map(({ parsedDate, ...rest }) => rest);


  return sortedNoticias.slice(0, 10); // Limit to 10
}

// --- CMS Functions ---

// Add Event
export async function addEvento(eventoData: Omit<Evento, 'id'>): Promise<string> {
  // Validate data before sending to Firestore
   if (!eventoData.titulo || !eventoData.data || !eventoData.horario || !eventoData.local) {
       throw new Error("Todos os campos são obrigatórios.");
   }
   if (!/^\d{2}\/\d{2}\/\d{4}$/.test(eventoData.data) || !parseDateString(eventoData.data)) {
       throw new Error("Formato de data inválido. Use DD/MM/YYYY.");
   }
    if (!/^\d{2}:\d{2}$/.test(eventoData.horario)) {
      throw new Error('Formato de horário inválido. Use HH:MM (ex: 16:00).');
    }

  try {
    const docRef = await addDoc(eventosCol, eventoData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding event:", error);
    throw new Error("Falha ao adicionar evento."); // Re-throw error for handling in UI
  }
}

// Update Event
export async function updateEvento(id: string, eventoData: Partial<Omit<Evento, 'id'>>): Promise<void> {
    // Validate data before sending to Firestore
    if (eventoData.data && (!/^\d{2}\/\d{2}\/\d{4}$/.test(eventoData.data) || !parseDateString(eventoData.data))) {
       throw new Error("Formato de data inválido. Use DD/MM/YYYY.");
   }
   if (eventoData.horario && !/^\d{2}:\d{2}$/.test(eventoData.horario)) {
      throw new Error('Formato de horário inválido. Use HH:MM (ex: 16:00).');
    }

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

// Fetch All Events for CMS (sorted by date descending)
export async function getAllEventosCMS(): Promise<Evento[]> {
    let eventos: Evento[] = [];
    try {
        // Fetch all documents first
        const q = query(eventosCol);
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
             if (data.titulo && data.data && data.horario && data.local && typeof data.data === 'string') {
                 eventos.push({
                     id: doc.id,
                     titulo: data.titulo,
                     data: data.data,
                     horario: data.horario,
                     local: data.local,
                 });
             } else {
                 console.warn(`Invalid or missing CMS event data for doc id: ${doc.id}`, data);
             }
        });
         // No sample data fallback needed for CMS usually
    } catch (error: any) {
         if (error.code === 'unavailable') {
            console.warn("Network unavailable. CMS event data may be stale or unavailable if cache is empty.");
            // Potentially inform the user that data might be outdated
         } else {
           console.error("Error fetching all events for CMS:", error);
         }
         // Even if offline, if data exists in cache, it will be in 'eventos'
         if (eventos.length === 0) {
            throw new Error("Falha ao carregar eventos para o CMS. Verifique a conexão.");
         }
    }
     // Sort by actual date descending for CMS view after fetching
    return eventos
        .map(evento => ({
            ...evento,
            parsedDate: parseDateString(evento.data)
        }))
        .filter(evento => evento.parsedDate) // Keep only valid dates
        .sort((a, b) => {
            // Should not happen after filter, but check anyway
            if (!a.parsedDate || !b.parsedDate) return 0;
            return compareAsc(b.parsedDate, a.parsedDate); // Sort descending
        })
        .map(({ parsedDate, ...rest }) => rest); // Remove temporary parsedDate
}


export { db };
