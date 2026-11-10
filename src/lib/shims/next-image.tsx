import React from 'react'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  unoptimized?: boolean
}

export default function Image({
  fill,
  priority,
  sizes,
  quality,
  unoptimized,
  className,
  style,
  alt = '',
  src,
  ...props
}: ImageProps) {
  const combinedStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        inset: 0,
        objectFit: 'cover',
        ...style,
      }
    : { ...style }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={combinedStyle}
      {...props}
    />
  )
}
