import { ScrollArea } from '@/components/ui/scroll-area'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  containerHeight?: number
  overscan?: number
  className?: string
}

function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 3,
  className = '',
}: VirtualizedListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  const [dynamicHeight, setDynamicHeight] = useState(containerHeight || 600)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)

  // Update dynamic height when containerHeight prop changes or when parent resizes
  useEffect(() => {
    if (containerHeight) {
      setDynamicHeight(containerHeight)
    } else {
      // If no containerHeight provided, try to get it from parent
      const updateHeight = () => {
        if (scrollAreaRef.current?.parentElement) {
          const parentHeight = scrollAreaRef.current.parentElement.clientHeight
          if (parentHeight > 0) {
            setDynamicHeight(parentHeight)
          }
        }
      }

      updateHeight()
      const resizeObserver = new ResizeObserver(updateHeight)
      if (scrollAreaRef.current?.parentElement) {
        resizeObserver.observe(scrollAreaRef.current.parentElement)
      }

      return () => resizeObserver.disconnect()
    }
  }, [containerHeight])

  const handleScroll = useCallback(
    (event: any) => {
      const scrollTop = event.target.scrollTop

      // Only update if scroll position changed significantly
      if (Math.abs(scrollTop - lastScrollTop.current) < itemHeight / 2) {
        return
      }

      lastScrollTop.current = scrollTop

      const start = Math.floor(scrollTop / itemHeight)
      const visibleCount = Math.ceil(dynamicHeight / itemHeight)
      const end = Math.min(start + visibleCount + overscan, items.length)

      setVisibleRange({ start, end })
    },
    [items.length, itemHeight, dynamicHeight, overscan]
  )

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange.start, visibleRange.end])

  const totalHeight = items.length * itemHeight
  const offsetTop = visibleRange.start * itemHeight
  const offsetBottom = (items.length - visibleRange.end) * itemHeight

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className={className}
      style={{ height: dynamicHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: offsetTop,
            left: 0,
            right: 0,
            paddingBottom: offsetBottom,
          }}
        >
          {visibleItems.map((item, index) => renderItem(item, visibleRange.start + index))}
        </div>
      </div>
    </ScrollArea>
  )
}

export default memo(VirtualizedList) as <T>(props: VirtualizedListProps<T>) => React.ReactElement
