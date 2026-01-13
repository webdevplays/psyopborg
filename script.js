// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });
  
  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// Quote carousel
const quotes = document.querySelectorAll('.quote');
let currentQuote = 0;

function rotateQuotes() {
  quotes.forEach(q => q.classList.remove('active'));
  currentQuote = (currentQuote + 1) % quotes.length;
  quotes[currentQuote].classList.add('active');
}

setInterval(rotateQuotes, 4000);

// Copy contract address
function copyContract() {
  const contract = document.getElementById('contract').textContent;
  navigator.clipboard.writeText(contract).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = 'Copy CA';
    }, 2000);
  });
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add scared animation on scroll
const scaredBadge = document.querySelector('.scared-badge');
const fearStates = [
  'PSYOPBORG',
  'PSYOPBORG',
  'PSYOPBORG',
  'PSYOPBORG',
  'PSYOPBORG',
  'PSYOPBORG',
  'PSYOPBORG',
  'PSYOPBORG',
  'PSYOPBORG',
  'PSYOPBORG'
];
let fearIndex = 0;

setInterval(() => {
  fearIndex = (fearIndex + 1) % fearStates.length;
  if (scaredBadge) {
    scaredBadge.textContent = fearStates[fearIndex];
  }
}, 3000);

// Parallax effect on hero image
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroImg = document.getElementById('hero-media-img');
  const heroVideo = document.getElementById('hero-media-video');
  if (scrolled < window.innerHeight) {
    const transform = `translateY(${scrolled * 0.1}px)`;
    if (heroImg) heroImg.style.transform = transform;
    if (heroVideo) heroVideo.style.transform = transform;
  }
});

console.log('🐴🔥 REKT Horse website loaded. Still scared. Still here.');

// Activity Feed
const activityList = document.getElementById('activity-list');
const MAX_ACTIVITIES = 50;
let activities = [];

// API Gateway URL for activity feed (set by CDK deployment)
const ACTIVITY_API_URL = 'https://n829ui8mhk.execute-api.us-east-1.amazonaws.com/prod/api/activity';

const ACTIVITY_ICONS = {
  'message': '💬',
  'image': '🎨',
  'video': '🎬',
  'tweet': '𝕏',
  'memory': '🧠',
  'thinking': '🤔',
  'error': '😱',
  'startup': 'PSYOPBORG'
};

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function renderActivities() {
  if (!activityList) return;
  
  if (activities.length === 0) {
    activityList.innerHTML = `
      <div class="activity-placeholder">
        <span class="pulse-dot"></span>
        Waiting for bot activity...
      </div>`;
    return;
  }
  
  activityList.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <span class="activity-icon">${ACTIVITY_ICONS[activity.type] || '🐴'}</span>
      <div class="activity-content">
        <div class="activity-text">${escapeHtml(activity.text)}</div>
        <div class="activity-time">${formatTimeAgo(new Date(activity.timestamp))}</div>
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function addActivity(type, text) {
  const activity = {
    id: Date.now(),
    type,
    text,
    timestamp: new Date().toISOString()
  };
  
  activities.unshift(activity);
  if (activities.length > MAX_ACTIVITIES) {
    activities = activities.slice(0, MAX_ACTIVITIES);
  }
  
  renderActivities();
}

async function loadActivities() {
  try {
    const response = await fetch(ACTIVITY_API_URL);
    if (!response.ok) return;
    
    const data = await response.json();
    if (data.activities && Array.isArray(data.activities)) {
      activities = data.activities.slice(0, MAX_ACTIVITIES);
      renderActivities();
    }
  } catch (error) {
    console.log('Activity feed not available yet');
    // Show demo activities for now
    if (activities.length === 0) {
      addActivity('startup', 'REKT Horse bot is online and terrified');
    }
  }
}

// Poll for new activities every 10 seconds
function startActivityPolling() {
  loadActivities();
  setInterval(loadActivities, 10000);
}

// Start activity feed
if (activityList) {
  startActivityPolling();
}

// Hero Media Rotation - cycles: REKT -> VIDEO -> REKT -> IMAGE -> repeat
let heroRotationIndex = 0;
let heroGalleryImages = [];
let heroGalleryVideos = [];
let preloadedVideos = new Map(); // Cache preloaded video blobs
let preloadedImages = new Map(); // Cache preloaded images
const heroImg = document.getElementById('hero-media-img');
const heroVideo = document.getElementById('hero-media-video');
const heroCaption = document.getElementById('hero-caption');
const REKT_SRC = '/assets/REKT.JPG';
const REKT_CAPTION = '*nervous horse noises*';

// Preload a video and cache the blob URL
async function preloadVideo(item) {
  if (preloadedVideos.has(item.id)) return preloadedVideos.get(item.id);
  
  // Use thumbnail if available, otherwise preload full video
  const thumbUrl = item.thumbnail || item.url;
  
  try {
    const response = await fetch(thumbUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    preloadedVideos.set(item.id, { blobUrl, item });
    return { blobUrl, item };
  } catch (e) {
    console.warn('Failed to preload video:', item.id);
    return null;
  }
}

// Preload an image
async function preloadImage(item) {
  if (preloadedImages.has(item.id)) return preloadedImages.get(item.id);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloadedImages.set(item.id, item);
      resolve(item);
    };
    img.onerror = () => resolve(null);
    img.src = item.url;
  });
}

// Get the next item to show based on cycle
function getNextHeroItem() {
  const cycle = heroRotationIndex % 4;
  heroRotationIndex++;
  
  if (cycle === 0 || cycle === 2) {
    return { type: 'rekt' };
  } else if (cycle === 1 && heroGalleryVideos.length > 0) {
    const item = heroGalleryVideos[Math.floor(Math.random() * heroGalleryVideos.length)];
    return { type: 'video', item };
  } else if (cycle === 3 && heroGalleryImages.length > 0) {
    const item = heroGalleryImages[Math.floor(Math.random() * heroGalleryImages.length)];
    return { type: 'image', item };
  }
  return { type: 'rekt' };
}

async function rotateHeroMedia() {
  if (!heroImg || !heroVideo) return;
  
  const next = getNextHeroItem();
  
  // Fade out with smooth transition
  heroImg.classList.add('fading');
  heroVideo.classList.add('fading');
  heroCaption.classList.add('fading');
  
  await new Promise(r => setTimeout(r, 400));
  
  if (next.type === 'rekt') {
    heroImg.src = REKT_SRC;
    heroImg.style.display = 'block';
    heroVideo.style.display = 'none';
    heroVideo.pause();
    heroCaption.textContent = REKT_CAPTION;
  } else if (next.type === 'video') {
    const cached = preloadedVideos.get(next.item.id);
    // Use thumbnail for display, or fallback to video URL
    const displayUrl = next.item.thumbnail || (cached ? cached.blobUrl : next.item.url);
    
    heroVideo.src = displayUrl;
    heroImg.style.display = 'none';
    heroVideo.style.display = 'block';
    heroVideo.currentTime = 0;
    heroVideo.play().catch(() => {}); // Ignore autoplay errors
    heroCaption.textContent = next.item.caption || (next.item.prompt?.substring(0, 50) + '...') || '🎬 Memory in motion';
  } else if (next.type === 'image') {
    heroImg.src = next.item.url;
    heroImg.style.display = 'block';
    heroVideo.style.display = 'none';
    heroVideo.pause();
    heroCaption.textContent = next.item.caption || (next.item.prompt?.substring(0, 50) + '...') || '🖼️ A terrified memory';
  }
  
  // Fade in
  await new Promise(r => setTimeout(r, 50));
  heroImg.classList.remove('fading');
  heroVideo.classList.remove('fading');
  heroCaption.classList.remove('fading');
  
  // Preload next items in background
  preloadNextItems();
}

// Preload upcoming items for smooth transitions
async function preloadNextItems() {
  // Preload a few random videos and images
  const videosToPreload = heroGalleryVideos.slice(0, 3);
  const imagesToPreload = heroGalleryImages.slice(0, 3);
  
  for (const v of videosToPreload) {
    preloadVideo(v);
  }
  for (const i of imagesToPreload) {
    preloadImage(i);
  }
}

// Start hero rotation after gallery loads
async function initHeroRotation() {
  try {
    const response = await fetch('/gallery/manifest.json');
    if (!response.ok) return;
    
    const data = await response.json();
    heroGalleryImages = data.images.filter(item => item.mediaType !== 'video');
    heroGalleryVideos = data.images.filter(item => item.mediaType === 'video');
    
    // Start preloading immediately
    preloadNextItems();
    
    // Rotate every 6 seconds (slightly longer for video playback)
    setInterval(rotateHeroMedia, 6000);
  } catch (error) {
    console.error('Error loading hero rotation:', error);
  }
}

initHeroRotation();

// Gallery Logic
const galleryGrid = document.getElementById('gallery-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
let galleryItems = [];

async function loadGallery() {
  try {
    const response = await fetch('/gallery/manifest.json');
    if (!response.ok) throw new Error('Failed to load gallery manifest');
    
    const data = await response.json();
    galleryItems = data.images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    renderGallery(galleryItems);
  } catch (error) {
    console.error('Error loading gallery:', error);
    if (galleryGrid) {
      galleryGrid.innerHTML = '<div class="loading-spinner">🐴 Failed to load memories. I probably deleted them out of fear.</div>';
    }
  }
}

function renderGallery(items) {
  if (!galleryGrid) return;
  
  galleryGrid.innerHTML = '';
  
  if (items.length === 0) {
    galleryGrid.innerHTML = '<div class="loading-spinner">No memories found yet...</div>';
    return;
  }

  // Detect iOS for special handling
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    
    const isVideo = item.mediaType === 'video';
    
    let mediaHtml;
    if (isVideo) {
      // For iOS: use thumbnail as background image with video overlay
      // For desktop: use video with poster attribute
      if (item.thumbnail) {
        // Use thumbnail as CSS background for reliable iOS display
        mediaHtml = `
          <div class="gallery-media video-container" style="background-image: url('${item.thumbnail}'); background-size: cover; background-position: center;">
            <video class="gallery-video-overlay" src="${item.url}" poster="${item.thumbnail}" loop muted playsinline webkit-playsinline preload="none"></video>
            <div class="video-play-icon">▶</div>
          </div>`;
      } else {
        // No thumbnail - load first frame
        mediaHtml = `<video class="gallery-media" src="${item.url}" loop muted playsinline webkit-playsinline preload="metadata"></video>`;
      }
    } else {
      mediaHtml = `<img class="gallery-media" src="${item.url}" alt="${item.prompt}" loading="lazy">`;
    }

    const date = new Date(item.createdAt).toLocaleDateString();
    const platformIcon = item.platform === 'twitter' ? '𝕏' : '✈️';

    el.innerHTML = `
      ${mediaHtml}
      <div class="media-badge">${isVideo ? '🎥 Video' : '🖼️ Image'}</div>
      <div class="gallery-overlay">
        <p class="gallery-caption">${item.caption || item.prompt}</p>
        <div class="gallery-meta">
          <span>${platformIcon} ${item.platform}</span>
          <span>${date}</span>
        </div>
      </div>
    `;
    
    // Video play/pause on hover (desktop) or tap (mobile)
    if (isVideo) {
      const video = el.querySelector('video');
      const playIcon = el.querySelector('.video-play-icon');
      
      if (video) {
        // Desktop: hover to play
        if (!isIOS) {
          el.addEventListener('mouseenter', () => {
            if (playIcon) playIcon.style.display = 'none';
            video.play().catch(() => {});
          });
          el.addEventListener('mouseleave', () => {
            if (playIcon) playIcon.style.display = 'flex';
            video.pause();
            video.currentTime = 0;
          });
        }
        
        // Mobile: tap to toggle play
        let isPlaying = false;
        el.addEventListener('touchstart', (e) => {
          e.preventDefault();
          if (isPlaying) {
            video.pause();
            video.currentTime = 0;
            if (playIcon) playIcon.style.display = 'flex';
            isPlaying = false;
          } else {
            if (playIcon) playIcon.style.display = 'none';
            video.play().catch(() => {});
            isPlaying = true;
          }
        }, { passive: false });
      }
    }
    
    // Click to view full size (long press or double tap on mobile)
    let clickTimer = null;
    el.addEventListener('click', (e) => {
      // Prevent immediate open on mobile, wait for double tap
      if (isIOS) return;
      window.open(item.url, '_blank');
    });
    
    el.addEventListener('dblclick', () => {
      window.open(item.url, '_blank');
    });

    galleryGrid.appendChild(el);
  });
}

// Filter logic
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    
    if (filter === 'all') {
      renderGallery(galleryItems);
    } else {
      const filtered = galleryItems.filter(item => {
        if (filter === 'video') return item.mediaType === 'video';
        if (filter === 'image') return !item.mediaType || item.mediaType === 'image';
        return true;
      });
      renderGallery(filtered);
    }
  });
});

// Initialize gallery
if (document.getElementById('gallery')) {
  loadGallery();
}
