import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Square, Trash2, Eraser, Undo2 } from 'lucide-react';

interface ScratchpadProps {
  onUseBadge?: () => void;
}

export default function Scratchpad({ onUseBadge }: ScratchpadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563eb'); // Blue default
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Adjust canvas size to parent container dynamically
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Save current content
      const tempImage = canvas.toDataURL();

      canvas.width = rect.width;
      canvas.height = Math.max(rect.height - 80, 250); // reserve top space

      // Restore content
      const img = new Image();
      img.src = tempImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };

      // Set default style
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state for undo
    setHistory(prev => [...prev, canvas.toDataURL()]);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? 16 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
    if (onUseBadge) onUseBadge();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  return (
    <div ref={containerRef} className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[350px]" id="scratchpad-card">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap gap-2 items-center justify-between" id="scratchpad-header">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="font-medium text-slate-700 text-sm">Riyazi Qaralama və Yazı Lövhəsi</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Colors */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 mr-2">
            {[
              { hex: '#2563eb', label: 'Mavi' },
              { hex: '#10b981', label: 'Yaşıl' },
              { hex: '#ef4444', label: 'Qırmızı' },
              { hex: '#1e293b', label: 'Qara' },
              { hex: '#eab308', label: 'Sarı' }
            ].map(col => (
              <button
                key={col.hex}
                onClick={() => {
                  setColor(col.hex);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 rounded-full border transition-all ${
                  color === col.hex && !isEraser ? 'scale-110 ring-2 ring-indigo-300' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.label}
                id={`col-btn-${col.hex}`}
              />
            ))}
          </div>

          {/* Tools */}
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 gap-1">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-1.5 rounded-md transition-colors ${
                !isEraser ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Qələm"
              id="tool-pencil"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`p-1.5 rounded-md transition-colors ${
                isEraser ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Pozan"
              id="tool-eraser"
            >
              <Eraser size={16} />
            </button>
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40"
              title="Geri al"
              id="tool-undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-1.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Təmizlə"
              id="tool-clear"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-grow bg-slate-50 overflow-hidden" id="scratchpad-canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full h-full cursor-crosshair touch-none bg-white"
          id="scratchpad-canvas"
        />
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 pointer-events-none select-none font-mono">
          bura qaralama dəftərindir • toxun və yaz
        </div>
      </div>
    </div>
  );
}
