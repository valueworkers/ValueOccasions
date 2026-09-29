import React, { useEffect, useMemo, useState } from 'react'
import { FiStar, FiMapPin, FiPhone, FiBriefcase, FiCamera, FiCoffee, FiMusic, FiGlobe, FiHeart, FiVideo } from 'react-icons/fi'
import { GiPalette } from 'react-icons/gi'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serviceProviders as staticServiceProviders } from '../data/serviceProviders'

const categoryTheme = {
  Photography: {
    bar: 'bg-sky-500',
    ring: 'ring-sky-200',
    chipBg: 'bg-sky-50 text-sky-800 ring-sky-200',
    chipBgMuted: 'bg-sky-50 text-sky-700 ring-sky-200',
    badgeBg: 'bg-sky-100 text-sky-700',
    button: 'bg-sky-600 hover:bg-sky-700',
    iconBg: 'bg-sky-100 text-sky-600'
  },
  Caterers: {
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-200',
    chipBg: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    chipBgMuted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-600'
  },
  Catering: {
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-200',
    chipBg: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    chipBgMuted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-600'
  },
  Decoration: {
    bar: 'bg-fuchsia-500',
    ring: 'ring-fuchsia-200',
    chipBg: 'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200',
    chipBgMuted: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
    badgeBg: 'bg-fuchsia-100 text-fuchsia-700',
    button: 'bg-fuchsia-600 hover:bg-fuchsia-700',
    iconBg: 'bg-fuchsia-100 text-fuchsia-600'
  },
  Music: {
    bar: 'bg-orange-500',
    ring: 'ring-orange-200',
    chipBg: 'bg-orange-50 text-orange-800 ring-orange-200',
    chipBgMuted: 'bg-orange-50 text-orange-700 ring-orange-200',
    badgeBg: 'bg-orange-100 text-orange-700',
    button: 'bg-orange-600 hover:bg-orange-700',
    iconBg: 'bg-orange-100 text-orange-600'
  },
  Videography: {
    bar: 'bg-purple-500',
    ring: 'ring-purple-200',
    chipBg: 'bg-purple-50 text-purple-800 ring-purple-200',
    chipBgMuted: 'bg-purple-50 text-purple-700 ring-purple-200',
    badgeBg: 'bg-purple-100 text-purple-700',
    button: 'bg-purple-600 hover:bg-purple-700',
    iconBg: 'bg-purple-100 text-purple-600'
  },
  Magic: {
    bar: 'bg-indigo-500',
    ring: 'ring-indigo-200',
    chipBg: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
    chipBgMuted: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-700',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-600'
  },
  'Senior Care': {
    bar: 'bg-teal-500',
    ring: 'ring-teal-200',
    chipBg: 'bg-teal-50 text-teal-800 ring-teal-200',
    chipBgMuted: 'bg-teal-50 text-teal-700 ring-teal-200',
    badgeBg: 'bg-teal-100 text-teal-700',
    button: 'bg-teal-600 hover:bg-teal-700',
    iconBg: 'bg-teal-100 text-teal-600'
  }
}

const categoryIcon = {
  Photography: FiCamera,
  Caterers: FiCoffee,
  Catering: FiCoffee,
  Decoration: GiPalette,
  Music: FiMusic,
  Videography: FiVideo,
  Magic: FiGlobe,
  'Senior Care': FiHeart
}

// Component for logo/icon display with error handling
const LogoDisplay = ({ logo, name, Icon, iconBg }) => {
  const [logoError, setLogoError] = useState(false);

  if (logo && !logoError) {
    return (
      <div className={`shrink-0 h-9 w-9 rounded-lg grid place-items-center ${iconBg} overflow-hidden`}>
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-full h-full object-contain p-1"
          onError={() => setLogoError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`shrink-0 h-9 w-9 rounded-lg grid place-items-center ${iconBg}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

const ListofServices = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedCity = useSelector((state) => state.city.selectedCity)
  const city = decodeURIComponent(params.city || selectedCity || ':city')
  const categories = ['Photography', 'Caterers', 'Catering', 'Decoration', 'Music', 'Videography', 'Magic']
  
  // Get category from URL query parameters
  const categoryFromUrl = searchParams.get('type') || ''
  
  const [selectedCategories, setSelectedCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceProviders, setServiceProviders] = useState([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [servicesError, setServicesError] = useState('')
  
  // Authentication state (for navigation only)
  const [authUser, setAuthUser] = useState(null)

  // Load services from API
  useEffect(() => {
    loadServices();
  }, []);

  // Normalize service data helper function
  const normalizeService = (service) => ({
    ...service,
    // Handle photos array
    photo: (service.photos && Array.isArray(service.photos) && service.photos.length > 0)
      ? (service.photos.find(p => p.is_primary)?.image || service.photos[0]?.image)
      : (service.photo || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop'),
    // Handle place/address/city
    place: service.place || `${service.address || ''}, ${service.city || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'N/A',
    // Handle tags/services
    services: Array.isArray(service.tags) && service.tags.length > 0
      ? service.tags
      : (Array.isArray(service.services) ? service.services : []),
    // Handle rating (default to 4.0 if not present)
    rating: service.rating || 4.0
  });

  const loadServices = async () => {
    setIsLoadingServices(true);
    setServicesError('');

    // Normalize static service providers
    const normalizedStaticServices = staticServiceProviders.map(normalizeService);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/booking/public-services/`
      );

      // Handle different response structures
      const servicesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || response.data?.data || []);
      
      // Normalize API service data
      const normalizedApiServices = servicesData.map(normalizeService);
      
      // Merge static and API services (static services first, then API)
      // Create a Set of static service IDs to check for duplicates
      const staticServiceIds = new Set(normalizedStaticServices.map(s => s.id));
      
      // Start with static services first
      const mergedServices = [...normalizedStaticServices];
      
      // Add API services that don't have duplicate IDs
      normalizedApiServices.forEach(service => {
        if (!staticServiceIds.has(service.id)) {
          mergedServices.push(service);
        }
      });
      
      setServiceProviders(mergedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to fetch services.';
      setServicesError(errorMessage);
      // Even if API fails, show static services
      setServiceProviders(normalizedStaticServices);
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Check authentication status
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('authUser') || 'null')
    setAuthUser(user)
  }, [])

  // Initialize selected categories from URL query parameter
  useEffect(() => {
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setSelectedCategories([categoryFromUrl])
    }
  }, [categoryFromUrl])

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const filteredProviders = useMemo(() => {
    let byCategory = serviceProviders
    
    // Normalize category for filtering (handle both Caterers and Catering)
    const normalizeCategory = (cat) => {
      if (cat === 'Catering' || cat === 'Caterers') return ['Caterers', 'Catering'];
      return [cat];
    };
    
    // Filter by category from URL or selected categories
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      const normalizedCategories = normalizeCategory(categoryFromUrl);
      byCategory = serviceProviders.filter((p) => normalizedCategories.includes(p.category))
    } else if (selectedCategories.length > 0) {
      const allSelectedCategories = selectedCategories.flatMap(cat => normalizeCategory(cat));
      byCategory = serviceProviders.filter((p) => allSelectedCategories.includes(p.category))
    }

    const term = searchTerm.trim().toLowerCase()
    if (!term) return byCategory

    return byCategory.filter((p) => {
      const inName = p.name?.toLowerCase().includes(term) || false
      const inPlace = (p.place || '').toLowerCase().includes(term)
      const inCategory = (p.category || '').toLowerCase().includes(term)
      const inServices = (p.services || []).some((s) => String(s).toLowerCase().includes(term))
      return inName || inPlace || inCategory || inServices
    })
  }, [selectedCategories, searchTerm, categoryFromUrl, serviceProviders, categories])

  // Pagination constants
  const itemsPerPage = 6

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchTerm, categoryFromUrl])

  // Ensure current page is valid when filtered results change
  useEffect(() => {
    const maxPage = Math.ceil(filteredProviders.length / itemsPerPage) || 1
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [filteredProviders.length, currentPage, itemsPerPage])

  // Update URL when Redux city changes
  useEffect(() => {
    if (selectedCity && selectedCity !== 'Select City') {
      const currentCityFromUrl = params.city ? decodeURIComponent(params.city) : null
      // Only update if Redux city is different from URL city
      if (currentCityFromUrl !== selectedCity) {
        // Preserve query params if any
        const searchParams = location.search
        navigate(`/services/${encodeURIComponent(selectedCity)}${searchParams}`, { replace: true })
      }
    }
  }, [selectedCity, navigate, params.city, location.search])
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage) || 1
  const pagedProviders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProviders.slice(start, start + itemsPerPage)
  }, [filteredProviders, currentPage])

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const persistServiceSelection = (serviceProvider) => {
    try {
      sessionStorage.setItem('selectedServiceProvider', JSON.stringify(serviceProvider))
    } catch (error) {
      console.error('Failed to persist selected service:', error)
    }
  }

  const handleServiceNavigate = (serviceProvider) => {
    // Check if user is authenticated
    if (!authUser) {
      // User not authenticated, redirect to login
      navigate('/login')
      return
    }
    
    // Validate service provider data
    if (!serviceProvider || !serviceProvider.id) {
      console.error('Invalid service provider data:', serviceProvider)
      alert('Service information is incomplete. Please try again.')
      return
    }
    
    // Special routing for Senior Care services
    if (serviceProvider.category === 'Senior Care') {
      navigate('/senior-care', {
        state: serviceProvider
      })
      return
    }
    
    // Normalize category for URL (handle Caterers/Catering)
    const normalizeCategoryForUrl = (category) => {
      if (!category) return 'photography' // default fallback
      if (category === 'Caterers' || category === 'Catering') {
        return 'caterers' // Use 'caterers' consistently
      }
      return category.toLowerCase()
    }
    
    const serviceType = normalizeCategoryForUrl(serviceProvider.category)
    const serviceId = String(serviceProvider.id) // Ensure it's a string
    
    const navigationPath = `/services/${serviceType}/${serviceId}`
    
    persistServiceSelection(serviceProvider)
    // Navigate to individual service page with service data
    navigate(navigationPath, {
      state: serviceProvider
    })
  }


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{city != ":city" ? `Service Providers in ${city}` : 'Service Providers'}</h1>
          <p className="text-gray-600 mt-2">Photography, Catering, Decorations, Music (DJ) and more</p>
        </div>

        <div className="mb-6 bg-white rounded-xl ring-1 ring-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="text-sm font-medium text-gray-700">Filter by category</div>
            <form onSubmit={(e)=>e.preventDefault()} className="w-full md:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  placeholder="Search providers, location, category, services"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
            </form>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
              const checked = selectedCategories.includes(cat)
              const theme = categoryTheme[cat] || categoryTheme.Photography
              return (
                <label key={cat} className={(checked ? `${theme.chipBg} ` : 'bg-gray-50 text-gray-700 ring-gray-200 ') + 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 cursor-pointer select-none text-sm'}>
                  <input
                    type="checkbox"
                    className="accent-current"
                    checked={checked}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className={checked ? '' : 'text-gray-700'}>{cat}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingServices && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        )}

        {/* Error State */}
        {servicesError && !isLoadingServices && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 font-medium">Error loading services</p>
            <p className="text-red-600 text-sm mt-1">{servicesError}</p>
          </div>
        )}

        {/* Show error if category from URL doesn't exist */}
        {!isLoadingServices && !servicesError && categoryFromUrl && !categories.includes(categoryFromUrl) ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FiBriefcase className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Category Not Available</h3>
            <p className="text-gray-500 mb-6">
              The service category "{categoryFromUrl}" is not available. Please select from the available categories above.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategories([])
                  navigate(location.pathname)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Services
              </button>
            </div>
          </div>
        ) : !isLoadingServices && !servicesError && filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedProviders.map((sp) => {
              const theme = categoryTheme[sp.category] || categoryTheme.Photography
              const Icon = categoryIcon[sp.category] || FiCamera
              return (
              <div key={sp.id} className={`relative bg-white rounded-xl shadow-sm ring-1 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all ${theme.ring} flex flex-col`}>
                <span className={`absolute inset-x-0 top-0 h-1 ${theme.bar}`}></span>
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src={sp.photo || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop'}
                    alt={sp.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop';
                    }}
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">{sp.name}</h3>
                      {sp.rating && (
                        <div className="mt-1 inline-flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar key={i} className={(i < Math.round(sp.rating) ? 'fill-amber-400 text-amber-400 ' : 'text-gray-300 ') + 'w-4 h-4'} />
                          ))}
                          <span className="ml-1 text-xs md:text-sm text-gray-600">{sp.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <LogoDisplay logo={sp.logo} name={sp.name} Icon={Icon} iconBg={theme.iconBg} />
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-gray-700 flex-grow">
                    <div className="flex items-center gap-2"><FiMapPin className="text-gray-500" />{sp.place || 'N/A'}</div>
                    <div className="flex items-center gap-2"><FiPhone className="text-gray-500" />{sp.contact || 'N/A'}</div>
                    {sp.website && sp.website.trim() !== '' && (
                      <div className="flex items-center gap-2">
                        <FiGlobe className="text-gray-500" />
                        <a 
                          href={sp.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Visit Website"
                        >
                          Website
                        </a>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <FiBriefcase className="mt-0.5 text-gray-500" />
                      <div className="flex flex-wrap gap-1.5">
                        {sp.services && sp.services.length > 0 ? (
                          sp.services.map((s, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-full text-[11px] ring-1 ${theme.chipBgMuted}`}>{s}</span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-xs">No services listed</span>
                        )}
                      </div>
                    </div>
                    {sp.category && (
                      <div className={`mt-1 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full ${theme.badgeBg}`}>{sp.category}</div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleServiceNavigate(sp)
                      }} 
                      className={`inline-flex items-center justify-center rounded-full text-white px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${theme.button}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : !isLoadingServices && !servicesError && categoryFromUrl && categories.includes(categoryFromUrl) ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBriefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-500 mb-6">
              No services found for the category "{categoryFromUrl}".
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategories([])
                  navigate(location.pathname)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : !isLoadingServices && !servicesError ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBriefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 
                `No services found matching "${searchTerm}". Try adjusting your search terms or filters.` :
                'No services available for the selected categories.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategories([])
                  navigate(location.pathname)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : null}

        {/* Sponsored Services - Show when no results found and category is valid */}
        {!isLoadingServices && !servicesError && filteredProviders.length === 0 && categoryFromUrl && categories.includes(categoryFromUrl) && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sponsored Services</h2>
              <p className="text-gray-600">Check out these featured service providers</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sri Venkateshwara Events */}
              <div className="relative bg-white rounded-xl shadow-sm ring-1 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all ring-fuchsia-200 flex flex-col">
                <span className="absolute inset-x-0 top-0 h-1 bg-fuchsia-500"></span>
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/gps-cs-s/AC9h4noCtGbUTEtLSzFAtCNiuu3G8VEnnT0j_UVblIWc5UodqHQnzYaX9FN3Wpx9DQaC4tX72wqkpA_zz8lh_YsN4UQtMmrecc1yVf0AEqh3cPCWgYNU9HB6Ne9zl2WIFgKnvRFkuxp_=s1360-w1360-h1020-rw"
                    alt="Sri Venkateshwara Events"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">Sri Venkateshwara Events</h3>
                      <div className="mt-1 inline-flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} className={(i < 4 ? 'fill-amber-400 text-amber-400 ' : 'text-gray-300 ') + 'w-4 h-4'} />
                        ))}
                        <span className="ml-1 text-xs md:text-sm text-gray-600">4.5</span>
                      </div>
                    </div>
                    <div className="shrink-0 h-9 w-9 rounded-lg grid place-items-center bg-fuchsia-100 text-fuchsia-600">
                      <GiPalette className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-gray-700 flex-grow">
                    <div className="flex items-center gap-2"><FiMapPin className="text-gray-500" />Karnataka, KA</div>
                    <div className="flex items-center gap-2"><FiPhone className="text-gray-500" />+91 7338046069</div>
                    <div className="flex items-center gap-2">
                      <FiGlobe className="text-gray-500" />
                      <a 
                        href="https://decor-omega-six.vercel.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Visit Website"
                      >
                        Website
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <FiBriefcase className="mt-0.5 text-gray-500" />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] ring-1 bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200">Wedding Decoration</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] ring-1 bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200">Party Decor</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] ring-1 bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200">Decoration</span>
                      </div>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-fuchsia-100 text-fuchsia-700">Decoration</div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleServiceNavigate({
                          id: 1,
                          name: 'Sri Venkateshwara Events',
                          website: 'https://decor-omega-six.vercel.app',
                          contact: '+91 7338046069',
                          place: 'Karnataka, KA',
                          services: ['Wedding Decoration', 'Party Decor', 'Decoration'],
                          rating: 4.5,
                          category: 'Decoration',
                          photo: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4noCtGbUTEtLSzFAtCNiuu3G8VEnnT0j_UVblIWc5UodqHQnzYaX9FN3Wpx9DQaC4tX72wqkpA_zz8lh_YsN4UQtMmrecc1yVf0AEqh3cPCWgYNU9HB6Ne9zl2WIFgKnvRFkuxp_=s1360-w1360-h1020-rw'
                        })
                      }} 
                      className="inline-flex items-center justify-center rounded-full text-white px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors bg-fuchsia-600 hover:bg-fuchsia-700"
                    >
                      View Details
                    </button>
                    
                    {/* Sponsored Badge */}
                    <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Sponsored
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional sponsored services can be added here */}
            </div>
          </div>
        )}

        {filteredProviders.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold">
                {filteredProviders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredProviders.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredProviders.length}</span> services
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
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
                  onClick={() => goToPage(currentPage + 1)}
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ListofServices


