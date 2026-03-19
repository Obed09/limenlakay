'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export default function ProtectedProductImage({
  src,
  alt,
  width = 800,
  height = 800,
  className = '',
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  useEffect(() => {
    // Silently block right-click on images
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className="image-container relative">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`product-image select-none ${className}`}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* Visible watermark — survives screenshots */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none select-none z-20">
        &copy; Limen Lakay
      </div>
    </div>
  );
}
