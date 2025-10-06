'use client';

import React from 'react';

const CreatorModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', color: 'black' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Creador</h2>
        <p>Contenido del modal del creador.</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default CreatorModal;
