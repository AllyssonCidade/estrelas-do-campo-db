
export type Evento = {
  id: string;
  titulo: string;
  data: string; // DD/MM/YYYY
  horario: string;
  local: string;
};

export type Noticia = {
  id: string;
  titulo: string;
  texto: string;
  imagem?: string | null; // Optional image URL
  data: string; // DD/MM/YYYY
};
