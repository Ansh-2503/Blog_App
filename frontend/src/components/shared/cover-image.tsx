'use client';

import Image from 'next/image';
import { useState } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

export function CoverImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
}: CoverImageProps) {
  const [didError, setDidError] = useState(false);

  if (didError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className ?? ''}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ERROR_IMG_SRC} alt="Image unavailable" className="opacity-40" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes ?? '100vw'}
        priority={priority}
        unoptimized={process.env.NODE_ENV === 'development' || src.includes('googleusercontent.com')}
        onError={() => setDidError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={process.env.NODE_ENV === 'development' || src.includes('googleusercontent.com')}
      onError={() => setDidError(true)}
      referrerPolicy="no-referrer"
    />
  );
}
