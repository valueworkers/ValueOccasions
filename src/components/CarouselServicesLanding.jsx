import React, { useEffect, useRef, useState } from 'react'

// Auto-advancing horizontal carousel with hover emphasis
const CarouselVenueLanding = () => {
  const items = [
    {
      title: 'Decoration',
      image:
        'https://images.unsplash.com/photo-1641996250159-9d2bbfb483fa?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Catering',
      image:
        'https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Photography',
      image:
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: "Music & DJ",
      image:
        'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Venue Styling',
      image:
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Live Bands',
      image:
        'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=1600&auto=format&fit=crop',
    },
  ]

  const containerRef = useRef(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [cardStep, setCardStep] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const firstCard = el.querySelector('[data-carousel-card]')
    if (!firstCard) return
    const rect = firstCard.getBoundingClientRect()
    setCardStep(rect.width + 16)
  }, [])

  useEffect(() => {
    if (!containerRef.current || !cardStep) return
    if (isPaused || hoveredIndex !== null) return
    const interval = setInterval(() => {
      const el = containerRef.current
      if (!el) return
      const maxScrollLeft = el.scrollWidth - el.clientWidth
      const nextLeft = el.scrollLeft + cardStep
      if (nextLeft >= maxScrollLeft - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: cardStep, behavior: 'smooth' })
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [cardStep, isPaused, hoveredIndex])

  const duplicated = [...items, ...items]

  return (
    <div
      className="relative px-4 sm:px-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
  ref={containerRef}
  className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 snap-x snap-mandatory"
>
  {duplicated.map((item, index) => {
    const isHovered = hoveredIndex === index
    const dimOthers = hoveredIndex !== null && !isHovered
    return (
      <div
        key={`${item.title}-${index}`}
        data-carousel-card
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        className={
          `relative w-48 sm:w-64 md:w-30 h-12 sm:h-20 md:h-26
           rounded-lg sm:rounded-xl overflow-hidden shrink-0 snap-center
           ring-1 ring-black/5 shadow transition-all duration-200 ` +
          (isHovered
            ? 'scale-[1.02] z-10 shadow-xl'
            : dimOthers
            ? 'blur-[2px] opacity-60'
            : '')
        }
      >
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
          draggable="false"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
          <span className="text-white font-semibold text-sm sm:text-base tracking-wide drop-shadow">
            {item.title}
          </span>
        </div>
      </div>
    )
  })}
</div>

    </div>
  )
}

export default CarouselVenueLanding


