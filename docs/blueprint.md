# **App Name**: Estrelas do Campo App

## Core Features:

- Agenda de Eventos: Exibir uma lista de jogos e treinos agendados, mostrando título, data, horário e local. Os eventos são ordenados por data (mais próximo primeiro) e limitados a 20 por carga para otimizar o desempenho. Os dados são buscados da coleção 'eventos' no Firestore.
- Notícias do Time: Apresentar notícias e atualizações do time, incluindo título, texto curto e imagem opcional (thumbnail 100x100px). Limitado a 10 notícias por carga. Os dados são buscados da coleção 'noticias' no Firestore. Imagens são armazenadas no Firebase Storage.
- Contato via WhatsApp: Fornecer um link direto para contato via WhatsApp com uma mensagem pré-definida. O link abre em uma nova aba ou aplicativo, utilizando um número de telefone placeholder.

## Style Guidelines:

- Cor primária: Verde (#22C55E) para representar os campos de futebol e transmitir uma sensação vibrante e acolhedora.
- Cor secundária: Branco (#FFFFFF) para criar fundos limpos e claros.
- Cor de destaque: Ouro (#FBBF24) para realçar elementos importantes, simbolizando vitória e energia. Usar em botões e títulos.
- Fonte: Inter (Google Fonts) para todos os textos.
- Tamanho da fonte: 24px para títulos, 16px para o corpo do texto e 14px para textos menores.
- Header fixo no topo com fundo branco, exibindo o logo do time à esquerda e o menu hamburger à direita (com aria-label 'Abrir menu de navegação').
- Menu lateral (slide-in da direita com transição suave de 0.3s) com fundo verde, contendo links para Agenda, Notícias e Contato.
- Footer estático com fundo cinza e texto '© 2025 Estrelas do Campo App' (14px, centralizado).
- Conteúdo principal com fundo branco, padding de 16px e largura máxima de 800px, centralizado. Utilizar Tailwind CSS para responsividade (flex, grid, sm:, md:).
- Transição suave (0.3s) para o menu slide-in.

## Original User Request:
Build a full-stack web application called "Estrelas do Campo App" using Next.js, designed to promote a women's football team, emphasizing cultural inclusion and community engagement. The app should be simple, accessible on low-end mobile devices, and use Firebase Firestore for data storage. It targets players, coaches, and local fans, aligning with gender equality and cultural heritage goals. Below are the detailed requirements for features, user workflows, design, and business rules.

---

### App Overview
- **Purpose**: Support a women's football team ("Estrelas do Campo") by providing a platform for event scheduling, news sharing, and community contact, promoting the sport as a cultural expression.
- **Target Audience**: 15 female players, 5 coaches, and approximately 200 local fans in a small community.
- **Platform**: Web app (responsive, optimized for mobile browsers, no installation required).
- **Tech Stack**: Next.js (front-end), Firebase Firestore (back-end for events and news), Firebase Hosting (deployment). Use Tailwind CSS for styling.
- **Language**: Portuguese (Brazilian Portuguese for all text).

---

### Features and User Workflows

#### 1. Agenda Screen (Event Schedule)
- **Purpose**: Display a list of upcoming games and training sessions to help players and fans stay informed.
- **User Workflow**:
  1. User lands on the home page, which is the Agenda screen.
  2. Sees a list of events (title, date, time, location).
  3. Can scroll through events sorted by date (nearest first).
  4. Clicks a menu button (hamburger icon) to navigate to Notícias or Contato screens.
- **Data Requirements**:
  - Events stored in a Firestore collection called "eventos" with fields:
    - `titulo` (string, e.g., "Jogo vs. Leoas"),
    - `data` (string, format "DD/MM/YYYY", e.g., "20/04/2025"),
    - `horario` (string, e.g., "16:00"),
    - `local` (string, e.g., "Campo Municipal").
  - Fetch events dynamically from Firestore and cache for offline access (if possible).
- **Business Rules**:
  - Only display events with a date equal to or later than today.
  - Limit to 20 events per load to optimize performance on low-end devices.
  - No user input required (read-only for MVP).

#### 2. Notícias Screen (News)
- **Purpose**: Share team updates, such as game results or announcements, to engage fans and promote the team's cultural role.
- **User Workflow**:
  1. User navigates to Notícias via the menu.
  2. Sees a list of news posts (title, short text, optional image).
  3. Scrolls through posts, with the most recent first.
  4. Can return to Agenda or go to Contato via the menu.
- **Data Requirements**:
  - News stored in a Firestore collection called "noticias" with fields:
    - `titulo` (string, e.g., "Vitória por 3x1!"),
    - `texto` (string, max 200 characters, e.g., "Grande jogo contra as Leoas!"),
    - `imagem` (string, optional URL to an image hosted in Firebase Storage),
    - `data` (string, format "DD/MM/YYYY", e.g., "20/04/2025").
  - Fetch news dynamically from Firestore.
- **Business Rules**:
  - Display up to 10 news posts at a time.
  - If an image is present, show it as a thumbnail (max 100x100px).
  - No user input required (read-only for MVP).

#### 3. Contato Screen (Contact)
- **Purpose**: Allow fans to connect with the team via WhatsApp for inquiries or support.
- **User Workflow**:
  1. User navigates to Contato via the menu.
  2. Sees a brief message (e.g., "Fale com o time Estrelas do Campo!").
  3. Clicks a button labeled "Enviar Mensagem" that opens WhatsApp with a pre-filled message ("Olá, sou fã do Estrelas do Campo e quero saber mais!").
  4. Can return to Agenda or Notícias via the menu.
- **Data Requirements**:
  - Static content (no Firestore needed).
  - WhatsApp link format: `https://wa.me/5511999999999?text=Olá,%20sou%20fã%20do%20Estrelas%20do%20Campo%20e%20quero%20saber%20mais!`.
- **Business Rules**:
  - Use a placeholder phone number (+5511999999999) for now; replace with the team's real number later.
  - Ensure the link opens WhatsApp in a new tab or app.

---

### User Interface and Design
- **Color Scheme**:
  - **Primary**: Green (#22C55E, inspired by football fields, vibrant and welcoming).
  - **Secondary**: White (#FFFFFF, for clean backgrounds).
  - **Accent**: Gold (#FBBF24, for highlights, symbolizing victory and energy).
  - **Text**: Dark Gray (#1F2937, high contrast for readability).
- **Typography**:
  - Font: **Inter** (available via Google Fonts, clean and modern).
  - Sizes: 24px (headings), 16px (body), 14px (small text).
- **Layout**:
  - **Header**: Fixed at the top, white background, with:
    - Left: Team logo (placeholder text "Estrelas do Campo" in gold if no image).
    - Right: Hamburger menu icon (green, toggles a slide-in menu).
  - **Menu**: Slide-in from the right, green background, with links to "Agenda", "Notícias", "Contato" (white text, bold).
  - **Content Area**: White background, padding 16px, max-width 800px, centered.
  - **Footer**: Static, gray background, text "© 2025 Estrelas do Campo App" (14px, centered).
- **Components**:
  - **Agenda**: List items in cards (white, rounded corners, shadow), with title in bold green, details in dark gray.
  - **Notícias**: Similar card style, with optional thumbnail (left-aligned).
  - **Contato**: Centered text and a green button with white text ("Enviar Mensagem").
- **Accessibility**:
  - Ensure high contrast (WCAG 2.1 compliant).
  - Add `aria-label` to menu and buttons (e.g., "Abrir menu de navegação").
  - Support screen readers for event and news lists.
- **Responsiveness**:
  - Optimize for mobile (min-width 320px, max-width 800px).
  - Use Tailwind CSS classes like `flex`, `grid`, `sm:`, `md:` for responsive layouts.
- **Performance**:
  - Lazy-load images in Notícias.
  - Minimize JavaScript bundle size for low-end devices.

---

### Navigation Flow
- **Entry Point**: User opens the app and lands on the **Agenda** screen (home).
- **Menu Navigation**:
  - Click the hamburger icon to open the menu.
  - Select "Notícias" to view news posts.
  - Select "Contato" to access the contact page.
  - Select "Agenda" to return to the home screen.
- **External Link**:
  - From Contato, clicking "Enviar Mensagem" opens WhatsApp in a new tab/app.
- **No Authentication**: The app is public, read-only, no login required.

---

### Business Rules
- **Data Management**:
  - Events and news are pre-populated in Firestore by the team (no admin interface in MVP).
  - Example event: `{ "titulo": "Treino Semanal", "data": "25/04/2025", "horario": "18:00", "local": "Campo Municipal" }`.
  - Example news: `{ "titulo": "Novo Uniforme!", "texto": "Confira o novo uniforme do time!", "imagem": "https://firebasestorage.googleapis.com/...", "data": "22/04/2025" }`.
- **Constraints**:
  - App must load in under 5 seconds on a 3G connection.
  - Support devices with 1GB RAM and 320x480px screens.
  - No paid services (use Firebase free tier).
- **Cultural Alignment**:
  - Emphasize the team's role in promoting gender equality (e.g., tagline in Agenda: "Futebol feminino: força e cultura").
  - Use inclusive language (e.g., "torcedores e torcedoras").

---

### Example Prompt Refinement
If the initial prototype lacks a feature, refine with:
- "Add a filter to the Agenda screen to show only games or only trainings."
- "Change the button color in Contato to gold (#FBBF24) and increase font size to 18px."
- "Ensure the app works offline by caching Firestore data."

---

### Setup Instructions
- Create a Firebase project and enable Firestore and Hosting.
- Populate Firestore with:
  - Collection "eventos" (at least 3 sample events).
  - Collection "noticias" (at least 2 sample news posts).
- Use Firebase App Hosting for deployment.
- Generate a Gemini API key if AI features are needed (not required for MVP).
- Ensure the app is publicly accessible via a shareable URL.

---

### Sample Data
- **Eventos**:
  1. `{ "titulo": "Jogo vs. Leoas", "data": "20/04/2025", "horario": "16:00", "local": "Campo Municipal" }`
  2. `{ "titulo": "Treino Semanal", "data": "25/04/2025", "horario": "18:00", "local": "Campo Municipal" }`
  3. `{ "titulo": "Amistoso", "data": "30/04/2025", "horario": "15:00", "local": "Estádio Central" }`
- **Notícias**:
  1. `{ "titulo": "Vitória por 3x1!", "texto": "Grande jogo contra as Leoas!", "data": "20/04/2025" }`
  2. `{ "titulo": "Novo Uniforme!", "texto": "Confira o novo uniforme do time!", "imagem": "https://firebasestorage.googleapis.com/...", "data": "22/04/2025" }`

---

### Additional Notes
- **Tone**: Friendly, empowering, and community-focused (e.g., "Junte-se às Estrelas do Campo!").
- **Context**: The app is part of a university extension project to promote women's football as a cultural and inclusive activity in Brazil.
- **Constraints**: Avoid complex animations or heavy dependencies to ensure compatibility with low-end devices.
- **Future Features** (not in MVP): Add a "Histórias" screen with player profiles to highlight their journeys.

---

Please generate the app with the above specifications, including the UI, Firestore integration, and WhatsApp link. Provide a web preview and a shareable URL for testing. If any clarification is needed, suggest improvements before finalizing.
Important! E não se esqueça, precisa estar em Portugues
  