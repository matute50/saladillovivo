import React from 'react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, imageAlt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white p-2 rounded-lg shadow-lg max-w-3xl max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 z-10"
        >
          &times;
        </button>
        <Image
          src={imageUrl}
          alt={imageAlt}
          layout="intrinsic"
          width={800} // Adjust as needed
          height={600} // Adjust as needed
          objectFit="contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;
