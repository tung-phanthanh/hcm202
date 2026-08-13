import React from 'react';

export default function Gallery({ mediaUrl = [] }) {
  if (!mediaUrl || mediaUrl.length === 0) return null;

  // Render a single image
  if (mediaUrl.length === 1) {
    return <img src={mediaUrl[0]} alt="Event highlight" />;
  }

  // Render a grid for multiple images
  return (
    <div className="gallery-grid">
      {mediaUrl.map((url, i) => (
        <div key={i} className="gallery-item">
          <img src={url} alt={`Gallery item ${i + 1}`} loading="lazy" />
        </div>
      ))}
    </div>
  );
}
