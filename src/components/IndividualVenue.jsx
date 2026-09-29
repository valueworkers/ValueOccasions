import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { FiChevronDown } from 'react-icons/fi'
import Calendar from './Calendar'
import axios from 'axios'

const IndividualVenue = () => {
  const { city = '', venueId = '' } = useParams()
  const location = useLocation()
  const source = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('source')
  }, [location.search])
  const isDashboardSource = source === 'dashboard'
  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPackageDropdown, setShowPackageDropdown] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)

  // Check if venue is honganasu party hall
  const isHonganasuPartyHall = useMemo(() => {
    if (!venue?.name) return false
    return venue.name.toLowerCase().includes('honganasu')
  }, [venue?.name])

  // Package options for honganasu party hall
  const packages = [
    { name: 'Classic Package', price: 475 },
    { name: 'Special Package', price: 525 },
    { name: 'Gold Package', price: 600 }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPackageDropdown && !event.target.closest('.package-dropdown-container')) {
        setShowPackageDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPackageDropdown])

  // Default fallback images if no photos from API
  const defaultImages = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526228076630-7f2c2c2a34f6?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1600&auto=format&fit=crop',
  ]

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true)
        const access = localStorage.getItem("access_token")
        const baseUrl = import.meta.env.VITE_BASEURL
        const endpoint = isDashboardSource
          ? `${baseUrl}/management/venues/${venueId}/`
          : `${baseUrl}/booking/public-venues/${venueId}/`
        const url = `${endpoint}?city__iexact=${encodeURIComponent(city)}`
        const config = access
          ? {
              headers: {
                Authorization: `Bearer ${access}`,
              }
            }
          : undefined
        
        const response = await axios.get(url, config)
        
        // Map API response to component structure
        const apiData = response.data?.data || response.data?.result || response.data
        
        // Helper function to extract photo URLs from photos or photos_links
        const getPhotoUrls = (photosArray) => {
          if (!photosArray || !Array.isArray(photosArray) || photosArray.length === 0) {
            return []
          }
          return photosArray
            .map(photo => {
              if (typeof photo === 'string') {
                return photo
              }
              if (photo && typeof photo === 'object') {
                return photo.image || photo.url || ''
              }
              return ''
            })
            .filter(url => url)
        }
        
        // Check both photos and photos_links
        const photosFromLinks = getPhotoUrls(apiData.photos_links)
        const photosFromPhotos = getPhotoUrls(apiData.photos)
        const allPhotos = photosFromLinks.length > 0 ? photosFromLinks : photosFromPhotos
        
        const mappedVenue = {
          id: apiData.id,
          name: apiData.name,
          description: apiData.description || '',
          capacity: apiData.capacity,
          price: parseFloat(apiData.price_per_event) || 0,
          location: apiData.location?.full_address || apiData.location?.city || decodeURIComponent(city),
          city: apiData.location?.city || decodeURIComponent(city),
          photos: allPhotos.length > 0 ? allPhotos : defaultImages,
          amenities: apiData.amenities || [],
          seatingArrangements: (apiData.seating_arrangement || []).map((arrangement) => {
            // Map seating arrangement strings to objects
            const arrangementMap = {
              'rectangular_table': { type: 'Rectangular Table Seating', capacity: 8, description: 'Perfect for formal dining and events' },
              'round_table': { type: 'Round Table Seating', capacity: 8, description: 'Perfect for family dining and conversations' },
              'theater_style': { type: 'Theater Style', capacity: 200, description: 'Ideal for presentations and ceremonies' },
              'banquet_style': { type: 'Banquet Style', capacity: 150, description: 'Classic formal dining arrangement' },
              'cocktail_standing': { type: 'Cocktail Standing', capacity: 300, description: 'Great for networking and mingling events' },
              'classroom_style': { type: 'Classroom Style', capacity: 80, description: 'Best for training sessions and workshops' },
              'u_shape': { type: 'U-Shape Setup', capacity: 40, description: 'Perfect for meetings and discussions' }
            }
            return arrangementMap[arrangement] || { 
              type: arrangement.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
              capacity: apiData.capacity || 100,
              description: `Available ${arrangement} seating arrangement`
            }
          }),
          features: {
            parking: apiData.parking_slots ? (apiData.parking_slots.car > 0 || apiData.parking_slots.bike > 0) : false,
            parkingSlots: apiData.parking_slots || { car: 0, bike: 0 },
            airConditioning: apiData.amenities?.includes('ac') || false,
            powerBackup: true,
            soundSystem: true,
            decoration: apiData.external_decorators_allow || false,
            catering: apiData.external_caterers_allow || false,
            photography: false,
            security: true
          },
          rooms: apiData.rooms,
          floors: apiData.floors,
          contact: apiData.contact || '',
          rating: 4.3 // Default rating if not in API
        }
        
        setVenue(mappedVenue)
      } catch (error) {
        console.error("Error fetching venue:", error)
        // Set a minimal fallback venue on error
        setVenue({
          id: venueId,
          name: 'Venue',
          description: 'Unable to load venue details',
          capacity: 0,
          price: 0,
          location: decodeURIComponent(city),
          city: decodeURIComponent(city),
          contact: '',
          photos: defaultImages,
          amenities: [],
          seatingArrangements: [],
          features: {
            parking: false,
            parkingSlots: { car: 0, bike: 0 },
            airConditioning: false,
            powerBackup: false,
            soundSystem: false,
            decoration: false,
            catering: false,
            photography: false,
            security: false
          },
          rooms: 0,
          floors: 0,
          rating: 0
        })
      } finally {
        setLoading(false)
      }
    }

    if (venueId) {
      fetchVenue()
    }
  }, [venueId, city, isDashboardSource])

  const DatePicker = () => {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState(null)

    const label = selected
      ? selected.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Select date'

    const handleSelect = (d) => {
      setSelected(d)
      setOpen(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (open && !event.target.closest('.date-picker')) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    return (
      <div className="relative date-picker">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`mt-1 w-full rounded-lg border px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            selected 
              ? 'border-blue-500 bg-blue-50 text-blue-900' 
              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={selected ? 'font-medium' : 'text-gray-500'}>
              {label}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        {open && (
          <div className="absolute z-30 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <Calendar value={selected || new Date()} onChange={handleSelect} minDate={new Date()} />
          </div>
        )}
      </div>
    )
  }

  const TimePicker = ({ label, value, onChange, placeholder }) => {
    const [open, setOpen] = useState(false)
    const [selectedTime, setSelectedTime] = useState(value || '')

    const timeSlots = [
      '06:00', '07:00', '08:00', 
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
      '21:00', '21:30', '22:00', '22:30', '23:00'
    ]

    const handleTimeSelect = (time) => {
      setSelectedTime(time)
      onChange(time)
      setOpen(false)
    }

    const formatTime = (time) => {
      if (!time) return ''
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    }

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (open && !event.target.closest('.time-picker')) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    return (
      <div className="relative time-picker">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`mt-1 w-full rounded-lg border px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            selectedTime 
              ? 'border-blue-500 bg-blue-50 text-blue-900' 
              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={selectedTime ? 'font-medium' : 'text-gray-500'}>
              {selectedTime ? formatTime(selectedTime) : placeholder}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {open && (
          <div className="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-xl max-h-80 overflow-y-auto">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Select Time</h3>
              <div className="h-px bg-gray-200"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`px-4 py-3 text-sm rounded-lg font-medium transition-all duration-150 ${
                    selectedTime === time 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Gallery modal state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  // Time selection state
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const openGallery = (startIndex = 0) => {
    setGalleryIndex(startIndex)
    setIsGalleryOpen(true)
  }
  const closeGallery = () => setIsGalleryOpen(false)
  const nextImage = () => setGalleryIndex((i) => (i + 1) % venue.photos.length)
  const prevImage = () => setGalleryIndex((i) => (i - 1 + venue.photos.length) % venue.photos.length)

  const handleFormSubmit = (e) => {
    e.preventDefault()
    
    // Validate time selection
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`)
      const end = new Date(`2000-01-01T${endTime}`)
      if (end <= start) {
        alert('End time must be after start time')
        return
      }
    }
    
    const formData = new FormData(e.target)
    const data = {
      venueId: venue.id,
      venueName: venue.name,
      date: formData.get('date'),
      startTime: startTime,
      endTime: endTime,
      session: formData.get('session'),
      guests: formData.get('guests'),
      name: formData.get('name'),
      phone: formData.get('phone')
    }
    // Here you would typically send this data to your backend
    alert('Booking enquiry submitted successfully!')
  }

  useEffect(() => {
    if (!isGalleryOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeGallery()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isGalleryOpen])

  // Show loading state
  if (loading || !venue) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venue details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen shadow-lg">
      {/* Header */}
      <section className="w-full pt-10 pb-6 bg-white shadow-lg border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="text-sm text-gray-600 mb-2">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <span className="mx-2">/</span>
            <Link to={`/venues/${encodeURIComponent(venue.city)}`} className="hover:text-gray-900">Venues in {venue.city}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{venue.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{venue.name}</h1>
          <p className="text-gray-700 mt-1">{venue.location} • ⭐ {Number(venue.rating).toFixed(1)} • Up to {venue.capacity} guests</p>
        </div>
      </section>
      
      {/* Content */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Gallery */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-4 grid-rows-2 gap-2 sm:gap-3">
                <div className="col-span-4 row-span-2 lg:col-span-3 lg:row-span-2 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => openGallery(0)} className="block w-full">
                    <div className="h-48 sm:h-72 md:h-[420px] bg-center bg-cover" style={{ backgroundImage: `url(${venue.photos[0]})` }} />
                  </button>
                </div>
                <div className="hidden lg:block rounded-xl overflow-hidden">
                  <button type="button" onClick={() => openGallery(1)} className="block w-full">
                    <div className="h-32 bg-center bg-cover" style={{ backgroundImage: `url(${venue.photos[1 % venue.photos.length]})` }} />
                  </button>
                </div>
                <div className="hidden lg:block rounded-xl overflow-hidden">
                  <button type="button" onClick={() => openGallery(2)} className="block w-full">
                    <div className="h-32 bg-center bg-cover" style={{ backgroundImage: `url(${venue.photos[2 % venue.photos.length]})` }} />
                  </button>
                </div>
                <div className="hidden lg:block rounded-xl overflow-hidden">
                  <button type="button" onClick={() => openGallery(3)} className="block w-full">
                    <div className="h-32 bg-center bg-cover" style={{ backgroundImage: `url(${venue.photos[3 % venue.photos.length]})` }} />
                  </button>
                </div>
                <div className="hidden lg:block rounded-xl overflow-hidden relative">
                  <button type="button" onClick={() => openGallery(0)} className="block w-full">
                    <div className="h-32 bg-center bg-cover" style={{ backgroundImage: `url(${venue.photos[4 % venue.photos.length]})` }} />
                    <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-sm font-semibold">View all photos</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Details */}
            <aside className="order-first lg:order-last">
              <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <div className="text-sm text-gray-600">Starting at</div>
                    {isHonganasuPartyHall ? (
                      <div className="relative package-dropdown-container">
                        <button
                          type="button"
                          onClick={() => setShowPackageDropdown(!showPackageDropdown)}
                          className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
                        >
                          ₹{selectedPackage ? `${selectedPackage.price.toLocaleString('en-IN')} per person` : venue.price.toLocaleString('en-IN')}
                          <FiChevronDown className={`w-5 h-5 transition-transform ${showPackageDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span>Click to select package</span>
                        </div>
                        {showPackageDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-2">
                              {packages.map((pkg, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPackage(pkg)
                                    setShowPackageDropdown(false)
                                  }}
                                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                                    selectedPackage?.name === pkg.name ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <div className="font-semibold text-gray-900">{pkg.name}</div>
                                  <div className="text-sm text-gray-600">₹{pkg.price.toLocaleString('en-IN')} per person</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">₹{venue.price.toLocaleString('en-IN')}</div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-yellow-600">⭐ {Number(venue.rating).toFixed(1)}</div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li>Capacity: up to {venue.capacity} guests</li>
                  <li>Location: {venue.location}</li>
                  <li>Rooms: {venue.rooms || 0}</li>
                  <li>Floors: {venue.floors || 0}</li>
                  {venue.features.parking ? (
                    <>
                      <li>Car Parking: {venue.features.parkingSlots.car || 0} slots</li>
                      <li>Bike Parking: {venue.features.parkingSlots.bike || 0} slots</li>
                    </>
                  ) : (
                    <li>Parking: Not Available</li>
                  )}
                </ul>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="rounded-md bg-blue-600 px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Enquire</button>
                  {venue.contact ? (
                    <a 
                      href={`tel:${venue.contact.replace(/[\s\-\(\)]/g, '')}`}
                      className="rounded-md bg-gray-100 px-3 sm:px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200 text-center"
                    >
                      Call
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="rounded-md bg-gray-100 px-3 sm:px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed"
                    >
                      Call
                    </button>
                  )}
                </div>
              </div>

              {/* Availability Form */}
              <div className="mt-4 sm:mt-6 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Check Availability</h2>
                <form className="mt-4 space-y-3 sm:space-y-4" onSubmit={handleFormSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Date</label>
                    <DatePicker />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Time</label>
                      <TimePicker 
                        value={startTime}
                        onChange={setStartTime}
                        placeholder="Select start time"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Time</label>
                      <TimePicker 
                        value={endTime}
                        onChange={setEndTime}
                        placeholder="Select end time"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="session" className="block text-sm font-medium text-gray-700">Session</label>
                    <select
                      id="session"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>Select session</option>
                      <option value="Morning">Morning / Lunch</option>
                      <option value="Evening">Evening / Dinner</option>
                      <option value="Full Day">Full Day</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700">No. of Guests</label>
                    <input
                      id="guests"
                      type="number"
                      min="1"
                      placeholder="e.g. 150"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      className="rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      className="rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-red-600 px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-white hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Check Availability</button>
                </form>
              </div>
            </aside>
          </div>

          {/* About the Venue */}
          <div className="mt-6 sm:mt-8">
            <div className="rounded-xl bg-white p-4 sm:p-6 ring-1 ring-black/5 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About {venue.name}</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{venue.description}</p>
            </div>
          </div>

          {/* Highlights */}
          <div className={`mt-6 sm:mt-8 grid grid-cols-1 ${isHonganasuPartyHall ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4 sm:gap-6`}>
            <div className="rounded-xl bg-white p-4 sm:p-5 ring-1 ring-black/5 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Highlights</h3>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Up to {venue.capacity} guests capacity</li>
                {venue.rooms > 0 && <li>{venue.rooms} room{venue.rooms > 1 ? 's' : ''}</li>}
                {venue.floors > 0 && <li>{venue.floors} floor{venue.floors > 1 ? 's' : ''}</li>}
                {venue.features.parking && (
                  <>
                    <li>Car Parking: {venue.features.parkingSlots.car || 0} slots</li>
                    <li>Bike Parking: {venue.features.parkingSlots.bike || 0} slots</li>
                  </>
                )}
                <li>Professional event management</li>
                <li>Premium location</li>
              </ul>
            </div>
            <div className="rounded-xl bg-white p-4 sm:p-5 ring-1 ring-black/5 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Timings</h3>
              <p className="text-sm text-gray-700">Morning: 9:00 AM – 3:30 PM</p>
              <p className="text-sm text-gray-700">Evening: 5:00 PM – 11:00 PM</p>
              <p className="text-sm text-gray-700 mt-2">Full Day bookings available</p>
            </div>
            {!isHonganasuPartyHall && (
              <div className="rounded-xl bg-white p-4 sm:p-5 ring-1 ring-black/5 shadow-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Menu</h3>
                <p className="text-sm text-gray-700">Veg: ₹800 per person</p>
                <p className="text-sm text-gray-700">Non-Veg: ₹999 per person</p>
                <p className="text-sm text-gray-500 mt-2">Customizable menu options</p>
              </div>
            )}
          </div>

          {/* Amenities & Features */}
          <div className="mt-6 sm:mt-8">
            <div className="rounded-xl bg-white p-4 sm:p-6 ring-1 ring-black/5 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Amenities & Features</h3>
              {venue.amenities && venue.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {venue.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-800">
                        {amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No amenities listed</p>
              )}
            </div>
          </div>

          {/* Seating Arrangements */}
          <div className="mt-6 sm:mt-8">
            <div className="rounded-xl bg-white p-4 sm:p-6 ring-1 ring-black/5 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Seating Arrangements</h3>
              {venue.seatingArrangements && venue.seatingArrangements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {venue.seatingArrangements.map((seating, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{seating.type}</h4>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {(['Round Table', 'Rectangular Table', 'Dining Style', 'Dining Table'].includes(seating.type))
                          ? `Up to ${seating.capacity} guests / table`
                          : `Up to ${seating.capacity}`}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">{seating.description || `Ideal ${seating.type}${seating.capacity ? ` • up to ${seating.capacity}${(['Round Table', 'Rectangular Table', 'Dining Style', 'Dining Table', 'Round Table Seating', 'Rectangular Table Seating'].includes(seating.type) ? ' per table' : ' guests')}` : ''}`}</p>
                  </div>
                ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No seating arrangements listed</p>
              )}
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-6 sm:mt-8">
            <div className="rounded-xl bg-white p-4 sm:p-6 ring-1 ring-black/5 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Additional Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className={`p-3 rounded-lg text-center ${venue.features.decoration ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${venue.features.decoration ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <span className={`text-sm sm:text-base ${venue.features.decoration ? 'text-green-600' : 'text-gray-400'}`}>🎨</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Decoration</p>
                  <p className={`text-xs ${venue.features.decoration ? 'text-green-600' : 'text-red-500'}`}>
                    {venue.features.decoration ? 'Available' : 'Not Available'}
                  </p>
                </div>

                <div className={`p-3 rounded-lg text-center ${venue.features.catering ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${venue.features.catering ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <span className={`text-sm sm:text-base ${venue.features.catering ? 'text-green-600' : 'text-gray-400'}`}>🍽️</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Catering</p>
                  <p className={`text-xs ${venue.features.catering ? 'text-green-600' : 'text-red-500'}`}>
                    {venue.features.catering ? 'Available' : 'External Only'}
                  </p>
                </div>

                <div className={`p-3 rounded-lg text-center ${venue.features.photography ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${venue.features.photography ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <span className={`text-sm sm:text-base ${venue.features.photography ? 'text-green-600' : 'text-gray-400'}`}>📸</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Photography</p>
                  <p className={`text-xs ${venue.features.photography ? 'text-green-600' : 'text-red-500'}`}>
                    {venue.features.photography ? 'In-house Available' : 'External Only'}
                  </p>
                </div>

                <div className="p-3 rounded-lg text-center bg-green-50 border border-green-200">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 rounded-full flex items-center justify-center bg-green-100">
                    <span className="text-sm sm:text-base text-green-600">🔒</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Security</p>
                  <p className="text-xs text-green-600">24/7 Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/80" onClick={closeGallery} />
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <div className="relative max-w-5xl w-full">
              <button
                type="button"
                onClick={closeGallery}
                className="absolute -top-10 right-0 text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-md px-3 py-1 text-sm"
              >
                Close
              </button>
              <div className="relative rounded-lg overflow-hidden bg-black">
                <img src={venue.photos[galleryIndex]} alt="Venue" className="w-full max-h-[80vh] object-contain" />
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-gray-900 font-bold"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-gray-900 font-bold"
                  aria-label="Next"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/90 bg-black/40 px-2 py-1 rounded-md">
                  {galleryIndex + 1} / {venue.photos.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IndividualVenue


