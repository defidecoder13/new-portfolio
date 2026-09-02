// ──────────────────────────────────────────────────────────────────────────
// 1:1 AUTHENTIC LUCAS-STYLE STICKY NOTES NOTICE BOARD (WITH MONGODB LIVE SYNC)
// ──────────────────────────────────────────────────────────────────────────

import { playKeyClick, playHoverTick } from './audio.js';

const STORAGE_KEY = 'portfolio_lucas_sticky_wall_v3';
const API_URL = '/api/notes';

// Exact notes and layout matching reference design
const DEFAULT_NOTES = [
  // ── ROW 1 ──
  {
    id: '1',
    author: 'ALEX',
    date: 'AUG 21',
    color: 'yellow',
    pinColor: 'yellow',
    text: 'whats up\n\n:)',
    x: 4.5,
    y: 8.0,
  },
  {
    id: '2',
    author: 'SUBHAM',
    date: 'AUG 21',
    color: 'blue',
    pinColor: 'blue',
    text: 'LULA 13 ☆\nBRASIL',
    x: 20.2,
    y: 8.0,
  },
  {
    id: '3',
    author: 'LUCAS',
    date: 'AUG 21',
    color: 'yellow',
    pinColor: 'yellow',
    text: "Yeah, I'm stealing this idea.",
    x: 36.0,
    y: 8.0,
  },
  {
    id: '4',
    author: 'DM',
    date: 'AUG 21',
    color: 'blue',
    pinColor: 'blue',
    text: '28RTG IS COMING',
    x: 51.8,
    y: 8.0,
  },
  {
    id: '5',
    author: 'VEX',
    date: 'AUG 21',
    color: 'pink',
    pinColor: 'pink',
    text: 'Hosh me aao abhijeet!!',
    x: 67.5,
    y: 8.0,
  },
  {
    id: '6',
    author: 'BAGAS',
    date: 'AUG 21',
    color: 'yellow',
    pinColor: 'yellow',
    text: "Hi Subham, I can't even describe how awesome this art is!",
    x: 83.2,
    y: 8.0,
  },

  // ── ROW 2 ──
  {
    id: '7',
    author: 'ALEX',
    date: 'AUG 21',
    color: 'yellow',
    pinColor: 'yellow',
    text: 'Whoa the lighting transition is insane',
    x: 4.5,
    y: 39.5,
  },
  {
    id: '8',
    author: 'NIKOLAI',
    date: 'AUG 21',
    color: 'peach',
    pinColor: 'peach',
    text: "it's good brother",
    x: 20.2,
    y: 39.5,
  },
  {
    id: '9',
    author: 'ESHAAN',
    date: 'AUG 21',
    color: 'blue',
    pinColor: 'blue',
    text: 'this is just crazy',
    x: 36.0,
    y: 39.5,
  },
  {
    id: '10',
    author: 'RAHUL',
    date: 'AUG 21',
    color: 'pink',
    pinColor: 'pink',
    text: 'hiiii',
    x: 51.8,
    y: 39.5,
  },
  {
    id: '11',
    author: 'DESIGNER',
    date: 'AUG 21',
    color: 'green',
    pinColor: 'green',
    text: 'Amazingly creative portfolio. Great scenarios for Design Futures',
    x: 67.5,
    y: 39.5,
  },
  {
    id: '12',
    author: 'DM',
    date: 'AUG 21',
    color: 'blue',
    pinColor: 'blue',
    text: 'Bro u nailed it!!\nFucking awesome',
    x: 83.2,
    y: 39.5,
  },

  // ── ROW 3 ──
  {
    id: '13',
    author: 'AMBRISH',
    date: 'AUG 21',
    color: 'pink',
    pinColor: 'pink',
    text: 'Good one mate',
    x: 3.2,
    y: 69.5,
  },
  {
    id: '14',
    author: 'GUDDHA',
    date: 'AUG 21',
    color: 'peach',
    pinColor: 'peach',
    text: 'Guddhaball ⚽',
    x: 17.0,
    y: 69.5,
  },
  {
    id: '15',
    author: 'MJ',
    date: 'AUG 21',
    color: 'yellow',
    pinColor: 'yellow',
    text: 'this is awesome',
    x: 30.8,
    y: 69.5,
  },
  {
    id: '16',
    author: 'SEHU',
    date: 'AUG 21',
    color: 'green',
    pinColor: 'green',
    text: 'keren gileeeee',
    x: 44.5,
    y: 69.5,
  },
  {
    id: '17',
    author: 'SUBHAM',
    date: 'AUG 21',
    color: 'yellow',
    pinColor: 'yellow',
    text: 'Direct Line ☕\nsubhamsaantra001@gmail.com\n@defidecoder13',
    x: 58.2,
    y: 69.5,
  },
  {
    id: '18',
    author: 'KEK',
    date: 'AUG 21',
    color: 'pink',
    pinColor: 'pink',
    text: 'party.photos\ncreative ideas for web!',
    x: 72.0,
    y: 69.5,
  },
  {
    id: '19',
    author: 'PRABOWO',
    date: 'AUG 21',
    color: 'blue',
    pinColor: 'blue',
    text: 'amazing',
    x: 85.8,
    y: 69.5,
  },
];

export function createStickyWall(container) {
  let root = document.getElementById('lucas-sticky-wall');
  if (root) root.remove();

  root = document.createElement('div');
  root.id = 'lucas-sticky-wall';
  root.className = 'lucas-wall-overlay';
  root.innerHTML = `
    <!-- Top-Right Close Button -->
    <button class="lucas-close-btn" id="lucas-wall-close" type="button" aria-label="Close sticky notes wall">
      <span>✕</span>
    </button>

    <div class="lucas-stage-wrapper">
      
      <!-- Live MongoDB Sync Status Pill -->
      <div class="lucas-live-badge" id="lucas-live-badge">
        <span class="live-dot pulse"></span>
        <span class="live-label" id="lucas-live-label">LIVE COMMUNITY BOARD</span>
      </div>

      <!-- Left Color Palette Picker Dock Capsule -->
      <div class="lucas-color-dock" id="lucas-color-dock" title="Click a color to pin a new sticky note!">
        <button class="dock-swatch yellow" data-color="yellow" type="button" aria-label="Add Yellow Note"></button>
        <button class="dock-swatch peach" data-color="peach" type="button" aria-label="Add Peach Note"></button>
        <button class="dock-swatch pink" data-color="pink" type="button" aria-label="Add Pink Note"></button>
        <button class="dock-swatch green" data-color="green" type="button" aria-label="Add Green Note"></button>
        <button class="dock-swatch blue" data-color="blue" type="button" aria-label="Add Blue Note"></button>
      </div>

      <!-- Main Whiteboard / Notice Board Canvas with Corner Mounting Screws -->
      <div class="lucas-notice-board" id="lucas-notice-board">
        <span class="board-screw top-left"></span>
        <span class="board-screw top-right"></span>
        <span class="board-screw bottom-left"></span>
        <span class="board-screw bottom-right"></span>

        <!-- Pinned Notes Container -->
        <div class="lucas-board-canvas" id="lucas-board-canvas"></div>
      </div>

    </div>

    <!-- Floating Composer Modal for Pinning New Notes -->
    <div class="lucas-composer-modal" id="lucas-composer-modal">
      <div class="composer-card" id="composer-card">
        <div class="composer-thumbtack" id="composer-thumbtack"></div>
        <textarea id="composer-text" placeholder="Write your note here…" maxlength="140" rows="4"></textarea>
        <div class="composer-footer">
          <input type="text" id="composer-author" placeholder="YOUR NAME" maxlength="16" />
          <button type="button" id="composer-stick-btn" class="composer-stick-btn">Pin Note 📌</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const canvas = root.querySelector('#lucas-board-canvas');
  const boardEl = root.querySelector('#lucas-notice-board');
  const closeBtn = root.querySelector('#lucas-wall-close');
  const colorDock = root.querySelector('#lucas-color-dock');
  const composerModal = root.querySelector('#lucas-composer-modal');
  const composerCard = root.querySelector('#composer-card');
  const composerText = root.querySelector('#composer-text');
  const composerAuthor = root.querySelector('#composer-author');
  const composerStickBtn = root.querySelector('#composer-stick-btn');
  const composerThumbtack = root.querySelector('#composer-thumbtack');
  const liveLabel = root.querySelector('#lucas-live-label');

  let activeColor = 'yellow';
  let zIndexCounter = 30;
  let pollTimer = null;

  // Local Cache + Initial State
  let notes = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      notes = JSON.parse(raw);
    }
  } catch (_) {}

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (_) {}
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MONGODB LIVE BACKEND SYNC
  // ──────────────────────────────────────────────────────────────────────────
  async function fetchLiveNotes() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      
      if (data.notes && Array.isArray(data.notes)) {
        notes = data.notes;
        saveLocal();
        renderAll();
        if (liveLabel) {
          liveLabel.textContent = data.live 
            ? `MONGODB LIVE GUESTBOOK (${notes.length} NOTES)` 
            : 'LOCAL GUESTBOOK (SYNCED)';
        }
      }
    } catch (err) {
      console.warn('[StickyWall] Using local offline cache:', err.message);
      if (liveLabel) liveLabel.textContent = 'LOCAL GUESTBOOK (OFFLINE)';
    }
  }

  async function syncNoteToMongo(noteObj) {
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteObj),
      });
    } catch (err) {
      console.warn('[StickyWall] Update sync error:', err.message);
    }
  }

  async function postNewNoteToMongo(noteObj) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteObj),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.note && data.note._id) {
          noteObj._id = data.note._id;
        }
      }
    } catch (err) {
      console.warn('[StickyWall] Post sync error:', err.message);
    }
  }

  // Render a sticky note with authentic 3D pushpin
  function renderNote(n) {
    const el = document.createElement('div');
    el.className = `lucas-note note-${n.color}`;
    el.id = `note-${n.id || n._id}`;
    el.style.left = `${n.x}%`;
    el.style.top = `${n.y}%`;
    el.style.zIndex = n.z || 10;

    const pinCol = n.pinColor || n.color || 'yellow';

    // Organic subtle hand-drawn rotation
    const seed = parseInt((n.id || '1').toString().replace(/\D/g, '') || '1', 10);
    const rot = n.rot !== undefined ? n.rot : (((seed * 17) % 7) - 3) * 0.4;
    el.style.transform = `rotate(${rot}deg)`;

    el.innerHTML = `
      <div class="note-thumbtack pin-${pinCol}">
        <span class="pin-glint"></span>
      </div>
      <div class="lucas-note-body">${escapeHTML(n.text).replace(/\n/g, '<br>')}</div>
      <div class="lucas-note-foot">
        <span class="note-author">${escapeHTML(n.author || 'VISITOR')}</span>
        <span class="note-date">${escapeHTML(n.date || 'AUG 21')}</span>
      </div>
    `;

    // Make note draggable across the board
    setupDraggable(el, n);
    canvas.appendChild(el);
  }

  function renderAll() {
    canvas.innerHTML = '';
    if (notes.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-board-placeholder';
      empty.innerHTML = `
        <div class="empty-board-pin">📌</div>
        <div class="empty-board-text">Notice board is clear!</div>
        <div class="empty-board-hint">Click any colored note swatch on the left palette to pin a new message.</div>
      `;
      canvas.appendChild(empty);
      return;
    }
    notes.forEach(renderNote);
  }

  // Drag and Drop interaction with smooth physics
  function setupDraggable(el, noteObj) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    el.addEventListener('pointerdown', (e) => {
      if (e.target.tagName === 'A') return;
      e.stopPropagation();
      isDragging = true;
      el.setPointerCapture(e.pointerId);

      zIndexCounter += 1;
      el.style.zIndex = zIndexCounter;
      noteObj.z = zIndexCounter;

      el.classList.add('dragging');
      playKeyClick();

      const rect = el.getBoundingClientRect();
      const parentRect = boardEl.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = ((rect.left - parentRect.left) / parentRect.width) * 100;
      initialTop = ((rect.top - parentRect.top) / parentRect.height) * 100;
    });

    el.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const parentRect = boardEl.getBoundingClientRect();
      const dx = ((e.clientX - startX) / parentRect.width) * 100;
      const dy = ((e.clientY - startY) / parentRect.height) * 100;

      let newX = Math.max(1, Math.min(88, initialLeft + dx));
      let newY = Math.max(2, Math.min(80, initialTop + dy));

      el.style.left = `${newX}%`;
      el.style.top = `${newY}%`;
    });

    const finishDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      el.classList.remove('dragging');

      const parentRect = boardEl.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      noteObj.x = ((rect.left - parentRect.left) / parentRect.width) * 100;
      noteObj.y = ((rect.top - parentRect.top) / parentRect.height) * 100;
      saveLocal();
      syncNoteToMongo(noteObj);
    };

    el.addEventListener('pointerup', finishDrag);
    el.addEventListener('pointercancel', finishDrag);
    el.addEventListener('pointerenter', () => playHoverTick());
  }

  // Left Swatch Palette clicks -> Open composer with chosen color
  colorDock.querySelectorAll('.dock-swatch').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeColor = btn.dataset.color || 'yellow';
      playKeyClick();
      openComposer(activeColor);
    });
    btn.addEventListener('pointerenter', () => playHoverTick());
  });

  function openComposer(color) {
    composerCard.className = `composer-card note-${color}`;
    composerThumbtack.className = `composer-thumbtack pin-${color}`;
    composerText.value = '';
    composerAuthor.value = '';
    composerModal.classList.add('show');
    setTimeout(() => composerText.focus(), 80);
  }

  function closeComposer() {
    composerModal.classList.remove('show');
    if (document.activeElement) document.activeElement.blur();
  }

  composerModal.addEventListener('click', (e) => {
    if (e.target === composerModal) closeComposer();
  });

  composerStickBtn.addEventListener('click', () => {
    const text = composerText.value.trim();
    if (!text) return;
    const author = (composerAuthor.value.trim() || 'ANONYMOUS').toUpperCase();

    playKeyClick();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}`;

    zIndexCounter += 1;
    const newNote = {
      id: Date.now().toString(),
      author,
      date: dateStr,
      color: activeColor,
      pinColor: activeColor,
      text,
      x: 35 + (Math.random() * 15 - 7.5),
      y: 35 + (Math.random() * 15 - 7.5),
      z: zIndexCounter,
    };

    notes.push(newNote);
    saveLocal();
    renderNote(newNote);
    postNewNoteToMongo(newNote);
    closeComposer();
  });

  let onExitCallback = null;
  closeBtn.addEventListener('click', () => {
    playKeyClick();
    if (onExitCallback) onExitCallback();
  });

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  return {
    open(isNight, onExit) {
      onExitCallback = onExit;
      root.classList.add('show');
      renderAll();
      fetchLiveNotes();

      // Poll every 8s while open for real-time live sync
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(fetchLiveNotes, 8000);
    },
    close() {
      root.classList.remove('show');
      closeComposer();
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    },
    isOpen() {
      return root.classList.contains('show');
    },
  };
}
