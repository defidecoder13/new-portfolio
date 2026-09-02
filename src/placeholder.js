// Placeholder canvas generator for instant startup / offline fallbacks
export function makePlaceholders() {
  const w = 16, h = 9;
  
  // Neutral warm gray color fallback
  const cCanvas = document.createElement('canvas');
  cCanvas.width = w; cCanvas.height = h;
  const cCtx = cCanvas.getContext('2d');
  cCtx.fillStyle = '#2d2724';
  cCtx.fillRect(0, 0, w, h);

  // Flat mid-gray depth fallback (0.5 displacement = zero 3D pop until loaded)
  const dCanvas = document.createElement('canvas');
  dCanvas.width = w; dCanvas.height = h;
  const dCtx = dCanvas.getContext('2d');
  dCtx.fillStyle = '#808080';
  dCtx.fillRect(0, 0, w, h);

  return {
    color: cCanvas,
    depth: dCanvas,
    aspect: 16 / 9,
  };
}
