'use client';

import React from 'react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div 
        className="p-4 relative"
        onClick={e => e.stopPropagation()}
      >
        <Image 
          src={imageUrl} 
          alt="Decreto" 
          width={800} 
          height={1100} 
          className="object-contain max-h-[90vh] max-w-[90vw]"
        />
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-white bg-black border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default ImageModal;