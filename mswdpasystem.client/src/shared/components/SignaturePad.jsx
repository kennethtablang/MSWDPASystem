import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { Eraser } from 'lucide-react';

/**
 * Canvas-based signature capture pad.
 * Exposes via ref: toDataURL() -> PNG data URL, isEmpty() -> bool, clear().
 */
const SignaturePad = forwardRef(function SignaturePad({ height = 180 }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [dirty, setDirty] = useState(false);

  // Size the canvas backing store to its CSS box (accounting for device pixel ratio).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
  }, [height]);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    last.current = pos(e);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!dirty) setDirty(true);
  };

  const end = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDirty(false);
  };

  useImperativeHandle(ref, () => ({
    isEmpty: () => !dirty,
    clear,
    toDataURL: () => (dirty ? canvasRef.current.toDataURL('image/png') : null),
  }), [dirty]);

  return (
    <div>
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height, touchAction: 'none', cursor: 'crosshair', display: 'block' }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-400">Sign inside the box using a mouse, stylus, or finger.</p>
        <button type="button" onClick={clear}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors">
          <Eraser size={14} /> Clear
        </button>
      </div>
    </div>
  );
});

export default SignaturePad;
