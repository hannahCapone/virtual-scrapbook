import React, { useCallback, useEffect, useRef, useState } from 'react';
import scraps from './scraps';
import './Board.css';

const TAPE_COLORS = ['#d9ee50', '#cdc3f1', '#f1e4a2', '#f6b7a6'];
const random = (min, max) => min + Math.random() * (max - min);

// Scatter the scraps over a jittered grid: each lands somewhere in its own cell,
// so they overlap a little like a real collage but never pile up completely.
function layout(boardWidth) {
  const small = boardWidth < 640;
  const cell = small ? 170 : 250;
  const cols = Math.max(2, Math.floor(boardWidth / cell));
  const cellW = boardWidth / cols;
  const cellH = cellW * (small ? 1.25 : 1.05);
  const order = scraps.map((_, i) => i).sort(() => Math.random() - 0.5);

  const placed = order.map((index, slot) => {
    const scrap = scraps[index];
    const longest = cellW * random(0.82, 1.05);
    const scale = longest / Math.max(scrap.w, scrap.h);
    const w = scrap.w * scale;
    const h = scrap.h * scale;
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const x = col * cellW + (cellW - w) / 2 + random(-0.14, 0.14) * cellW;
    const y = row * cellH + (cellH - h) / 2 + random(-0.12, 0.12) * cellH;
    return {
      index,
      x: Math.min(Math.max(x, 4), boardWidth - w - 4),
      y: Math.max(y, 8),
      w,
      h,
      rotate: random(-8, 8),
      tape: TAPE_COLORS[Math.floor(Math.random() * TAPE_COLORS.length)],
      tapeRotate: random(-10, 10),
      z: slot + 1,
    };
  });

  const height = Math.max(...placed.map((p) => p.y + p.h)) + 40;
  return { placed, height };
}

export default function Board({ shuffleKey }) {
  const boardRef = useRef(null);
  const drag = useRef(null);
  const topZ = useRef(scraps.length);
  const [state, setState] = useState({ placed: [], height: 0 });
  const [open, setOpen] = useState(null);

  const relayout = useCallback(() => {
    if (boardRef.current) setState(layout(boardRef.current.clientWidth));
  }, []);

  useEffect(relayout, [relayout, shuffleKey]);

  useEffect(() => {
    let width = boardRef.current?.clientWidth;
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Only re-scatter when the width really changes (not on mobile URL-bar show/hide).
        if (boardRef.current && Math.abs(boardRef.current.clientWidth - width) > 40) {
          width = boardRef.current.clientWidth;
          relayout();
        }
      }, 200);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [relayout]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const update = (slot, changes) =>
    setState((s) => ({ ...s, placed: s.placed.map((p, i) => (i === slot ? { ...p, ...changes } : p)) }));

  const onPointerDown = (e, slot) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = state.placed[slot];
    topZ.current += 1;
    update(slot, { z: topZ.current, lifted: true });
    drag.current = { slot, startX: e.clientX, startY: e.clientY, x: p.x, y: p.y, moved: false };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    if (d.moved) update(d.slot, { x: d.x + dx, y: d.y + dy });
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (!d) return;
    update(d.slot, { lifted: false });
    if (!d.moved) setOpen(state.placed[d.slot].index);
    drag.current = null;
  };

  const src = (file) => `${process.env.PUBLIC_URL}/scraps/${file}.webp`;

  return (
    <>
      <div className="board" ref={boardRef} style={{ height: state.height }}>
        {state.placed.map((p, slot) => {
          const scrap = scraps[p.index];
          return (
            <button
              key={scrap.file}
              type="button"
              className={`scrap${scrap.round ? ' round' : ''}${p.lifted ? ' lifted' : ''}`}
              style={{
                left: p.x,
                top: p.y,
                width: p.w,
                height: p.h,
                zIndex: p.z,
                '--rotate': `${p.rotate}deg`,
                '--tape': p.tape,
                '--tape-rotate': `${p.tapeRotate}deg`,
              }}
              onPointerDown={(e) => onPointerDown(e, slot)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(p.index)}
              aria-label={`Open ${scrap.alt}`}
            >
              <img src={src(scrap.file)} alt={scrap.alt} draggable="false" loading="lazy" />
            </button>
          );
        })}
      </div>

      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={scraps[open].alt} onClick={() => setOpen(null)}>
          <img src={src(scraps[open].file)} alt={scraps[open].alt} />
          <p>{scraps[open].alt}</p>
          <button type="button" className="close" onClick={() => setOpen(null)}>close &times;</button>
        </div>
      )}
    </>
  );
}
