// ──────────────────────────────────────────────────────────────────────────
// HOTSPOTS - Interactive regions over the studio artwork.
// Coordinates are normalized fractions (0..1) of the image:
// x,y = top-left corner, w,h = width and height.
//
// Calibration mode: Open http://localhost:5173/?edit to drag and resize boxes.
// On mouse release, the full updated array is automatically copied to your clipboard!
// ──────────────────────────────────────────────────────────────────────────

export const HOTSPOTS = [
  {
    section: 'about',
    id: 1,
    label: 'Portrait Frame · Subham Santra (About Me)',
    x: 0.405,
    y: 0.095,
    w: 0.075,
    h: 0.180,
    about: true,
  },
  {
    section: 'projects',
    id: 2,
    label: 'Project Folders Shelf · Featured Projects & Case Studies',
    x: 0.505,
    y: 0.155,
    w: 0.155,
    h: 0.140,
    projects: true,
  },
  {
    section: 'contact',
    id: 3,
    label: 'Sticky Notes · Interactive Message Wall 📌',
    x: 0.655,
    y: 0.355,
    w: 0.110,
    h: 0.120,
    wall: true,
  },
  {
    section: 'terminal',
    id: 4,
    label: 'CRT Monitor · SubhamOS Dev Terminal 💻',
    x: 0.475,
    y: 0.375,
    w: 0.158,
    h: 0.205,
    terminal: true,
  },
  {
    section: 'lamp',
    id: 5,
    label: 'Desk Lamp · Day / Night Switch',
    x: 0.355,
    y: 0.305,
    w: 0.115,
    h: 0.265,
    toggle: 'night',
  },
  {
    section: 'contact',
    id: 6,
    label: 'Retro Telephone · Direct Line & Contact Subham ☎️',
    x: 0.405,
    y: 0.490,
    w: 0.080,
    h: 0.100,
    phone: true,
  },
  {
    section: 'hobbies',
    id: 7,
    label: 'Vintage Radio · Play / Pause Music 📻',
    x: 0.840,
    y: 0.060,
    w: 0.110,
    h: 0.120,
    toggle: 'music',
  },
  {
    section: 'education',
    id: 8,
    label: 'Vintage Bookshelf · Experience, Education & Certifications 💼 🎓',
    x: 0.160,
    y: 0.090,
    w: 0.180,
    h: 0.650,
    education: true,
  },
  {
    section: 'beach',
    id: 11,
    label: 'Look Outside · Window to the Sea 🌊',
    x: 0.000,
    y: 0.000,
    w: 0.150,
    h: 0.620,
    beach: true,
  },
];
