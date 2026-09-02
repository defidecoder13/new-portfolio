// ──────────────────────────────────────────────────────────────────────────
// DYNAMIC INTERACTIVE "CONTACT US" BOARD USING USER'S PIXEL ART IMAGE
// ──────────────────────────────────────────────────────────────────────────

import { playKeyClick, playHoverTick, playPhoneBeep, playCatMeow } from './audio.js';

export function createPhoneConsole(container) {
  let root = document.getElementById('pixel-contact-board-modal');
  if (root) root.remove();

  root = document.createElement('div');
  root.id = 'pixel-contact-board-modal';
  root.className = 'contact-board-overlay';
  root.innerHTML = `
    <!-- Top-Right Close Button -->
    <button class="board-close-btn" id="board-close-btn" type="button" aria-label="Close Contact Board">
      <span>✕</span>
    </button>

    <!-- Main Container: Desktop Illustrated Board (>768px) -->
    <div class="board-wrapper">
      <img src="/assets/contact-board.webp" alt="Contact Us Board" class="board-base-img" draggable="false" />

      <!-- Interactive Overlay Layer with Pixel-Aligned Coordinate Mapping -->
      <div class="board-interactive-layer">
        
        <!-- 1. Interactive Cat Badge (Plays Meow) -->
        <button class="hitbox-cat" id="hitbox-cat" type="button" aria-label="Pet Mochi">
        </button>

        <!-- 2. Left Column Interactive Social & Contact Links -->
        <a href="mailto:subhamsaantra001@gmail.com" class="hitbox-link hitbox-email" id="link-email" aria-label="Email Subham"></a>
        <a href="https://github.com/defidecoder13" target="_blank" rel="noopener" class="hitbox-link hitbox-github" id="link-github" aria-label="Subham's GitHub"></a>
        <a href="https://www.linkedin.com/in/subham-santra001/" target="_blank" rel="noopener" class="hitbox-link hitbox-linkedin" id="link-linkedin" aria-label="Subham's LinkedIn"></a>
        <a href="https://x.com/subham_sl" target="_blank" rel="noopener" class="hitbox-link hitbox-twitter" id="link-twitter" aria-label="Subham's X / Twitter"></a>
        <div class="hitbox-link hitbox-location" id="item-location" aria-label="Location: Kolkata, India"></div>
        <div class="hitbox-plant" id="hitbox-plant" aria-label="Potted Plant"></div>

        <!-- 3. Right Column Dynamic Form Inputs -->
        <form class="board-form" id="board-contact-form">
          <input type="text" id="board-name" class="board-input input-name" placeholder="Your Name" autocomplete="off" spellcheck="false" required />
          <input type="email" id="board-email" class="board-input input-email" placeholder="Your Email" autocomplete="off" spellcheck="false" required />
          <input type="text" id="board-subject" class="board-input input-subject" placeholder="Subject" autocomplete="off" spellcheck="false" required />
          <textarea id="board-message" class="board-textarea textarea-message" placeholder="Your Message" rows="4" autocomplete="off" spellcheck="false" required></textarea>
          <button type="submit" class="board-submit-btn" id="board-submit-btn" aria-label="Send Message">
            <span class="submit-glow"></span>
          </button>
        </form>

        <div class="board-success-toast" id="board-success-toast">
          <span class="toast-plane">✈️</span>
          <span class="toast-msg">Telegram Transmitted to subhamsaantra001@gmail.com!</span>
        </div>

      </div>
    </div>

    <!-- Mobile Native Contact Sheet (<=768px) -->
    <div class="board-mobile-card">
      <div class="mob-contact-header">
        <span class="mob-cat-avatar">🐱</span>
        <div>
          <h2 class="mob-contact-title">Get In Touch</h2>
          <p class="mob-contact-sub">Direct Line · subhamsaantra001@gmail.com</p>
        </div>
      </div>

      <div class="mob-social-links-grid">
        <a href="mailto:subhamsaantra001@gmail.com" class="mob-social-btn">✉️ Email</a>
        <a href="https://github.com/defidecoder13" target="_blank" rel="noopener" class="mob-social-btn">🐙 GitHub</a>
        <a href="https://www.linkedin.com/in/subham-santra001/" target="_blank" rel="noopener" class="mob-social-btn">💼 LinkedIn</a>
        <a href="https://x.com/subham_sl" target="_blank" rel="noopener" class="mob-social-btn">🐦 Twitter</a>
      </div>

      <form class="mob-contact-form" id="mob-contact-form">
        <div class="mob-field-group">
          <label for="mob-name" class="mob-field-label">YOUR NAME</label>
          <input type="text" id="mob-name" class="mob-form-input" placeholder="e.g. Satoshi Nakamoto" required />
        </div>
        <div class="mob-field-group">
          <label for="mob-email" class="mob-field-label">YOUR EMAIL</label>
          <input type="email" id="mob-email" class="mob-form-input" placeholder="e.g. visitor@example.com" required />
        </div>
        <div class="mob-field-group">
          <label for="mob-subject" class="mob-field-label">SUBJECT</label>
          <input type="text" id="mob-subject" class="mob-form-input" placeholder="e.g. Project Collaboration / Opportunity" required />
        </div>
        <div class="mob-field-group">
          <label for="mob-message" class="mob-field-label">MESSAGE</label>
          <textarea id="mob-message" class="mob-form-textarea" placeholder="Write your message here…" rows="4" required></textarea>
        </div>
        <button type="submit" class="mob-submit-btn" id="mob-submit-btn">
          <span>Send Message 🚀</span>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const closeBtn = root.querySelector('#board-close-btn');
  const catBtn = root.querySelector('#hitbox-cat');
  const plantBox = root.querySelector('#hitbox-plant');
  const toast = root.querySelector('#board-success-toast');

  // Unified submit handler supporting both desktop and mobile forms
  const handleContactSubmit = async (name, email, subject, message, submitBtnEl) => {
    if (!name || !email || !message) return;

    playPhoneBeep(852, 1477);
    playKeyClick();

    if (submitBtnEl) {
      submitBtnEl.disabled = true;
      submitBtnEl.classList.add('clicked');
      if (submitBtnEl.querySelector('span')) submitBtnEl.querySelector('span').textContent = 'Transmitting… ⏳';
    }

    const toastMsg = toast.querySelector('.toast-msg');
    if (toastMsg) toastMsg.textContent = 'Transmitting telegram via Resend API…';
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playPhoneBeep(941, 1477);
        if (toastMsg) toastMsg.textContent = `✅ Delivered directly to Subham's inbox!`;
        if (submitBtnEl && submitBtnEl.querySelector('span')) submitBtnEl.querySelector('span').textContent = 'Message Delivered! ✅';
        // Reset all inputs
        root.querySelectorAll('#board-name, #board-email, #board-subject, #board-message, #mob-name, #mob-email, #mob-subject, #mob-message').forEach((inp) => { inp.value = ''; });
      } else {
        throw new Error(data.error || 'Transmission failed');
      }
    } catch (err) {
      console.warn('[Contact Board] API error, fallback to mailto:', err.message);
      if (toastMsg) toastMsg.textContent = `Dispatching via email client…`;
      const fullBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const mailtoUrl = `mailto:subhamsaantra001@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(fullBody)}`;
      setTimeout(() => { window.location.href = mailtoUrl; }, 500);
    } finally {
      if (submitBtnEl) {
        submitBtnEl.disabled = false;
        setTimeout(() => {
          submitBtnEl.classList.remove('clicked');
          if (submitBtnEl.querySelector('span')) submitBtnEl.querySelector('span').textContent = 'Send Message 🚀';
        }, 4000);
      }
      setTimeout(() => { toast.classList.remove('show'); }, 5000);
    }
  };

  // Desktop Form Listener
  const deskForm = root.querySelector('#board-contact-form');
  if (deskForm) {
    deskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = root.querySelector('#board-name').value.trim();
      const em = root.querySelector('#board-email').value.trim();
      const s = root.querySelector('#board-subject').value.trim();
      const m = root.querySelector('#board-message').value.trim();
      handleContactSubmit(n, em, s, m, root.querySelector('#board-submit-btn'));
    });
  }

  // Mobile Form Listener
  const mobForm = root.querySelector('#mob-contact-form');
  if (mobForm) {
    mobForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = root.querySelector('#mob-name').value.trim();
      const em = root.querySelector('#mob-email').value.trim();
      const s = root.querySelector('#mob-subject').value.trim();
      const m = root.querySelector('#mob-message').value.trim();
      handleContactSubmit(n, em, s, m, root.querySelector('#mob-submit-btn'));
    });
  }

  let onExitCallback = null;
  closeBtn.addEventListener('click', () => {
    playKeyClick();
    if (onExitCallback) onExitCallback();
  });

  return {
    open(isNight, onExit) {
      onExitCallback = onExit;
      root.classList.add('show');
      toast.classList.remove('show');
    },
    close() {
      root.classList.remove('show');
      if (document.activeElement) document.activeElement.blur();
    },
    isOpen() {
      return root.classList.contains('show');
    },
  };
}
