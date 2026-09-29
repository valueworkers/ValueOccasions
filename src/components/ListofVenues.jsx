import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Calendar from './Calendar'
import { FaCarAlt, FaMotorcycle, FaMapMarkerAlt , FaParking } from 'react-icons/fa'
import { TiTick, TiTimes } from 'react-icons/ti'
import { IoIosPerson, IoIosPeople } from 'react-icons/io'
import { IoBed } from "react-icons/io5"
import { SiLevelsdotfyi } from "react-icons/si"
import { IoClose } from "react-icons/io5"
import { MdTableRestaurant, MdTableBar } from "react-icons/md"
import rectTable from "../assets/6-table.svg"
import roundTable from "../assets/circular.svg"
import theaterTable from "../assets/theater.svg"
import classroomTable from "../assets/class.svg"
import dining from "../assets/dining.svg"
import axios from "axios"
import VenueRowSkeleton from './ui/VenueRowSkeleton'


const PLACEHOLDER_VENUE_IMAGE = 'https://via.placeholder.com/300'

const getPhotoUrl = (photo) => {
  if (!photo) return ''
  if (typeof photo === 'string') {
    return photo
  }
  if (photo.image) return photo.image
  if (photo.url) return photo.url
  if (photo.src) return photo.src
  return ''
}

const ITEMS_PER_PAGE = 8

const ListofVenues = () => {
  const params = useParams()
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const city = decodeURIComponent(params.city || '')
  const selectedCity = useSelector((state) => state.city.selectedCity)

  useEffect(() => {
    // Keep URL in sync with selected city from Redux
    if (selectedCity && selectedCity !== 'Select City') {
      const urlCity = params.city ? decodeURIComponent(params.city) : ''
      if (urlCity !== selectedCity) {
        const searchParams = routerLocation.search
        navigate(`/venues/${encodeURIComponent(selectedCity)}${searchParams}`, { replace: true })
      }
    }
  }, [selectedCity, params.city, routerLocation.search, navigate])

  useEffect(() => {
   
  }, [selectedCity])
  
  // Auth state
  const [authUser, setAuthUser] = useState(null)
  
  // Filter states
  const [selectedLocality, setSelectedLocality] = useState('')
  const [selectedVenueType, setSelectedVenueType] = useState('')
  const [filters, setFilters] = useState({
    veg: false,
    nonVeg: false,
    outsideFood: false,
    outsideLiquor: false,
    rooftop: false
  })
  const [guestCount, setGuestCount] = useState('')
  const [selectedGuestOption, setSelectedGuestOption] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const [distanceWithin, setDistanceWithin] = useState(0)
  
  const [decorator, setDecorator] = useState('')
  const [caterer, setCaterer] = useState('')
  const [floor, setFloor] = useState('')
  const [openStartCal, setOpenStartCal] = useState(false)
  const [openEndCal, setOpenEndCal] = useState(false)
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false)
  const [selectedVenueAmenities, setSelectedVenueAmenities] = useState([])
  const [showSeatingModal, setShowSeatingModal] = useState(false)
  const [selectedVenueSeating, setSelectedVenueSeating] = useState([])
  const startCalRef = useRef(null)
  const endCalRef = useRef(null)
  // Selected seating per venue
  const [selectedSeatingByVenue, setSelectedSeatingByVenue] = useState({})

  // Loctaion data for Range Slider
  const [center, setCenter] = useState({ lat: 0, lon: 0 })

  // Carousel state for each venue
  const [carouselStates, setCarouselStates] = useState({})

  // Geo Location
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);


  // Helper function to normalize venue data from API
  const normalizeVenue = (venue) => {
    // Map seating_arrangement array of strings to objects with type and icon
    const mapSeatingType = (type) => {
      // If it's already an object with type and icon, return it as-is
      if (typeof type === 'object' && type !== null) {
        if (type.type && type.icon) {
          return type
        }
        // If it has type but no icon, extract the type string
        if (type.type) {
          type = type.type
        } else {
          // If it's an object without expected structure, try to convert to string
          type = String(type)
        }
      }
      
      // Ensure type is a string at this point
      if (typeof type !== 'string') {
        type = String(type || 'theater')
      }
      
      const seatingMap = {
        'conference': { type: 'Conference', icon: 'theater' },
        'banquet': { type: 'Banquet', icon: 'round' },
        'classroom': { type: 'Classroom', icon: 'classroom' },
        'round': { type: 'Round Table', icon: 'round' },
        'rectangular': { type: 'Rectangular Table', icon: 'rectangular' },
        'theater': { type: 'Theater Style', icon: 'theater' },
        'dining': { type: 'Dining Style', icon: 'dining' },
      }
      const lowerType = type.toLowerCase()
      return seatingMap[lowerType] || { type: type, icon: 'theater' }
    }

    // Helper to check if value is empty object
    const isEmptyObject = (val) => {
      return typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length === 0
    }

    // Handle location object (new structure: {building_name, address_line1, address_line2, locality, city, state, postal_code})
    const locationObj = venue.location && typeof venue.location === 'object' ? venue.location : {}
    
    // Handle amenities - can be array or empty object {}
    let amenitiesArray = []
    if (Array.isArray(venue.amenities)) {
      amenitiesArray = venue.amenities
    } else if (venue.amenities && !isEmptyObject(venue.amenities)) {
      amenitiesArray = Object.values(venue.amenities)
    }

    // Handle seating_arrangement - can be array, empty object {}, or undefined
    let seatingArray = []
    if (Array.isArray(venue.seating_arrangement) && venue.seating_arrangement.length > 0) {
      seatingArray = venue.seating_arrangement
    } else if (venue.seating_arrangement && !isEmptyObject(venue.seating_arrangement) && typeof venue.seating_arrangement === 'object') {
      // If it's an object (but not empty), try to extract values
      seatingArray = Object.values(venue.seating_arrangement)
    }

    // Handle parking_slots - new structure: {car: number, bike: number} or empty {}
    const parkingSlots = venue.parking_slots && !isEmptyObject(venue.parking_slots)
      ? venue.parking_slots
      : { car: 0, bike: 0 }

    // Build full address from location object
    const addressParts = [
      locationObj.address_line1,
      locationObj.address_line2,
      locationObj.locality,
      locationObj.city
    ].filter(Boolean)
    const fullAddress = addressParts.join(', ')

    return {
      ...venue,
      // Location mapping - new structure
      locality: locationObj.locality || 
                venue.locality || 
                '',
      // location should be city name (string), not the location object
      location: locationObj.city || 
                (typeof venue.location === 'string' ? venue.location : null) ||
                venue.city || 
                '',
      address: fullAddress || 
               venue.address || 
               locationObj.address_line1 ||
               locationObj.address_line2 ||
               venue.full_address || 
               '',
      city: locationObj.city || 
            venue.city || 
            '',
      
      // Parking mapping - new structure: {car, bike}
      parking: {
        car: parkingSlots.car || 0,
        cars: parkingSlots.car || 0,
        bike: parkingSlots.bike || 0,
        bikes: parkingSlots.bike || 0
      },
      
      // Permissions mapping
      externalDecorationAllowed: venue.external_decorators_allow !== undefined 
        ? venue.external_decorators_allow 
        : venue.externalDecorationAllowed,
      externalCatererAllowed: venue.external_caterers_allow !== undefined 
        ? venue.external_caterers_allow 
        : venue.externalCatererAllowed,
      
      // Status mapping
      enabled: venue.is_active !== undefined ? venue.is_active : venue.enabled,
      
      // Amenities - handle array or empty object
      amenities: amenitiesArray,
      
      // Seating arrangements - handle array, empty object, or undefined
      seatingArrangements: seatingArray.length > 0
        ? seatingArray.map(mapSeatingType)
        : (venue.seatingArrangements || []),
      
      // Photos mapping - handle new structure with image objects
      photos: (() => {
        if (Array.isArray(venue.photos) && venue.photos.length > 0) {
          // New structure: array of objects with 'image' property
          return venue.photos.map(photo => {
            if (typeof photo === 'object' && photo !== null && photo.image) {
              return photo.image
            }
            return getPhotoUrl(photo)
          }).filter(Boolean)
        }
        
        // Fallback to old structure
        let rawPhotos = []
        if (venue.photos_links && Array.isArray(venue.photos_links) && venue.photos_links.length > 0) {
          rawPhotos = venue.photos_links
        } else if (venue.photos_data && Array.isArray(venue.photos_data) && venue.photos_data.length > 0) {
          rawPhotos = venue.photos_data
        } else if (venue.imgList && Array.isArray(venue.imgList) && venue.imgList.length > 0) {
          rawPhotos = venue.imgList
        }
        const urls = rawPhotos.map(getPhotoUrl).filter(Boolean)
        return urls.length > 0 ? urls : []
      })(),
      
      // Price mapping - handle null price_per_event
      price: venue.price_per_event && venue.price_per_event !== null
        ? parseFloat(venue.price_per_event)
        : (venue.price || 0),
      
      // Keep original fields for backward compatibility
    }
  }

  // GET Request for List of Venues 
  useEffect(() => {
    // Only fetch if a valid city is selected
    if (!selectedCity || selectedCity === 'Select City') {
      setVenues([])
      return
    }

    const access = localStorage.getItem("access_token");
    const userType = localStorage.getItem("user_type");

    // const config = access
    //   ? { headers: { Authorization: `Bearer ${access}` } }
    //   : undefined;

    setLoadingVenues(true)
    setVenuesError(null)

    axios
      .get(`${import.meta.env.VITE_BASEURL}/booking/public-venues/?location__city__icontains=${selectedCity}`)
      .then((response) => {
        // Get venues from response.data.results (new paginated structure)
        const rawVenues = Array.isArray(response.data.results)
          ? response.data.results
          : (Array.isArray(response.data.result)
              ? response.data.result
              : (Array.isArray(response.data) 
                  ? response.data
                  : (response.data.data || [])))
      
        
        const venuesData = rawVenues.map(normalizeVenue)
        setVenues(venuesData)
        setLoadingVenues(false)
      })
      .catch((error) => {
        console.error("Error fetching venues:", error);
        setVenuesError(error.message || 'Failed to fetch venues')
        setVenues([])
        setLoadingVenues(false)
      });
  }, [selectedCity]);

  // Check auth status on mount and when auth changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const raw = localStorage.getItem('authUser')
      const user = raw ? JSON.parse(raw) : null
      setAuthUser(user)
    }
    
    checkAuthStatus()
    
    // Listen for auth changes
    const handleAuthChange = () => checkAuthStatus()
    window.addEventListener('auth-changed', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openStartCal && startCalRef.current && !startCalRef.current.contains(e.target)) {
        setOpenStartCal(false)
      }
      if (openEndCal && endCalRef.current && !endCalRef.current.contains(e.target)) {
        setOpenEndCal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [openStartCal, openEndCal])

  // Geo Location
  //   useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         const { latitude, longitude } = position.coords;

  //         try {
  //           // Example using OpenStreetMap's free reverse geocoding API
  //           const res = await fetch(
  //             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
  //           );
  //           const data = await res.json();
            
  //           setCenter({lat: data.lat , lon: data.lon})
  //           setLocation(data.address.quarter);
  //         } catch (err) {
  //           setError("Failed to fetch location");
  //         }
  //       },
  //       (err) => {
  //         setError(err.message);
  //       }
  //     );
  //   } else {
  //     setError("Geolocation is not supported by this browser.");
  //   }
  // }, []);

  // For Location Range Increase

  //   useEffect(() => {
  //   // Approximate new point (northwards by radius km)
  //   const R = 6371; // Earth radius in km
  //   const lat = Number(center.lat);
  //   const lng = Number(center.lon);
  //   const radius = Number(distanceWithin);
  //   const newLat = lat + (radius / R) * (180 / Math.PI);

  //   fetch(
  //     `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${lng}`
  // )
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data && data.address) {
  //         setLocation(data.address.quarter || data.address.suburb || data.address.city || data.address.village || data.address.county);
  //         }
  //     });
  // }, [distanceWithin]);

  // Auto-play carousel for all venues
  useEffect(() => {
    const intervals = {}
    
    Object.keys(carouselStates).forEach(venueId => {
      const state = carouselStates[venueId]
      if (state.isAutoPlaying) {
        intervals[venueId] = setInterval(() => {
          nextCarouselImage(parseInt(venueId))
        }, 3000) // Change image every 3 seconds
      }
    })
    
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval))
    }
  }, [carouselStates])


  const venueImages = useMemo(
    () => [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526228076630-7f2c2c2a34f6?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1600&auto=format&fit=crop',
    ],
    []
  )

  // Venues state management - now using API data (declared before useMemo hooks that depend on it)
  const [venues, setVenues] = useState([])
  const [loadingVenues, setLoadingVenues] = useState(false)
  const [venuesError, setVenuesError] = useState(null)

  // Extract localities and venue types dynamically from API data
  const localities = useMemo(() => {
    const uniqueLocalities = [...new Set(venues.map(v => v.locality).filter(Boolean))]
    return uniqueLocalities.sort()
  }, [venues])
  
  const venueTypes = useMemo(() => {
    const uniqueTypes = [...new Set(venues.map(v => v.venue_type || v.venueType).filter(Boolean))]
    return uniqueTypes.sort()
  }, [venues])

  // Filter options state management
  const [foodTypes, setFoodTypes] = useState(() => {
    try {
      const saved = localStorage.getItem(`foodTypes_${city}`)
      return saved ? JSON.parse(saved) : ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Halal']
    } catch (error) {
      return ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Halal']
    }
  })

  const [decoratorOptions, setDecoratorOptions] = useState(() => {
    try {
      const saved = localStorage.getItem(`decoratorOptions_${city}`)
      return saved ? JSON.parse(saved) : ['External decorator allowed', 'External decorator not allowed', 'In-house decorator only']
    } catch (error) {
      return ['External decorator allowed', 'External decorator not allowed', 'In-house decorator only']
    }
  })

  const [catererOptions, setCatererOptions] = useState(() => {
    try {
      const saved = localStorage.getItem(`catererOptions_${city}`)
      return saved ? JSON.parse(saved) : ['External caterers allowed', 'External caterers not allowed', 'In-house catering only']
    } catch (error) {
      return ['External caterers allowed', 'External caterers not allowed', 'In-house catering only']
    }
  })

  // Save filter options to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`foodTypes_${city}`, JSON.stringify(foodTypes))
    } catch (error) {
      console.error('Error saving food types:', error)
    }
  }, [foodTypes, city])

  useEffect(() => {
    try {
      localStorage.setItem(`decoratorOptions_${city}`, JSON.stringify(decoratorOptions))
    } catch (error) {
      console.error('Error saving decorator options:', error)
    }
  }, [decoratorOptions, city])

  useEffect(() => {
    try {
      localStorage.setItem(`catererOptions_${city}`, JSON.stringify(catererOptions))
    } catch (error) {
      console.error('Error saving caterer options:', error)
    }
  }, [catererOptions, city])


  const list = venues

  // Determine minimum accepted pax across venues (based on displayed Minimum Pax)
  const minAcceptedPax = useMemo(() => {
    if (!list.length) return 0
    return list.reduce((min, v) => {
      const venueMin = Math.min(100, v.capacity)
      return Math.min(min, venueMin)
    }, Number.POSITIVE_INFINITY)
  }, [list])

  const isBelowMinPax = useMemo(() => {
    if (!guestCount) return false
    const val = parseInt(guestCount)
    if (Number.isNaN(val)) return false
    return val < minAcceptedPax
  }, [guestCount, minAcceptedPax])

  // Filter venues based on selected criteria
  const filteredVenues = useMemo(() => {
    return list.filter(venue => {
      // Helper to get property with fallback for different naming conventions
      const getProp = (obj, ...keys) => {
        for (const key of keys) {
          if (obj[key] !== undefined && obj[key] !== null) return obj[key]
        }
        return null
      }

      const venueLocality = getProp(venue, 'locality') || 
                            venue.location?.address_line_1 || 
                            venue.location?.locality || 
                            venue.address_line_1
      const venueType = getProp(venue, 'venueType', 'venue_type')
      // location can be string (city) or object, extract city name
      const venueLocation = (typeof venue.location === 'string' ? venue.location : null) ||
                            venue.location?.city || 
                            getProp(venue, 'city')
      const venueCapacity = getProp(venue, 'capacity')
      const venueEnabled = getProp(venue, 'enabled', 'is_active')
      const venueFeatures = getProp(venue, 'features') || {}

      // Hide disabled venues for all users
      if (venueEnabled === false) return false
      
      // Locality filter
      if (selectedLocality && venueLocality !== selectedLocality) return false
      
      // Venue type filter
      if (selectedVenueType && venueType !== selectedVenueType) return false
      
      // Search by location/locality
      if (searchLocation || location) {
        const q = (searchLocation || location || '').trim().toLowerCase()
        const localityMatch = venueLocality ? venueLocality.toLowerCase().includes(q) : false
        const locationMatch = venueLocation ? venueLocation.toLowerCase().includes(q) : false
        if (!localityMatch && !locationMatch) return false
      }
      
      // Guest count filter
      if (guestCount && venueCapacity && venueCapacity < parseInt(guestCount)) return false
      
      // Feature filters (handle both nested features object and direct properties)
      if (filters.veg && !venueFeatures.veg && !venue.veg) return false
      if (filters.nonVeg && !venueFeatures.nonVeg && !venue.non_veg) return false
      if (filters.outsideFood && !venueFeatures.outsideFood && !venue.outside_food) return false
      if (filters.outsideLiquor && !venueFeatures.outsideLiquor && !venue.outside_liquor) return false
      if (filters.rooftop && !venueFeatures.rooftop && !venue.rooftop) return false
      
      return true
    })
  }, [list, selectedLocality, selectedVenueType, filters, guestCount, searchLocation, location])

  // Expand venues so that each hall (if present) appears as an individual listing
  const expandedVenues = useMemo(() => {
    const items = []
    filteredVenues.forEach((venue) => {
      if (venue.halls && venue.halls.length > 0) {
        venue.halls.forEach((hall, hallIndex) => {
          items.push({ ...venue, __hall: hall, __hallIndex: hallIndex })
        })
      } else {
        items.push(venue)
      }
    })
    return items
  }, [filteredVenues])

  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredVenues.length])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(expandedVenues.length / ITEMS_PER_PAGE))
  }, [expandedVenues.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedVenues = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return expandedVenues.slice(start, start + ITEMS_PER_PAGE)
  }, [expandedVenues, currentPage])

  // Helpers to display hall-specific info when present
  const getDisplayName = (venue) => {
    return venue.__hall ? `${venue.name} - ${venue.__hall.name || 'Hall'}` : venue.name
  }

  const getDisplayCapacity = (venue) => {
    return venue.__hall && venue.__hall.capacity ? venue.__hall.capacity : venue.capacity
  }

  const getDisplayPricePerPax = (venue) => {
    if (venue.__hall && venue.__hall.price) return venue.__hall.price
    
    // Use price_per_event from API response directly as price per pax
    const pricePerEvent = venue.price_per_event || venue.price || 0
    
    if (pricePerEvent) {
      return Math.round(parseFloat(pricePerEvent))
    }
    
    // Fallback to old method if no price available
    return getPriceForSeating(getSelectedSeating(venue.id)?.icon)
  }

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }))
  }

  const handleApplyFilters = () => {
    // Filters are applied automatically through useMemo
    setShowFilters(false)
  }

  const clearFilters = () => {
    setSearchLocation("")
    setDistanceWithin(0)
    setSelectedLocality('')
    setSelectedVenueType('')
    setFilters({
      veg: false,
      nonVeg: false,
      outsideFood: false,
      outsideLiquor: false,
      rooftop: false
    })
    setGuestCount('')
    setSelectedGuestOption('')
    setDecorator('')
    setCaterer('')
    setFloor('')
    setLocation(null)
  }

  const openAmenitiesModal = (amenities) => {
    setSelectedVenueAmenities(amenities)
    setShowAmenitiesModal(true)
  }

  const openSeatingModal = (seatingArrangements) => {
    setSelectedVenueSeating(seatingArrangements)
    setShowSeatingModal(true)
  }

  const renderSeatingIcon = (iconType) => {
    switch (iconType) {
      case 'round':
        return <img src={roundTable} alt="Round table" className="h-4 w-4" />
      case 'rectangular':
        return <img src={rectTable} alt="Rectangular table" className="h-4 w-4" />
      case 'theater':
        return  <img src={theaterTable} alt="Theater table" className="h-4 w-4" />
      case 'classroom':
        return <img src={classroomTable} alt="Classroom table" className="h-4 w-4" />
      case 'banquet':
        return <MdTableRestaurant className="w-4 h-4 text-blue-600" />
      case 'dining':
        return <img src={dining} alt='Dining table' className='h-4 w-4'/>
      case 'cocktail':
        return <MdTableBar className="w-4 h-4 text-gray-600" />
      case 'boardroom':
        return <div className="w-4 h-4 border-2 border-gray-600 rounded flex items-center justify-center"><div className="w-2 h-1 bg-gray-600 rounded"></div></div>
      default:
        return <div className="w-4 h-4 border-2 border-gray-600 rounded"></div>
    }
  }

  const getSeatingsForVenue = (venueId) => {
    const venue = list.find(v => v.id === venueId)
    return (venue?.seatingArrangements || venue?.seating_arrangements || [])
  }

  const getSelectedSeating = (venueId) => {
    // Return the selected seating object if present, else default to first
    const seatings = getSeatingsForVenue(venueId)
    if (selectedSeatingByVenue[venueId]) {
      const match = seatings.find(s => s.type === selectedSeatingByVenue[venueId])
      if (match) return match
    }
    return seatings[0] || { type: 'Theater', icon: 'theater' }
  }

  const setSeatingForVenue = (venueId, seatingType) => {
    setSelectedSeatingByVenue(prev => ({ ...prev, [venueId]: seatingType }))
  }

  const getPriceForSeating = (seating) => {
    switch (seating) {
      case 'round': // circular
        return 500
      case 'rectangular':
        return 480
      case 'theater':
      case 'classroom':
        return 450
      default:
        return 450
    }
  }

  const changeLocation=(e)=>{
    setSearchLocation(e.target.value)
    setLocation(e.target.value)
  }
  // Carousel functions
  const getCarouselState = (venueId) => {
    return carouselStates[venueId] || { currentIndex: 0, isAutoPlaying: false }
  }

  const updateCarouselState = (venueId, updates) => {
    setCarouselStates(prev => ({
      ...prev,
      [venueId]: { ...getCarouselState(venueId), ...updates }
    }))
  }

  const nextCarouselImage = (venueId) => {
    const venue = list.find(v => v.id === venueId)
    if (!venue) return
    
    const currentState = getCarouselState(venueId)
    const photos = venue.photos && venue.photos.length > 0 ? venue.photos : venueImages
    const nextIndex = (currentState.currentIndex + 1) % photos.length
    updateCarouselState(venueId, { currentIndex: nextIndex })
  }

  const prevCarouselImage = (venueId) => {
    const venue = list.find(v => v.id === venueId)
    if (!venue) return
    
    const currentState = getCarouselState(venueId)
    const photos = venue.photos && venue.photos.length > 0 ? venue.photos : venueImages
    const prevIndex = (currentState.currentIndex - 1 + photos.length) % photos.length
    updateCarouselState(venueId, { currentIndex: prevIndex })
  }

  const goToImage = (venueId, index) => {
    updateCarouselState(venueId, { currentIndex: index })
  }

  const toggleAutoPlay = (venueId) => {
    const currentState = getCarouselState(venueId)
    updateCarouselState(venueId, { isAutoPlaying: !currentState.isAutoPlaying })
  }

  // Calculate price based on guest count
  const getPricePerPax = (guestOption) => {
    switch (guestOption) {
      case '150':
        return 450
      case '200':
        return 440
      case '250':
        return 430
      case '300+':
        return 410
      default:
        return 400 // Default price
    }
  }

  // Range data
    const changeRange=(e)=>{
       setDistanceWithin(e.target.value)
    }

  return (
    <div className="min-h-screen bg-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-7">
          
        {/* Sidebar Filters */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search Location</label>
              <input
                type="text"
                value={searchLocation || location || ""}
                onChange={changeLocation}
                placeholder="Search location"
                className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-gray-800"
              />
      </div>

          {/* <div>
              <label className="block text-sm font-medium text-gray-700">Distance within</label>
              <input
                type="range"
                min="0"
                max="100"
                value={distanceWithin}
                onChange={changeRange}
                className="mt-2 w-full"
              />
              <div className="text-xs text-gray-600 flex justify-between">
              <span className="text-sm font-medium text-gray-800 w-10">
      {distanceWithin} kms
    </span>
              </div>
              </div> */}

                    <div>
              <label className="block text-sm font-medium text-gray-700">Venue Type</label>
                      <select
                value={selectedVenueType}
                onChange={(e) => setSelectedVenueType(e.target.value)}
                size={1}
                className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-gray-800"
              >
                <option value="">All</option>
                {venueTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
              <label className="block text-sm font-medium text-gray-700">Food Type</label>
                      <select
                value={filters.nonVeg ? 'nonVeg' : filters.veg ? 'veg' : ''}
                onChange={(e) => {
                  const val = e.target.value
                  setFilters(prev => ({ ...prev, veg: val === 'veg', nonVeg: val === 'nonVeg' }))
                }}
                size={1}
                className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-gray-800"
              >
                <option value="">Any</option>
                {foodTypes.map((type, index) => (
                  <option key={index} value={type.toLowerCase().replace('-', '')}>{type}</option>
                ))}
                      </select>
                    </div>

                    <div>
              <label className="block text-sm font-medium text-gray-700">No of Guests</label>
              <select
                value={selectedGuestOption}
                onChange={(e) => {
                  setSelectedGuestOption(e.target.value)
                  setGuestCount(e.target.value)
                }}
                className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-gray-800"
              >
                <option value="">Select guest count</option>
                <option value="150">100 - 150</option>
                <option value="200">150 - 200</option>
                <option value="250">200 - 300</option>
                <option value="300+">300+</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">Decorator</label>
              <select
                value={decorator}
                onChange={(e) => setDecorator(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-gray-800"
              >
                <option value="">Any</option>
                {decoratorOptions.map((option, index) => (
                  <option key={index} value={option.toLowerCase().replace(/\s+/g, '_')}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Caterer</label>
              <select
                value={caterer}
                onChange={(e) => setCaterer(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-gray-800"
              >
                <option value="">Any</option>
                {catererOptions.map((option, index) => (
                  <option key={index} value={option.toLowerCase().replace(/\s+/g, '_')}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Floor</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-gray-800"
              />
                  </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleApplyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-md">Apply</button>
              <button onClick={clearFilters} className="px-4 py-2 bg-blue-600 text-white rounded-md">Clear</button>
                </div>

                  </div>
          </div>
        </aside>

        {/* Main Content */}
          <main className="lg:col-span-3 order-1 lg:order-2 space-y-6">
         
          {/* Loading State */}
          {loadingVenues && <VenueRowSkeleton count={4} />}

          {/* Error State */}
          {venuesError && !loadingVenues && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">Error loading venues</p>
              <p className="text-red-600 text-sm mt-1">{venuesError}</p>
            </div>
          )}

          {/* No City Selected */}
          {!selectedCity || selectedCity === 'Select City' ? (
            !loadingVenues && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Please select a city to view venues</p>
              </div>
            )
          ) : null}
                    
          {/* Venue Rows */}
          {!isBelowMinPax && !loadingVenues && !venuesError && (
          <>
          <div className="space-y-2">
            {paginatedVenues.map((v, evIndex) => (
              <div key={`${v.id}-${v.__hallIndex ?? 'main'}-${evIndex}`} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Mobile Layout */}
                <div className="block lg:hidden">
                  {/* Image Carousel */}
                  <div className="relative h-48 sm:h-64 w-full bg-center bg-cover overflow-hidden" style={{ backgroundImage: `url(${(v.photos && v.photos.length > 0 ? v.photos : venueImages)[getCarouselState(v.id).currentIndex]})` }}>
                    {/* Navigation Arrows */}
                    <button
                      onClick={() => prevCarouselImage(v.id)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => nextCarouselImage(v.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {getCarouselState(v.id).currentIndex + 1} / {(v.photos && v.photos.length > 0 ? v.photos : venueImages).length}
                    </div>

                    {/* Auto-play Toggle */}
                    <button
                      onClick={() => toggleAutoPlay(v.id)}
                      className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        getCarouselState(v.id).isAutoPlaying 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-white/80 text-gray-800 hover:bg-white'
                      }`}
                    >
                      {getCarouselState(v.id).isAutoPlaying ? '⏸️' : '▶️'}
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
                      {(v.photos && v.photos.length > 0 ? v.photos : venueImages).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(v.id, index)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                            getCarouselState(v.id).currentIndex === index 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    {/* Venue Name (hall-aware) */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {getDisplayName(v)}
                        {!v.enabled && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            Hidden
                          </span>
                        )}
                      </h3>
                      {/* <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium text-gray-700">{v.rating || v.rating_score || 'N/A'}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">{v.venueType || v.venue_type || 'N/A'}</span>
                      </div> */}
                    </div>

                    {/* Location (single row) */}
                    <div className="flex items-center gap-2 min-w-0 mb-3">
                      <div className="text-sm font-medium text-gray-800 flex items-center gap-2 whitespace-nowrap">
                        <FaMapMarkerAlt className="text-blue-600" /> 
                        {(v.locality || v.location?.address_line_1 || v.location?.locality || v.address_line_1 || v.city || v.location?.city || 'N/A')}, {(v.address || v.location?.full_address || v.location?.address || v.location?.address_line_1 || v.full_address || v.address_line_1 || 'N/A')}
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="text-xs text-gray-600 truncate flex-1">{v.address || v.location?.full_address || v.location?.address || v.location?.address_line_1 || v.full_address || v.address_line_1 || 'Address not available'}</div>
                    </div>

                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <IoIosPerson className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="text-xs text-gray-500">Min Guests</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {selectedGuestOption ? selectedGuestOption : Math.min(50, v.capacity || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoIosPeople className="h-4 w-4 text-gray-600"/>
                        <div>
                          <div className="text-xs text-gray-500">Max Capacity</div>
                          <div className="text-sm font-semibold text-gray-800">{getDisplayCapacity(v) || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoBed className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="text-xs text-gray-500">Rooms</div>
                          <div className="text-sm font-semibold text-gray-800">{v.rooms || v.num_rooms || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SiLevelsdotfyi className="h-4 w-4 text-gray-600"/>
                        <div>
                          <div className="text-xs text-gray-500">Floors</div>
                          <div className="text-sm font-semibold text-gray-800">{v.floors || v.num_floors || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Parking and Permissions */}
                    <div className="space-y-3 mb-3">
                      <div className="flex items-center gap-2">
                        <FaParking className="h-4 w-4 text-gray-600" />
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1">
                            <FaMotorcycle className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Bike:</span>
                            <span className="text-sm font-medium text-gray-800">{v.parking.bike || v.parking.bikes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaCarAlt className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Car:</span>
                            <span className="text-sm font-medium text-gray-800">{v.parking.car || v.parking.cars}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className={`${(v.externalDecorationAllowed || v.external_decoration_allowed) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border rounded px-3 py-2 text-center text-xs font-medium flex items-center gap-2`}> 
                          {(v.externalDecorationAllowed || v.external_decoration_allowed) ? <TiTick className="text-green-600 w-4 h-4" /> : <TiTimes className="text-red-600 w-4 h-4" />}
                          <span>Decor</span>
                        </div>
                        <div className={`${(v.externalCatererAllowed || v.external_caterer_allowed) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border rounded px-3 py-2 text-center text-xs font-medium flex items-center gap-2`}> 
                          {(v.externalCatererAllowed || v.external_caterer_allowed) ? <TiTick className="text-green-600 w-4 h-4" /> : <TiTimes className="text-red-600 w-4 h-4" />}
                          <span>Caterer</span>
                        </div>
                      </div>
                    </div>

                    {/* Amenities and Seating */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Amenities</div>
                        <div className="flex flex-wrap gap-2">
                          {(v.amenities || []).slice(0, 3).map((amenity, index) => (
                            <div key={index} className="bg-gray-100 rounded px-3 py-1 text-xs font-medium text-gray-700">
                              {amenity}
                            </div>
                          ))}
                          {(v.amenities || []).length > 3 && (
                            <button
                              onClick={() => openAmenitiesModal(v.amenities || [])}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                            >
                              +{(v.amenities || []).length - 3} more
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Seating</div>
                        <div className="flex flex-wrap gap-2">
                          {(v.seatingArrangements || v.seating_arrangements || []).slice(0, 2).map((seating, index) => (
                            <div key={index} title={`${seating.type}${seating.capacity ? ` (Capacity: ${seating.capacity})` : ''}`} className="bg-blue-50 rounded px-3 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
                              {renderSeatingIcon(seating.icon)}
                              <span>{seating.type}</span>
                            </div>
                          ))}
                          {(v.seatingArrangements || v.seating_arrangements || []).length > 2 && (
                            <button
                              onClick={() => openSeatingModal(v.seatingArrangements || v.seating_arrangements || [])}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                            >
                              +{(v.seatingArrangements || v.seating_arrangements || []).length - 2} more
                            </button>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs text-gray-600">Select seating:</label>
                          <select
                            value={getSelectedSeating(v.id).type}
                            onChange={(e) => setSeatingForVenue(v.id, e.target.value)}
                            className="border rounded px-2 py-1 text-xs text-gray-800"
                          >
                            {(v.seatingArrangements || v.seating_arrangements || []).length > 0 ? (
                              (v.seatingArrangements || v.seating_arrangements || []).map((seating, idx) => (
                                <option key={idx} value={seating.type}>
                                  {seating.type}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="theater">Theater</option>
                                <option value="classroom">Classroom</option>
                                <option value="round">Circular</option>
                                <option value="rectangular">Rectangular</option>
                              </>
                            )}
                          </select>
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <span className="text-gray-500">Selected:</span>
                            {renderSeatingIcon(getSelectedSeating(v.id).icon)}
                            <span className="capitalize">{getSelectedSeating(v.id).type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Halls (if any) */}
                  {!v.__hall && v.halls && v.halls.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Halls</div>
                      <div className="flex flex-wrap gap-2">
                        {v.halls.map((hall, idx) => (
                          <div key={idx} className="bg-purple-50 rounded px-3 py-1 text-xs font-medium text-purple-800 border border-purple-200">
                            {hall.name || 'Hall'}
                            {(hall.capacity || hall.price) && (
                              <span className="text-purple-600"> {`(`}
                                {hall.capacity ? `${hall.capacity} pax` : ''}
                                {hall.capacity && hall.price ? ' • ' : ''}
                                {hall.price ? `${hall.price} / Pax` : ''}
                              {`)`}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                    {/* Price and Action */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          
                          <div className="text-sm text-gray-600">{getDisplayPricePerPax(v)} / Pax • Inclusive of food</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (!authUser) {
                                // User not authenticated, redirect to login
                                navigate('/login')
                              } else {
                                navigate(`/venue/${encodeURIComponent(city)}/${v.id}`
                                )
                              }
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-1 p-2">
                  {/* Image Carousel */}
                  <div className="lg:col-span-3 flex items-center">
                    <div className="relative w-48 h-38 rounded-lg overflow-hidden shadow-sm">
                      <div 
                        className="w-full h-full bg-center bg-cover transition-all duration-500 hover:scale-95" 
                        style={{ backgroundImage: `url(${(v.photos && v.photos.length > 0 ? v.photos : venueImages)[getCarouselState(v.id).currentIndex]})` }}
                      >
                        {/* Navigation Arrows */}
                        <button
                          onClick={() => prevCarouselImage(v.id)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                          aria-label="Previous image"
                        >
                          <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => nextCarouselImage(v.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                          aria-label="Next image"
                        >
                          <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {getCarouselState(v.id).currentIndex + 1} / {(v.photos && v.photos.length > 0 ? v.photos : venueImages).length}
                        </div>

                        {/* Auto-play Toggle */}
                        <button
                          onClick={() => toggleAutoPlay(v.id)}
                          className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            getCarouselState(v.id).isAutoPlaying 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-white/80 text-gray-800 hover:bg-white'
                          }`}
                        >
                          {getCarouselState(v.id).isAutoPlaying ? '⏸️' : '▶️'}
                        </button>
                      </div>

                      {/* Thumbnail Navigation */}
                      <div className="absolute -bottom-8 left-0 right-0 flex gap-1 justify-center">
                        {(v.photos && v.photos.length > 0 ? v.photos : venueImages).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToImage(v.id, index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              getCarouselState(v.id).currentIndex === index 
                                ? 'bg-blue-600 scale-125' 
                                : 'bg-gray-400 hover:bg-gray-600'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                {/* Details */}
                  <div className="lg:col-span-7">
                  
                                    {/* Row 1: Capacity and Rooms */}
                  <div className="text-black text-base font-semibold leading-tight flex items-center gap-2">
                    {getDisplayName(v)}
                    {!v.enabled && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs">
                    <div className="text-md text-gray-800 font-semibold flex items-center gap-2"><FaMapMarkerAlt /> {((v.address || v.location?.full_address || v.location?.address || v.location?.address_line_1 || v.full_address || v.address_line_1 || v.locality || v.location?.locality || 'N/A')).slice(0,11)}{((v.address || v.location?.full_address || v.location?.address || v.location?.address_line_1 || v.full_address || v.address_line_1 || v.locality || v.location?.locality || 'N/A')).length > 11 ? '...' : ''}</div>
                  
                    <div className="flex items-center gap-2">
                      <IoIosPerson className="h-5 w-5 text-gray-700" />
                      <div className="text-gray-800 font-medium">
                        {selectedGuestOption ? `${selectedGuestOption} Pax` : `${Math.min(100, v.capacity)} Pax`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IoIosPeople className="h-5 w-5 text-gray-700"/>
                      <div className="text-gray-800 font-medium">{getDisplayCapacity(v)} Pax</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <IoBed className="h-5 w-5 text-gray-700" /> */}
                      <div className="text-gray-800 font-medium"> Rooms {v.rooms}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <SiLevelsdotfyi className="h-5 w-5 text-gray-700"/> */}
                      <div className="text-gray-800 font-medium"> Floors {v.floors}</div>
                    </div>

                      {/* Parking */}
                    <div className="flex items-center gap-2">
                      <FaParking className="h-5 w-5 text-gray-700" />
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1">
                          <FaMotorcycle className="h-4 w-4 text-gray-600" />
                          <span className="text-xs font-medium text-black">{v.parking.car || v.parking.cars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCarAlt className="h-4 w-4 text-gray-600" />
                          <span className="text-xs font-medium text-black">{v.parking.bike || v.parking.bikes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Parking and Permissions */}
                  <div>
                   


                    {/* Permissions */}
                    <div className="flex gap-2 mt-2">
                      <div className={`${v.externalDecorationAllowed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border rounded px-2 py-1 text-center text-xs font-medium flex items-center gap-1 h-7 relative group`}> 
                        {v.externalDecorationAllowed ? <TiTick className="text-green-600 w-3 h-3" /> : <TiTimes className="text-red-600 w-3 h-3" />}
                        <span className="truncate">External Decorator</span>
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          External Decorator {v.externalDecorationAllowed ? 'Allowed' : 'Not Allowed'}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                      <div className={`${v.externalCatererAllowed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border rounded px-2 py-1 text-center text-xs font-medium flex items-center gap-1 h-7 relative group`}> 
                        {v.externalCatererAllowed ? <TiTick className="text-green-600 w-3 h-3" /> : <TiTimes className="text-red-600 w-3 h-3" />}
                        <span className="truncate">External Caterer</span>
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          External Caterers {v.externalCatererAllowed ? 'Allowed' : 'Not Allowed'}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Amenities and Seating in Columns */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    {/* Amenities Column */}
                    <div>
                      <div className="text-[10px] text-gray-600 font-medium mb-1">Amenities:</div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(v.amenities || []).slice(0, 3).map((amenity, index) => (
                          <div key={index} className="bg-gray-100 rounded px-2 py-1 text-xs font-medium text-gray-700">
                            {amenity}
                          </div>
                        ))}
                      </div>
                      {(v.amenities || []).length > 3 && (
                        <button
                          onClick={() => openAmenitiesModal(v.amenities || [])}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          +{(v.amenities || []).length - 3} more amenities
                        </button>
                      )}
                    </div>

                    {/* Seating Column */}
                    <div>
                      <div className="text-[10px] text-gray-600 font-medium mb-1">Available Seating Arrangements:</div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(v.seatingArrangements || v.seating_arrangements || []).map((seating, index) => (
                          <div key={index} title={`${seating.type}${seating.capacity ? ` (Capacity: ${seating.capacity})` : ''}`} className="bg-gray-100 rounded px-2 py-1 text-xs font-medium text-gray-700">
                            {renderSeatingIcon(seating.icon)}
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <label className="text-[10px] text-gray-600">Select seating:</label>
                        <select
                          value={getSelectedSeating(v.id).type}
                          onChange={(e) => setSeatingForVenue(v.id, e.target.value)}
                          className="border rounded px-2 py-1 text-[11px] text-gray-800"
                        >
                          {(v.seatingArrangements || v.seating_arrangements || []).length > 0 ? (
                            (v.seatingArrangements || v.seating_arrangements || []).map((seating, idx) => (
                              <option key={idx} value={seating.type}>
                                {seating.type}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="theater">Theater</option>
                              <option value="classroom">Classroom</option>
                              <option value="round">Circular</option>
                              <option value="rectangular">Rectangular</option>
                            </>
                          )}
                        </select>
                        <div className="flex items-center gap-1 text-[11px] text-gray-700">
                          <span className="text-gray-500">Selected:</span>
                          {renderSeatingIcon(getSelectedSeating(v.id).icon)}
                          <span className="capitalize">{getSelectedSeating(v.id).type}</span>
                        </div>
                      </div>
                    </div>

                {/* Halls (if any) */}
                {!v.__hall && v.halls && v.halls.length > 0 && (
                  <div className="mt-2 text-xs">
                    <div className="text-[10px] text-gray-600 font-medium mb-1">Halls:</div>
                    <div className="flex flex-wrap gap-1">
                      {v.halls.map((hall, idx) => (
                        <div key={idx} className="bg-purple-50 rounded px-2 py-1 font-medium text-purple-800 border border-purple-200">
                          {hall.name || 'Hall'}
                          {(hall.capacity || hall.price) && (
                            <span className="text-purple-700"> {`(`}
                              {hall.capacity ? `${hall.capacity} pax` : ''}
                              {hall.capacity && hall.price ? ' • ' : ''}
                              {hall.price ? `${hall.price} / Pax` : ''}
                            {`)`}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  </div>
                </div>

                
                {/* Price & Actions */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2">
                  <div className="text-xl text-black"> {getDisplayPricePerPax(v)} / Pax</div>
                  <div className="text-xs text-gray-600">Inclusive of food</div>
                  
                  <button
                        onClick={() => {
                          if (!authUser) {
                            // User not authenticated, redirect to login
                            navigate('/login')
                          } else {
                            navigate(`/venue/${encodeURIComponent(city)}/${v.id}`
                            )
                          }
                        }}
                        className="text-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Select
                      </button>
                </div>
                  </div>
                </div>
              ))}
            </div>

          {expandedVenues.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold">
                  {expandedVenues.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, expandedVenues.length)}
                </span>{' '}
                of <span className="font-semibold">{expandedVenues.length}</span> venues
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
          )}

            {/* Empty State - Only show when not loading */}
            {!loadingVenues && (filteredVenues.length === 0 || isBelowMinPax) && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {isBelowMinPax
                    ? 'Unfortunately we do not have any venue that accept less than mentioned pax'
                    : venues.length === 0
                      ? 'Venues from this city is not listed please search for other list'
                      : searchLocation || location
                        ? `Venue in this area is not available`
                        : 'No venues match your current filters.'}
                </p>
                {/* Only show Clear Filters button if there are venues but filters are applied */}
                {venues.length > 0 && filteredVenues.length === 0 && !isBelowMinPax && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
        </main>
          </div>
    </div>

      {/* Amenities Modal */}
      {showAmenitiesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">All Amenities</h3>
              <button
                onClick={() => setShowAmenitiesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selectedVenueAmenities.map((amenity, index) => (
                <div key={index} className="bg-gray-100 rounded px-3 py-2 text-sm font-medium text-gray-700">
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Seating Arrangements Modal */}
      {showSeatingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Seating Arrangements</h3>
              <button
                onClick={() => setShowSeatingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {selectedVenueSeating.map((seating, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {renderSeatingIcon(seating.icon)}
                    <div>
                      <div className="font-medium text-gray-800">{seating.type}</div>
                      <div className="text-sm text-gray-600">Capacity: {seating.capacity} people</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin modals removed */}
    </div>
  )
}

export default ListofVenues


