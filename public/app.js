// Estado de la Aplicación
let currentPostId = null;
let currentPost = null;
let allPosts = [];
let userLikedPosts = new Set(JSON.parse(localStorage.getItem('vf_liked_posts') || '[]'));
let userLikedComments = new Set(JSON.parse(localStorage.getItem('vf_liked_comments') || '[]'));

// Elementos del DOM
const videoWrapper = document.getElementById('videoWrapper');
const postCategory = document.getElementById('postCategory');
const postTitle = document.getElementById('postTitle');
const postAuthor = document.getElementById('postAuthor');
const postAuthorAvatar = document.getElementById('postAuthorAvatar');
const postDate = document.getElementById('postDate');
const postViews = document.getElementById('postViews');
const postCommentsBadge = document.getElementById('postCommentsBadge');
const postDescription = document.getElementById('postDescription');
const videoLikesCount = document.getElementById('videoLikesCount');
const likeVideoBtn = document.getElementById('likeVideoBtn');
const shareBtn = document.getElementById('shareBtn');

// Comentarios
const commentsList = document.getElementById('commentsList');
const commentsHeadingCount = document.getElementById('commentsHeadingCount');
const sortCommentsSelect = document.getElementById('sortCommentsSelect');
const commentAuthorInput = document.getElementById('commentAuthorInput');
const commentTextInput = document.getElementById('commentTextInput');
const submitCommentBtn = document.getElementById('submitCommentBtn');
const currentUserAvatar = document.getElementById('currentUserAvatar');

// Barra lateral y búsqueda
const sidebarPostsList = document.getElementById('sidebarPostsList');
const searchInput = document.getElementById('searchInput');
const brandBtn = document.getElementById('brandBtn');

// Modal de nuevo post
const openNewPostBtn = document.getElementById('openNewPostBtn');
const sidebarNewBtn = document.getElementById('sidebarNewBtn');
const newPostModal = document.getElementById('newPostModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const newPostForm = document.getElementById('newPostForm');
const dropzone = document.getElementById('dropzone');
const videoFileInput = document.getElementById('videoFileInput');
const selectedFileInfo = document.getElementById('selectedFileInfo');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const removeFileBtn = document.getElementById('removeFileBtn');
const videoUrlInput = document.getElementById('videoUrlInput');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const uploadProgressContainer = document.getElementById('uploadProgressContainer');
const uploadProgressBar = document.getElementById('uploadProgressBar');
const uploadProgressText = document.getElementById('uploadProgressText');
const publishBtn = document.getElementById('publishBtn');

// Miniatura y avisos
const thumbnailUrlInput = document.getElementById('thumbnailUrlInput');
const thumbnailFileInput = document.getElementById('thumbnailFileInput');
const thumbnailPreviewWrap = document.getElementById('thumbnailPreviewWrap');
const thumbnailPreviewImg = document.getElementById('thumbnailPreviewImg');
const removeThumbnailBtn = document.getElementById('removeThumbnailBtn');
const cloudUploadNotice = document.getElementById('cloudUploadNotice');

// Tema
const themeToggleBtn = document.getElementById('themeToggleBtn');

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initUser();
  setupEventListeners();

  // Comprobar si hay un ID en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialPostId = urlParams.get('id');

  loadPosts(initialPostId);
});

// Guardar / Cargar Usuario Local
function initUser() {
  const savedName = localStorage.getItem('vf_username') || '';
  if (savedName) {
    commentAuthorInput.value = savedName;
    document.getElementById('postAuthorInput').value = savedName;
    updateUserAvatar(savedName);
  }
}

function updateUserAvatar(name) {
  const initial = (name.trim()[0] || 'T').toUpperCase();
  currentUserAvatar.textContent = initial;
}

// Tema Claro / Oscuro
function initTheme() {
  const savedTheme = localStorage.getItem('vf_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeToggleBtn.querySelector('.theme-icon').textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    themeToggleBtn.querySelector('.theme-icon').textContent = '🌙';
  }
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeToggleBtn.querySelector('.theme-icon').textContent = '☀️';
    localStorage.setItem('vf_theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    themeToggleBtn.querySelector('.theme-icon').textContent = '🌙';
    localStorage.setItem('vf_theme', 'dark');
  }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  themeToggleBtn.addEventListener('click', toggleTheme);

  brandBtn.addEventListener('click', () => {
    if (allPosts.length > 0) {
      loadPostDetails(allPosts[0].id);
    }
  });

  // Búsqueda
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    renderSidebarPosts(allPosts.filter(p => 
      p.title.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.author && p.author.toLowerCase().includes(term))
    ));
  });

  // Modal
  openNewPostBtn.addEventListener('click', openModal);
  if (sidebarNewBtn) sidebarNewBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);

  // Tabs en modal
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetTab = document.getElementById(btn.dataset.tab);
      if (targetTab) targetTab.classList.add('active');
    });
  });

  // File dropzone
  dropzone.addEventListener('click', () => videoFileInput.click());
  videoFileInput.addEventListener('change', handleFileSelected);

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      videoFileInput.files = e.dataTransfer.files;
      handleFileSelected();
    }
  });

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    videoFileInput.value = '';
    selectedFileInfo.style.display = 'none';
  });

  // Miniatura / Portada
  if (thumbnailFileInput) {
    thumbnailFileInput.addEventListener('change', () => {
      if (thumbnailFileInput.files && thumbnailFileInput.files[0]) {
        const file = thumbnailFileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          thumbnailPreviewImg.src = e.target.result;
          thumbnailPreviewWrap.style.display = 'block';
          if (thumbnailUrlInput) thumbnailUrlInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (thumbnailUrlInput) {
    thumbnailUrlInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) {
        thumbnailPreviewImg.src = val;
        thumbnailPreviewWrap.style.display = 'block';
      } else {
        thumbnailPreviewWrap.style.display = 'none';
      }
    });
  }

  if (removeThumbnailBtn) {
    removeThumbnailBtn.addEventListener('click', () => {
      if (thumbnailFileInput) thumbnailFileInput.value = '';
      if (thumbnailUrlInput) thumbnailUrlInput.value = '';
      if (thumbnailPreviewImg) thumbnailPreviewImg.src = '';
      if (thumbnailPreviewWrap) thumbnailPreviewWrap.style.display = 'none';
    });
  }

  // Form submit
  newPostForm.addEventListener('submit', handleNewPostSubmit);

  // Likes y Compartir
  likeVideoBtn.addEventListener('click', handleLikeVideo);
  shareBtn.addEventListener('click', handleShare);

  // Comentarios
  submitCommentBtn.addEventListener('click', handleCommentSubmit);
  sortCommentsSelect.addEventListener('change', () => {
    if (currentPost && currentPost.comments) {
      renderComments(currentPost.comments);
    }
  });

  commentAuthorInput.addEventListener('input', (e) => {
    const val = e.target.value;
    updateUserAvatar(val);
    localStorage.setItem('vf_username', val);
  });
}

function handleFileSelected() {
  if (videoFileInput.files && videoFileInput.files[0]) {
    const file = videoFileInput.files[0];
    fileNameDisplay.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
    selectedFileInfo.style.display = 'flex';
  }
}

function openModal() {
  newPostModal.classList.add('open');
  if (isStaticMode && cloudUploadNotice) {
    cloudUploadNotice.style.display = 'flex';
  }
}

function closeModal() {
  newPostModal.classList.remove('open');
  uploadProgressContainer.style.display = 'none';
  uploadProgressBar.style.width = '0%';
  if (thumbnailPreviewWrap) thumbnailPreviewWrap.style.display = 'none';
  if (thumbnailPreviewImg) thumbnailPreviewImg.src = '';
}

// Helper para resolver rutas relativas en GitHub Pages (ej: /video-forum/intro.mp4)
function resolveAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const clean = url.replace(/^\.?\//, '');
  const origin = window.location.origin;
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const isGithub = window.location.hostname.endsWith('github.io');
  const repoName = isGithub && pathSegments.length > 0 ? pathSegments[0] : '';

  if (repoName) {
    return `${origin}/${repoName}/${clean}`;
  }
  return `${origin}/${clean}`;
}

// Helper para obtener URL base limpia sin romper rutas en GitHub Pages
function getBaseAppUrl() {
  const origin = window.location.origin;
  let path = window.location.pathname.replace(/\/index\.html$/, '');
  if (!path.endsWith('/')) {
    path += '/';
  }
  return `${origin}${path}`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Genera un enlace que funciona para CUALQUIER persona en internet (sin dar error 404)
function getShareableUrl(post) {
  if (!post) return getBaseAppUrl();
  const baseUrl = getBaseAppUrl();

  // Si es un video personalizado (creado con YouTube, Dropbox, Drive, enlace web, etc.)
  // Lo empaquetamos con parámetros para que cualquier amigo que abra el enlace lo vea de inmediato
  if (post.isCustom || (post.id && post.id !== 'post-intro-1' && !post.id.startsWith('post-1'))) {
    const params = new URLSearchParams();
    params.set('v', post.videoUrl);
    params.set('title', post.title);
    if (post.author) params.set('author', post.author);
    if (post.category) params.set('cat', post.category);
    if (post.description) params.set('desc', post.description);
    if (post.thumbnail) params.set('thumb', post.thumbnail);
    return `${baseUrl}?${params.toString()}`;
  }

  // Si es el video oficial de introducción
  return `${baseUrl}?id=${encodeURIComponent(post.id)}`;
}

// ==================== CARGAR PUBLICACIONES ====================
let isStaticMode = false;

async function loadPosts(preferredPostId = null) {
  try {
    let posts = null;

    // Intentar consultar API de Node.js
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.posts) {
          posts = data.posts;
        }
      }
    } catch (e) {
      // Servidor no disponible o estamos en GitHub Pages / estático
    }

    // Si no hubo respuesta del backend, activar Modo Estático / GitHub Pages
    if (!posts) {
      isStaticMode = true;
      document.body.classList.add('static-cloud-mode');
      
      const badge = document.querySelector('.brand-badge');
      if (badge) {
        badge.textContent = 'GitHub Cloud 24/7';
        badge.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
        badge.style.color = '#fff';
      }

      try {
        const jsonUrl = resolveAssetUrl('data/forum_data.json') + '?t=' + Date.now();
        const staticRes = await fetch(jsonUrl);
        if (staticRes.ok) {
          const rawData = await staticRes.json();
          posts = rawData.map(p => ({
            ...p,
            commentsCount: (p.comments || []).length
          }));
        }
      } catch (err) {
        console.warn('Cargando posts de respaldo local');
      }

      if (!posts || posts.length === 0) {
        // Fallback garantizado en caso de carga offline
        posts = [
          {
            id: 'post-intro-1',
            title: 'Video de Presentación - Introducción Oficial',
            description: '¡Bienvenidos a nuestro foro de video! Este es el video introductorio alojado directamente en el sitio web. Puedes verlo en pantalla completa, dejar comentarios y compartir tu opinión.',
            author: 'Arturo',
            category: 'Presentación',
            createdAt: new Date().toISOString(),
            videoType: 'url',
            videoUrl: './intro.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
            views: 48,
            likes: 12,
            commentsCount: 1
          }
        ];
      }

      // Combinar con publicaciones creadas localmente y limpiar posts antiguos de demo
      const localCustomPosts = JSON.parse(localStorage.getItem('vf_custom_posts') || '[]');
      posts = [...localCustomPosts, ...posts].filter(p => 
        !p.title.includes('Big Buck Bunny') && !(p.videoUrl && p.videoUrl.includes('BigBuckBunny'))
      );
    }

    // Comprobar si se abrió mediante un enlace compartido con video específico (?v=...)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedV = urlParams.get('v') || urlParams.get('video');

    if (sharedV) {
      const parsed = parseVideoSource(sharedV);
      const title = urlParams.get('title') || urlParams.get('t') || 'Video Compartido';
      const author = urlParams.get('author') || 'Comunidad';
      const category = urlParams.get('cat') || 'General';
      const desc = urlParams.get('desc') || '';
      const thumb = urlParams.get('thumb') || parsed.defaultThumbnail || '';

      const sharedPost = {
        id: 'shared-' + hashCode(sharedV + title),
        title: title,
        author: author,
        category: category,
        description: desc,
        createdAt: new Date().toISOString(),
        videoType: parsed.type,
        videoUrl: parsed.url,
        thumbnail: thumb,
        isCustom: true,
        views: 1,
        likes: 1,
        comments: []
      };

      // Guardar también en el almacenamiento local del visitante para que no se pierda
      const localCustom = JSON.parse(localStorage.getItem('vf_custom_posts') || '[]');
      if (!localCustom.some(p => p.id === sharedPost.id)) {
        localCustom.unshift(sharedPost);
        localStorage.setItem('vf_custom_posts', JSON.stringify(localCustom));
      }

      posts = [sharedPost, ...posts.filter(p => p.id !== sharedPost.id)];
      preferredPostId = sharedPost.id;
    }

    allPosts = posts;
    renderSidebarPosts(allPosts);

    if (allPosts.length > 0) {
      const targetId = preferredPostId && allPosts.some(p => p.id === preferredPostId) 
        ? preferredPostId 
        : allPosts[0].id;
      loadPostDetails(targetId);
    } else {
      videoWrapper.innerHTML = `
        <div class="video-placeholder">
          <p>Aún no hay videos en el foro. ¡Publica uno!</p>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error al inicializar posts:', err);
  }
}

// Cargar detalles de un post específico
async function loadPostDetails(postId) {
  try {
    currentPostId = postId;
    // Actualizar URL sin recargar de forma segura (sin provocar 404 si se comparte)
    const targetPost = allPosts.find(p => p.id === postId);
    const newUrl = getShareableUrl(targetPost);
    try {
      window.history.replaceState({ postId }, '', newUrl);
    } catch (e) {}

    // Marcar como activo en la barra lateral
    document.querySelectorAll('.sidebar-post-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === postId);
    });

    let post = null;

    if (!isStaticMode) {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.post) {
            post = data.post;
          }
        }
      } catch (e) {
        // Ignorar y pasar a fallback
      }
    }

    // Fallback estático
    if (!post) {
      post = allPosts.find(p => p.id === postId);
      if (post && !post.comments) {
        post.comments = [];
      }
      // Cargar comentarios adicionales guardados localmente
      const storedComments = JSON.parse(localStorage.getItem(`vf_comments_${postId}`) || '[]');
      if (storedComments.length > 0 && post) {
        post.comments = [...(post.comments || []), ...storedComments];
      }
    }

    if (post) {
      currentPost = post;
      renderPost(currentPost);

      // Incrementar vistas
      if (!isStaticMode) {
        fetch(`/api/posts/${postId}/view`, { method: 'POST' }).then(r => r.json()).then(vData => {
          if (vData.success) {
            postViews.innerHTML = `<span class="icon">👁️</span> ${vData.views} vistas`;
          }
        }).catch(() => {});
      } else {
        post.views = (post.views || 0) + 1;
        postViews.innerHTML = `<span class="icon">👁️</span> ${post.views} vistas`;
      }
    }
  } catch (err) {
    console.error('Error cargando detalle del post:', err);
  }
}

// Renderizar Video y Metadatos
function renderPost(post) {
  postCategory.textContent = post.category || 'General';
  postTitle.textContent = post.title;
  postAuthor.textContent = post.author || 'Anónimo';
  postAuthorAvatar.textContent = (post.author ? post.author[0] : 'A').toUpperCase();
  postDate.textContent = timeAgo(new Date(post.createdAt));
  postViews.innerHTML = `<span class="icon">👁️</span> ${post.views || 0} vistas`;
  
  const totalComments = (post.comments || []).reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
  postCommentsBadge.innerHTML = `<span class="icon">💬</span> ${totalComments} comentarios`;
  commentsHeadingCount.textContent = totalComments;

  postDescription.textContent = post.description || 'Sin descripción adicional.';
  videoLikesCount.textContent = post.likes || 0;

  // Actualizar estado de like del botón
  if (userLikedPosts.has(post.id)) {
    likeVideoBtn.classList.add('liked');
  } else {
    likeVideoBtn.classList.remove('liked');
  }

  // Renderizar reproductor según el tipo de video
  renderVideoPlayer(post);

  // Renderizar comentarios
  renderComments(post.comments || []);
}

function renderVideoPlayer(post) {
  videoWrapper.innerHTML = '';

  const isGDrive = post.videoType === 'gdrive' || (post.videoUrl && post.videoUrl.includes('drive.google.com'));

  if (post.videoType === 'youtube' || post.videoType === 'vimeo' || isGDrive) {
    let embedUrl = post.videoUrl;
    if (isGDrive) {
      const match = embedUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
      if (match) {
        embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    iframe.allowFullscreen = true;
    videoWrapper.appendChild(iframe);
  } else {
    // Archivo subido o video directo mp4/webm
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = false;
    video.preload = 'auto';
    video.playsInline = true;
    
    const finalVideoSrc = resolveAssetUrl(post.videoUrl);
    video.src = finalVideoSrc;

    if (post.thumbnail) {
      video.poster = resolveAssetUrl(post.thumbnail);
    }
    
    const source = document.createElement('source');
    source.src = finalVideoSrc;
    source.type = 'video/mp4';
    video.appendChild(source);

    videoWrapper.appendChild(video);
    try {
      video.load();
    } catch (e) {}
  }
}

// ==================== BARRA LATERAL ====================
function renderSidebarPosts(posts) {
  sidebarPostsList.innerHTML = '';
  if (posts.length === 0) {
    sidebarPostsList.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:1rem 0;">No se encontraron videos</p>`;
    return;
  }

  posts.forEach(p => {
    const item = document.createElement('div');
    item.className = `sidebar-post-item ${p.id === currentPostId ? 'active' : ''}`;
    item.dataset.id = p.id;

    const thumbUrl = p.thumbnail ? resolveAssetUrl(p.thumbnail) : '';
    const thumbHtml = thumbUrl 
      ? `<img class="sidebar-post-thumb" src="${escapeHtml(thumbUrl)}" alt="Portada">`
      : `<div class="sidebar-post-thumb-placeholder">🎬</div>`;

    item.innerHTML = `
      <div class="sidebar-post-thumb-wrap">
        ${thumbHtml}
      </div>
      <div class="sidebar-post-info">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge" style="font-size:0.62rem; margin:0; padding:1px 6px;">${escapeHtml(p.category || 'General')}</span>
          <span style="font-size:0.72rem; color:var(--text-muted);">${timeAgo(new Date(p.createdAt))}</span>
        </div>
        <h4 class="sidebar-post-title">${escapeHtml(p.title)}</h4>
        <div class="sidebar-post-meta">
          <span>👤 ${escapeHtml(p.author)}</span>
          <span>💬 ${p.commentsCount || 0} &nbsp; 👁️ ${p.views || 0}</span>
        </div>
      </div>
    `;

    item.addEventListener('click', () => {
      loadPostDetails(p.id);
    });

    sidebarPostsList.appendChild(item);
  });
}

// ==================== COMENTARIOS ====================
function renderComments(comments) {
  commentsList.innerHTML = '';

  const sort = sortCommentsSelect.value;
  let sorted = [...comments];

  if (sort === 'newest') {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'oldest') {
    sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === 'likes') {
    sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  if (sorted.length === 0) {
    commentsList.innerHTML = `
      <div style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted);">
        <p style="font-size:1.5rem; margin-bottom:0.5rem;">💬</p>
        <p>No hay comentarios aún en este video.</p>
        <p style="font-size:0.85rem;">¡Sé el primero en compartir tu opinión!</p>
      </div>
    `;
    return;
  }

  sorted.forEach(c => {
    const isLiked = userLikedComments.has(c.id);
    const commentEl = document.createElement('div');
    commentEl.className = 'comment-item';
    commentEl.id = `comment-${c.id}`;

    const repliesHtml = (c.replies || []).map(r => `
      <div class="reply-item">
        <div style="display:flex; gap:0.6rem; align-items:center; margin-bottom:0.3rem;">
          <div class="comment-avatar" style="width:26px; height:26px; font-size:0.75rem; background-color:${r.avatarColor || '#6366f1'};">
            ${(r.author ? r.author[0] : 'U').toUpperCase()}
          </div>
          <span style="font-weight:700; font-size:0.85rem;">${escapeHtml(r.author)}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">${timeAgo(new Date(r.createdAt))}</span>
        </div>
        <p style="font-size:0.88rem; margin-left:34px;">${escapeHtml(r.content)}</p>
      </div>
    `).join('');

    commentEl.innerHTML = `
      <div class="comment-main">
        <div class="comment-avatar" style="background-color: ${c.avatarColor || '#6366f1'};">
          ${(c.author ? c.author[0] : 'U').toUpperCase()}
        </div>
        <div class="comment-body">
          <div class="comment-author-row">
            <span class="comment-author-name">${escapeHtml(c.author)}</span>
            <span class="comment-timestamp">${timeAgo(new Date(c.createdAt))}</span>
          </div>
          <p class="comment-content">${escapeHtml(c.content)}</p>
          <div class="comment-actions">
            <button class="comment-btn ${isLiked ? 'liked' : ''}" data-action="like-comment" data-id="${c.id}">
              <span>❤️</span>
              <span class="like-num">${c.likes || 0}</span>
            </button>
            <button class="comment-btn" data-action="toggle-reply" data-id="${c.id}">
              <span>💬 Responder</span>
              <span>(${c.replies ? c.replies.length : 0})</span>
            </button>
          </div>

          <!-- Caja de Respuesta Desplegable -->
          <div class="reply-input-box" id="reply-box-${c.id}" style="display:none;">
            <input type="text" placeholder="Tu nombre..." value="${commentAuthorInput.value || ''}" class="reply-author-field">
            <textarea placeholder="Escribe tu respuesta a ${escapeHtml(c.author)}..." class="reply-text-field"></textarea>
            <div class="reply-input-actions">
              <button class="btn btn-secondary" data-action="cancel-reply" data-id="${c.id}" style="padding:4px 10px; font-size:0.8rem;">Cancelar</button>
              <button class="btn btn-primary" data-action="send-reply" data-id="${c.id}" style="padding:4px 12px; font-size:0.8rem;">Enviar</button>
            </div>
          </div>

          <!-- Respuestas Anidadas -->
          <div class="replies-container" id="replies-container-${c.id}">
            ${repliesHtml}
          </div>
        </div>
      </div>
    `;

    commentsList.appendChild(commentEl);
  });

  // Delegación de eventos para botones de comentarios y respuestas
  setupCommentsEventDelegation();
}

function setupCommentsEventDelegation() {
  commentsList.querySelectorAll('[data-action="like-comment"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const commentId = btn.dataset.id;
      handleLikeComment(commentId, btn);
    });
  });

  commentsList.querySelectorAll('[data-action="toggle-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const commentId = btn.dataset.id;
      const box = document.getElementById(`reply-box-${commentId}`);
      if (box) {
        box.style.display = box.style.display === 'none' ? 'flex' : 'none';
        if (box.style.display === 'flex') {
          const textarea = box.querySelector('.reply-text-field');
          if (textarea) textarea.focus();
        }
      }
    });
  });

  commentsList.querySelectorAll('[data-action="cancel-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const commentId = btn.dataset.id;
      const box = document.getElementById(`reply-box-${commentId}`);
      if (box) box.style.display = 'none';
    });
  });

  commentsList.querySelectorAll('[data-action="send-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const commentId = btn.dataset.id;
      handleSendReply(commentId);
    });
  });
}

// ==================== ACCIONES DE COMENTARIOS ====================
async function handleCommentSubmit() {
  if (!currentPostId) return;

  const content = commentTextInput.value.trim();
  const author = commentAuthorInput.value.trim() || 'Usuario';

  if (!content) {
    showToast('Por favor escribe un comentario antes de publicar', 'error');
    return;
  }

  submitCommentBtn.disabled = true;
  submitCommentBtn.innerHTML = '<span>Publicando...</span>';

  try {
    let comment = null;

    if (!isStaticMode) {
      try {
        const res = await fetch(`/api/posts/${currentPostId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, content })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.comment) {
            comment = data.comment;
          }
        }
      } catch (e) {}
    }

    // Fallback estático / GitHub Pages
    if (!comment) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];
      comment = {
        id: 'c-' + Date.now(),
        author: author,
        content: content,
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: []
      };

      // Guardar en localStorage
      const localComments = JSON.parse(localStorage.getItem(`vf_comments_${currentPostId}`) || '[]');
      localComments.push(comment);
      localStorage.setItem(`vf_comments_${currentPostId}`, JSON.stringify(localComments));
    }

    if (comment) {
      if (!currentPost.comments) currentPost.comments = [];
      currentPost.comments.push(comment);

      commentTextInput.value = '';
      showToast('Comentario publicado correctamente', 'success');

      // Actualizar contadores
      const totalComments = currentPost.comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
      postCommentsBadge.innerHTML = `<span class="icon">💬</span> ${totalComments} comentarios`;
      commentsHeadingCount.textContent = totalComments;

      renderComments(currentPost.comments);
      
      // Actualizar en barra lateral
      const found = allPosts.find(p => p.id === currentPostId);
      if (found) {
        found.commentsCount = totalComments;
        renderSidebarPosts(allPosts);
      }
    }
  } catch (err) {
    console.error('Error enviando comentario:', err);
    showToast('Error al publicar el comentario', 'error');
  } finally {
    submitCommentBtn.disabled = false;
    submitCommentBtn.innerHTML = `
      <span>Publicar Comentario</span>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;
  }
}

async function handleSendReply(commentId) {
  const box = document.getElementById(`reply-box-${commentId}`);
  if (!box) return;

  const authorInput = box.querySelector('.reply-author-field');
  const textInput = box.querySelector('.reply-text-field');
  const author = authorInput.value.trim() || 'Usuario';
  const content = textInput.value.trim();

  if (!content) {
    showToast('Escribe una respuesta', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/posts/${currentPostId}/comments/${commentId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content })
    });

    const data = await res.json();
    if (data.success && data.reply) {
      const comment = (currentPost.comments || []).find(c => c.id === commentId);
      if (comment) {
        if (!comment.replies) comment.replies = [];
        comment.replies.push(data.reply);
      }

      showToast('Respuesta enviada', 'success');
      renderComments(currentPost.comments);
    }
  } catch (err) {
    console.error('Error enviando respuesta:', err);
    showToast('Error al enviar la respuesta', 'error');
  }
}

async function handleLikeComment(commentId, btn) {
  if (userLikedComments.has(commentId)) {
    showToast('Ya diste me gusta a este comentario', 'info');
    return;
  }

  try {
    const res = await fetch(`/api/posts/${currentPostId}/comments/${commentId}/like`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      userLikedComments.add(commentId);
      localStorage.setItem('vf_liked_comments', JSON.stringify([...userLikedComments]));

      btn.classList.add('liked');
      const numSpan = btn.querySelector('.like-num');
      if (numSpan) numSpan.textContent = data.likes;
    }
  } catch (err) {
    console.error('Error dando like al comentario:', err);
  }
}

// ==================== LIKES Y COMPARTIR ====================
async function handleLikeVideo() {
  if (!currentPostId) return;

  if (userLikedPosts.has(currentPostId)) {
    showToast('Ya te gusta este video', 'info');
    return;
  }

  try {
    const res = await fetch(`/api/posts/${currentPostId}/like`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      userLikedPosts.add(currentPostId);
      localStorage.setItem('vf_liked_posts', JSON.stringify([...userLikedPosts]));

      likeVideoBtn.classList.add('liked');
      videoLikesCount.textContent = data.likes;
      showToast('¡Te gusta este video!', 'success');
    }
  } catch (err) {
    console.error('Error dando like:', err);
  }
}

function handleShare() {
  if (!currentPostId) return;

  const targetPost = currentPost || allPosts.find(p => p.id === currentPostId);
  const shareUrl = getShareableUrl(targetPost);

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('¡Enlace copiado! Cualquier persona que lo abra verá este video.', 'success');
    }).catch(() => {
      prompt('Copia el enlace de este video para compartirlo:', shareUrl);
    });
  } else {
    prompt('Copia el enlace de este video para compartirlo:', shareUrl);
  }
}

// ==================== RECONOCIMIENTO DE VIDEOS ====================
function parseVideoSource(rawUrl) {
  if (!rawUrl) return { type: 'unknown', url: '', defaultThumbnail: '' };
  const trimmed = rawUrl.trim();

  // YouTube
  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: 'youtube',
      url: `https://www.youtube.com/embed/${id}`,
      defaultThumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }

  // Google Drive
  const gdriveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
  const gdriveMatch = trimmed.match(gdriveRegex);
  if (gdriveMatch) {
    const fileId = gdriveMatch[1];
    return {
      type: 'gdrive',
      url: `https://drive.google.com/file/d/${fileId}/preview`,
      defaultThumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'
    };
  }

  // Dropbox (conversión automática a enlace directo de streaming)
  if (trimmed.includes('dropbox.com')) {
    let directDropboxUrl = trimmed.replace('dl=0', 'raw=1');
    if (!directDropboxUrl.includes('raw=1')) {
      directDropboxUrl += (directDropboxUrl.includes('?') ? '&' : '?') + 'raw=1';
    }
    return {
      type: 'url',
      url: directDropboxUrl,
      defaultThumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80'
    };
  }

  // Enlace directo de video (MP4, etc.)
  return {
    type: 'url',
    url: trimmed,
    defaultThumbnail: ''
  };
}

// ==================== CREAR NUEVO POST ====================
async function handleNewPostSubmit(e) {
  e.preventDefault();

  const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
  const title = document.getElementById('postTitleInput').value.trim();
  const author = document.getElementById('postAuthorInput').value.trim() || 'Anónimo';
  const category = document.getElementById('postCategorySelect').value;
  const description = document.getElementById('postDescInput').value.trim();

  // Obtener miniatura personalizada
  let customThumbnail = '';
  if (thumbnailPreviewWrap && thumbnailPreviewWrap.style.display !== 'none' && thumbnailPreviewImg.src) {
    customThumbnail = thumbnailPreviewImg.src;
  } else if (thumbnailUrlInput && thumbnailUrlInput.value.trim()) {
    customThumbnail = thumbnailUrlInput.value.trim();
  }

  if (!title) {
    showToast('El título es obligatorio', 'error');
    return;
  }

  publishBtn.disabled = true;
  publishBtn.innerHTML = '<span>Publicando...</span>';

  try {
    if (activeTab === 'tab-upload') {
      const file = videoFileInput.files[0];
      if (!file) {
        showToast('Selecciona un archivo de video primero', 'error');
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<span>Publicar en el Foro</span>';
        return;
      }

      // Si estamos en la nube de GitHub Pages, evitar el error 405 (GitHub Pages no procesa POST de 300MB)
      if (isStaticMode) {
        showToast('En GitHub Pages (nube 24/7), sube tu video a Google Drive o YouTube y usa la pestaña "🔗 Enlace"', 'info');
        const urlTabBtn = document.querySelector('.tab-btn[data-tab="tab-url"]');
        if (urlTabBtn) urlTabBtn.click();
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<span>Publicar en el Foro</span>';
        return;
      }

      uploadProgressContainer.style.display = 'flex';
      const formData = new FormData();
      formData.append('videoFile', file);
      formData.append('title', title);
      formData.append('author', author);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('thumbnail', customThumbnail);

      // Subida con XMLHttpRequest para servidor local Node.js
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/posts', true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          uploadProgressBar.style.width = percent + '%';
          uploadProgressText.textContent = `Subiendo video: ${percent}%`;
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201 || xhr.status === 200) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.success && res.post) {
              handlePostCreatedSuccess(res.post);
            }
          } catch (e) {
            showToast('Error procesando respuesta del servidor', 'error');
          }
        } else {
          showToast('Error al subir video. Puedes usar la pestaña Enlace para videos grandes.', 'error');
          publishBtn.disabled = false;
          publishBtn.innerHTML = '<span>Publicar en el Foro</span>';
        }
      };

      xhr.onerror = () => {
        showToast('Fallo de red al subir el video', 'error');
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<span>Publicar en el Foro</span>';
      };

      xhr.send(formData);

    } else {
      // URL de Video (YouTube, Google Drive, Vimeo, MP4 directo)
      const videoUrl = videoUrlInput.value.trim();
      if (!videoUrl) {
        showToast('Debes ingresar un enlace de video válido', 'error');
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<span>Publicar en el Foro</span>';
        return;
      }

      const parsed = parseVideoSource(videoUrl);
      const finalThumb = customThumbnail || parsed.defaultThumbnail || '';

      // Si estamos en GitHub Pages / estático, crear el post y guardar en memoria/localStorage sin error 405
      if (isStaticMode) {
        const newPost = {
          id: 'post-' + Date.now(),
          title: title,
          author: author,
          category: category,
          description: description,
          createdAt: new Date().toISOString(),
          videoType: parsed.type,
          videoUrl: parsed.url,
          thumbnail: finalThumb,
          views: 1,
          likes: 0,
          comments: []
        };

        const customPosts = JSON.parse(localStorage.getItem('vf_custom_posts') || '[]');
        customPosts.unshift(newPost);
        localStorage.setItem('vf_custom_posts', JSON.stringify(customPosts));

        handlePostCreatedSuccess(newPost);
        return;
      }

      // Servidor con backend
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            author,
            category,
            description,
            videoUrl,
            thumbnail: finalThumb
          })
        });

        const data = await res.json();
        if (data.success && data.post) {
          handlePostCreatedSuccess(data.post);
        } else {
          showToast(data.error || 'Error al crear la publicación', 'error');
          publishBtn.disabled = false;
          publishBtn.innerHTML = '<span>Publicar en el Foro</span>';
        }
      } catch (err) {
        // Fallback en caso de que el backend falle
        const newPost = {
          id: 'post-' + Date.now(),
          title: title,
          author: author,
          category: category,
          description: description,
          createdAt: new Date().toISOString(),
          videoType: parsed.type,
          videoUrl: parsed.url,
          thumbnail: finalThumb,
          views: 1,
          likes: 0,
          comments: []
        };
        handlePostCreatedSuccess(newPost);
      }
    }
  } catch (err) {
    console.error('Error al crear post:', err);
    showToast('Ocurrió un error inesperado', 'error');
    publishBtn.disabled = false;
    publishBtn.innerHTML = '<span>Publicar en el Foro</span>';
  }
}

function handlePostCreatedSuccess(newPost) {
  showToast('¡Video con portada publicado con éxito!', 'success');
  closeModal();
  newPostForm.reset();
  selectedFileInfo.style.display = 'none';

  publishBtn.disabled = false;
  publishBtn.innerHTML = '<span>Publicar en el Foro</span>';

  // Añadir a la lista y cargar como activo
  allPosts.unshift({
    id: newPost.id,
    title: newPost.title,
    author: newPost.author,
    category: newPost.category,
    createdAt: newPost.createdAt,
    videoType: newPost.videoType,
    videoUrl: newPost.videoUrl,
    thumbnail: newPost.thumbnail || '',
    views: newPost.views || 0,
    likes: newPost.likes || 0,
    commentsCount: (newPost.comments || []).length
  });

  renderSidebarPosts(allPosts);
  loadPostDetails(newPost.id);
}

// ==================== UTILIDADES ====================
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Hace unos momentos';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  return date.toLocaleDateString();
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
