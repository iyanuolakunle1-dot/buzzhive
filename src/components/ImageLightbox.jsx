import { X } from 'lucide-react';

export default function ImageLightbox({ src, alt = '', onClose }) {
  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center px-4 bg-black/80" onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 text-white/80 hover:text-white">
        <X size={26} />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[85vh] rounded-xl object-contain"
      />
    </div>
  );
}
