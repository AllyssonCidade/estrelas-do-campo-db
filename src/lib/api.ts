'use client'; // Mark functions potentially used in client components

import axios from 'axios';
import type { Evento } from '@/lib/types';

// Define the base URL for the backend API
// Use environment variable, fallback for local development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; // Ensure this matches your backend setup

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- API Functions for Eventos ---

// Fetch Events for public view (sorted by date asc, upcoming only)
export async function getEventosApi(): Promise<Evento[]> {
  try {
    const response = await apiClient.get('/api/eventos');
    // Data should already be filtered and sorted by the backend
    return response.data;
  } catch (error: any) {
    console.error("API Error fetching events:", error.response?.data?.error || error.message);
    // Decide how to handle errors: throw, return empty array, return sample data?
    // Returning empty array for now, UI should handle this case.
    // Consider adding fallback sample data *only* if API fails and app is in development
    // if (process.env.NODE_ENV === 'development') {
    //   console.log("API fetch failed, using sample data.");
    //   return sampleEventos.map((e, i) => ({...e, id: `sample-${i}`})); // Define sampleEventos if needed
    // }
    return []; // Return empty on error
  }
}

// Fetch ALL Events for CMS (sorted by date desc)
export async function getAllEventosCMSApi(): Promise<Evento[]> {
     try {
        // Use a different endpoint if backend provides one for all events
        const response = await apiClient.get('/api/eventos/all');
        return response.data;
    } catch (error: any) {
        console.error("API Error fetching all events for CMS:", error.response?.data?.error || error.message);
        throw new Error("Falha ao carregar eventos para o CMS. Verifique a conexão com a API."); // Throw to be caught by calling function
    }
}

// Add Event (requires password in data)
export async function addEventoApi(eventoData: Omit<Evento, 'id'>, password: string): Promise<Evento> {
  try {
    // Include password in the request body
    const response = await apiClient.post('/api/eventos', { ...eventoData, password });
    return response.data.evento; // Assuming backend returns { message: '...', evento: {...} }
  } catch (error: any) {
    console.error("API Error adding event:", error.response?.data?.error || error.message);
    throw new Error(error.response?.data?.error || "Falha ao adicionar evento via API.");
  }
}

// Update Event (requires password in data)
export async function updateEventoApi(id: string, eventoData: Omit<Evento, 'id'>, password: string): Promise<Evento> {
   try {
    // Include password in the request body
    const response = await apiClient.put(`/api/eventos/${id}`, { ...eventoData, password });
    return response.data.evento; // Assuming backend returns { message: '...', evento: {...} }
  } catch (error: any) {
    console.error("API Error updating event:", error.response?.data?.error || error.message);
    throw new Error(error.response?.data?.error || "Falha ao atualizar evento via API.");
  }
}

// Delete Event (requires password in data, passed in body for consistency)
export async function deleteEventoApi(id: string, password: string): Promise<{ message: string }> {
   try {
    // Include password in the request body for DELETE
    const response = await apiClient.delete(`/api/eventos/${id}`, {
        data: { password } // Send password in the data payload for DELETE
    });
    return response.data; // Assuming backend returns { message: '...' }
  } catch (error: any) {
    console.error("API Error deleting event:", error.response?.data?.error || error.message);
    throw new Error(error.response?.data?.error || "Falha ao deletar evento via API.");
  }
}

// --- API Functions for Noticias (Placeholder - Assuming static for now) ---
// If Noticias were dynamic, you'd add similar functions here

// Fetch News (assuming static for now)
// export async function getNoticiasApi(): Promise<Noticia[]> {
//   // Replace with actual API call if Noticias become dynamic
//   console.log("Fetching static news data.");
//   // Define sampleNoticias if needed here or import from types/constants
//   // const sampleNoticias: Omit<Noticia, 'id'>[] = [...];
//   // return Promise.resolve(sampleNoticias.map((n, i) => ({...n, id: `sample-${i}`})));
//   return Promise.resolve([]); // Return empty array or sample data
// }


// Note: Error handling can be enhanced (e.g., specific error types, logging)
