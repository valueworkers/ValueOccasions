import React, { useState, useEffect, useMemo } from 'react';
import { FaMapMarkerAlt, FaParking, FaMotorcycle, FaCarAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { TiTick, TiTimes } from 'react-icons/ti';
import { IoIosPerson, IoIosPeople } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { MdTableRestaurant } from 'react-icons/md';
import { MdTableBar } from 'react-icons/md';
import classroomTable from '../../assets/class.svg';
import rectTable from '../../assets/6-table.svg';
import roundTable from '../../assets/circular.svg';
import theaterTable from '../../assets/theater.svg';
import dining from '../../assets/dining.svg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setVenues as setVenuesRedux, setLoading, setError } from '../../store/slices/venuesSlice';

const seatingIcon = type => {
  switch(type) {
    case 'rectangular': return <img src={rectTable} alt="Rectangular table" className="h-4 w-4 inline-block align-sub" />
    case 'round': return <img src={roundTable} alt="Round table" className="h-4 w-4 inline-block align-sub" />
    case 'theater': return <img src={theaterTable} alt="Theater table" className="h-4 w-4 inline-block align-sub" />
    case 'classroom': return <img src={classroomTable} alt="Classroom table" className="h-4 w-4 inline-block align-sub" />
    case 'banquet': return <MdTableRestaurant className="w-4 h-4 text-blue-600 inline-block align-sub" />
    case 'dining': return <img src={dining} alt='Dining' className='h-4 w-4 inline-block align-sub'/>;
    case 'cocktail': return <MdTableBar className="w-4 h-4 text-gray-600 inline-block align-sub" />;
    default: return <div className="w-4 h-4 border rounded bg-gray-200 inline-block" />
  }
}

const seatingOptions = [
  { type: 'Rectangular Table', icon: 'rectangular' },
  { type: 'Round Table', icon: 'round' },
  { type: 'Theater Style', icon: 'theater' },
  { type: 'Banquet', icon: 'banquet' },
  { type: 'Dining Style', icon: 'dining' },
  { type: 'Classroom', icon: 'classroom' },
  { type: 'Cocktail', icon: 'cocktail' },
];

const PLACEHOLDER_VENUE_IMAGE = 'https://via.placeholder.com/300';

const getVenuePhotosList = (venue) => {
  if (venue?.photos && venue.photos.length > 0) {
    return venue.photos;
  }
  if (venue?.imgList && venue.imgList.length > 0) {
    return venue.imgList;
  }
  return [PLACEHOLDER_VENUE_IMAGE];
};

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
      'u-shape': { type: 'U-shape', icon: 'rectangular' },
      'cocktail': { type: 'Cocktail', icon: 'cocktail' },
    }
    const lowerType = type.toLowerCase().replace(/[-_\s]/g, '')
    // Handle variations
    if (lowerType.includes('banquet') || lowerType.includes('round')) return { type: type, icon: 'round' }
    if (lowerType.includes('conference') || lowerType.includes('theater')) return { type: type, icon: 'theater' }
    if (lowerType.includes('classroom')) return { type: type, icon: 'classroom' }
    if (lowerType.includes('rectangular')) return { type: type, icon: 'rectangular' }
    if (lowerType.includes('dining')) return { type: type, icon: 'dining' }
    if (lowerType.includes('ushape') || lowerType.includes('u-shape')) return { type: type, icon: 'rectangular' }
    return seatingMap[lowerType] || { type: type, icon: 'theater' }
  }

  // Helper to build photo URL
  const getPhotoUrl = (photo) => {
    if (typeof photo === 'string') {
      // If it's already a full URL, return it
      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo
      }
      // If it's a relative path, might need backend URL prefix
      // For now, return empty or the path as-is (backend might serve it)
      return photo || ''
    }
    if (photo && typeof photo === 'object') {
      // Try url first, then image field
      if (photo.url) {
        return photo.url.startsWith('http://') || photo.url.startsWith('https://') 
          ? photo.url 
          : photo.url
      }
      if (photo.image) {
        const img = photo.image
        // If image contains a full URL (embedded in path), extract it
        if (img.includes('http://') || img.includes('https://')) {
          const urlMatch = img.match(/https?:\/\/[^\s]+/)
          if (urlMatch) return urlMatch[0]
        }
        // If it's a full URL, return it
        if (img.startsWith('http://') || img.startsWith('https://')) {
          return img
        }
        // Otherwise, return the path as-is (backend should handle serving)
        return img
      }
    }
    return ''
  }

  // Helper to check if value is empty object
  const isEmptyObject = (val) => {
    return typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length === 0;
  };

  // Handle parking slots - can be empty object {}
  const parkingSlots = (venue.parking_slots && !isEmptyObject(venue.parking_slots))
    ? venue.parking_slots
    : (venue.parking && !isEmptyObject(venue.parking) ? venue.parking : { car: 0, bike: 0 });

  // Handle amenities - can be empty object {} or array
  let amenitiesArray = [];
  if (Array.isArray(venue.amenities)) {
    amenitiesArray = venue.amenities;
  } else if (venue.amenities && !isEmptyObject(venue.amenities)) {
    amenitiesArray = Object.values(venue.amenities);
  }

  // Handle seating_arrangement - can be empty object {} or array
  let seatingArray = [];
  if (Array.isArray(venue.seating_arrangement) && venue.seating_arrangement.length > 0) {
    seatingArray = venue.seating_arrangement;
  } else if (venue.seating_arrangement && !isEmptyObject(venue.seating_arrangement) && typeof venue.seating_arrangement === 'object') {
    // If it's an object (but not empty), try to extract values
    seatingArray = Object.values(venue.seating_arrangement);
  }

  return {
    ...venue,
    // Location mapping
    locality: venue.location?.locality || venue.location?.address_line_1 || venue.location?.city || venue.locality || '',
    location: venue.location?.city || venue.location || '',
    address: venue.location?.address_line1 || venue.location?.address_line_1 || venue.location?.full_address || venue.address || '',
    building_name: venue.location?.building_name || '',
    address_line1: venue.location?.address_line1 || venue.location?.address_line_1 || '',
    address_line2: venue.location?.address_line2 || venue.location?.address_line_2 || '',
    city: venue.location?.city || venue.city || '',
    state: venue.location?.state || venue.state || '',
    postal_code: venue.location?.postal_code || venue.postal_code || '',
    
    // Parking mapping - handle both singular (car/bike) and plural (cars/bikes) keys, and empty objects
    parking_slots: parkingSlots,
    parking: parkingSlots,
    // Keep carParking and bikeParking for backward compatibility
    carParking: (parkingSlots.car || parkingSlots.cars || 0),
    bikeParking: (parkingSlots.bike || parkingSlots.bikes || 0),
    
    // Amenities - handle empty object or array
    amenities: amenitiesArray,
    
    // Permissions mapping
    externalDecorationAllowed: venue.external_decorators_allow !== undefined 
      ? venue.external_decorators_allow 
      : (venue.externalDecorationAllowed !== undefined ? venue.externalDecorationAllowed : false),
    externalCatererAllowed: venue.external_caterers_allow !== undefined 
      ? venue.external_caterers_allow 
      : (venue.externalCatererAllowed !== undefined ? venue.externalCatererAllowed : false),
    
    // Status mapping
    enabled: venue.is_active !== undefined ? venue.is_active : (venue.enabled !== undefined ? venue.enabled : true),
    
    // Seating arrangements - handle empty object, array, or convert string array to object array
    seatingArrangements: seatingArray.length > 0
      ? seatingArray.map(mapSeatingType)
      : (venue.seatingArrangements || []),
    
    // Photos mapping - handle photos array with image field, photos_links, photos_data array
    photos: (() => {
      // First check if venue.photos is an array of objects with image field
      if (venue.photos && Array.isArray(venue.photos) && venue.photos.length > 0) {
        return venue.photos.map(photo => {
          if (typeof photo === 'string') return photo;
          if (photo && typeof photo === 'object' && photo.image) {
            return photo.image;
          }
          return getPhotoUrl(photo);
        }).filter(url => url);
      }
      // Then check photos_links
      if (venue.photos_links && Array.isArray(venue.photos_links) && venue.photos_links.length > 0) {
        return venue.photos_links.map(photo => photo.image || getPhotoUrl(photo)).filter(url => url);
      }
      // Then check photos_data
      if (venue.photos_data && Array.isArray(venue.photos_data) && venue.photos_data.length > 0) {
        return venue.photos_data.map(getPhotoUrl).filter(url => url);
      }
      // Fallback to existing photos or imgList
      return venue.imgList || [];
    })(),
    imgList: (() => {
      // First check if venue.photos is an array of objects with image field
      if (venue.photos && Array.isArray(venue.photos) && venue.photos.length > 0) {
        return venue.photos.map(photo => {
          if (typeof photo === 'string') return photo;
          if (photo && typeof photo === 'object' && photo.image) {
            return photo.image;
          }
          return getPhotoUrl(photo);
        }).filter(url => url);
      }
      // Then check photos_links
      if (venue.photos_links && Array.isArray(venue.photos_links) && venue.photos_links.length > 0) {
        return venue.photos_links.map(photo => photo.image || getPhotoUrl(photo)).filter(url => url);
      }
      // Then check photos_data
      if (venue.photos_data && Array.isArray(venue.photos_data) && venue.photos_data.length > 0) {
        return venue.photos_data.map(getPhotoUrl).filter(url => url);
      }
      // Fallback to existing photos or imgList
      return venue.imgList || [];
    })(),
    
    // Price mapping - handle string to number conversion
    price: venue.price_per_event ? parseFloat(venue.price_per_event) : (venue.price || 0),
    
    // Capacity
    capacity: venue.capacity || 0,
    
    // Keep original fields for backward compatibility
  }
}

const ITEMS_PER_PAGE = 6;

const VenuesDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [authUser, setAuthUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [selectedSeating, setSelectedSeating] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [isSavingVenue, setIsSavingVenue] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [selectedVenueForEdit, setSelectedVenueForEdit] = useState(null);
  const [selectedVenueForDelete, setSelectedVenueForDelete] = useState(null);
  const [selectedVenueAmenities, setSelectedVenueAmenities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [photoIndices, setPhotoIndices] = useState([]);
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    price: '',
    locality: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    venueType: '',
    building_name: '',
    address: '',
    address_line_1: '',
    address_line_2: '',
    contact: '',
    rooms: '',
    floors: '',
    carParking: '',
    bikeParking: '',
    externalDecorationAllowed: false,
    externalCatererAllowed: false,
    amenities: [],
    seatingArrangements: [],
    new_photos: [],
    halls: [],
    enabled: true
  });

  // Track object URLs for cleanup
  const [photoObjectUrls, setPhotoObjectUrls] = useState(new Map());
  
  // Track venueType locally (not sent to API) - keyed by venue ID (as string)
  // Initialize from localStorage
  const [venueTypeMap, setVenueTypeMap] = useState(() => {
    try {
      const stored = localStorage.getItem('venueTypeMap');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all keys are strings for consistency
        const map = new Map();
        Object.entries(parsed).forEach(([key, value]) => {
          map.set(String(key), value);
        });
        return map;
      }
    } catch (error) {
      console.error('Error loading venueTypeMap from localStorage:', error);
    }
    return new Map();
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const raw = localStorage.getItem('authUser');
        if (raw) {
          const parsed = JSON.parse(raw);
          setAuthUser(parsed);
        } else {
          setAuthUser(null);
        }
      } catch (error) {
        console.error('Error parsing authUser from localStorage:', error);
        setAuthUser(null);
      }
    };

    checkAuthStatus();

    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Save venueTypeMap to localStorage whenever it changes
  useEffect(() => {
    try {
      const mapObject = Object.fromEntries(venueTypeMap);
      localStorage.setItem('venueTypeMap', JSON.stringify(mapObject));
    } catch (error) {
      console.error('Error saving venueTypeMap to localStorage:', error);
    }
  }, [venueTypeMap]);

  useEffect(() => {
    setPhotoIndices(venues.map(() => 0));
  }, [venues]);

  useEffect(() => {
    let retryTimeout = null;
    let isMounted = true;
    const MAX_RETRIES = 5; // Maximum number of retry attempts

    const fetchVenues = async (retryCount = 0) => {
      if (!isMounted) return;

      const access = localStorage.getItem("access_token");
      const userType = localStorage.getItem("user_type");

      const config = access
        ? { headers: { Authorization: `Bearer ${access}` } }
        : undefined;
     
      try {
        setIsLoadingVenues(true);
        dispatch(setLoading(true));
        const response = await axios.get(`${import.meta.env.VITE_BASEURL}/management/venues/`, config);
        
        // Extract venues from response.data.results
        const venuesData = response.data?.results || response.data || [];
        
        // Check if we got valid data
        const hasValidData = Array.isArray(venuesData) && venuesData.length > 0;
        
        if (hasValidData) {
          const normalizedVenues = venuesData.map(normalizeVenue);
          
          if (isMounted) {
            setVenues(normalizedVenues);
            // Store venues in Redux
            dispatch(setVenuesRedux(normalizedVenues));
            
            // Initialize selected seating for each venue
            setSelectedSeating(normalizedVenues.map(v => 
              v.seatingArrangements && v.seatingArrangements.length > 0 
                ? v.seatingArrangements[0] 
                : seatingOptions[0]
            ));
            
            // Extract unique venue types if available
            const uniqueTypes = [...new Set(normalizedVenues.map(v => v.venueType || v.venue_type).filter(Boolean))];
            if (uniqueTypes.length > 0) {
              setVenueTypes(uniqueTypes.sort());
            }
            
            setIsLoadingVenues(false);
            return; // Success, stop retrying
          }
        }
        
        // If we got an empty array or data length <= 0, show "No venues found" immediately
        // (No need to retry if API responded successfully but with empty data)
        if (isMounted) {
          setVenues([]);
          dispatch(setVenuesRedux([]));
          setIsLoadingVenues(false);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        if (isMounted) {
          // Retry on error, but only up to MAX_RETRIES
          if (retryCount < MAX_RETRIES) {
          
            retryTimeout = setTimeout(() => {
              if (isMounted) {
                fetchVenues(retryCount + 1);
              }
            }, 2000); // Retry after 2 seconds
          } else {
            // Max retries reached, show "No venues found"
          
            setVenues([]);
            dispatch(setVenuesRedux([]));
            dispatch(setError(error.message || 'Failed to fetch venues'));
            setIsLoadingVenues(false);
          }
        }
      }
    };
    
    fetchVenues();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      photoObjectUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [photoObjectUrls]);

  const canManageVenues = useMemo(() => {
    return authUser?.user_type === 'VSRE_OWNER' || authUser?.user_type === 'MASTER_ADMIN';
  }, [authUser]);

  // Helper function to check if a venue is Senior Care
  const isSeniorCareVenue = (venue) => {
    if (!venue || !venue.id) return false;
    
    // Check venueType from venue object
    if (venue.venueType === 'Senior Care' || venue.venue_type === 'Senior Care') {
      return true;
    }
    
    // Check venueTypeMap - use string ID for consistency (all IDs stored as strings)
    const venueIdString = String(venue.id);
    return venueTypeMap.get(venueIdString) === 'Senior Care';
  };

  const [venueTypes, setVenueTypes] = useState([]);

  const filteredVenues = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return venues;

    return venues.filter((venue) => {
      const fields = [
        venue.name,
        venue.city,
        venue.locality,
        venue.address,
        venue.location?.city,
        venue.location?.address_line_1,
      ];
      return fields.some(
        (field) => typeof field === 'string' && field.toLowerCase().includes(term)
      );
    });
  }, [venues, searchTerm]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredVenues.length / ITEMS_PER_PAGE)),
    [filteredVenues.length]
  );

  const paginatedVenues = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVenues.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVenues, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredVenues.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  const handleFormInputChange = (field, value) => {
    setVenueFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddVenue = () => {
    setSelectedVenueForEdit(null); // Clear selected venue to ensure we're in "add" mode
    setVenueFormData({
      name: '',
      description: '',
      capacity: '',
      price: '',
      locality: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      venueType: '',
      building_name: '',
      address: '',
      address_line_1: '',
      address_line_2: '',
      contact: '',
      rooms: '',
      floors: '',
      carParking: '',
      bikeParking: '',
      externalDecorationAllowed: false,
      externalCatererAllowed: false,
      amenities: [],
      seatingArrangements: [],
      new_photos: [],
      halls: [],
      enabled: true
    });
    setShowAddModal(true);
  };

  const handleEditVenue = async (venue) => {
    if (!venue.id) {
      alert('Venue ID is missing. Cannot edit this venue.');
      return;
    }

    try {
      const access = localStorage.getItem("access_token");
      const config = access
        ? { 
            headers: { 
              Authorization: `Bearer ${access}`,
              'Content-Type': 'application/json'
            } 
          }
        : { headers: { 'Content-Type': 'application/json' } };

      // Fetch venue details from API
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/management/venues/${venue.id}/`,
        config
      );

      const venueData = response.data;
      
      // Normalize the venue data
      const normalizedVenue = normalizeVenue(venueData);
      
      setSelectedVenueForEdit(normalizedVenue);
      // Get venueType from local map if available, otherwise from normalized venue
      // Try both string and number ID formats
      const venueId = normalizedVenue.id;
      const storedVenueType = venueTypeMap.get(String(venueId)) || 
                              venueTypeMap.get(venueId) || 
                              normalizedVenue.venueType || 
                              normalizedVenue.venue_type || 
                              '';
      setVenueFormData({
        name: normalizedVenue.name || '',
        description: normalizedVenue.description || '',
        capacity: normalizedVenue.capacity !== undefined && normalizedVenue.capacity !== null ? String(normalizedVenue.capacity) : '',
        price: normalizedVenue.price !== undefined && normalizedVenue.price !== null ? String(normalizedVenue.price) : '',
        locality: normalizedVenue.locality || normalizedVenue.location?.city || '',
        city: normalizedVenue.city || normalizedVenue.location?.city || normalizedVenue.locality || '',
        state: normalizedVenue.state || normalizedVenue.location?.state || '',
        country: normalizedVenue.country || normalizedVenue.location?.country || 'India',
        postal_code: normalizedVenue.postal_code || normalizedVenue.location?.postal_code || '',
        venueType: storedVenueType,
        address: normalizedVenue.address || normalizedVenue.location?.address_line_1 || normalizedVenue.location?.address_line1 || '',
        address_line_1: normalizedVenue.address || normalizedVenue.location?.address_line_1 || normalizedVenue.location?.address_line1 || '',
        address_line_2: normalizedVenue.address_line_2 || normalizedVenue.address_line2 || normalizedVenue.location?.address_line_2 || normalizedVenue.location?.address_line2 || '',
        building_name: normalizedVenue.building_name || normalizedVenue.location?.building_name || '',
        contact: normalizedVenue.contact || venueData.contact || '',
        rooms: (normalizedVenue.rooms || 0).toString(),
        floors: (normalizedVenue.floors || 0).toString(),
        carParking: (normalizedVenue.carParking || 0).toString(),
        bikeParking: (normalizedVenue.bikeParking || 0).toString(),
        externalDecorationAllowed: normalizedVenue.externalDecorationAllowed !== undefined ? normalizedVenue.externalDecorationAllowed : (normalizedVenue.features?.externalDecorator || normalizedVenue.external_decorators_allow || false),
        externalCatererAllowed: normalizedVenue.externalCatererAllowed !== undefined ? normalizedVenue.externalCatererAllowed : (normalizedVenue.features?.externalCaterer || normalizedVenue.external_caterers_allow || false),
        amenities: normalizedVenue.amenities || [],
        seatingArrangements: normalizedVenue.seatingArrangements || [],
        new_photos: normalizedVenue.photos && normalizedVenue.photos.length > 0 ? normalizedVenue.photos : (normalizedVenue.imgList && normalizedVenue.imgList.length > 0 ? normalizedVenue.imgList : []),
        halls: (normalizedVenue.halls || []).map(h => ({
          name: h.name || '',
          capacity: (h.capacity ?? '').toString(),
          price: (h.price ?? '').toString()
        })),
        enabled: normalizedVenue.enabled !== undefined ? normalizedVenue.enabled : (normalizedVenue.status === 'Active')
      });
      setShowEditModal(true);
    } catch (error) {
      let errorMessage = 'Failed to fetch venue details';
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteVenue = (venue) => {
    setSelectedVenueForDelete(venue);
    setShowDeleteModal(true);
  };

  const confirmDeleteVenue = async () => {
    if (!selectedVenueForDelete || !selectedVenueForDelete.id) {
      alert('Venue ID is missing. Cannot delete this venue.');
      return;
    }

    const access = localStorage.getItem("access_token");
    const config = access
      ? { 
          headers: { 
            Authorization: `Bearer ${access}`,
            'Content-Type': 'application/json'
          } 
        }
      : { headers: { 'Content-Type': 'application/json' } };

    try {
      // Make DELETE API call
      await axios.delete(
        `${import.meta.env.VITE_BASEURL}/management/venues/${selectedVenueForDelete.id}/`,
        config
      );

      // Remove venueType from localStorage map if it exists
      if (selectedVenueForDelete.id) {
        const venueIdString = String(selectedVenueForDelete.id);
        setVenueTypeMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(venueIdString);
          return newMap;
        });
      }

      // Update venues list
      const updatedVenues = venues.filter(v => v.id !== selectedVenueForDelete.id);
      setVenues(updatedVenues);
      // Update Redux store
      dispatch(setVenuesRedux(updatedVenues));
      
      // Update selected seating
      setSelectedSeating(prev => prev.filter((_, i) => venues.findIndex(v => v.id !== selectedVenueForDelete.id) !== i));
      
      // Close modal and clear selection
      setShowDeleteModal(false);
      setSelectedVenueForDelete(null);
      
      alert('Venue deleted successfully!');
    } catch (error) {
      let errorMessage = 'Failed to delete venue';
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  // Helper function to convert seating arrangement type to API format
  const convertSeatingTypeToAPI = (type) => {
    if (typeof type === 'string') {
      let converted = type.toLowerCase().trim();
      
      // Map common variations to API format
      const typeMap = {
        'round table': 'round_table',
        'rectangular table': 'rectangular_table',
        'theater style': 'theater',
        'theater': 'theater',
        'classroom style': 'classroom',
        'classroom': 'classroom',
        'dining style': 'dining',
        'dining': 'dining',
        'banquet': 'banquet',
        'cocktail': 'cocktail'
      };
      
      // Check if we have a direct mapping
      if (typeMap[converted]) {
        return typeMap[converted];
      }
      
      // Otherwise, convert to snake_case
      return converted
        .replace(/\s+/g, '_')
        .replace(/_style/gi, '')
        .trim();
    }
    return type;
  };

  // Helper function to convert amenities to API format (lowercase with underscores)
  const convertAmenitiesToAPI = (amenities) => {
    return amenities.map(amenity => {
      if (typeof amenity === 'string') {
        return amenity.toLowerCase().replace(/\s+/g, '_');
      }
      return amenity;
    });
  };

  const saveVenue = async () => {
    if (!venueFormData.name || !venueFormData.capacity || !venueFormData.price) {
      alert('Please fill in all required fields (Name, Capacity, Price)')
      return
    }

    // Validate required location fields
    if (!venueFormData.address_line_1 && !venueFormData.city) {
      alert('Please provide at least Address or City in location')
      return
    }

    // Validate contact number
    if (!venueFormData.contact || venueFormData.contact.trim() === '') {
      alert('Please enter a contact number')
      return
    }

    // Validate contact number format (should be 10 digits, can have + or country code)
    const contactRegex = /^[\+]?[0-9]{10,15}$/;
    const cleanedContact = venueFormData.contact.replace(/[\s\-\(\)]/g, '');
    if (!contactRegex.test(cleanedContact)) {
      alert('Please enter a valid contact number (10-15 digits)')
      return
    }

    if (isSavingVenue) {
      return;
    }

    setIsSavingVenue(true);
    const access = localStorage.getItem("access_token");
    
    try {
      // Build API payload according to the required structure
      const seatingArrangements = venueFormData.seatingArrangements.length > 0 
        ? venueFormData.seatingArrangements.map(sa => {
            const type = typeof sa === 'object' ? sa.type : sa;
            return convertSeatingTypeToAPI(type);
          })
        : (selectedVenueForEdit?.seatingArrangements?.map(sa => {
            const type = typeof sa === 'object' ? sa.type : sa;
            return convertSeatingTypeToAPI(type);
          }) || []);

      const amenities = venueFormData.amenities.length > 0 
        ? convertAmenitiesToAPI(venueFormData.amenities)
        : (selectedVenueForEdit?.amenities ? convertAmenitiesToAPI(selectedVenueForEdit.amenities) : []);

      // Parse capacity and price with proper validation
      const capacityValue = venueFormData.capacity === '' || venueFormData.capacity === null || venueFormData.capacity === undefined
        ? 0
        : (() => {
            const parsed = parseInt(String(venueFormData.capacity).trim(), 10);
            return isNaN(parsed) ? 0 : parsed;
          })();

      const priceValue = venueFormData.price === '' || venueFormData.price === null || venueFormData.price === undefined
        ? 0
        : (() => {
            const parsed = parseFloat(String(venueFormData.price).trim());
            return isNaN(parsed) ? 0 : parsed;
          })();

      // Separate File objects from URL strings in photos
      const photoFiles = venueFormData.new_photos.filter(photo => photo instanceof File);

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add all text/number fields to FormData
      formData.append('name', venueFormData.name);
      formData.append('description', venueFormData.description || `A beautiful venue for ${venueFormData.venueType || 'events'}`);
      formData.append('capacity', capacityValue);
      // price_per_event should be a string in the format "458.00"
      formData.append('price_per_event', priceValue.toString());
      formData.append('rooms', venueFormData.rooms === '' ? 0 : (isNaN(parseInt(venueFormData.rooms)) ? 0 : parseInt(venueFormData.rooms)));
      formData.append('floors', venueFormData.floors === '' ? 0 : (isNaN(parseInt(venueFormData.floors)) ? 0 : parseInt(venueFormData.floors)));
      formData.append('external_decorators_allow', venueFormData.externalDecorationAllowed || false);
      formData.append('external_caterers_allow', venueFormData.externalCatererAllowed || false);
      formData.append('is_active', venueFormData.enabled !== false);

      // Prepare location fields according to new API structure
      // Note: Form uses 'address' field for Address Line 1
      const buildingName = (venueFormData.building_name || '').trim();
      const addressLine1 = (venueFormData.address || venueFormData.address_line_1 || '').trim();
      const addressLine2 = (venueFormData.address_line_2 || '').trim();
      const locality = (venueFormData.locality || '').trim();
      const city = (venueFormData.city || '').trim();
      const state = (venueFormData.state || '').trim();
      const postalCode = (venueFormData.postal_code || '').trim();
      
      // Add location fields
      if (buildingName) {
        formData.append('building_name', buildingName);
      }
      if (addressLine1) {
        formData.append('address_line1', addressLine1);
      }
      if (addressLine2) {
        formData.append('address_line2', addressLine2);
      }
      if (locality) {
        formData.append('locality', locality);
      }
      if (city) {
        formData.append('city', city);
      }
      if (state) {
        formData.append('state', state);
      }
      if (postalCode) {
        formData.append('postal_code', postalCode);
      }

      // Add parking_slots as JSON string (empty object {} if no parking slots)
      const parkingCar = parseInt(venueFormData.carParking) || 0;
      const parkingBike = parseInt(venueFormData.bikeParking) || 0;
      
      if (parkingCar > 0 || parkingBike > 0) {
        formData.append('parking_slots', JSON.stringify({
          car: parkingCar,
          bike: parkingBike
        }));
      } else {
        formData.append('parking_slots', JSON.stringify({}));
      }
      
      // Add contact number if available (not part of location structure)
      if (venueFormData.contact && venueFormData.contact.trim()) {
        const cleanedContact = venueFormData.contact.replace(/[\s\-\(\)]/g, '');
        formData.append('contact', cleanedContact);
      }

      // Add arrays as JSON strings (ensure they are arrays, not undefined)
      formData.append('amenities', JSON.stringify(Array.isArray(amenities) ? amenities : []));
      formData.append('seating_arrangement', JSON.stringify(Array.isArray(seatingArrangements) ? seatingArrangements : []));

      // Add photo files to FormData
      photoFiles.forEach((photoFile, index) => {
        formData.append('photos', photoFile);
      });

      // Configure headers - let axios set Content-Type automatically for FormData (multipart/form-data)
      const config = access
        ? { 
            headers: { 
              Authorization: `Bearer ${access}`
              // Don't set Content-Type - let axios set it automatically with boundary for FormData
            } 
          }
        : { headers: {} };

      // Make API call - PATCH for update, POST for create
      let response;
      if (selectedVenueForEdit?.id) {
        // Update existing venue using PATCH
        response = await axios.patch(
          `${import.meta.env.VITE_BASEURL}/management/venues/${selectedVenueForEdit.id}/`,
          formData,
          config
        );
      } else {
        // Create new venue using POST
        response = await axios.post(
          `${import.meta.env.VITE_BASEURL}/management/venues/`,
          formData,
          config
        );
      }
      
      if (response.data) {
        // Save venueType to local map before refreshing
        // Use string IDs for consistency with localStorage
        if (venueFormData.venueType && selectedVenueForEdit?.id) {
          const venueId = String(selectedVenueForEdit.id);
          setVenueTypeMap(prev => {
            const newMap = new Map(prev);
            newMap.set(venueId, venueFormData.venueType);
            return newMap;
          });
        } else if (venueFormData.venueType && response.data.id) {
          // For new venues, save the venueType using the response ID
          const venueId = String(response.data.id);
          setVenueTypeMap(prev => {
            const newMap = new Map(prev);
            newMap.set(venueId, venueFormData.venueType);
            return newMap;
          });
        }
        
        // Refresh venues list to get updated data
        // Use a separate config for GET request (doesn't need FormData headers)
        const getConfig = access
          ? { headers: { Authorization: `Bearer ${access}` } }
          : undefined;
        const venuesResponse = await axios.get(`${import.meta.env.VITE_BASEURL}/management/venues/`, getConfig);
        const venuesData = venuesResponse.data?.results || venuesResponse.data || [];
        const normalizedVenues = venuesData.map(normalizeVenue);
        setVenues(normalizedVenues);
        // Update Redux store with refreshed venues
        dispatch(setVenuesRedux(normalizedVenues));
        
        // Update selected seating
        setSelectedSeating(normalizedVenues.map(v => 
          v.seatingArrangements && v.seatingArrangements.length > 0 
            ? v.seatingArrangements[0] 
            : seatingOptions[0]
        ));
        
        alert(selectedVenueForEdit ? 'Venue updated successfully!' : 'Venue created successfully!');
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedVenueForEdit(null);
    } catch (error) {
      let errorMessage = 'Failed to save venue';
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSavingVenue(false);
    }
  }

  // Halls management
  const addHall = () => {
    setVenueFormData(prev => ({
      ...prev,
      halls: [...(prev.halls || []), { name: '', capacity: '', price: '' }]
    }));
  };

  const updateHallField = (index, field, value) => {
    setVenueFormData(prev => ({
      ...prev,
      halls: prev.halls.map((h, i) => i === index ? { ...h, [field]: value } : h)
    }));
  };

  const removeHall = (index) => {
    setVenueFormData(prev => ({
      ...prev,
      halls: prev.halls.filter((_, i) => i !== index)
    }));
  };

  // Photo management
  const handlePhotoFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setVenueFormData(prev => ({
        ...prev,
        new_photos: [...prev.new_photos, ...files]
      }));
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const removePhotoFromVenue = (index) => {
    // Clean up object URL if it exists
    setPhotoObjectUrls(prev => {
      const newMap = new Map(prev);
      if (newMap.has(index)) {
        URL.revokeObjectURL(newMap.get(index));
        newMap.delete(index);
      }
      // Shift remaining URLs after this index
      const shiftedMap = new Map();
      newMap.forEach((url, idx) => {
        if (idx > index) {
          shiftedMap.set(idx - 1, url);
        } else if (idx < index) {
          shiftedMap.set(idx, url);
        }
      });
      return shiftedMap;
    });

    setVenueFormData(prev => ({
      ...prev,
      new_photos: prev.new_photos.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoNavigation = (venueIndex, direction) => {
    if (!venues || venues.length === 0) return;

    setPhotoIndices(prev => {
      const base = prev.length === venues.length ? [...prev] : venues.map((_, idx) => prev[idx] || 0);
      const photos = getVenuePhotosList(venues[venueIndex]);
      const total = photos.length;

      if (total <= 1) {
        base[venueIndex] = 0;
        return base;
      }

      const current = base[venueIndex] || 0;
      const nextIndex = ((current + direction) % total + total) % total;
      base[venueIndex] = nextIndex;
      return base;
    });
  };

  // Helper function to get photo preview URL
  const getPhotoPreviewUrl = (photo, index) => {
    if (photo instanceof File) {
      // Check if we already have an object URL for this file
      if (!photoObjectUrls.has(index)) {
        const objectUrl = URL.createObjectURL(photo);
        setPhotoObjectUrls(prev => new Map(prev).set(index, objectUrl));
        return objectUrl;
      }
      return photoObjectUrls.get(index);
    }
    // If it's a string (URL), return as is
    return photo || '';
  };

  // Open amenities modal
  const openAmenitiesModal = (amenities) => {
    setSelectedVenueAmenities(amenities || []);
    setShowAmenitiesModal(true);
  };

  return (
    <div className=" py-3 px-1">
      <div className="max-w-5xl mx-auto">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {canManageVenues && (
            <div className="flex justify-end md:justify-start">
              <button
                onClick={handleAddVenue}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Add Venue
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Venues"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {isLoadingVenues ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading venues...</p>
                <p className="text-sm text-gray-400">Fetching data...</p>
              </div>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-600">
              {searchTerm.trim()
                ? (
                  <span>
                    No venues match "<span className="font-semibold text-gray-800">{searchTerm.trim()}</span>".
                  </span>
                ) : (
                  'No venues found.'
                )}
            </div>
          ) : (
            paginatedVenues.map((venue, i) => {
              const listIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;
              const venuePhotos = getVenuePhotosList(venue);
              const totalPhotos = venuePhotos.length;
              const rawIndex = photoIndices[listIndex] ?? 0;
              const activePhotoIndex = totalPhotos > 0 ? ((rawIndex % totalPhotos) + totalPhotos) % totalPhotos : 0;
              const currentPhoto = venuePhotos[activePhotoIndex] || PLACEHOLDER_VENUE_IMAGE;
              const displayAddress = venue.address
                || venue.location?.address_line_1
                || venue.locality
                || venue.city
                || '';

              return (
                <div key={venue.id || venue.name} className="bg-white rounded-lg flex flex-row items-center overflow-hidden shadow border border-gray-200 min-h-[90px] p-0 md:p-0">
                {/* Image */}
                <div className="relative w-32 md:w-40 h-24 md:h-40 rounded-l-lg overflow-hidden flex-shrink-0">
                  <img src={currentPhoto} alt={venue.name} className="object-cover w-full h-full" />
                  {totalPhotos > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePhotoNavigation(listIndex, -1)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
                        aria-label="Previous photo"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePhotoNavigation(listIndex, 1)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
                        aria-label="Next photo"
                      >
                        ›
                      </button>
                    </>
                  )}
                  <span className="absolute left-2 bottom-2 bg-black/80 text-white px-2 py-0.5 text-xs rounded font-semibold">
                    {totalPhotos > 0 ? `${activePhotoIndex + 1} / ${totalPhotos}` : '1 / 1'}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 px-3 py-1.5 flex flex-col gap-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0">
                    <span className="font-semibold text-black text-sm truncate">{venue.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${venue.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {venue.enabled === false ? 'Hidden' : 'Active'}
                    </span>
                    <FaMapMarkerAlt className="ml-2 text-blue-700 h-3 w-3" />
                    <span className="text-xs text-gray-800 truncate max-w-[140px]">{displayAddress}</span>
                    <IoIosPerson className="ml-2 text-gray-700 h-4.5 w-4.5" />
                    <span className="text-xs text-black">{Math.min(100, venue.capacity || 0)}</span>
                    <IoIosPeople className="text-gray-700 h-4.5 w-4.5 ml-2" />
                    <span className="text-xs text-black">{venue.capacity || venue.maxPax || 0}</span>
                    {(Number(venue.rooms) || 0) > 0 && <span className="text-xs ml-2 text-black">Rooms {venue.rooms}</span>}
                    {(Number(venue.floors) || 0) > 0 && <span className="text-xs ml-2 text-black">Floors {venue.floors}</span>}
                    {(venue.bikeParking > 0 || venue.carParking > 0) && (
                      <>
                        <FaParking className="ml-2 text-gray-700 h-3.5 w-3.5"/>
                        {venue.bikeParking > 0 && (
                          <>
                            <FaMotorcycle className="h-4 w-4 text-gray-700" />
                            <span className="text-xs text-black">{venue.bikeParking}</span>
                          </>
                        )}
                        {venue.carParking > 0 && (
                          <>
                            <FaCarAlt className="ml-2 text-gray-700 h-3.5 w-3.5" />
                            <span className="text-xs text-black ">{venue.carParking}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {!isSeniorCareVenue(venue) && (
                    <div className="flex flex-wrap items-center gap-1 mt-0.5 mb-0.5">
                      {venue.externalDecorationAllowed
                        ? (
                          <span className="px-2 py-0 rounded border bg-green-50 text-green-700 flex items-center gap-1 font-semibold border-green-200 text-xs"><TiTick className="inline-block text-green-600"/>External Decorator</span>
                        ) : (
                          <span className="px-2 py-0 rounded border bg-red-50 text-red-600 flex items-center gap-1 border-red-200 text-xs"><TiTimes className="inline-block text-red-600"/>External Decorator</span>
                        )}
                      {venue.externalCatererAllowed
                        ? (<span className="px-2 py-0 rounded border bg-green-50 text-green-700 flex items-center gap-1 font-semibold border-green-200 text-xs"><TiTick className="inline-block text-green-600"/>External Caterer</span>)
                        : (<span className="px-2 py-0 rounded border bg-red-50 text-red-600 flex items-center gap-1 border-red-200 text-xs"><TiTimes className="inline-block text-red-600"/>External Caterer</span>)}
                    </div>
                  )}
                  {/* Amenities and Seating in Two Columns */}
                  <div className={`grid ${isSeniorCareVenue(venue) ? 'grid-cols-1' : 'grid-cols-2'} gap-3 mt-1 text-xs`}>
                    {/* Amenities Column */}
                    <div>
                      <div className="text-[10px] text-gray-600 font-medium mb-1">Amenities:</div>
                      <div className="flex flex-wrap gap-1">
                        {venue.amenities.slice(0, 2).map(am => (
                          <span key={am} className="bg-gray-100 rounded px-2 py-1 font-medium text-gray-700 text-xs">
                            {am}
                          </span>
                        ))}
                        {venue.amenities.length > 2 && (
                          <button
                            onClick={() => openAmenitiesModal(venue.amenities)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            +{venue.amenities.length - 2} more
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Seating Column - Only show if not Senior Care */}
                    {!isSeniorCareVenue(venue) && (
                    <div>
                        <div className="text-[10px] text-gray-600 font-medium mb-1">Available Seating Arrangements:</div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {venue.seatingArrangements && venue.seatingArrangements.length > 0 ? venue.seatingArrangements.map((sa, saIndex) => {
                            const isSelected = selectedSeating[listIndex]?.type === sa.type;
                            return (
                              <button
                                key={`${venue.id || i}-seating-${saIndex}-${sa.type}`}
                                onClick={() => setSelectedSeating(prev => prev.map((s, idx) => idx === listIndex ? sa : s))}
                                className={`p-1.5 rounded border transition-colors ${
                                  isSelected 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                }`}
                                title={sa.type}
                              >
                                <div className={`${isSelected ? 'brightness-0 invert' : ''}`}>
                                  {seatingIcon(sa.icon)}
                                </div>
                              </button>
                            );
                          }) : null}
                        </div>
                        {/* {venue.seatingArrangements && venue.seatingArrangements.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <label className="text-[10px] text-gray-600">Select seating:</label>
                            <select
                              value={selectedSeating[listIndex]?.type || venue.seatingArrangements[0]?.type}
                              onChange={e => setSelectedSeating(prev => prev.map((s, idx) => idx === listIndex ? venue.seatingArrangements.find(sa => sa.type === e.target.value) || venue.seatingArrangements[0] : s))}
                              className="border rounded px-1.5 py-0.5 text-[11px] text-gray-800"
                            >
                              {venue.seatingArrangements.map((opt, optIndex) => (
                                <option key={`${venue.id || i}-option-${optIndex}-${opt.type}`} value={opt.type}>{opt.type}</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1 text-[11px] text-gray-700">
                              <span className="text-gray-500">Selected:</span>
                              {selectedSeating[listIndex] && seatingIcon(selectedSeating[listIndex].icon)}
                              <span>{selectedSeating[listIndex]?.type}</span>
                            </div>
                          </div>
                        )} */}
                      </div>
                    )}
                  </div>
                </div>
                {/* Price/Select */}
                <div className="flex flex-col justify-between items-end h-full pl-2 pr-3 py-1 min-w-[100px]">
                  {/* <div className="text-xl text-black font-bold whitespace-nowrap">{venue.price} <span className="text-xs font-normal">/ Pax</span></div>
                  <div className="text-[11px] text-gray-600 -mt-0.5 mb-1">Inclusive of food</div> */}
                  <div className="flex flex-col gap-1">
                    {canManageVenues && (
                      <div className="flex gap-1">
                        <button onClick={() => handleEditVenue(venue)} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-4 py-1.5 rounded-md font-semibold shadow flex items-center gap-1 justify-center">
                          <FaEdit className="w-3 h-3" />
                          Edit
                        </button>
                        <button onClick={() => handleDeleteVenue(venue)} className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-1.5 rounded-md font-semibold shadow flex items-center gap-1 justify-center">
                          <FaTrash className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                    <button 
                    onClick={() => {
                      const venueCity = venue.location?.city || venue.city || '';
                      navigate(`/venue/${encodeURIComponent(venueCity)}/${venue.id}?source=dashboard`);
                    }}
                     className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md font-semibold shadow w-20 ml-8">
                      Select
                     </button>
                  </div>
                </div>
                </div>
              );
            })
          )}
        </div>
        {filteredVenues.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredVenues.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredVenues.length}</span> venues
            </div>
            <div className="flex items-center gap-3">
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
        )}
      </div>

      {/* Add Venue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New Venue</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  value={venueFormData.name}
                  onChange={(e) => handleFormInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter venue name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={venueFormData.description}
                  onChange={(e) => handleFormInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter venue description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <input
                  type="number"
                  value={venueFormData.capacity}
                  onChange={(e) => handleFormInputChange('capacity', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter capacity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Pax *</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={venueFormData.price}
                  onChange={(e) => handleFormInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter price per person"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Type</label>
                <select
                  value={venueFormData.venueType}
                  onChange={(e) => handleFormInputChange('venueType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                >
                  <option value="">Select venue type</option>
                  <option value="Party Hall">Party Hall</option>
                  {/* <option value="Senior Care">Senior Care</option> */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={venueFormData.address}
                  onChange={(e) => handleFormInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter address line 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={venueFormData.address_line_2}
                  onChange={(e) => handleFormInputChange('address_line_2', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter address line 2 (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  value={venueFormData.contact}
                  onChange={(e) => handleFormInputChange('contact', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter contact number (e.g., 9876543210)"
                  pattern="[0-9+\-\s\(\)]{10,15}"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={venueFormData.city}
                    onChange={(e) => handleFormInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={venueFormData.locality}
                    onChange={(e) => handleFormInputChange('locality', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter locality"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={venueFormData.state}
                    onChange={(e) => handleFormInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={venueFormData.postal_code}
                    onChange={(e) => handleFormInputChange('postal_code', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={venueFormData.country}
                  onChange={(e) => handleFormInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter country"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                  <input
                    type="number"
                    value={venueFormData.rooms}
                    onChange={(e) => handleFormInputChange('rooms', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Rooms"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                  <input
                    type="number"
                    value={venueFormData.floors}
                    onChange={(e) => handleFormInputChange('floors', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Floors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Parking</label>
                  <input
                    type="number"
                    value={venueFormData.carParking}
                    onChange={(e) => handleFormInputChange('carParking', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Car spaces"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bike Parking</label>
                  <input
                    type="number"
                    value={venueFormData.bikeParking}
                    onChange={(e) => handleFormInputChange('bikeParking', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Bike spaces"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center text-black">
                  <input
                    type="checkbox"
                    checked={venueFormData.externalDecorationAllowed}
                    onChange={(e) => handleFormInputChange('externalDecorationAllowed', e.target.checked)}
                    className="mr-2 text-black"
                  />
                  External Decoration Allowed
                </label>
                <label className="flex items-center text-black">
                  <input
                    type="checkbox"
                    checked={venueFormData.externalCatererAllowed}
                    onChange={(e) => handleFormInputChange('externalCatererAllowed', e.target.checked)}
                    className="mr-2 text-black"
                  />
                  External Caterer Allowed
                </label>
              </div>
              
              {/* Halls Management */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Halls (optional)</label>
                  <button
                    type="button"
                    onClick={addHall}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Add Hall
                  </button>
                </div>
                {(venueFormData.halls || []).length === 0 && (
                  <div className="text-xs text-gray-500">No halls added.</div>
                )}
                <div className="space-y-2">
                  {(venueFormData.halls || []).map((hall, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="block text-xs text-gray-600 mb-1">Hall Name</label>
                        <input
                          type="text"
                          value={hall.name}
                          onChange={(e) => updateHallField(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-black"
                          placeholder="e.g., Grand Ballroom"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 mb-1">Capacity</label>
                        <input
                          type="number"
                          value={hall.capacity}
                          onChange={(e) => updateHallField(index, 'capacity', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-black"
                          placeholder="e.g., 200"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 mb-1">Price per Pax</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={hall.price}
                          onChange={(e) => updateHallField(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-black"
                          placeholder="e.g., 450"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeHall(index)}
                          className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Remove hall"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Photos</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="photo-file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoFileChange}
                      className="flex-1 px-3 py-2 border rounded-md text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {venueFormData.new_photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getPhotoPreviewUrl(photo, index)}
                          alt={`Venue photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                          onError={(e) => {
                            e.target.src = ''
                          }}
                        />
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                          {photo instanceof File ? photo.name : 'Photo'}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhotoFromVenue(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seating Arrangements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seating Arrangements</label>
                <div className="flex flex-wrap gap-2">
                  {seatingOptions.map(opt => (
                    <label key={opt.type} className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={venueFormData.seatingArrangements.some(sa => sa.type === opt.type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFormInputChange('seatingArrangements', [...venueFormData.seatingArrangements, opt]);
                          } else {
                            handleFormInputChange('seatingArrangements', venueFormData.seatingArrangements.filter(sa => sa.type !== opt.type));
                          }
                        }}
                      />
                      <span className="text-sm text-black">{opt.type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {/* Amenities Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add amenity (press Enter)"
                      className="flex-1 px-3 py-2 border rounded-md text-black"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const amenity = e.target.value.trim();
                          if (amenity && !venueFormData.amenities.includes(amenity)) {
                            handleFormInputChange('amenities', [...venueFormData.amenities, amenity]);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        const amenity = input.value.trim();
                        if (amenity && !venueFormData.amenities.includes(amenity)) {
                          handleFormInputChange('amenities', [...venueFormData.amenities, amenity]);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {venueFormData.amenities.map((amenity, index) => (
                      <span key={index} className="bg-gray-100 rounded px-3 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => handleFormInputChange('amenities', venueFormData.amenities.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={venueFormData.enabled}
                  onChange={(e) => handleFormInputChange('enabled', e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Enable this venue</label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveVenue}
                  disabled={isSavingVenue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingVenue ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    'Add Venue'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Venue Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Venue</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  value={venueFormData.name}
                  onChange={(e) => handleFormInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={venueFormData.description}
                  onChange={(e) => handleFormInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter venue description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <input
                  type="number"
                  value={venueFormData.capacity}
                  onChange={(e) => handleFormInputChange('capacity', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Pax *</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={venueFormData.price}
                  onChange={(e) => handleFormInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Type</label>
                <select
                  value={venueFormData.venueType}
                  onChange={(e) => handleFormInputChange('venueType', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                >
                  <option value="">Select venue type</option>
                  <option value="Party Hall">Party Hall</option>
                  <option value="Senior Care">Senior Care</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={venueFormData.address}
                  onChange={(e) => handleFormInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter address line 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={venueFormData.address_line_2}
                  onChange={(e) => handleFormInputChange('address_line_2', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter address line 2 (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  value={venueFormData.contact}
                  onChange={(e) => handleFormInputChange('contact', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter contact number (e.g., 9876543210)"
                  pattern="[0-9+\-\s\(\)]{10,15}"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={venueFormData.city}
                    onChange={(e) => handleFormInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                  <input
                    type="text"
                    value={venueFormData.locality}
                    onChange={(e) => handleFormInputChange('locality', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter locality"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={venueFormData.state}
                    onChange={(e) => handleFormInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={venueFormData.postal_code}
                    onChange={(e) => handleFormInputChange('postal_code', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={venueFormData.country}
                  onChange={(e) => handleFormInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter country"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                  <input
                    type="number"
                    value={venueFormData.rooms}
                    onChange={(e) => handleFormInputChange('rooms', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                  <input
                    type="number"
                    value={venueFormData.floors}
                    onChange={(e) => handleFormInputChange('floors', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Parking</label>
                  <input
                    type="number"
                    value={venueFormData.carParking}
                    onChange={(e) => handleFormInputChange('carParking', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bike Parking</label>
                  <input
                    type="number"
                    value={venueFormData.bikeParking}
                    onChange={(e) => handleFormInputChange('bikeParking', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center  text-black">
                  <input
                    type="checkbox"
                    checked={venueFormData.externalDecorationAllowed}
                    onChange={(e) => handleFormInputChange('externalDecorationAllowed', e.target.checked)}
                    className="mr-2 "
                  />
                  External Decoration Allowed
                </label>
                <label className="flex items-center  text-black">
                  <input
                    type="checkbox"
                    checked={venueFormData.externalCatererAllowed}
                    onChange={(e) => handleFormInputChange('externalCatererAllowed', e.target.checked)}
                    className="mr-2"
                  />
                  External Caterer Allowed
                </label>
              </div>
              
              {/* Halls Management */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Halls (optional)</label>
                  <button
                    type="button"
                    onClick={addHall}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Add Hall
                  </button>
                </div>
                {(venueFormData.halls || []).length === 0 && (
                  <div className="text-xs text-gray-500">No halls added.</div>
                )}
                <div className="space-y-2">
                  {(venueFormData.halls || []).map((hall, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="block text-xs text-gray-600 mb-1">Hall Name</label>
                        <input
                          type="text"
                          value={hall.name}
                          onChange={(e) => updateHallField(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-black"
                          placeholder="e.g., Grand Ballroom"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 mb-1">Capacity</label>
                        <input
                          type="number"
                          value={hall.capacity}
                          onChange={(e) => updateHallField(index, 'capacity', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-black"
                          placeholder="e.g., 200"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 mb-1">Price per Pax</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={hall.price}
                          onChange={(e) => updateHallField(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-black"
                          placeholder="e.g., 450"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeHall(index)}
                          className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Remove hall"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Photos</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="photo-file-edit-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoFileChange}
                      className="flex-1 px-3 py-2 border rounded-md text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {venueFormData.new_photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getPhotoPreviewUrl(photo, index)}
                          alt={`Venue photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                          onError={(e) => {
                            e.target.src = ''
                          }}
                        />
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                          {photo instanceof File ? photo.name : 'Photo'}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhotoFromVenue(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seating Arrangements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seating Arrangements</label>
                <div className="flex flex-wrap gap-2">
                  {seatingOptions.map(opt => (
                    <label key={opt.type} className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={venueFormData.seatingArrangements.some(sa => sa.type === opt.type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFormInputChange('seatingArrangements', [...venueFormData.seatingArrangements, opt]);
                          } else {
                            handleFormInputChange('seatingArrangements', venueFormData.seatingArrangements.filter(sa => sa.type !== opt.type));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{opt.type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {/* Amenities Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add amenity (press Enter)"
                      className="flex-1 px-3 py-2 border rounded-md text-black"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const amenity = e.target.value.trim();
                          if (amenity && !venueFormData.amenities.includes(amenity)) {
                            handleFormInputChange('amenities', [...venueFormData.amenities, amenity]);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        const amenity = input.value.trim();
                        if (amenity && !venueFormData.amenities.includes(amenity)) {
                          handleFormInputChange('amenities', [...venueFormData.amenities, amenity]);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {venueFormData.amenities.map((amenity, index) => (
                      <span key={index} className="bg-gray-100 rounded px-3 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => handleFormInputChange('amenities', venueFormData.amenities.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={venueFormData.enabled}
                  onChange={(e) => handleFormInputChange('enabled', e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Enable this venue</label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveVenue}
                  disabled={isSavingVenue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingVenue ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVenueForDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>"{selectedVenueForDelete?.name}"</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteVenue}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Venue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Modal */}
      {showAmenitiesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">All Amenities</h3>
              <button
                onClick={() => setShowAmenitiesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              {selectedVenueAmenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedVenueAmenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 rounded px-3 py-2 text-sm font-medium text-gray-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No amenities available.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAmenitiesModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenuesDashboard;
