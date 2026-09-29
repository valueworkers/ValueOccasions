import React, { useEffect, useRef, useState } from 'react'

// Auto-advancing horizontal carousel with hover emphasis
const CarouselVenueLanding = () => {
  const items = [
    {
      title: 'Banquet Hall',
      image:
        'https://plus.unsplash.com/premium_photo-1678310301887-dad749ca881d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Resort',
      image:
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Wedding Hall',
      image:
        'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: "Hotel",
      image:
        'https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Community Hall',
      image:
        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Conference Hall',
      image:
        'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Farmhouse',
      image:
        'https://images.unsplash.com/photo-1603726008204-77f56e5a2610?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    },
    {
      title: 'Restaurant',
      image:
        'https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    }
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


