import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiMapPin, FiClock, FiStar, FiHeart, FiShare2, FiPhone, FiMail, FiCamera, FiCoffee, FiMusic, FiBriefcase, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { GiPalette } from 'react-icons/gi'
import { serviceProviders } from '../data/serviceProviders'

const IndividualServices = () => {
  const { serviceType, serviceId } = useParams()
  const location = useLocation()
  const [storedService] = useState(() => {
    try {
      const cached = sessionStorage.getItem('selectedServiceProvider')
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to read cached service:', error)
      return null
    }
  })
  const [staticServices, setStaticServices] = useState([])
  const [apiService, setApiService] = useState(null)
  const [isLoadingService, setIsLoadingService] = useState(false)
  const [serviceError, setServiceError] = useState('')

  const hasLocationState = location.state && Object.keys(location.state).length > 0

  useEffect(() => {
    if (hasLocationState) {
      try {
        sessionStorage.setItem('selectedServiceProvider', JSON.stringify(location.state))
      } catch (error) {
        console.error('Failed to cache selected service:', error)
      }
    }
  }, [hasLocationState, location.state])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('staticServiceProviders')
      if (raw) {
        setStaticServices(JSON.parse(raw))
      } else {
        setStaticServices(serviceProviders)
      }
    } catch (error) {
      console.error('Failed to load static service providers:', error)
      setStaticServices(serviceProviders)
    }
  }, [])

  // Check if serviceId exists in static services
  const isStaticService = useMemo(() => {
    if (!serviceId || !staticServices || staticServices.length === 0) return false
    return staticServices.some((sp) => String(sp.id) === String(serviceId))
  }, [serviceId, staticServices])

  // Fetch service from API only if it's not a static service
  useEffect(() => {
    if (!serviceId) return
    if (isStaticService) return // Skip API call for static services

    const fetchService = async () => {
      setIsLoadingService(true)
      setServiceError('')

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASEURL}/booking/public-services/${serviceId}/`
        )

        const serviceData = response.data

        // Normalize API service data
        const normalizedService = {
          ...serviceData,
          // Handle photos array - preserve all photos
          photos: serviceData.photos && Array.isArray(serviceData.photos) && serviceData.photos.length > 0
            ? serviceData.photos.map(p => p.image || p)
            : (serviceData.photo ? [serviceData.photo] : []),
          // Handle single photo for backward compatibility
          photo: (serviceData.photos && Array.isArray(serviceData.photos) && serviceData.photos.length > 0)
            ? (serviceData.photos.find(p => p.is_primary)?.image || serviceData.photos[0]?.image)
            : (serviceData.photo || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop'),
          // Handle place/address/city
          place: serviceData.place || `${serviceData.address || ''}, ${serviceData.city || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'N/A',
          // Handle tags/services
          services: Array.isArray(serviceData.tags) && serviceData.tags.length > 0
            ? serviceData.tags
            : (Array.isArray(serviceData.services) ? serviceData.services : []),
          // Handle rating (default to 4.0 if not present)
          rating: serviceData.rating || 4.0,
          // Keep videos if present
          videos: serviceData.videos || []
        }

        setApiService(normalizedService)
      } catch (error) {
        console.error('Error fetching service details:', error)
        setServiceError(error.response?.data?.message || 
                       error.response?.data?.detail || 
                       error.message || 
                       'Failed to fetch service details.')
        setApiService(null)
      } finally {
        setIsLoadingService(false)
      }
    }

    fetchService()
  }, [serviceId, isStaticService])

  const fallbackService = useMemo(() => {
    if (!staticServices || staticServices.length === 0) return null
    if (!serviceId) return null
    return staticServices.find((sp) => String(sp.id) === String(serviceId)) || null
  }, [staticServices, serviceId])

  const service = useMemo(() => {
    // Priority for static services: location state > stored service > fallback service (no API)
    // Priority for API services: API service > location state > stored service
    
    // If it's a static service, use static data only (no API)
    if (isStaticService && fallbackService) {
      const base = (hasLocationState && location.state) || storedService || {}
      return {
        ...fallbackService,
        ...base,
        videos:
          Array.isArray(base?.videos) && base.videos.length > 0
            ? base.videos
            : fallbackService.videos || [],
        services:
          Array.isArray(base?.services) && base.services.length > 0
            ? base.services
            : fallbackService.services || [],
        photo: base?.photo || fallbackService.photo,
        place: base?.place || fallbackService.place,
        contact: base?.contact || fallbackService.contact,
        category: base?.category || fallbackService.category,
      }
    }

    // For API services, prioritize API data
    const base =
      apiService ||
      (hasLocationState && location.state) ||
      storedService ||
      fallbackService ||
      {}

    // If we have API service, use it directly
    if (apiService) {
      return {
        ...apiService,
        // Merge with location state if available (for any overrides)
        ...(hasLocationState && location.state ? location.state : {}),
      }
    }

    // If we have fallback service (for non-static API services that failed to load), merge with other sources
    if (fallbackService) {
      return {
        ...fallbackService,
        ...base,
        videos:
          Array.isArray(base?.videos) && base.videos.length > 0
            ? base.videos
            : fallbackService.videos || [],
        services:
          Array.isArray(base?.services) && base.services.length > 0
            ? base.services
            : fallbackService.services || [],
        photo: base?.photo || fallbackService.photo,
        place: base?.place || fallbackService.place,
        contact: base?.contact || fallbackService.contact,
        category: base?.category || fallbackService.category,
      }
    }
    return base
  }, [isStaticService, apiService, hasLocationState, location.state, storedService, fallbackService])
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('about')
  const [isSaved, setIsSaved] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Service type configuration
  const isMagicCategory = useMemo(() => {
    const typeFromRoute = serviceType?.toLowerCase()
    const typeFromData = service?.category?.toLowerCase()
    return typeFromRoute === 'magic' || typeFromData === 'magic'
  }, [serviceType, service])

  const serviceConfig = useMemo(() => {
    const configs = {
      Photography: {
        icon: FiCamera,
        color: 'sky',
        equipment: ['Professional DSLR/Mirrorless cameras', 'Cinematic video equipment', 'Drone photography setup', 'Studio lighting']
      },
      Caterers: {
        icon: FiCoffee,
        color: 'emerald',
        equipment: ['Professional kitchen equipment', 'Live cooking stations', 'Dessert bar setup', 'Hygienic food preparation']
      },
      Decoration: {
        icon: GiPalette,
        color: 'fuchsia',
        equipment: ['Theme decoration materials', 'LED lighting systems', 'Floral arrangements', 'Custom backdrops']
      },
      Music: {
        icon: FiMusic,
        color: 'orange',
        equipment: ['Professional sound systems', 'DJ equipment', 'MC/Host services', 'Lighting equipment']
      },
      Magic: {
        icon: FiBriefcase,
        color: 'indigo',
        equipment: ['Illusion props', 'Stage lighting effects', 'Audio cues', 'Assistant coordination']
      }
    }
    // Convert serviceType to proper case for lookup
    // Handle "caterers" -> "Caterers" mapping
    let properCaseType = serviceType ? serviceType.charAt(0).toUpperCase() + serviceType.slice(1) : 'Caterers'
    if (properCaseType === 'Catering') {
      properCaseType = 'Caterers' // Normalize Catering to Caterers
    }
    return configs[properCaseType] || configs.Caterers
  }, [serviceType])

  const normalizedVideos = useMemo(() => {
    const collect = []
    const appendUrl = (url) => {
      if (!url || typeof url !== 'string') return
      const trimmed = url.trim()
      if (!trimmed) return
      collect.push(trimmed)
    }

    if (Array.isArray(service?.videos)) {
      service.videos.forEach(appendUrl)
    }
    if (typeof service?.videoUrl === 'string') {
      appendUrl(service.videoUrl)
    }
    if (typeof service?.videoLinks === 'string') {
      service.videoLinks
        .split(/[\n,]/)
        .map((part) => part.trim())
        .forEach(appendUrl)
    }

    if (collect.length === 0 && isMagicCategory) {
      collect.push('https://www.youtube.com/watch?v=ysz5S6PUM-U')
    }
    return collect
  }, [service, isMagicCategory])

  // Check if service is "corel photo"
  const isCorelPhoto = useMemo(() => {
    const serviceName = (service?.name || '').toLowerCase()
    const serviceCategory = (service?.category || '').toLowerCase()
    return serviceName.includes('corel') || serviceCategory.includes('corel')
  }, [service])

  // Service data from ListofServices or fallback
  const serviceData = useMemo(() => {
    // Extract Quick Info from service (can be in quick_info object or direct fields)
    const quick_info = service?.quick_info && typeof service.quick_info === 'object' 
      ? service.quick_info 
      : {}
    
    const startingPriceFrom = quick_info.StartingPriceFrom || 
                              service?.starting_price_from 
    const responseTime = quick_info.response_time || 
                        service?.response_time || 
                        'Within 2 hours'
    const advanceBooking = quick_info.advance_booking || 
                          service?.advance_booking || 
                          '30 days'
    const cancellation = quick_info.cancellation || 
                        service?.cancellation || 
                        'Free up to 7 days'
    
    return {
    id: service.id || serviceId || '1',
    name: service.name || 'Artistry Studios',
    location: service.place || 'Mumbai, Delhi',
    experience: '5+ years experience',
    rating: service.rating || 4.9,
    reviewCount: 127,
    isFeatured: true,
    startingPrice: startingPriceFrom,
    responseTime: responseTime,
    advanceBooking: advanceBooking,
    cancellation: cancellation,
    contact: service.contact || '+91 98765 43210',
    email: isCorelPhoto ? 'info.corelphoto@gmail.com' : (service.email || 'contact@artistrystudios.com'),
    description: service.description || `With 5+ years of experience in ${serviceType?.toLowerCase() || 'photography'}, we specialize in creating beautiful memories that last a lifetime. Our team is passionate about capturing the perfect moments and delivering exceptional quality that exceeds expectations.`,
    services: service.services || ['Wedding Photography', 'Cinematic Video', 'Drone Shots'],
    videos: normalizedVideos,
    portfolio: (() => {
      // Use photos array from API response if available
      if (service.photos && Array.isArray(service.photos) && service.photos.length > 0) {
        return service.photos.map(p => typeof p === 'string' ? p : (p.image || p))
      }
      // Fallback to single photo if available
      if (service.photo) {
        return [service.photo]
      }
      // Return empty array if no photos
      return []
    })(),
    packages: [
      { name: 'Basic Package', price: '₹25,000', features: ['4 hours coverage', '50 edited photos', 'Online gallery'] },
      { name: 'Premium Package', price: '₹45,000', features: ['8 hours coverage', '100 edited photos', 'Online gallery', 'Print album'] },
      { name: 'Luxury Package', price: '₹75,000', features: ['Full day coverage', '200 edited photos', 'Premium album', 'Video highlights'] }
    ],
    reviews: [
      { name: 'Priya Sharma', rating: 5, comment: 'Amazing work! They captured every special moment beautifully.' },
      { name: 'Rajesh Kumar', rating: 5, comment: 'Professional team with excellent quality. Highly recommended!' },
      { name: 'Anita Singh', rating: 4, comment: 'Great service and timely delivery. Very satisfied with the results.' }
    ]
    }
  }, [serviceId, service, serviceType, normalizedVideos, isCorelPhoto])

  const IconComponent = serviceConfig.icon
  const colorClasses = {
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      button: 'bg-sky-600 hover:bg-sky-700',
      badge: 'bg-sky-100 text-sky-700'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    fuchsia: {
      bg: 'bg-fuchsia-50',
      text: 'text-fuchsia-600',
      button: 'bg-fuchsia-600 hover:bg-fuchsia-700',
      badge: 'bg-fuchsia-100 text-fuchsia-700'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700',
      badge: 'bg-orange-100 text-orange-700'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      badge: 'bg-indigo-100 text-indigo-700'
    }
  }

  const currentColor = colorClasses[serviceConfig.color]

  const tabs = useMemo(() => {
    if (isCorelPhoto) return ['about', 'reviews']
    if (isMagicCategory) return ['about', 'videos', 'availability', 'packages', 'reviews']
    return ['about', 'availability', 'packages', 'reviews']
  }, [isMagicCategory, isCorelPhoto])

  // Reset activeTab if it's 'availability' or 'packages' for corel photo
  useEffect(() => {
    if (isCorelPhoto && (activeTab === 'availability' || activeTab === 'packages')) {
      setActiveTab('about')
    }
  }, [isCorelPhoto, activeTab])

  // Mock unavailable dates (in a real app, this would come from an API)
  const unavailableDates = useMemo(() => {
    const today = new Date()
    const unavailable = []
    
    // Add some random unavailable dates for demo
    for (let i = 0; i < 10; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1)
      unavailable.push(date.toDateString())
    }
    
    // Add weekends as unavailable for some services
    if (serviceType === 'Photography') {
      const weekends = []
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        if (date.getDay() === 0 || date.getDay() === 6) { // Sunday or Saturday
          weekends.push(date.toDateString())
        }
      }
      unavailable.push(...weekends)
    }
    
    return unavailable
  }, [serviceType])

  // Calendar utility functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const isDateAvailable = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return false
    return !unavailableDates.includes(date.toDateString())
  }

  const isDateSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const handleDateSelect = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }
  const handleMenu = () => {
     navigate("/menu")
  }

const handleBookNow = () => {
  if (!selectedDate) {
    // Switch to availability tab and scroll to it
    setActiveTab('availability');
    setTimeout(() => {
      window.scrollBy({
        top: 400,
        behavior: "smooth",
      });
    }, 100);
    return; 
  }
  if (serviceType === 'caterers') {
    navigate("/menu")
  } else {
    navigate("/pay", {
      state: {
        amount: 1000,
        merchantName: "Booking Website",
        description: `Booking advance for ${serviceData.name}`,
        customerName: "John Doe",
        customerEmail: "john.doe@example.com",
        customerPhone: "9999999999",
        logo: serviceData.portfolio?.[0],
      },
    });
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={`/services/${serviceType}`} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to {serviceType}
            </Link>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Loading State */}
        {isLoadingService && !isStaticService && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading service details...</p>
          </div>
        )}

        {/* Error State */}
        {serviceError && !isLoadingService && !isStaticService && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
            <p className="text-red-800 font-medium">Error loading service</p>
            <p className="text-red-600 text-sm mt-1">{serviceError}</p>
          </div>
        )}

        {(!isLoadingService || isStaticService) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Service Header */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{serviceData.name}</h1>
                    {serviceData.isFeatured && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentColor.badge} self-start`}>
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      <span className="text-sm sm:text-base">{serviceData.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm sm:text-base">{serviceData.experience}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-900 font-medium text-sm sm:text-base">{serviceData.rating}</span>
                    <span className="text-gray-500 text-sm sm:text-base">({serviceData.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${currentColor.bg} flex-shrink-0`}>
                  <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${currentColor.text}`} />
                </div>
              </div>
            </div>

            {/* Portfolio */}
            {serviceData.portfolio && serviceData.portfolio.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {serviceData.portfolio.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4 sm:p-6">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">About {serviceData.name}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{serviceData.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-2 sm:mb-3">Services Offered</h4>
                      <div className="flex flex-wrap gap-2">
                        {serviceData.services.map((serviceItem, index) => (
                          <span key={index} className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                            {serviceItem}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isCorelPhoto && (
                      <div>
                        <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-2 sm:mb-3">Equipment & Techniques</h4>
                        <div className="space-y-2">
                          {serviceConfig.equipment.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-gray-600">
                              <div className={`w-2 h-2 rounded-full ${currentColor.bg}`}></div>
                              <span className="text-sm sm:text-base">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'videos' && isMagicCategory && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Performance Videos</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Click a video to watch directly on YouTube. These links highlight illusions, crowd interactions,
                        and stage presence. Add or update links from the services dashboard.
                      </p>
                    </div>
                    {serviceData.videos.length > 0 ? (
                      <div className="space-y-3">
                        {serviceData.videos.map((videoUrl, index) => {
                          const displayUrl = videoUrl.replace(/^https?:\/\//, '')
                          return (
                            <a
                              key={videoUrl + index}
                              href={videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-sm sm:text-base"
                            >
                              <span className="truncate">
                                Video {index + 1}: {displayUrl}
                              </span>
                              <svg
                                className="w-4 h-4 flex-shrink-0 text-indigo-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5h6m0 0v6m0-6L10 14" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 19l6-6" />
                              </svg>
                            </a>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-600">
                        No videos added yet. Provide a YouTube link in the service details to showcase magic performances.
                      </div>
                    )}
                  </div>
                )}

                {/* Availability Tab */}
                {activeTab === 'availability' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Check Availability</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Select your preferred date to check availability and proceed with booking.</p>
                    </div>

                    {/* Calendar */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => navigateMonth(-1)}
                            className="p-1.5 sm:p-2 rounded-lg text-black bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => navigateMonth(1)}
                            className="p-1.5 sm:p-2 rounded-lg text-black bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                          >
                            →
                          </button>
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
                          const days = []
                          
                          // Empty cells for days before the first day of the month
                          for (let i = 0; i < startingDayOfWeek; i++) {
                            days.push(<div key={`empty-${i}`} className="p-1 sm:p-2"></div>)
                          }
                          
                          // Days of the month
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                            const isAvailable = isDateAvailable(date)
                            const isSelected = isDateSelected(date)
                            const isToday = date.toDateString() === new Date().toDateString()
                            
                            days.push(
                              <button
                                key={day}
                                onClick={() => handleDateSelect(date)}
                                disabled={!isAvailable}
                                className={`p-1 sm:p-2 text-xs sm:text-sm rounded-lg transition-all ${
                                  isSelected
                                    ? `${currentColor.button} text-white`
                                    : isAvailable
                                    ? 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                } ${isToday ? 'ring-2 ring-blue-300' : ''}`}
                              >
                                {day}
                              </button>
                            )
                          }
                          
                          return days
                        })()}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white border border-gray-200 rounded"></div>
                          <span className="text-gray-600">Available</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-100 rounded"></div>
                          <span className="text-gray-600">Unavailable</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded"></div>
                          <span className="text-gray-600">Selected</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Date Info */}
                    {selectedDate && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-green-900 text-sm sm:text-base">Date Selected</h4>
                            <p className="text-green-700 text-xs sm:text-sm">
                              {selectedDate.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row mt-3 gap-2 sm:gap-4">
                          {serviceType === 'caterers' ? <button
                            onClick={handleBookNow}
                            className={`${currentColor.button} text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm sm:text-base`}
                          >
                            Select Menu & Proceed to Book
                          </button> : 
                          <button
                            onClick={handleBookNow}
                            className={`${currentColor.button} text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm sm:text-base`}
                          >
                           Proceed to Book
                          </button>}
                          
                          <button
                            onClick={() => setSelectedDate(null)} // clears the date
                            className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm sm:text-base"
                          >
                            Remove Selected Date
                          </button>

                        </div>
                      </div>
                    )}

                    {/* No Date Selected */}
                    {!selectedDate && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Select a Date</h4>
                            <p className="text-blue-700 text-xs sm:text-sm">Choose an available date from the calendar above to proceed with booking.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Packages Tab */}
                {activeTab === 'packages' && (
                  <div className="space-y-3 sm:space-y-4">
                    {serviceData.packages.map((pkg, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900">{pkg.name}</h4>
                          <span className="text-lg sm:text-xl font-bold text-gray-900">{pkg.price}</span>
                        </div>
                        <ul className="space-y-1">
                          {pkg.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-gray-600">
                              <div className={`w-1.5 h-1.5 rounded-full ${currentColor.bg}`}></div>
                              <span className="text-sm sm:text-base">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-3 sm:space-y-4">
                    {serviceData.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-3 sm:pb-4 last:border-b-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{review.name}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar 
                                key={i} 
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Get in Touch */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Get in Touch</h3>
              <div className="space-y-2 sm:space-y-3">
                <button 
                  onClick={handleBookNow} 
                  // disabled={!selectedDate}
                  className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    selectedDate 
                      ? `${currentColor.button} text-white hover:opacity-90` 
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {selectedDate ? 'Book Through Online' : 'Select Available Dates'}
                </button>
                {serviceData.contact && (
                  <a 
                    href={`tel:${serviceData.contact.replace(/\s+/g, '')}`}
                    className="w-full border border-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FiPhone className="w-4 h-4" />
                    Call Now for Booking
                  </a>
                )}
                {serviceData.email && (
                  <a 
                    href={`mailto:${serviceData.email}`}
                    className="w-full border border-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FiMail className="w-4 h-4" />
                    Send Message
                  </a>
                )}
                {serviceType === 'caterers' && (
                  <div className="relative group">
                    <button 
                      onClick={handleMenu} 
                      disabled={!selectedDate}
                      className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                        selectedDate 
                          ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' 
                          : 'border border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100'
                      }`}
                    >
                      <FiCoffee className="w-4 h-4" />
                      Menu
                    </button>
                    {!selectedDate && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Select date first
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
              
              {/* Selected Date Display */}
              {selectedDate && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-green-900">Selected Date:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-green-700 mt-1">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Info</h3>
              <div className="space-y-2 sm:space-y-3">
                {isCorelPhoto ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Price:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">₹800 per hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Response Time:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceData.responseTime}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {serviceType === 'caterers' ? null : 
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Starting Price From:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceData.startingPrice}</span>
                    </div> }
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Response Time:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceData.responseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Advance Booking:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceData.advanceBooking}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Cancellation:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceData.cancellation}</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Social Media Icons */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Follow Us</h4>
                <div className="flex justify-center gap-3">
                  {/* Facebook */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    title="Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  
                  {/* LinkedIn */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors"
                    title="LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  
                  {/* WhatsApp */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                    title="WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </a>
                  
                  {/* Instagram */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
                    title="Instagram"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  
                  {/* Discord */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
                    title="Discord"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </a>
                  
                  {/* Snapchat */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white hover:bg-yellow-600 transition-colors"
                    title="Snapchat"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default IndividualServices