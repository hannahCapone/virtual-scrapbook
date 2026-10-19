import React, { useState, useEffect, useRef } from 'react';
import './RandomImages.css'; // Ensure this path is correct

// Aspect ratios are width / height of each scrap image.
// Captions show under a scrap when you click it (Hannah writes these).
const images = [
  { src: 'scraps/scrap1.webp', alt: 'Ski lift ticket from Sölden', aspectRatio: 518 / 823, caption: '' },
  { src: 'scraps/scrap2.webp', alt: 'Book Depot sign', aspectRatio: 820 / 538, caption: '' },
  { src: 'scraps/scrap3.webp', alt: 'Illustrated postcard from Berlin', aspectRatio: 900 / 631, caption: '' },
  { src: 'scraps/scrap4.webp', alt: 'Doodle of looping lines', aspectRatio: 637 / 900, caption: '' },
  { src: 'scraps/scrap5.webp', round: true, alt: "Brouwerij 't IJ beer coaster, Amsterdam", aspectRatio: 864 / 885, caption: '' },
  { src: 'scraps/scrap6.webp', round: true, alt: 'Grolsch beer coaster', aspectRatio: 890 / 882, caption: '' },
  { src: 'scraps/scrap7.webp', round: true, alt: 'The Bulldog Amsterdam coaster', aspectRatio: 857 / 859, caption: '' },
  { src: 'scraps/scrap8.webp', round: true, alt: 'Pilsner Urquell beer coaster', aspectRatio: 882 / 878, caption: '' },
  { src: 'scraps/scrap9.webp', alt: 'Stone Brewing beer flight card', aspectRatio: 539 / 803, caption: '' },
  { src: 'scraps/scrap10.webp', alt: 'Photo booth strip', aspectRatio: 289 / 900, caption: '' },
  { src: 'scraps/scrap11.webp', alt: 'Winthrop, Massachusetts postcard', aspectRatio: 900 / 617, caption: '' },
  { src: 'scraps/scrap12.webp', alt: 'Canterbury postcard', aspectRatio: 900 / 650, caption: '' },
  { src: 'scraps/scrap13.webp', alt: 'City of Canterbury postcard', aspectRatio: 900 / 634, caption: '' },
  { src: 'scraps/scrap14.webp', alt: 'Dover postcard', aspectRatio: 900 / 633, caption: '' },
  { src: 'scraps/scrap15.webp', alt: 'The Good, the Bad and the Ugly card', aspectRatio: 630 / 900, caption: '' },
  { src: 'scraps/scrap16.webp', alt: 'Illustrated postcard of two women on a bench', aspectRatio: 640 / 900, caption: '' },
  { src: 'scraps/scrap17.webp', alt: 'Illustrated postcard of a reader among stacks of books', aspectRatio: 644 / 900, caption: '' },
  { src: 'scraps/scrap18.webp', alt: 'Volendam cheese shop postcard', aspectRatio: 900 / 618, caption: '' },
  { src: 'scraps/scrap19.webp', alt: 'Volendam, Holland postcard', aspectRatio: 587 / 900, caption: '' },
  { src: 'scraps/scrap20.webp', alt: 'Postcard of a Dutch street with bicycles', aspectRatio: 646 / 900, caption: '' },
  { src: 'scraps/scrap21.webp', alt: 'Postcard of a spring flower garden', aspectRatio: 615 / 900, caption: '' },
  { src: 'scraps/scrap22.webp', alt: 'Photo of a storefront window', aspectRatio: 900 / 589, caption: '' },
  { src: 'scraps/scrap23.webp', alt: 'Vintage postcard of a sea cave', aspectRatio: 540 / 868, caption: '' },
  { src: 'scraps/scrap24.webp', alt: 'Laguna Beach postcard', aspectRatio: 900 / 586, caption: '' },
  { src: 'scraps/scrap25.webp', alt: 'La Jolla, CA surfing postcard', aspectRatio: 566 / 900, caption: '' }
];

// How many random spots to try before letting a scrap overlap others
const MAX_ATTEMPTS = 300;

// The board is a bit taller than the screen so bigger scraps still have room
const BOARD_HEIGHT = 1.35;

// About half the scraps get tape; round coasters never do
const TAPE_CHANCE = 0.5;
const HOLDERS = ['tape', 'tape', 'corners'];
const TAPE_COLORS = ['#d9ee50', '#cdc3f1', '#f1e4a2', '#f6b7a6', '#bfe3d6'];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const doRectanglesOverlap = (r1, r2) => {
  return !(r2.left >= r1.right || 
           r2.right <= r1.left || 
           r2.top >= r1.bottom || 
           r2.bottom <= r1.top);
};

// Every scrap gets about the same area, so coasters, tickets, and postcards look similar in size
const getScrapSize = (aspectRatio, viewportWidth, viewportHeight) => {
  const area = (viewportWidth * viewportHeight * BOARD_HEIGHT) / images.length * 0.62 * (0.9 + Math.random() * 0.2);
  let width = Math.sqrt(area * aspectRatio);
  let height = width / aspectRatio;
  if (height > viewportHeight * 0.55) {
    height = viewportHeight * 0.55;
    width = height * aspectRatio;
  }
  return { width, height };
};

const getRandomRect = (aspectRatio, placedRects) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const { width, height } = getScrapSize(aspectRatio, viewportWidth, viewportHeight);
  let rect;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const x = Math.floor(Math.random() * Math.max(1, viewportWidth - width - 20)); // Ensure the image fits within viewport width
    const y = Math.floor(Math.random() * Math.max(1, viewportHeight * BOARD_HEIGHT - height - 20)); // Ensure the image fits within the board
    rect = { left: x, top: y, width, height };

    let isOverlapping = false;
    for (const placed of placedRects) {
      if (doRectanglesOverlap(
        { left: placed.left, top: placed.top, right: placed.left + placed.width, bottom: placed.top + placed.height },
        { left: x, top: y, right: x + width, bottom: y + height }
      )) {
        isOverlapping = true;
        break;
      }
    }
    if (!isOverlapping) {
      break;
    }
  }

  rect.rotate = Math.random() * 8 - 4;
  rect.holder = !images[placedRects.length].round && Math.random() < TAPE_CHANCE ? pick(HOLDERS) : 'none';
  rect.color = pick(TAPE_COLORS);
  rect.holderRotate = Math.random() * 16 - 8;
  placedRects.push(rect);
  return rect;
};

const RandomImages = () => {
  const [rects, setRects] = useState([]);
  const [order, setOrder] = useState(images.map((_, index) => index));
  const [openIndex, setOpenIndex] = useState(null);
  const containerRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    const placedRects = [];
    setRects(images.map(image => getRandomRect(image.aspectRatio, placedRects)));
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (e) => e.key === 'Escape' && setOpenIndex(null);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openIndex]);

  const bringToFront = (index) => setOrder(o => [...o.filter(i => i !== index), index]);

  const onPointerDown = (e, index) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    bringToFront(index);
    drag.current = { index, startX: e.clientX, startY: e.clientY, left: rects[index].left, top: rects[index].top, moved: false };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    if (!d.moved) return;
    const box = containerRef.current.getBoundingClientRect();
    setRects(r => r.map((rect, i) => i !== d.index ? rect : {
      ...rect,
      left: Math.min(Math.max(d.left + dx, 0), box.width - rect.width),
      top: Math.min(Math.max(d.top + dy, 0), box.height - rect.height),
    }));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) setOpenIndex(d.index);
  };

  const src = (image) => `${process.env.PUBLIC_URL}/${image.src}`;

  return (
    <div className="image-container" ref={containerRef}>
      {images.map((image, index) => rects[index] && (
        <div
          key={index}
          style={{
            top: `${rects[index].top}px`,
            left: `${rects[index].left}px`,
            width: `${rects[index].width}px`,
            height: `${rects[index].height}px`,
            zIndex: order.indexOf(index) + 1,
            '--rotate': `${rects[index].rotate}deg`,
            '--holder-color': rects[index].color,
            '--holder-rotate': `${rects[index].holderRotate}deg`,
          }}
          className={`random-image${drag.current && drag.current.index === index ? ' dragging' : ''}`}
          onPointerDown={(e) => onPointerDown(e, index)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img src={src(image)} alt={image.alt} draggable="false" />
          <span className={`holder ${rects[index].holder}`} aria-hidden="true" />
        </div>
      ))}

      {openIndex !== null && (
        <div className="scrap-detail" role="dialog" aria-modal="true" aria-label={images[openIndex].alt} onClick={() => setOpenIndex(null)}>
          <img src={src(images[openIndex])} alt={images[openIndex].alt} />
          {images[openIndex].caption && <p>{images[openIndex].caption}</p>}
          <button type="button" onClick={() => setOpenIndex(null)}>Close &times;</button>
        </div>
      )}
    </div>
  );
};

export default RandomImages;
