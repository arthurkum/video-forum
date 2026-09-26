import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directorios clave
const DATA_FILE = path.join(__dirname, 'data', 'forum_data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuración de Multer para subir videos locales
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.mkv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de video (.mp4, .webm, .ogg, .mov, etc.)'));
    }
  }
});

// Helper para leer base de datos JSON
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error al leer datos:', err);
    return [];
  }
}

// Helper para guardar base de datos JSON
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error al guardar datos:', err);
    return false;
  }
}

// Helper para formatear URLs de video (reconocer YouTube o video directo)
function parseVideoSource(rawUrl) {
  if (!rawUrl) return { type: 'unknown', url: '' };

  const trimmed = rawUrl.trim();

  // YouTube match: regular watch, youtu.be, or shorts
  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch) {
    return {
      type: 'youtube',
      url: `https://www.youtube.com/embed/${ytMatch[1]}`
    };
  }

  // Vimeo match
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  // Enlace directo de video
  return {
    type: 'url',
    url: trimmed
  };
}

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// ================= API ENDPOINTS =================

// 1. Obtener todos los temas/videos
app.get('/api/posts', (req, res) => {
  const posts = readData();
  // Devolver lista ligera ordenada por fecha descendente
  const list = posts.map(p => ({
    id: p.id,
    title: p.title,
    author: p.author,
    category: p.category || 'General',
    createdAt: p.createdAt,
    videoType: p.videoType,
    videoUrl: p.videoUrl,
    views: p.views || 0,
    likes: p.likes || 0,
    commentsCount: (p.comments || []).reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0)
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, posts: list });
});

// 2. Obtener un tema/video por ID con sus comentarios
app.get('/api/posts/:id', (req, res) => {
  const posts = readData();
  const post = posts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, error: 'Video o tema no encontrado' });
  }

  res.json({ success: true, post });
});

// 3. Crear nuevo tema/video (con subida de archivo o enlace)
app.post('/api/posts', upload.single('videoFile'), (req, res) => {
  try {
    const { title, author, description, category, videoUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'El título es requerido' });
    }

    let finalVideoType = 'url';
    let finalVideoUrl = '';

    if (req.file) {
      // Se subió un archivo local
      finalVideoType = 'uploaded';
      finalVideoUrl = `/uploads/${req.file.filename}`;
    } else if (videoUrl && videoUrl.trim()) {
      const parsed = parseVideoSource(videoUrl);
      finalVideoType = parsed.type;
      finalVideoUrl = parsed.url;
    } else {
      return res.status(400).json({ success: false, error: 'Debes proporcionar un enlace de video o subir un archivo' });
    }

    const posts = readData();
    const newPost = {
      id: 'post-' + Date.now(),
      title: title.trim(),
      description: (description || '').trim(),
      author: (author || 'Anónimo').trim(),
      category: (category || 'General').trim(),
      createdAt: new Date().toISOString(),
      videoType: finalVideoType,
      videoUrl: finalVideoUrl,
      views: 0,
      likes: 0,
      comments: []
    };

    posts.unshift(newPost);
    writeData(posts);

    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    console.error('Error al crear post:', err);
    res.status(500).json({ success: false, error: err.message || 'Error interno del servidor' });
  }
});

// 4. Incrementar vistas
app.post('/api/posts/:id/view', (req, res) => {
  const posts = readData();
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    post.views = (post.views || 0) + 1;
    writeData(posts);
    return res.json({ success: true, views: post.views });
  }
  res.status(404).json({ success: false, error: 'No encontrado' });
});

// 5. Dar Like a un video
app.post('/api/posts/:id/like', (req, res) => {
  const posts = readData();
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    post.likes = (post.likes || 0) + 1;
    writeData(posts);
    return res.json({ success: true, likes: post.likes });
  }
  res.status(404).json({ success: false, error: 'No encontrado' });
});

// 6. Agregar comentario a un video
app.post('/api/posts/:id/comments', (req, res) => {
  const { author, content, avatarColor } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'El comentario no puede estar vacío' });
  }

  const posts = readData();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, error: 'Video no encontrado' });
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];
  const assignedColor = avatarColor || colors[Math.floor(Math.random() * colors.length)];

  const newComment = {
    id: 'c-' + Date.now(),
    author: (author || 'Usuario').trim(),
    content: content.trim(),
    avatarColor: assignedColor,
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: []
  };

  if (!post.comments) post.comments = [];
  post.comments.push(newComment);
  writeData(posts);

  res.status(201).json({ success: true, comment: newComment });
});

// 7. Responder a un comentario específico
app.post('/api/posts/:id/comments/:commentId/reply', (req, res) => {
  const { author, content, avatarColor } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'La respuesta no puede estar vacía' });
  }

  const posts = readData();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, error: 'Video no encontrado' });
  }

  const comment = (post.comments || []).find(c => c.id === req.params.commentId);
  if (!comment) {
    return res.status(404).json({ success: false, error: 'Comentario no encontrado' });
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];
  const assignedColor = avatarColor || colors[Math.floor(Math.random() * colors.length)];

  const newReply = {
    id: 'r-' + Date.now(),
    author: (author || 'Usuario').trim(),
    content: content.trim(),
    avatarColor: assignedColor,
    createdAt: new Date().toISOString(),
    likes: 0
  };

  if (!comment.replies) comment.replies = [];
  comment.replies.push(newReply);
  writeData(posts);

  res.status(201).json({ success: true, reply: newReply });
});

// 8. Like a un comentario
app.post('/api/posts/:id/comments/:commentId/like', (req, res) => {
  const posts = readData();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ success: false, error: 'Video no encontrado' });

  const comment = (post.comments || []).find(c => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ success: false, error: 'Comentario no encontrado' });

  comment.likes = (comment.likes || 0) + 1;
  writeData(posts);

  res.json({ success: true, likes: comment.likes });
});

// 9. Eliminar un post
app.delete('/api/posts/:id', (req, res) => {
  const posts = readData();
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'No encontrado' });

  // Si era un archivo local subido, opcionalmente eliminarlo del disco
  const post = posts[index];
  if (post.videoType === 'uploaded' && post.videoUrl) {
    const filename = path.basename(post.videoUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }

  posts.splice(index, 1);
  writeData(posts);
  res.json({ success: true, message: 'Publicación eliminada correctamente' });
});

// Fallback a index.html para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor del Foro de Videos activo en:`);
  console.log(`👉 Local: http://localhost:${PORT}`);
  console.log(`👉 Red Local: http://0.0.0.0:${PORT}`);
  console.log(`===============================================`);
});
