
export type Evento = {
  id: number; // Changed to number for PostgreSQL SERIAL PRIMARY KEY
  titulo: string;
  data: string; // DD/MM/YYYY (kept as string based on current backend/frontend logic)
  horario: string; // HH:MM
  local: string;
};

export type Noticia = {
  id: string; // Kept as string assuming static or future ID structure
  titulo: string;
  texto: string;
  imagem?: string | null; // Optional image URL
  data: string; // DD/MM/YYYY
};
