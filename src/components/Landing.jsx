import React, { useMemo, useState, useEffect } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { TiTick, TiTimes } from 'react-icons/ti'
import { FaCarAlt, FaMotorcycle, FaStar, FaMapMarkerAlt, FaParking, FaBed, FaPlus, FaTrash, FaUserPlus, FaBuilding, FaCogs, FaBox } from 'react-icons/fa'
import { MdPeopleAlt } from 'react-icons/md'
import axios from 'axios'
import Blogs from './Blogs'
import CarouselVenueLanding from './CarouselVenueLanding'
import CarouselServicesLanding from './CarouselServicesLanding'
import { useSelector } from 'react-redux'

const Landing = () => {
  const selectedCity = useSelector((state) => state.city.selectedCity)
  // Carousel state for venue images
  const [currentVenueImage, setCurrentVenueImage] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const venueImages = [
    'https://images.unsplash.com/photo-1542665952-14513db15293?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    'https://plus.unsplash.com/premium_photo-1681841713733-7b5d6cb95137?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1462826303086-329426d1aef5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568530873454-e4103a0b3c71?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop'
  ]

  // Carousel state for services images
  const [currentServiceImage, setCurrentServiceImage] = useState(0)
  const [isServiceCarouselPaused, setIsServiceCarouselPaused] = useState(false)
  const serviceImages = [
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1747270318402-d0265f822979?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1677677402907-05f2883e3f66?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop'
  ]

  // Auto-rotate venue carousel every 5 seconds
  useEffect(() => {
    if (isCarouselPaused) return

    const interval = setInterval(() => {
      setCurrentVenueImage((prev) => (prev + 1) % venueImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isCarouselPaused, venueImages.length])

  // Auto-rotate services carousel every 5 seconds
  useEffect(() => {
    if (isServiceCarouselPaused) return

    const interval = setInterval(() => {
      setCurrentServiceImage((prev) => (prev + 1) % serviceImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isServiceCarouselPaused, serviceImages.length])

  // Function to handle manual navigation and reset timer for venue
  const handleVenueImageChange = (newIndex) => {
    setCurrentVenueImage(newIndex)
  }

  // Function to handle manual navigation and reset timer for services
  const handleServiceImageChange = (newIndex) => {
    setCurrentServiceImage(newIndex)
  }

  const FeaturedCard = ({ venue }) => {
    const [index, setIndex] = useState(0)
    const total = venue.photos.length
    const goPrev = () => setIndex((i) => (i - 1 + total) % total)
    const goNext = () => setIndex((i) => (i + 1) % total)
    return (
      <div className="bg-white rounded-2xl shadow-md ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-56">
          <img src={venue.photos[index]} alt={`${venue.name} photo ${index + 1}`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur px-2.5 py-1 text-sm font-semibold text-green-700 shadow ring-1 ring-black/5">
            <FaStar className="text-green-600" /> {venue.rating || '4.5'}
          </div>
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {venue.photos.map((_, i) => (
              <span key={i} className={`h-1.5 w-6 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <button type="button" aria-label="Previous" onClick={goPrev} className="h-8 w-8 rounded-full bg-black/45 text-white grid place-items-center hover:bg-black/60">‹</button>
            <button type="button" aria-label="Next" onClick={goNext} className="h-8 w-8 rounded-full bg-black/45 text-white grid place-items-center hover:bg-black/60">›</button>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{venue.name}</h3>
              <div className="mt-1 flex items-center gap-2 text-gray-600 text-sm">
                <FaMapMarkerAlt />
                <span>{venue.address}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Starting from</p>
              <p className="text-2xl font-extrabold text-gray-900">₹{venue.price.toLocaleString()}/pax</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">Per Plate | Veg & Non-veg</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-700 bg-gray-50 ring-1 ring-gray-200">
              <MdPeopleAlt /> {venue.paxCapacity}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-700 bg-gray-50 ring-1 ring-gray-200">
              <FaBed /> {venue.rooms} rooms
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-700 bg-gray-50 ring-1 ring-gray-200">
              <FaParking /> {venue.parking.cars} parking
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className={`rounded-md border px-3 py-2 text-center text-xs font-medium flex items-center justify-center gap-1 ring-1 ${venue.externalDecorationAllowed ? 'bg-green-50 text-green-700 border-green-200 ring-green-200/70' : 'bg-red-50 text-red-700 border-red-200 ring-red-200/70'}`}>
              {venue.externalDecorationAllowed ? <TiTick className="text-green-600" /> : <TiTimes className="text-red-600" />}
              <span>External Decor {venue.externalDecorationAllowed ? 'Allowed' : 'Not Allowed'}</span>
            </div>
            <div className={`rounded-md border px-3 py-2 text-center text-xs font-medium flex items-center justify-center gap-1 ring-1 ${venue.externalCatererAllowed ? 'bg-green-50 text-green-700 border-green-200 ring-green-200/70' : 'bg-red-50 text-red-700 border-red-200 ring-red-200/70'}`}>
              {venue.externalCatererAllowed ? <TiTick className="text-green-600" /> : <TiTimes className="text-red-600" />}
              <span>External Caterers {venue.externalCatererAllowed ? 'Allowed' : 'Not Allowed'}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link to={`/venues/${encodeURIComponent(venue.city)}?name=${encodeURIComponent(venue.name)}`} className="flex-1 text-center rounded-lg bg-red-600 px-5 py-2.5 text-white font-semibold hover:bg-red-700">Check availability</Link>
            <Link to={`/venues/${encodeURIComponent(venue.city)}?name=${encodeURIComponent(venue.name)}`} className="flex-1 text-center rounded-lg border-2 border-gray-200 px-5 py-2.5 text-gray-900 font-semibold hover:border-gray-300">View contact</Link>
        </div>
      </div>

    </div>
  )
}
  const [showTalkModal, setShowTalkModal] = useState(false)
  const [talkForm, setTalkForm] = useState({ firstName: '', middleName: '', lastName: '', email: '', password: '', confirmPassword: '', mobile: '', gender: '', address: '', city: '' })
  const [formErrors, setFormErrors] = useState({})
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerMessage, setRegisterMessage] = useState({ type: null, text: '' }) // 'success' or 'error'
  // Registration checkboxes state (local UI only, not sent to API)
  const [registrationCheckboxes, setRegistrationCheckboxes] = useState({
    venue: false,
    services: false,
    props: false,
    featured: false
  })
  const updateTalkForm = (key, val) => {
    setTalkForm(prev => ({ ...prev, [key]: val }))
    // Clear error for this field when user types
    if (formErrors[key]) {
      setFormErrors(prev => ({ ...prev, [key]: '' }))
    }
    // Clear success/error message when user types
    if (registerMessage.type) {
      setRegisterMessage({ type: null, text: '' })
    }
  }
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const navigate = useNavigate()
  // Venue type management state
  const [venueTypes, setVenueTypes] = useState(() => {
    try {
      const savedVenueTypes = localStorage.getItem('venueTypes')
      if (savedVenueTypes) {
        return JSON.parse(savedVenueTypes)
      }
    } catch (error) {
      console.error('Error loading venue types from localStorage:', error)
    }
    
    // Default venue types
    return [
      'Auditorium', 'Resort', 'Wedding Hall','Hotel', 'Community Hall', 'Conference Hall', 'Farmhouse', 'Restaurant',
    ]
  })
  const [showAddVenueTypeModal, setShowAddVenueTypeModal] = useState(false)
  const [newVenueType, setNewVenueType] = useState('')
  const [showVenueTypeManagementModal, setShowVenueTypeManagementModal] = useState(false)
  // Authentication state
  const [authUser, setAuthUser] = useState(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // Section visibility state
  const [enabledSections, setEnabledSections] = useState(() => {
    try {
      const savedSections = localStorage.getItem('enabledSections')
      if (savedSections) {
        return JSON.parse(savedSections)
      }
    } catch (error) {
      console.error('Error loading enabled sections from localStorage:', error)
    }
    // Default: all sections enabled
    return {
      venues: true,
      services: true,
      resources: true
    }
  })

  // Occasion management state
  const [occasionTypes, setOccasionTypes] = useState(() => {
    try {
      const savedOccasionTypes = localStorage.getItem('occasionTypes')
      if (savedOccasionTypes) {
        return JSON.parse(savedOccasionTypes)
      }
    } catch (error) {
      console.error('Error loading occasion types from localStorage:', error)
    }
    
    // Default occasion types
    return [
      'Religious Event', 'Social Event', 'Political Event', 'Business Event',
    ]
  })
  const [showAddOccasionModal, setShowAddOccasionModal] = useState(false)
  const [newOccasionType, setNewOccasionType] = useState('')
  const [showOccasionManagementModal, setShowOccasionManagementModal] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const raw = localStorage.getItem('authUser')
      const user = raw ? JSON.parse(raw) : null
      setAuthUser(user)
      setIsSuperAdmin(user?.user_type === 'MASTER_ADMIN')
    }

    checkAuthStatus()

    const handleAuthChange = () => checkAuthStatus()
    window.addEventListener('auth-changed', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  // Save venue types to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('venueTypes', JSON.stringify(venueTypes))
    } catch (error) {
      console.error('Error saving venue types to localStorage:', error)
    }
  }, [venueTypes])

  // Save occasion types to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('occasionTypes', JSON.stringify(occasionTypes))
    } catch (error) {
      console.error('Error saving occasion types to localStorage:', error)
    }
  }, [occasionTypes])

  // Add new venue type
  const handleAddVenueType = () => {
    if (newVenueType.trim() && !venueTypes.includes(newVenueType.trim())) {
      setVenueTypes(prev => [...prev, newVenueType.trim()])
      setNewVenueType('')
      setShowAddVenueTypeModal(false)
    }
  }

  // Delete venue type
  const handleDeleteVenueType = (venueType) => {
    if (window.confirm(`Are you sure you want to delete "${venueType}"?`)) {
      setVenueTypes(prev => prev.filter(type => type !== venueType))
    }
  }

  // Add new occasion type
  const handleAddOccasionType = () => {
    if (newOccasionType.trim() && !occasionTypes.includes(newOccasionType.trim())) {
      setOccasionTypes(prev => [...prev, newOccasionType.trim()])
      setNewOccasionType('')
      setShowAddOccasionModal(false)
    }
  }

  // Delete occasion type
  const handleDeleteOccasionType = (occasionType) => {
    if (window.confirm(`Are you sure you want to delete "${occasionType}"?`)) {
      setOccasionTypes(prev => prev.filter(type => type !== occasionType))
    }
  }

  // Add new service type
  const handleAddServiceType = () => {
    if (newServiceType.trim() && !serviceTypes.includes(newServiceType.trim())) {
      setServiceTypes(prev => [...prev, newServiceType.trim()])
      setNewServiceType('')
      setShowAddServiceModal(false)
    }
  }

  // Delete service type
  const handleDeleteServiceType = (serviceType) => {
    if (window.confirm(`Are you sure you want to delete "${serviceType}"? This will also delete all its subcategories.`)) {
      setServiceTypes(prev => prev.filter(type => type !== serviceType))
      setServiceSubCategories(prev => {
        const updated = { ...prev }
        delete updated[serviceType]
        return updated
      })
    }
  }

  // Add new service subcategory
  const handleAddServiceSubCategory = () => {
    if (newServiceSubCategory.trim() && selectedServiceForSubCategory) {
      setServiceSubCategories(prev => ({
        ...prev,
        [selectedServiceForSubCategory]: [
          ...(prev[selectedServiceForSubCategory] || []),
          newServiceSubCategory.trim()
        ]
      }))
      setNewServiceSubCategory('')
      setSelectedServiceForSubCategory('')
      setShowAddServiceSubCategoryModal(false)
    }
  }

  // Delete service subcategory
  const handleDeleteServiceSubCategory = (serviceType, subCategory) => {
    if (window.confirm(`Are you sure you want to delete "${subCategory}"?`)) {
      setServiceSubCategories(prev => ({
        ...prev,
        [serviceType]: prev[serviceType].filter(sub => sub !== subCategory)
      }))
    }
  }

  // Add new resource type
  const handleAddResourceType = () => {
    if (newResourceType.trim() && !resourceTypes.includes(newResourceType.trim())) {
      setResourceTypes(prev => [...prev, newResourceType.trim()])
      setNewResourceType('')
      setShowAddResourceModal(false)
    }
  }

  // Delete resource type
  const handleDeleteResourceType = (resourceType) => {
    if (window.confirm(`Are you sure you want to delete "${resourceType}"? This will also delete all its subcategories.`)) {
      setResourceTypes(prev => prev.filter(type => type !== resourceType))
      setResourceSubCategories(prev => {
        const updated = { ...prev }
        delete updated[resourceType]
        return updated
      })
    }
  }

  // Add new resource subcategory
  const handleAddResourceSubCategory = () => {
    if (newResourceSubCategory.trim() && selectedResourceForSubCategory) {
      setResourceSubCategories(prev => ({
        ...prev,
        [selectedResourceForSubCategory]: [
          ...(prev[selectedResourceForSubCategory] || []),
          newResourceSubCategory.trim()
        ]
      }))
      setNewResourceSubCategory('')
      setSelectedResourceForSubCategory('')
      setShowAddResourceSubCategoryModal(false)
    }
  }

  // Delete resource subcategory
  const handleDeleteResourceSubCategory = (resourceType, subCategory) => {
    if (window.confirm(`Are you sure you want to delete "${subCategory}"?`)) {
      setResourceSubCategories(prev => ({
        ...prev,
        [resourceType]: prev[resourceType].filter(sub => sub !== subCategory)
      }))
    }
  }

  // Toggle section visibility
  const toggleSection = (section) => {
    setEnabledSections(prev => {
      const newSections = {
        ...prev,
        [section]: !prev[section]
      }
      
      // If current search type is being disabled, switch to first enabled section
      if (!newSections[section]) {
        const currentSearchType = searchType === 'venue' ? 'venues' : 
                                 searchType === 'service' ? 'services' : 'resources'
        
        if (currentSearchType === section) {
          // Current section is being disabled, switch to first available enabled section
          if (newSections.venues) {
            setSearchType('venue')
          } else if (newSections.services) {
            setSearchType('service')
          } else if (newSections.resources) {
            setSearchType('resources')
          }
        }
      }
      
      return newSections
    })
  }
  const paxRanges = useMemo(
    () => [
      'Up to 100', '100 - 200', '200 - 300', '300 - 500', '500+',
    ],
    []
  )
  // Service management state
  const [serviceTypes, setServiceTypes] = useState(() => {
    try {
      const savedServiceTypes = localStorage.getItem('serviceTypes')
      if (savedServiceTypes) {
        return JSON.parse(savedServiceTypes)
      }
    } catch (error) {
      console.error('Error loading service types from localStorage:', error)
    }
    
    // Default service types
    return [
      'Photography', 'Videography', 'Catering', 'Decoration', 'DJ & Music', 'Lighting', 'Transportation', 'Makeup & Styling', 'Event Planning', 'Security'
    ]
  })
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [newServiceType, setNewServiceType] = useState('')
  const [showServiceManagementModal, setShowServiceManagementModal] = useState(false)

  // Service subcategories management state
  const [serviceSubCategories, setServiceSubCategories] = useState(() => {
    try {
      const savedServiceSubCategories = localStorage.getItem('serviceSubCategories')
      if (savedServiceSubCategories) {
        return JSON.parse(savedServiceSubCategories)
      }
    } catch (error) {
      console.error('Error loading service subcategories from localStorage:', error)
    }
    
    // Default service subcategories
    return {
      'Photography': [
        'PhotoGraphy',
        'Album',
        'Industry Photography',
        'Drone Photography',
        'Event Photography'
      ],
      'Videography': [
        'Wedding Videography',
        'Corporate Videography',
        'Document/Film',
        'Commercial/Advertising'
      ],
      'Catering': [
        'Centralized Catering',
        'Onsite Catering',
        'Daily Requirement',
        'Corporate Catering',
        'Buffet/Full-Service'
      ],
      'Decoration': [
        'Event Decoration',
        'Festival Decoration',
        'Wedding Decoration',
        'Corporate Decoration',
        'Themed Decoration'
      ],
      'DJ & Music': [
        'Wedding DJ and Music',
        'Club/Party',
        'Corporate',
        'Festival/Concert',
        'Event-Specific'
      ],
      'Lighting': [
        'Stage Lighting',
        'Uplighting',
        'Laser-Lighting',
        'Wedding'
      ],
      'Transportation': [
        'Wedding Transportation',
        'Guest Pickup and Drop',
        'VIP/Luxury',
        'Event Logistics',
        'Shuttle Services'
      ],
      'Makeup & Styling': [
        'Bridal Makeup',
        'Groom Styling',
        'Party Makeup',
        'Fashion',
        'Corporate'
      ],
      'Event Planning': [
        'Wedding Planning',
        'Social-Event',
        'Festival and Cultural',
        'Destination/Event Travel'
      ],
      'Security': [
        'Event Security',
        'VIP/Celebrity',
        'Venue Security',
        'Surveillance and Monitoring',
        'Emergency and Safety Management'
      ]
    }
  })
  const [showAddServiceSubCategoryModal, setShowAddServiceSubCategoryModal] = useState(false)
  const [newServiceSubCategory, setNewServiceSubCategory] = useState('')
  const [selectedServiceForSubCategory, setSelectedServiceForSubCategory] = useState('')
  const [showServiceSubCategoryManagementModal, setShowServiceSubCategoryManagementModal] = useState(false)
  // Resource management state
  const [resourceTypes, setResourceTypes] = useState(() => {
    try {
      const savedResourceTypes = localStorage.getItem('resourceTypes')
      if (savedResourceTypes) {
        return JSON.parse(savedResourceTypes)
      }
    } catch (error) {
      console.error('Error loading resource types from localStorage:', error)
    }
    
    // Default resource types
    return [
      "Idol",
      "BackGround",
      "Arches / Pillars",
      "Lighting and Chandeliers",
      "Carpet",
      "Photo booth props & frames",
      "Chairs (plastic, cushioned, banquet)",
      "Dining tables / round tables",
      "DJ & sound system",
      "Electrical Apparatus",
      "Entertainment"
    ]
  })
  const [showAddResourceModal, setShowAddResourceModal] = useState(false)
  const [newResourceType, setNewResourceType] = useState('')
  const [showResourceManagementModal, setShowResourceManagementModal] = useState(false)

  // Resource subcategories management state
  const [resourceSubCategories, setResourceSubCategories] = useState(() => {
    try {
      const savedResourceSubCategories = localStorage.getItem('resourceSubCategories')
      if (savedResourceSubCategories) {
        return JSON.parse(savedResourceSubCategories)
      }
    } catch (error) {
      console.error('Error loading resource subcategories from localStorage:', error)
    }
    
    // Default resource subcategories
    return {
      "Idol": [
        "Ganesha",
        "Shiva", 
        "Venkateshwara",
        "Nandi"
      ],
      "BackGround": [
        "Floral backdrop",
        "Fabric draping",
        "LED backdrop", 
        "Themed backdrop",
        "Balloon backdrop"
      ],
      "Arches / Pillars": [
        "Balloon arch",
        "Balloon pillars",
        "Balloon ceiling décor",
        "Helium balloons",
        "Customized balloon art"
      ],
      "Lighting and Chandeliers": [
        "String lights",
        "LED spotlights",
        "Chandeliers",
        "Uplighting",
        "Laser lights"
      ],
      "Carpet": [
        "Red carpet walkway",
        "Custom printed carpet",
        "Flower-strewn walkway",
        "LED-lit walkway"
      ],
      "Photo booth props & frames": [
        "Customized frames",
        "Funky props",
        "Theme-based props",
        "LED photo booth"
      ],
      "Chairs (plastic, cushioned, banquet)": [
        "Plastic chairs",
        "Cushioned chairs",
        "Banquet chairs",
        "Lounge chairs",
        "Single sofa chair",
        "Double seater",
        "Royal-style sofa",
        "Lounge sofa"
      ],
      "Dining tables / round tables": [
        "Round dining table",
        "Rectangular dining table",
        "Buffet table",
        "Folding dining table",
        "Standing cocktail table",
        "Bar table",
        "LED cocktail table"
      ],
      "DJ & sound system": [
        "DJ console",
        "Turntable setup",
        "Mixing equipment",
        "DJ lights",
        "Wireless microphones",
        "Corded microphones",
        "Surround sound speakers",
        "Bass speakers"
      ],
      "Electrical Apparatus": [
        "Pedestal fans",
        "Desert coolers",
        "Portable heaters",
        "Ceiling fans",
        "Split portable AC",
        "Tower AC",
        "Outdoor cooling units",
        "Diesel generator",
        "Silent generator",
        "Portable backup unit"
      ],
      "Entertainment": [
        "Magic props kit",
        "Clown wigs",
        "Funny costumes",
        "Face paint setup",
        "Round cake table",
        "LED-lit cake table",
        "Themed cake stand",
        "Birthday hats",
        "Eye masks",
        "Party goggles",
        "Handheld props",
        "Mickey Mouse cutout",
        "Superhero standees",
        "Princess cutouts",
        "Seasonal characters"
      ]
    }
  })
  const [showAddResourceSubCategoryModal, setShowAddResourceSubCategoryModal] = useState(false)
  const [newResourceSubCategory, setNewResourceSubCategory] = useState('')
  const [selectedResourceForSubCategory, setSelectedResourceForSubCategory] = useState('')
  const [showResourceSubCategoryManagementModal, setShowResourceSubCategoryManagementModal] = useState(false)

  // Save service types to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('serviceTypes', JSON.stringify(serviceTypes))
    } catch (error) {
      console.error('Error saving service types to localStorage:', error)
    }
  }, [serviceTypes])

  // Save service subcategories to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('serviceSubCategories', JSON.stringify(serviceSubCategories))
    } catch (error) {
      console.error('Error saving service subcategories to localStorage:', error)
    }
  }, [serviceSubCategories])

  // Save resource types to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('resourceTypes', JSON.stringify(resourceTypes))
    } catch (error) {
      console.error('Error saving resource types to localStorage:', error)
    }
  }, [resourceTypes])

  // Save resource subcategories to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('resourceSubCategories', JSON.stringify(resourceSubCategories))
    } catch (error) {
      console.error('Error saving resource subcategories to localStorage:', error)
    }
  }, [resourceSubCategories])

  // Save enabled sections to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('enabledSections', JSON.stringify(enabledSections))
    } catch (error) {
      console.error('Error saving enabled sections to localStorage:', error)
    }
  }, [enabledSections])

  const [selectedType, setSelectedType] = useState('')
  const [selectedOccasion, setSelectedOccasion] = useState('')
  const [selectedPax, setSelectedPax] = useState('')
  const [searchType, setSearchType] = useState('venue') // 'venue' or 'service' or 'resources'
  // Resources state
  const [selectedResourceType, setSelectedResourceType] = useState('')
  const [selectedResourceSubCategory, setSelectedResourceSubCategory] = useState('')
  const [resourceMode, setResourceMode] = useState('rent') // 'rent' | 'sell'
  // Service state
  const [selectedServiceSubCategory, setSelectedServiceSubCategory] = useState('')
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  // Modal state
  const [showCityModal, setShowCityModal] = useState(false)

  // Reset subcategory when main category changes
  useEffect(() => {
    setSelectedServiceSubCategory('')
  }, [selectedType])

  useEffect(() => {
    setSelectedResourceSubCategory('')
  }, [selectedResourceType])

  const featuredVenues = useMemo(
    () => [
      {
        name: 'Grand Orchid Banquets',
        city: 'Mumbai',
        address: 'Andheri East, Mumbai, Maharashtra',
        paxCapacity: '200 - 300',
        rooms: 12,
        parking: { cars: 50, bikes: 120 },
        price: 450,
        externalDecorationAllowed: true,
        externalCatererAllowed: false,
        photos: [
          'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop'
        ]
      },
      {
        name: 'Lotus Garden Lawn',
        city: 'Delhi',
        address: 'Dwarka Sector 21, New Delhi',
        paxCapacity: '300 - 500',
        rooms: 20,
        parking: { cars: 100, bikes: 200 },
        price: 600,
        externalDecorationAllowed: false,
        externalCatererAllowed: true,
        photos: [
           'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop'
        ]
      },
      {
        name: 'Taj West End',
        city: 'Delhi',
        address: 'Dwarka Sector 21, New Delhi',
        paxCapacity: '300 - 500',
        rooms: 20,
        parking: { cars: 100, bikes: 200 },
        price: 600,
        externalDecorationAllowed: true,
        externalCatererAllowed: true,
        photos: [
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop'
        ]
      }
    ],
    []
  )

  const onSubmit = (e) => {
    e.preventDefault()
    if (selectedCity === 'Select City'){
      setShowCityModal(true)
    } else {
    const params = new URLSearchParams()
    if (selectedType) params.set('type', selectedType)
    if (selectedOccasion) params.set('occasion', selectedOccasion)
    if (selectedPax) params.set('pax', selectedPax)
    if (selectedServiceSubCategory) params.set('subCategory', selectedServiceSubCategory)
    const query = params.toString()
    
    if (searchType === 'venue') {
      const cityPath = selectedCity !== 'Select City' ? `/${encodeURIComponent(selectedCity)}` : ''
      const url = `/venues${cityPath}${query ? `?${query}` : ''}`
      navigate(url)
    } else if (searchType === 'service') {
      const paramsService = new URLSearchParams()
      if (selectedType) paramsService.set('type', selectedType)
      const queryService = paramsService.toString()
      const cityPath = selectedCity !== 'Select City' ? `/${encodeURIComponent(selectedCity)}` : ''
      const url = `/services${cityPath}${queryService ? `?${queryService}` : ''}`
      navigate(url)
    } else {
      const paramsResources = new URLSearchParams()
      if (selectedResourceType) paramsResources.set('resourceType', selectedResourceType)
      paramsResources.set('mode', resourceMode)
      const queryResources = paramsResources.toString()
      const url = `/resources${queryResources ? `?${queryResources}` : ''}`
      navigate(url)
}
  }
  }

  const handleRegister = async () => {
    // Reset errors and messages
    setFormErrors({})
    setRegisterMessage({ type: null, text: '' })
    setIsRegistering(true)
    
    const errors = {}
    let hasErrors = false

    // Validation
    if (!talkForm.firstName || !talkForm.firstName.trim()) {
      errors.firstName = 'First name is required'
      hasErrors = true
    }
    if (!talkForm.lastName || !talkForm.lastName.trim()) {
      errors.lastName = 'Last name is required'
      hasErrors = true
    }
    if (!talkForm.email || !talkForm.email.trim()) {
      errors.email = 'Email is required'
      hasErrors = true
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(talkForm.email)) {
        errors.email = 'Please enter a valid email address'
        hasErrors = true
      }
    }
    if (!talkForm.password || !talkForm.password.trim()) {
      errors.password = 'Password is required'
      hasErrors = true
    } else if (talkForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
      hasErrors = true
    }
    if (talkForm.password !== talkForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      hasErrors = true
    }
    if (!talkForm.mobile || !talkForm.mobile.trim()) {
      errors.mobile = 'Mobile number is required'
      hasErrors = true
    } else {
      // Mobile number validation (basic - 10 digits)
      const mobileRegex = /^[0-9]{10}$/
      if (!mobileRegex.test(talkForm.mobile.replace(/\D/g, ''))) {
        errors.mobile = 'Please enter a valid 10-digit mobile number'
        hasErrors = true
      }
    }

    if (hasErrors) {
      setFormErrors(errors)
      setIsRegistering(false)
      return
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASEURL}/accounts/register/owner/`, {
        first_name: talkForm.firstName.trim(),
        middle_name: talkForm.middleName?.trim() || '',
        last_name: talkForm.lastName.trim(),
        email: talkForm.email.trim(),
        password: talkForm.password,
        confirm_password: talkForm.confirmPassword,
        mobile_number: talkForm.mobile.trim(),
        gender: talkForm.gender,
        address: talkForm.address.trim(),
        city: talkForm.city.trim()
      })
      
      // Show success message
      setRegisterMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' })
      setIsRegistering(false)
      
      // Clear form
      setTalkForm({ firstName: '', middleName: '', lastName: '', email: '', password: '', confirmPassword: '', mobile: '', gender: '', address: '', city: '' })
      setFormErrors({})
      // Reset checkboxes
      setRegistrationCheckboxes({ venue: false, services: false, props: false, featured: false })
      
      // Close modal and redirect after 2 seconds
      setTimeout(() => {
        setShowTalkModal(false)
        navigate('/login')
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error response:', error.response)
      setIsRegistering(false)
      
      let errorMessage = 'Registration failed. Please try again.'
      if (error.response) {
        console.error('Error response data:', error.response.data)
        errorMessage = error.response.data?.message || error.response.data?.detail || errorMessage
        
        // Try to map API errors to specific fields
        if (error.response.data) {
          const apiErrors = {}
          if (error.response.data.email) {
            apiErrors.email = Array.isArray(error.response.data.email) ? error.response.data.email[0] : error.response.data.email
          }
          if (error.response.data.mobile_number || error.response.data.mobile) {
            const mobileError = error.response.data.mobile_number || error.response.data.mobile
            apiErrors.mobile = Array.isArray(mobileError) ? mobileError[0] : mobileError
          }
          if (error.response.data.password) {
            apiErrors.password = Array.isArray(error.response.data.password) ? error.response.data.password[0] : error.response.data.password
          }
          if (Object.keys(apiErrors).length > 0) {
            setFormErrors(apiErrors)
            return
          }
        }
      } else {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
      // Show error message in modal
      setRegisterMessage({ type: 'error', text: errorMessage })
    }
  }
  const handleCategorySearch = () => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      alert('Please enter a term to search.')
      return
    }

    const normalizeFind = (list) => {
      return (
        list.find((item) => item.toLowerCase() === query) ||
        list.find((item) => item.toLowerCase().includes(query))
      )
    }

    let foundCategory = null

    if (searchType === 'venue') {
      foundCategory = normalizeFind(venueTypes)
      if (foundCategory) {
        setSelectedType(foundCategory)
        setSearchQuery('')
        return
      }
    } else if (searchType === 'service') {
      foundCategory = normalizeFind(serviceTypes)
      if (foundCategory) {
        setSelectedType(foundCategory)
        setSearchQuery('')
        return
      }
    } else if (searchType === 'resources') {
      foundCategory = normalizeFind(resourceTypes)
      if (foundCategory) {
        setSelectedResourceType(foundCategory)
        setSearchQuery('')
        return
      }
    }

    alert('No matching categories found. Please try another term.')
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-r from-gray-300 via-purple-200 to-pink-200">
      <section className="w-full py-12 md:py-10">
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Decorative background blobs */}
          <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-200/40 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-purple-200/40 blur-3xl"></div>
          
          {/* Main container */}
          <div className="rounded-2xl p-2 bg-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[540px]">
              {/* Left column with two stacked sections */}
              <div className="col-span-2 flex flex-col gap-2">
                {/* Super Admin Section - replaces Venue and Services cards when super admin is logged in */}
                {isSuperAdmin ? (
                  <div className="flex-1 rounded-xl p-[1px] bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10">
                    <div className="rounded-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 h-full px-6 py-6 transition-all hover:shadow-3xl hover:-translate-y-1">
                      <div className="flex flex-col items-center gap-6 h-full">
                        {/* Super-Admin Header */}
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
                            <FaCogs className="text-white text-2xl" />
                          </div>
                          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                              Master Admin
                            </span>
                          </h1>
                          <p className="mt-3 text-base md:text-lg text-gray-600 font-medium">
                            Platform Management Dashboard
                          </p>
                        </div>

                        {/* Admin Options Grid */}
                        <div className="w-full max-w-lg space-y-4">
                          {/* First Row - 3 items */}
                          <div className="grid grid-cols-3 gap-3">
                            <Link
                              to="/admin/subscriptions"
                              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                              <div className="p-3 text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                                  <FaUserPlus className="text-white text-sm" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-800 group-hover:text-blue-700 transition-colors leading-tight">
                                  Add/Edit Subscriptions
                                </h3>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300"></div>
                            </Link>

                            <button
                              onClick={() => {
                                if (isSuperAdmin) {
                                  navigate('/dashboard?section=venues')
                                } else {
                                  if (selectedCity === 'Select City') {
                                    setShowCityModal(true)
                                  } else {
                                    navigate(`/venues/${encodeURIComponent(selectedCity)}`)
                                  }
                                }
                              }}
                              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                              <div className="p-3 text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                                  <FaBuilding className="text-white text-sm" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-800 group-hover:text-green-700 transition-colors leading-tight">
                                  Add/Edit Venues
                                </h3>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-all duration-300"></div>
                            </button>

                            <button
                              onClick={() => {
                                if (isSuperAdmin) {
                                  navigate('/dashboard?section=services')
                                } else {
                                  if (selectedCity === 'Select City') {
                                    setShowCityModal(true)
                                  } else {
                                    navigate(`/services/${encodeURIComponent(selectedCity)}`)
                                  }
                                }
                              }}
                              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                              <div className="p-3 text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                                  <FaCogs className="text-white text-sm" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-800 group-hover:text-orange-700 transition-colors leading-tight">
                                  Add/Edit Services
                                </h3>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-300"></div>
                            </button>
                          </div>

                          {/* Second Row - 2 items */}
                          <div className="grid grid-cols-2 gap-4">
                            {isSuperAdmin ? (
                              <button
                                onClick={() => navigate('/dashboard?section=resources')}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                              >
                                <div className="p-4 text-center">
                                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <FaBox className="text-white text-lg" />
                                  </div>
                                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                                    Add/Edit Resources
                                  </h3>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all duration-300"></div>
                              </button>
                            ) : (
                              <Link
                                to="/resources"
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                              >
                                <div className="p-4 text-center">
                                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <FaBox className="text-white text-lg" />
                                  </div>
                                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                                    Add/Edit Resources
                                  </h3>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all duration-300"></div>
                              </Link>
                            )}

                            {/* Add Persona Section - Master Admin Only */}
                            <Link to="/admin/add-persona">
                            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                              <div className="p-4 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors mb-2">
                                  Add Persona
                                </h3>
                                
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 group-hover:from-indigo-500/5 group-hover:to-indigo-500/10 transition-all duration-300"></div>
                            </div>
                            </Link>
                            
                          </div>
                        </div>

                        {/* Footer Text */}
                        <div className="mt-auto text-center">
                          <p className="text-xs text-gray-500 font-medium">
                            Manage your platform with administrative controls
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Top section - Venue card */}
                    <div className="flex-1 rounded-xl p-[1px] bg-gradient-to-r from-pink-400/5 via-fuchsia-400/5 to-purple-400/5">
                      <div className="rounded-xl bg-white/40 backdrop-blur shadow-xl ring-1 ring-gray-200 h-64 px-5 py-4 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex flex-col items-center gap-4 h-full">

                          {/* Title + Description */}
                          <a href="/" className="flex flex-col justify-between text-center">
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight whitespace-nowrap">
                              <span className="inline">Find Your Perfect </span>
                              <span className="inline bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent w-fit">
                                Venue
                              </span>
                            </h1>
                            <p className="mt-2 text-sm md:text-base text-gray-600">
                              Discover amazing party halls for weddings, birthdays, corporate events, and celebrations.
                            </p>
                          </a>

                          {/* "View All" + Carousel */}
                          <div className="w-full">
                            <div className="flex justify-between items-center mb-2">
                              <h2 className="text-sm font-semibold text-gray-800">Venues</h2>
                              <button
                                onClick={() => {
                                  if (selectedCity === 'Select City') {
                                    setShowCityModal(true)
                                  } else {
                                    navigate(`/venues/${encodeURIComponent(selectedCity)}`)
                                  }
                                }}
                                className="text-xs font-medium text-purple-600 hover:text-purple-800 transition"
                              >
                                View All →
                              </button>
                            </div>

                            <div className="w-full h-[72px] md:h-[120px] rounded-lg overflow-hidden relative">
                              <CarouselVenueLanding />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Bottom section - Services card */}
                    <div className="flex-1 rounded-xl p-[1px] bg-gradient-to-r from-pink-400/5 via-fuchsia-400/5 to-purple-400/5">
                      <div className="rounded-xl bg-white/40 backdrop-blur shadow-xl ring-1 ring-gray-200 h-64 px-5 py-4 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex flex-col items-center gap-2 h-full">

                          {/* Title + Description */}
                          <a href='/services' className="flex flex-col justify-between text-center">
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight whitespace-nowrap">
                              <span className="inline">Explore Our </span>
                              <span className="inline bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent w-fit">
                                Services
                              </span>
                            </h1>
                            <p className="mt-2 text-sm md:text-base text-gray-600">
                              Our Service and your Happiness is one appointment away. Click now to Book!
                            </p>
                          </a>

                          {/* "View All" + Carousel */}
                          <div className="w-full">
                            <div className="flex justify-between items-center mb-2">
                              <h2 className="text-sm font-semibold text-gray-800">Services</h2>
                              <button
                                onClick={() => {
                                  if (selectedCity === 'Select City') {
                                    setShowCityModal(true)
                                  } else {
                                    navigate(`/services/${encodeURIComponent(selectedCity)}`)
                                  }
                                }}
                                className="text-xs font-medium text-purple-600 hover:text-purple-800 transition"
                              >
                                View All →
                              </button>
                            </div>

                            <div className="w-full h-[72px] md:h-[120px] rounded-lg overflow-hidden relative">
                              <CarouselServicesLanding />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Right column - Search section */}
              <div className="col-span-1">
                <div className="rounded-xl p-[1px] bg-gradient-to-r from-pink-400/5 via-fuchsia-400/5 to-purple-400/5 h-full">
                  <div className="rounded-xl bg-white/40 backdrop-blur shadow-xl ring-1 ring-gray-200 h-full px-4 py-4 transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
                    <div className="h-full flex flex-col">
                      
                      {/* Admin Controls */}
                      {isSuperAdmin && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200 flex-shrink-0">
                          <div className="mb-2 flex flex-row justify-between gap-1">
                            <h3 className="text-xs font-semibold text-blue-900">Admin Controls</h3>
                            <span className="text-xs text-blue-700">Enable/Disable Sections</span>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <button
                              type="button"
                              onClick={() => toggleSection('venues')}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                enabledSections.venues
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {enabledSections.venues ? '✓ Venues' : '✗ Venues'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSection('services')}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                enabledSections.services
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {enabledSections.services ? '✓ Services' : '✗ Services'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSection('resources')}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                enabledSections.resources
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {enabledSections.resources ? '✓ Resources' : '✗ Resources'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Toggle buttons - only show enabled sections */}
                      {Object.values(enabledSections).some(enabled => enabled) && (
                        <div className="flex mb-2 bg-gray-100 rounded-lg p-1 flex-shrink-0">
                          {enabledSections.venues && (
                            <button
                              type="button"
                              onClick={() => setSearchType('venue')}
                              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                searchType === 'venue'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              Venues
                            </button>
                          )}
                          {enabledSections.services && (
                            <button
                              type="button"
                              onClick={() => setSearchType('service')}
                              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                searchType === 'service'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              Services
                            </button>
                          )}
                          {enabledSections.resources && (
                            <button
                              type="button"
                              onClick={() => setSearchType('resources')}
                              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                searchType === 'resources'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              Resources
                            </button>
                          )}
                        </div>
                      )}

                      {/* Only show search form if at least one section is enabled */}
                      {Object.values(enabledSections).some(enabled => enabled) && (
                        <div className="flex-1 flex flex-col min-h-0">
                          {/* <h2 className="text-sm font-bold text-gray-900 mb-2 text-center flex-shrink-0">
                            Search {searchType === 'venue' ? 'Venues' : searchType === 'service' ? 'Services' : 'Resources'}
                          </h2> */}

                          {/* Search Section */}
                          {/* <div className="mb-2 flex-shrink-0">
                            <div className="flex gap-1">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleCategorySearch()
                                  }
                                }}
                                className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs"
                              />
                              <button
                                type="button"
                                onClick={handleCategorySearch}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-xs font-medium"
                              >
                                Search
                              </button>
                            </div>
                          </div> */}

                          {/* Choose Section */}
                          <h2 className="text-sm font-bold text-gray-900 text-center flex-shrink-0">
                            Choose {searchType === 'venue' ? 'Venues' : searchType === 'service' ? 'Services' : 'Resources'}
                          </h2>
                          <div className="flex-1 min-h-0">
                            <div className="rounded border border-gray-300 bg-gray-50 p-2 h-full overflow-y-auto">
                              <form onSubmit={onSubmit} className="space-y-1.5">

                      {/* Only show form content if current search type is enabled */}
                      {enabledSections[searchType === 'venue' ? 'venues' : searchType === 'service' ? 'services' : 'resources'] && (
                        <>

                      {searchType !== 'resources' && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor="landing-type" className="block text-xs font-medium text-gray-700">
                              {searchType === 'venue' ? 'Venue Type' : 'Service Category'}
                            </label>
                            {isSuperAdmin && searchType === 'venue' && (
                              <button
                                type="button"
                                onClick={() => setShowAddVenueTypeModal(true)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                title="Add new venue type"
                              >
                                <FaPlus className="w-3 h-3" />
                                Add
                              </button>
                            )}
                            {isSuperAdmin && searchType === 'service' && (
                              <button
                                type="button"
                                onClick={() => setShowAddServiceModal(true)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                title="Add new service type"
                              >
                                <FaPlus className="w-3 h-3" />
                                Add
                              </button>
                            )}
                          </div>
                          <select
                            id="landing-type"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none cursor-pointer text-sm"
                            style={{ 
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.2em 1.2em',
                              paddingRight: '2rem'
                            }}
                          >
                            <option value="" className="text-gray-900">Select type</option>
                            {(searchType === 'venue' ? venueTypes : serviceTypes).map((t) => (
                              <option key={t} value={t} className="text-gray-900 py-2">{t}</option>
                            ))}
                          </select>
                          {isSuperAdmin && searchType === 'venue' && (
                            <div className="mt-1 w-full">
                              <div className="flex flex-wrap gap-1 w-full items-center">
                                {venueTypes.slice(0, 2).map((venueType) => (
                                  <div key={venueType} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs flex-1 min-w-0 max-w-[calc(40%-0.25rem)]">
                                    <span className="text-gray-700 truncate flex-1">{venueType}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVenueType(venueType)}
                                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-1"
                                      title="Delete venue type"
                                    >
                                      <FaTrash className="w-2 h-2" />
                                    </button>
                                  </div>
                                ))}
                                {venueTypes.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => setShowVenueTypeManagementModal(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                                  >
                                    +{venueTypes.length - 2} more...
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                          {isSuperAdmin && searchType === 'service' && (
                            <div className="mt-1 w-full">
                              <div className="flex flex-wrap gap-1 w-full items-center">
                                {serviceTypes.slice(0, 2).map((serviceType) => (
                                  <div key={serviceType} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs flex-1 min-w-0 max-w-[calc(40%-0.25rem)]">
                                    <span className="text-gray-700 truncate flex-1">{serviceType}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteServiceType(serviceType)}
                                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-1"
                                      title="Delete service type"
                                    >
                                      <FaTrash className="w-2 h-2" />
                                    </button>
                                  </div>
                                ))}
                                {serviceTypes.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => setShowServiceManagementModal(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                                  >
                                    +{serviceTypes.length - 2} more...
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {searchType === 'service' && selectedType && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor="landing-service-subcategory" className="block text-sm font-medium text-gray-700">
                              Service Sub Category
                            </label>
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedServiceForSubCategory(selectedType)
                                  setShowAddServiceSubCategoryModal(true)
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                title="Add new service subcategory"
                              >
                                <FaPlus className="w-3 h-3" />
                                Add
                              </button>
                            )}
                          </div>
                          <select
                            id="landing-service-subcategory"
                            value={selectedServiceSubCategory}
                            onChange={(e) => setSelectedServiceSubCategory(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none cursor-pointer text-sm"
                            style={{ 
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.2em 1.2em',
                              paddingRight: '2rem'
                            }}
                          >
                            <option value="" className="text-gray-900">Select sub category</option>
                            {serviceSubCategories[selectedType]?.map((subCategory) => (
                              <option key={subCategory} value={subCategory} className="text-gray-900 py-2">
                                {subCategory}
                              </option>
                            ))}
                          </select>
                          {isSuperAdmin && (
                            <div className="mt-1 w-full">
                              <div className="flex flex-wrap gap-1 w-full items-center">
                                {serviceSubCategories[selectedType]?.slice(0, 2).map((subCategory) => (
                                  <div key={subCategory} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs flex-1 min-w-0 max-w-[calc(40%-0.25rem)]">
                                    <span className="text-gray-700 truncate flex-1">{subCategory}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteServiceSubCategory(selectedType, subCategory)}
                                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-1"
                                      title="Delete service subcategory"
                                    >
                                      <FaTrash className="w-2 h-2" />
                                    </button>
                                  </div>
                                ))}
                                {serviceSubCategories[selectedType]?.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => setShowServiceSubCategoryManagementModal(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                                  >
                                    +{serviceSubCategories[selectedType].length - 2} more...
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {searchType === 'resources' && (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label htmlFor="landing-resource-type" className="block text-sm font-medium text-gray-700">Resource Category</label>
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setShowAddResourceModal(true)}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                  title="Add new resource type"
                                >
                                  <FaPlus className="w-3 h-3" />
                                  Add
                                </button>
                              )}
                            </div>
                            <select
                              id="landing-resource-type"
                              value={selectedResourceType}
                              onChange={(e) => setSelectedResourceType(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none cursor-pointer text-sm"
                              style={{ 
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.2em 1.2em',
                                paddingRight: '2rem'
                              }}
                            >
                              <option value="" className="text-gray-900">Select resource</option>
                              {resourceTypes.map((r) => (
                                <option key={r} value={r} className="text-gray-900 py-2">{r}</option>
                              ))}
                            </select>
                            {isSuperAdmin && (
                              <div className="mt-1 w-full">
                                <div className="flex flex-wrap gap-1 w-full items-center">
                                  {resourceTypes.slice(0, 2).map((resourceType) => (
                                    <div key={resourceType} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs flex-1 min-w-0 max-w-[calc(40%-0.25rem)]">
                                      <span className="text-gray-700 truncate flex-1">{resourceType}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteResourceType(resourceType)}
                                        className="text-red-500 hover:text-red-700 flex-shrink-0 ml-1"
                                        title="Delete resource type"
                                      >
                                        <FaTrash className="w-2 h-2" />
                                      </button>
                                    </div>
                                  ))}
                                  {resourceTypes.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => setShowResourceManagementModal(true)}
                                      className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                                    >
                                      +{resourceTypes.length - 2} more...
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {selectedResourceType && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label htmlFor="landing-resource-subcategory" className="block text-sm font-medium text-gray-700">Resource Sub Category</label>
                                {isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedResourceForSubCategory(selectedResourceType)
                                      setShowAddResourceSubCategoryModal(true)
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    title="Add new resource subcategory"
                                  >
                                    <FaPlus className="w-3 h-3" />
                                    Add
                                  </button>
                                )}
                              </div>
                              <select
                                id="landing-resource-subcategory"
                                value={selectedResourceSubCategory}
                                onChange={(e) => setSelectedResourceSubCategory(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none cursor-pointer text-sm"
                                style={{ 
                                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                  backgroundPosition: 'right 0.5rem center',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundSize: '1.2em 1.2em',
                                  paddingRight: '2rem'
                                }}
                              >
                                <option value="" className="text-gray-900">Select sub category</option>
                                {resourceSubCategories[selectedResourceType]?.map((subCategory) => (
                                  <option key={subCategory} value={subCategory} className="text-gray-900 py-2">
                                    {subCategory}
                                  </option>
                                ))}
                              </select>
                              {isSuperAdmin && (
                                <div className="mt-1 w-full">
                                  <div className="flex flex-wrap gap-1 w-full items-center">
                                    {resourceSubCategories[selectedResourceType]?.slice(0, 2).map((subCategory) => (
                                      <div key={subCategory} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs flex-1 min-w-0 max-w-[calc(40%-0.25rem)]">
                                        <span className="text-gray-700 truncate flex-1">{subCategory}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteResourceSubCategory(selectedResourceType, subCategory)}
                                          className="text-red-500 hover:text-red-700 flex-shrink-0 ml-1"
                                          title="Delete resource subcategory"
                                        >
                                          <FaTrash className="w-2 h-2" />
                                        </button>
                                      </div>
                                    ))}
                                    {resourceSubCategories[selectedResourceType]?.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => setShowResourceSubCategoryManagementModal(true)}
                                        className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                                      >
                                        +{resourceSubCategories[selectedResourceType].length - 2} more...
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Rent/Sell toggle */}
                          <div className="flex mb-1 mt-1 bg-gray-100 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => { setResourceMode('rent') }}
                              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                resourceMode === 'rent'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              Rent
                            </button>
                            <button
                              type="button"
                              onClick={() => { setResourceMode('sell') }}
                              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                resourceMode === 'sell'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              Sell / Buy
                            </button>
                          </div>
                        </>
                      )}

                      {searchType === 'venue' && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor="landing-occasion" className="block text-sm font-medium text-gray-700">
                              Occasion
                            </label>
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => setShowAddOccasionModal(true)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                title="Add new occasion type"
                              >
                                <FaPlus className="w-3 h-3" />
                                Add
                              </button>
                            )}
                          </div>
                          <select
                            id="landing-occasion"
                            value={selectedOccasion}
                            onChange={(e) => setSelectedOccasion(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none cursor-pointer text-sm"
                            style={{ 
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.2em 1.2em',
                              paddingRight: '2rem'
                            }}
                          >
                            <option value="" className="text-gray-900">Occasion type</option>
                            {occasionTypes.map((o) => (
                              <option key={o} value={o} className="text-gray-900 py-2">{o}</option>
                            ))}
                          </select>
                          {isSuperAdmin && (
                            <div className="mt-1 w-full">
                              <div className="flex flex-wrap gap-1 w-full items-center">
                                {occasionTypes.slice(0, 2).map((occasion) => (
                                  <div key={occasion} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs flex-1 min-w-0 max-w-[calc(40%-0.25rem)]">
                                    <span className="text-gray-700 truncate flex-1">{occasion}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOccasionType(occasion)}
                                      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-1"
                                      title="Delete occasion type"
                                    >
                                      <FaTrash className="w-2 h-2" />
                                    </button>
                                  </div>
                                ))}
                                {occasionTypes.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => setShowOccasionManagementModal(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                                  >
                                    +{occasionTypes.length - 2} more...
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {searchType === 'venue' && (
                        <div>
                          <label htmlFor="landing-pax" className="block text-sm font-medium text-gray-700 mb-1">Pax</label>
                          <select
                            id="landing-pax"
                            value={selectedPax}
                            onChange={(e) => setSelectedPax(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none cursor-pointer text-sm"
                            style={{ 
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.2em 1.2em',
                              paddingRight: '2rem'
                            }}
                          >
                            <option value="" className="text-gray-900">Select pax</option>
                            {paxRanges.map((p) => (
                              <option key={p} value={p} className="text-gray-900 py-2">{p}</option>
                            ))}
                          </select>
                        </div>
                      )}

                                 <button
                                   type="submit"
                                   className="w-full inline-flex items-center justify-center rounded bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 transition-all duration-200 text-xs"
                                 >
                                   Find {searchType === 'venue' ? 'venues' : searchType === 'service' ? 'services' : 'resources'} →
                                 </button>
                        </>
                      )}

                      {/* Show message when current section is disabled */}
                      {!enabledSections[searchType === 'venue' ? 'venues' : searchType === 'service' ? 'services' : 'resources'] && (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="text-gray-500 text-sm">
                              <p className="mb-1">This section is currently disabled.</p>
                              <p>Please select an enabled section from the tabs above.</p>
                            </div>
                          </div>
                        </div>
                      )}

                              </form>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Show message when no sections are enabled */}
                      {!Object.values(enabledSections).some(enabled => enabled) && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-gray-500 text-xs">
                              <p className="mb-1">No search sections are currently enabled.</p>
                              <p>Contact an administrator to enable search functionality.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="relative flex items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">Featured Venues</h2>
          <Link to="/venues/featured" className="absolute right-0 text-red-600 hover:text-red-700 font-medium">View all</Link>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredVenues.map((v) => (
            <FeaturedCard key={v.name} venue={v} />
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          Ready to Host Your Perfect Event?
        </h2>
        <p className="mt-4 text-lg md:text-2xl text-gray-600">
          Join thousands of satisfied customers who found their dream venue with PartyVenue
        </p>
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={() => {
              // Check if user is already logged in
              if (authUser) {
                alert('You are already logged in!')
                return
              }
              // If not logged in, show registration modal
              setShowTalkModal(true)
              setFormErrors({})
              setRegisterMessage({ type: null, text: '' })
              setIsRegistering(false)
              setRegistrationCheckboxes({ venue: false, services: false, props: false, featured: false })
            }}
            className="inline-flex items-center justify-center rounded-xl border-2 border-purple-300 text-purple-700 px-8 py-4 text-lg font-semibold hover:border-purple-400"
          >
            Join Us
          </button>
        </div>
      </section>
      <Blogs/>

      {showTalkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
            setShowTalkModal(false)
            setFormErrors({})
            setRegisterMessage({ type: null, text: '' })
            setIsRegistering(false)
            setRegistrationCheckboxes({ venue: false, services: false, props: false, featured: false })
          }} />
          <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 flex flex-col">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-white flex flex-col max-h-full">
              <div className="flex-shrink-0 px-6 md:px-10 pt-6 pb-2 text-center">
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Join Us</h3>
                <p className="text-sm text-gray-600 mt-1">Create your account to get started</p>
              </div>
              <form onSubmit={(e)=>{e.preventDefault(); handleRegister()}} className="px-6 md:px-10 pb-6 overflow-y-auto flex-1 min-h-0">
                    {registerMessage.type === 'success' && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">{registerMessage.text}</p>
                      </div>
                    )}
                    {registerMessage.type === 'error' && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">{registerMessage.text}</p>
                      </div>
                    )}
                    {formErrors.general && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{formErrors.general}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <input disabled={isRegistering} value={talkForm.firstName} onChange={(e)=>updateTalkForm('firstName', e.target.value)} placeholder="First name" className={`w-full rounded-lg border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.firstName ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
                      </div>
                      <div>
                        <input disabled={isRegistering} value={talkForm.middleName} onChange={(e)=>updateTalkForm('middleName', e.target.value)} placeholder="Middle name (optional)" className={`w-full rounded-lg border ${formErrors.middleName ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.middleName ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        {formErrors.middleName && <p className="mt-1 text-sm text-red-600">{formErrors.middleName}</p>}
                      </div>
                      <div>
                        <input disabled={isRegistering} value={talkForm.lastName} onChange={(e)=>updateTalkForm('lastName', e.target.value)} placeholder="Last name" className={`w-full rounded-lg border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.lastName ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
                      </div>
                      <div>
                        <select disabled={isRegistering} value={talkForm.gender} onChange={(e)=>updateTalkForm('gender', e.target.value)} className={`w-full rounded-lg border ${formErrors.gender ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.gender ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <option value="">Select gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                        {formErrors.gender && <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>}
                      </div>
                      <div>
                        <input disabled={isRegistering} value={talkForm.address} onChange={(e)=>updateTalkForm('address', e.target.value)} placeholder="Address" className={`w-full rounded-lg border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.address ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
                      </div>
                      <div>
                        <input disabled={isRegistering} value={talkForm.city} onChange={(e)=>updateTalkForm('city', e.target.value)} placeholder="City" className={`w-full rounded-lg border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.city ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
                      </div>
                      <div>
                        <input disabled={isRegistering} value={talkForm.email} onChange={(e)=>updateTalkForm('email', e.target.value)} placeholder="Email address" type="email" className={`w-full rounded-lg border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.email ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                      </div>
                      <div>
                        <input disabled={isRegistering} value={talkForm.mobile} onChange={(e)=>updateTalkForm('mobile', e.target.value)} placeholder="Mobile number" className={`w-full rounded-lg border ${formErrors.mobile ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 ${formErrors.mobile ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        {formErrors.mobile && <p className="mt-1 text-sm text-red-600">{formErrors.mobile}</p>}
                      </div>
                      <div>
                        <div className="relative">
                          <input disabled={isRegistering} value={talkForm.password} onChange={(e)=>updateTalkForm('password', e.target.value)} placeholder="Password" type={showPwd ? 'text' : 'password'} className={`w-full rounded-lg border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 pr-10 focus:outline-none focus:ring-2 ${formErrors.password ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                          <button type="button" disabled={isRegistering} onClick={()=>setShowPwd(!showPwd)} className={`absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {showPwd ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
                          </button>
                        </div>
                        {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                      </div>
                      <div>
                        <div className="relative">
                          <input disabled={isRegistering} value={talkForm.confirmPassword} onChange={(e)=>updateTalkForm('confirmPassword', e.target.value)} placeholder="Confirm password" type={showConfirmPwd ? 'text' : 'password'} className={`w-full rounded-lg border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} bg-white placeholder-gray-400 text-gray-900 px-4 py-3 pr-10 focus:outline-none focus:ring-2 ${formErrors.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-indigo-500'} ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`} />
                          <button type="button" disabled={isRegistering} onClick={()=>setShowConfirmPwd(!showConfirmPwd)} className={`absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {showConfirmPwd ? <FiEyeOff className="h-5 w-5"/> : <FiEye className="h-5 w-5"/>}
                          </button>
                        </div>
                        {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>}
                      </div>
                    </div>
                    
                    {/* Registration Checkboxes - Local UI only, not sent to API */}
                    <div className="mt-4 mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registrationCheckboxes.venue}
                            onChange={(e) => setRegistrationCheckboxes(prev => ({ ...prev, venue: e.target.checked }))}
                            disabled={isRegistering}
                            className={`w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                          <span className={`text-sm text-gray-700 ${isRegistering ? 'opacity-50' : ''}`}>Venue</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registrationCheckboxes.services}
                            onChange={(e) => setRegistrationCheckboxes(prev => ({ ...prev, services: e.target.checked }))}
                            disabled={isRegistering}
                            className={`w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                          <span className={`text-sm text-gray-700 ${isRegistering ? 'opacity-50' : ''}`}>Services</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registrationCheckboxes.props}
                            onChange={(e) => setRegistrationCheckboxes(prev => ({ ...prev, props: e.target.checked }))}
                            disabled={isRegistering}
                            className={`w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                          <span className={`text-sm text-gray-700 ${isRegistering ? 'opacity-50' : ''}`}>Props</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registrationCheckboxes.featured}
                            onChange={(e) => setRegistrationCheckboxes(prev => ({ ...prev, featured: e.target.checked }))}
                            disabled={isRegistering}
                            className={`w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                          <span className={`text-sm text-gray-700 ${isRegistering ? 'opacity-50' : ''}`}>Featured</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-center gap-3">
                      <button onClick={()=>handleRegister()} type="submit" disabled={isRegistering} className={`rounded-full bg-indigo-600 text-white hover:bg-indigo-700 px-10 py-3 text-lg font-semibold ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isRegistering ? 'Registering...' : 'Register'}
                      </button>
                      <button onClick={()=>{
                        setShowTalkModal(false)
                        setFormErrors({})
                        setRegisterMessage({ type: null, text: '' })
                        setRegistrationCheckboxes({ venue: false, services: false, props: false, featured: false })
                      }} type="button" disabled={isRegistering} className={`rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-3 text-lg font-semibold ${isRegistering ? 'opacity-50 cursor-not-allowed' : ''}`}>Cancel</button>
                    </div>
                  </form>
            </div>
          </div>
        </div>
      )}

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Your City</h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 text-sm">
                Please select your city from the navigation bar before searching for venues, services, or resources.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCityModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Venue Type Modal */}
      {showAddVenueTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddVenueTypeModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Venue Type</h3>
              <button
                onClick={() => setShowAddVenueTypeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="new-venue-type" className="block text-sm font-medium text-gray-700 mb-2">
                Venue Type Name
              </label>
              <input
                id="new-venue-type"
                type="text"
                value={newVenueType}
                onChange={(e) => setNewVenueType(e.target.value)}
                placeholder="Enter venue type (e.g., Banquet Hall, Garden)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddVenueType()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddVenueTypeModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVenueType}
                disabled={!newVenueType.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
              >
                Add Venue Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Occasion Type Modal */}
      {showAddOccasionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddOccasionModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Occasion Type</h3>
              <button
                onClick={() => setShowAddOccasionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="new-occasion-type" className="block text-sm font-medium text-gray-700 mb-2">
                Occasion Type Name
              </label>
              <input
                id="new-occasion-type"
                type="text"
                value={newOccasionType}
                onChange={(e) => setNewOccasionType(e.target.value)}
                placeholder="Enter occasion type (e.g., Wedding, Birthday)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddOccasionType()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddOccasionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOccasionType}
                disabled={!newOccasionType.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
              >
                Add Occasion Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Type Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddServiceModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Service Type</h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="new-service-type" className="block text-sm font-medium text-gray-700 mb-2">
                Service Type Name
              </label>
              <input
                id="new-service-type"
                type="text"
                value={newServiceType}
                onChange={(e) => setNewServiceType(e.target.value)}
                placeholder="Enter service type (e.g., Photography, Catering)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddServiceType()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddServiceType}
                disabled={!newServiceType.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
              >
                Add Service Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Subcategory Modal */}
      {showAddServiceSubCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddServiceSubCategoryModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Service Subcategory</h3>
              <button
                onClick={() => setShowAddServiceSubCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="service-category" className="block text-sm font-medium text-gray-700 mb-2">
                Service Category
              </label>
              <select
                id="service-category"
                value={selectedServiceForSubCategory}
                onChange={(e) => setSelectedServiceForSubCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="">Select service category</option>
                {serviceTypes.map((serviceType) => (
                  <option key={serviceType} value={serviceType}>{serviceType}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="new-service-subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Name
              </label>
              <input
                id="new-service-subcategory"
                type="text"
                value={newServiceSubCategory}
                onChange={(e) => setNewServiceSubCategory(e.target.value)}
                placeholder="Enter subcategory name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddServiceSubCategory()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddServiceSubCategoryModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddServiceSubCategory}
                disabled={!newServiceSubCategory.trim() || !selectedServiceForSubCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
              >
                Add Subcategory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Type Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddResourceModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Resource Type</h3>
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="new-resource-type" className="block text-sm font-medium text-gray-700 mb-2">
                Resource Type Name
              </label>
              <input
                id="new-resource-type"
                type="text"
                value={newResourceType}
                onChange={(e) => setNewResourceType(e.target.value)}
                placeholder="Enter resource type (e.g., Lighting, Chairs)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddResourceType()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddResourceType}
                disabled={!newResourceType.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
              >
                Add Resource Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Subcategory Modal */}
      {showAddResourceSubCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddResourceSubCategoryModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Resource Subcategory</h3>
              <button
                onClick={() => setShowAddResourceSubCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="resource-category" className="block text-sm font-medium text-gray-700 mb-2">
                Resource Category
              </label>
              <select
                id="resource-category"
                value={selectedResourceForSubCategory}
                onChange={(e) => setSelectedResourceForSubCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="">Select resource category</option>
                {resourceTypes.map((resourceType) => (
                  <option key={resourceType} value={resourceType}>{resourceType}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="new-resource-subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory Name
              </label>
              <input
                id="new-resource-subcategory"
                type="text"
                value={newResourceSubCategory}
                onChange={(e) => setNewResourceSubCategory(e.target.value)}
                placeholder="Enter subcategory name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddResourceSubCategory()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddResourceSubCategoryModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddResourceSubCategory}
                disabled={!newResourceSubCategory.trim() || !selectedResourceForSubCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
              >
                Add Subcategory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venue Type Management Modal */}
      {showVenueTypeManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVenueTypeManagementModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Venue Types</h3>
              <button
                onClick={() => setShowVenueTypeManagementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-700">All Venue Types</h4>
                <button
                  onClick={() => {
                    setShowVenueTypeManagementModal(false)
                    setShowAddVenueTypeModal(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Add New
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {venueTypes.map((venueType) => (
                  <div key={venueType} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <span className="text-gray-700 text-sm">{venueType}</span>
                    <button
                      onClick={() => handleDeleteVenueType(venueType)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete venue type"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowVenueTypeManagementModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Occasion Management Modal */}
      {showOccasionManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOccasionManagementModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Occasion Types</h3>
              <button
                onClick={() => setShowOccasionManagementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-700">All Occasion Types</h4>
                <button
                  onClick={() => {
                    setShowOccasionManagementModal(false)
                    setShowAddOccasionModal(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Add New
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {occasionTypes.map((occasion) => (
                  <div key={occasion} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <span className="text-gray-700 text-sm">{occasion}</span>
                    <button
                      onClick={() => handleDeleteOccasionType(occasion)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete occasion type"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowOccasionManagementModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Management Modal */}
      {showServiceManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowServiceManagementModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Service Types</h3>
              <button
                onClick={() => setShowServiceManagementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-700">All Service Types</h4>
                <button
                  onClick={() => {
                    setShowServiceManagementModal(false)
                    setShowAddServiceModal(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Add New
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {serviceTypes.map((serviceType) => (
                  <div key={serviceType} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <span className="text-gray-700 text-sm">{serviceType}</span>
                    <button
                      onClick={() => handleDeleteServiceType(serviceType)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete service type"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowServiceManagementModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Subcategory Management Modal */}
      {showServiceSubCategoryManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowServiceSubCategoryManagementModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Service Subcategories</h3>
              <button
                onClick={() => setShowServiceSubCategoryManagementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-700">All Service Subcategories</h4>
                <button
                  onClick={() => {
                    setShowServiceSubCategoryManagementModal(false)
                    setShowAddServiceSubCategoryModal(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Add New
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {Object.entries(serviceSubCategories).map(([serviceType, subCategories]) => (
                  <div key={serviceType} className="mb-3">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">{serviceType}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                      {subCategories.map((subCategory) => (
                        <div key={subCategory} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                          <span className="text-gray-700 text-sm">{subCategory}</span>
                          <button
                            onClick={() => handleDeleteServiceSubCategory(serviceType, subCategory)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete service subcategory"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowServiceSubCategoryManagementModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Management Modal */}
      {showResourceManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResourceManagementModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Resource Types</h3>
              <button
                onClick={() => setShowResourceManagementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-700">All Resource Types</h4>
                <button
                  onClick={() => {
                    setShowResourceManagementModal(false)
                    setShowAddResourceModal(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Add New
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {resourceTypes.map((resourceType) => (
                  <div key={resourceType} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <span className="text-gray-700 text-sm">{resourceType}</span>
                    <button
                      onClick={() => handleDeleteResourceType(resourceType)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete resource type"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowResourceManagementModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Subcategory Management Modal */}
      {showResourceSubCategoryManagementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResourceSubCategoryManagementModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Resource Subcategories</h3>
              <button
                onClick={() => setShowResourceSubCategoryManagementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <TiTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-700">All Resource Subcategories</h4>
                <button
                  onClick={() => {
                    setShowResourceSubCategoryManagementModal(false)
                    setShowAddResourceSubCategoryModal(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Add New
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {Object.entries(resourceSubCategories).map(([resourceType, subCategories]) => (
                  <div key={resourceType} className="mb-3">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">{resourceType}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                      {subCategories.map((subCategory) => (
                        <div key={subCategory} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                          <span className="text-gray-700 text-sm">{subCategory}</span>
                          <button
                            onClick={() => handleDeleteResourceSubCategory(resourceType, subCategory)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete resource subcategory"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowResourceSubCategoryManagementModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Landing