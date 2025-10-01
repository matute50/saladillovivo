'use client';

import React from 'react';
import Image from 'next/image';

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ padding: '1rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <Image src={imageUrl} alt="Decreto" width={800} height={1100} style={{ objectFit: 'contain', maxHeight: '90vh', maxWidth: '90vw' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', background: 'black', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>X</button>
      </div>
    </div>
  );
};

export default ImageModal;
