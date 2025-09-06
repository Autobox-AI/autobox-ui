'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { memo, useCallback, useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  loading?: 'lazy' | 'eager'
  className?: string
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
}

const OptimizedImage = memo(
  ({
    src,
    alt,
    width = 500,
    height = 300,
    priority = false,
    loading = 'lazy',
    className,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px',
    quality = 75,
    placeholder = 'empty',
    blurDataURL,
    onLoad,
    onError,
    fallbackSrc,
  }: OptimizedImageProps) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [currentSrc, setCurrentSrc] = useState(src)

    const handleLoad = useCallback(() => {
      setIsLoading(false)
      onLoad?.()
    }, [onLoad])

    const handleError = useCallback(() => {
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc)
        setHasError(false)
      } else {
        setHasError(true)
        setIsLoading(false)
      }
      onError?.()
    }, [fallbackSrc, currentSrc, onError])

    const getBlurDataURL = useCallback(() => {
      if (blurDataURL) return blurDataURL

      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return undefined
      }
      const canvas = document.createElement('canvas')
      canvas.width = 40
      canvas.height = 40
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(0, 0, 40, 40)
        return canvas.toDataURL()
      }
      return undefined
    }, [blurDataURL])

    if (hasError) {
      return (
        <div
          className={cn('flex items-center justify-center bg-gray-800 text-gray-400', className)}
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )
    }

    return (
      <div className={cn('relative', className)}>
        {isLoading && (
          <div
            className="absolute inset-0 bg-gray-800 animate-pulse rounded"
            style={{ width, height }}
          />
        )}

        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          loading={loading}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={getBlurDataURL()}
          onLoad={handleLoad}
          onError={handleError}
          className={cn('transition-opacity duration-300', isLoading ? 'opacity-0' : 'opacity-100')}
          style={{
            objectFit: 'contain',
            width: '100%',
            height: 'auto',
            maxWidth: `${width}px`,
          }}
        />
      </div>
    )
  }
)

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage
