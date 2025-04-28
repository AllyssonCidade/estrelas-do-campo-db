require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db'); // Import the pool from db.js

const app = express();
const PORT = process.env.PORT || 3001; // Use Render's port or default

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// --- Helper Functions ---
const parseDateString = (dateStr) => {
    try {
        if (typeof dateStr !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        if (month < 1 || month > 12 || day < 1 || day > 31) return null;
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
        return date;
    } catch (e) { return null; }
};

const isValidDate = (dateStr) => {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr) && parseDateString(dateStr) !== null;
};

const isValidUrl = (url) => {
    try {
        return typeof url === 'string' && 
               (url.startsWith('http://') || url.startsWith('https://')) &&
               url.length <= 255;
    } catch (e) { return false; }
};

// --- Password Check Middleware ---
const checkPassword = (req, res, next) => {
  // Password should be in the request body for POST/PUT/DELETE
  const { password } = req.body;
  // Allow GET requests without password
  if (req.method === 'GET') {
    return next();
  }
  // Check password for protected routes
  if (password !== process.env.ADMIN_PASSWORD) {
    console.log('Password mismatch attempt'); // Log failed attempts
    return res.status(401).json({ error: 'Senha incorreta' });
  }
  // If password matches, remove it from the body before proceeding
  delete req.body.password;
  next();
};

// --- API Routes ---

// GET /api/eventos - List events
app.get('/api/eventos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM eventos');

    // Filter for today/future and sort by date ascending
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredAndSortedEventos = rows
      .map(evento => ({
        ...evento,
        parsedDate: parseDateString(evento.data)
      }))
      .filter(evento => evento.parsedDate && evento.parsedDate >= today)
      .sort((a, b) => (a.parsedDate ? a.parsedDate.getTime() : 0) - (b.parsedDate ? b.parsedDate.getTime() : 0))
      .map(({ parsedDate, ...rest }) => rest);

    res.json(filteredAndSortedEventos.slice(0, 20));
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos do banco de dados.' });
  }
});

// GET /api/eventos/all - List ALL events for CMS (sorted desc)
app.get('/api/eventos/all', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM eventos');

    const sortedEventos = rows
      .map(evento => ({
        ...evento,
        parsedDate: parseDateString(evento.data)
      }))
      .filter(evento => evento.parsedDate)
      .sort((a, b) => (b.parsedDate ? b.parsedDate.getTime() : 0) - (a.parsedDate ? a.parsedDate.getTime() : 0))
      .map(({ parsedDate, ...rest }) => rest);

    res.json(sortedEventos);
  } catch (error) {
    console.error('Error fetching all events for CMS:', error);
    res.status(500).json({ error: 'Erro ao buscar todos os eventos para CMS.' });
  }
});

// POST /api/eventos - Create event (Password Protected)
app.post('/api/eventos', checkPassword, async (req, res) => {
  const { titulo, data, horario, local } = req.body;

  // Basic Validation
  if (!titulo || !data || !horario || !local) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, data, horario, local).' });
  }
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  }
  if (!/^\d{2}:\d{2}$/.test(horario)) {
    return res.status(400).json({ error: 'Formato de horário inválido. Use HH:MM.' });
  }
  if (titulo.length > 100 || local.length > 100) {
    return res.status(400).json({ error: 'Título e Local não podem exceder 100 caracteres.' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO eventos (titulo, data, horario, local) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, data, horario, local]
    );
    res.status(201).json({ message: 'Evento adicionado com sucesso!', evento: rows[0] });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Erro ao salvar evento no banco de dados.' });
  }
});

// PUT /api/eventos/:id - Update event (Password Protected)
app.put('/api/eventos/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  const { titulo, data, horario, local } = req.body;

  // Basic Validation
  if (!titulo || !data || !horario || !local) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, data, horario, local).' });
  }
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  }
  if (!/^\d{2}:\d{2}$/.test(horario)) {
    return res.status(400).json({ error: 'Formato de horário inválido. Use HH:MM.' });
  }
  if (titulo.length > 100 || local.length > 100) {
    return res.status(400).json({ error: 'Título e Local não podem exceder 100 caracteres.' });
  }

  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE eventos SET titulo = $1, data = $2, horario = $3, local = $4 WHERE id = $5 RETURNING *',
      [titulo, data, horario, local, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    res.json({ message: 'Evento atualizado com sucesso!', evento: rows[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento no banco de dados.' });
  }
});

// DELETE /api/eventos/:id - Delete event (Password Protected)
app.delete('/api/eventos/:id', checkPassword, async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM eventos WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    res.json({ message: 'Evento deletado com sucesso!' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Erro ao deletar evento do banco de dados.' });
  }
});

// --- API Routes for Noticias ---

// GET /api/noticias - List recent news for public view (sorted desc by date)
app.get('/api/noticias', async (req, res) => {
  console.log(`GET /api/noticias requested from origin: ${req.headers.origin}`);
  try {
    const { rows } = await pool.query('SELECT * FROM noticias');
    const sortedNoticias = rows
      .map(noticia => ({ ...noticia, parsedDate: parseDateString(noticia.data) }))
      .filter(noticia => noticia.parsedDate)
      .sort((a, b) => (b.parsedDate?.getTime() ?? -Infinity) - (a.parsedDate?.getTime() ?? -Infinity))
      .map(({ parsedDate, ...rest }) => rest);

    console.log(`Sending ${Math.min(sortedNoticias.length, 10)} noticias for /api/noticias`);
    res.json(sortedNoticias.slice(0, 10));
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias do banco de dados.' });
  }
});

// GET /api/noticias/all - List ALL news for CMS (sorted desc by date)
app.get('/api/noticias/all', async (req, res) => {
  console.log(`GET /api/noticias/all requested from origin: ${req.headers.origin}`);
  try {
    const { rows } = await pool.query('SELECT * FROM noticias');

    const sortedNoticias = rows
      .map(noticia => ({ ...noticia, parsedDate: parseDateString(noticia.data) }))
      .filter(noticia => noticia.parsedDate)
      .sort((a, b) => (b.parsedDate?.getTime() ?? -Infinity) - (a.parsedDate?.getTime() ?? -Infinity))
      .map(({ parsedDate, ...rest }) => rest);

    console.log(`Sending ${sortedNoticias.length} noticias for /api/noticias/all`);
    res.json(sortedNoticias);
  } catch (error) {
    console.error('Error fetching all news for CMS:', error);
    res.status(500).json({ error: 'Erro ao buscar todas as notícias para CMS.' });
  }
});

// POST /api/noticias - Create news item (Password Protected)
app.post('/api/noticias', checkPassword, async (req, res) => {
  const { titulo, texto, imagem, data } = req.body;
  console.log(`POST /api/noticias: ${titulo}`);

  // Validation
  if (!titulo || !texto || !imagem || !data) return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, texto, imagem, data).' });
  if (!isValidDate(data)) return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  if (!isValidUrl(imagem)) return res.status(400).json({ error: 'URL da imagem inválida. Deve começar com http:// ou https://.' });
  if (titulo.length > 100) return res.status(400).json({ error: 'Título não pode exceder 100 caracteres.' });
  if (imagem.length > 255) return res.status(400).json({ error: 'URL da imagem não pode exceder 255 caracteres.' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO noticias (titulo, texto, imagem, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, texto, imagem, data]
    );
    console.log(`Noticia added successfully: ID ${rows[0].id}`);
    res.status(201).json({ message: 'Notícia adicionada com sucesso!', noticia: rows[0] });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Erro ao salvar notícia no banco de dados.' });
  }
});

// PUT /api/noticias/:id - Update news item (Password Protected)
app.put('/api/noticias/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  const { titulo, texto, imagem, data } = req.body;
  console.log(`PUT /api/noticias/${id}: ${titulo}`);

  // Validation
  if (!titulo || !texto || !imagem || !data) return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, texto, imagem, data).' });
  if (!isValidDate(data)) return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });

  try {
    const { rows } = await pool.query(
      'UPDATE noticias SET titulo = $1, texto = $2, imagem = $3, data = $4 WHERE id = $5 RETURNING *',
      [titulo, texto, imagem, data, id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Notícia não encontrada.' });

    console.log(`Notícia updated successfully: ID ${rows[0].id}`);
    res.json({ message: 'Notícia atualizada com sucesso!', noticia: rows[0] });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Erro ao atualizar notícia no banco de dados.' });
  }
});

// DELETE /api/noticias/:id - Delete news item (Password Protected)
app.delete('/api/noticias/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  
  try {
    const { rowCount } = await pool.query('DELETE FROM noticias WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }
    res.json({ message: 'Notícia deletada com sucesso!' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Erro ao deletar notícia do banco de dados.' });
  }
});

// --- Root Route (Optional: for health check) ---
app.get('/', (req, res) => {
  res.send('Estrelas do Campo Backend API is running!');
});

// --- Error Handling Middleware (Basic) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado no servidor!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
