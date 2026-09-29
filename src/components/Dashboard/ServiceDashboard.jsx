import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiX, FiStar, FiMapPin, FiPhone, FiBriefcase, FiGlobe, FiEdit2, FiTrash2, FiCamera, FiCoffee, FiMusic, FiHeart } from 'react-icons/fi';
import { GiPalette } from 'react-icons/gi';
import CardGridSkeleton from '../ui/CardGridSkeleton';
import FormFieldsSkeleton from '../ui/FormFieldsSkeleton';

const categories = ['Photography', 'Caterers', 'Decoration', 'Music', 'Senior Care'];

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
  'Senior Care': {
    bar: 'bg-teal-500',
    ring: 'ring-teal-200',
    chipBg: 'bg-teal-50 text-teal-800 ring-teal-200',
    chipBgMuted: 'bg-teal-50 text-teal-700 ring-teal-200',
    badgeBg: 'bg-teal-100 text-teal-700',
    button: 'bg-teal-600 hover:bg-teal-700',
    iconBg: 'bg-teal-100 text-teal-600'
  }
};

const categoryIcon = {
  Photography: FiCamera,
  Caterers: FiCoffee,
  Decoration: GiPalette,
  Music: FiMusic,
  'Senior Care': FiHeart
};

const ITEMS_PER_PAGE = 6;

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

const ServiceDashboard = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [adminServices, setAdminServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState('');
  const [isLoadingServiceDetails, setIsLoadingServiceDetails] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [isDeletingService, setIsDeletingService] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    city: '',
    services: '',
    category: '',
    photos: [],
    logo: null,
    website: '',
    description: '',
    quick_info: {
      starting_price_from: '',
      response_time: '',
      advance_booking: '',
      cancellation: ''
    }
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Load admin services from API
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setServicesError('Authorization token missing. Please log in again.');
      return;
    }

    setIsLoadingServices(true);
    setServicesError('');

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/management/services/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Handle different response structures - API returns direct array
      const servicesData = Array.isArray(response.data) ? response.data : (response.data?.results || response.data?.data || []);
      setAdminServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to fetch services.';
      setServicesError(errorMessage);
      setAdminServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      email: '',
      address: '',
      city: '',
      services: '',
      category: '',
      photos: [],
      logo: null,
      website: '',
      description: '',
      quick_info: {
        starting_price_from: '',
        response_time: '',
        advance_booking: '',
        cancellation: ''
      }
    });
  };

  // Handle photo file change with preview - supports multiple files
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData({...formData, photos: [...formData.photos, ...files]});
    }
  };

  // Remove a photo from the photos array
  const handleRemovePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({...formData, photos: newPhotos});
  };

  // Handle logo file change with preview
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, logo: file});
    } else {
      setFormData({...formData, logo: null});
    }
  };

  // Get preview URLs for photos (either File objects or string URLs)
  const getPhotoPreviews = useMemo(() => {
    return formData.photos.map(photo => {
      if (photo instanceof File) {
        return URL.createObjectURL(photo);
      }
      if (typeof photo === 'string') {
        return photo;
      }
      return null;
    }).filter(Boolean);
  }, [formData.photos]);

  // Get preview URL for logo (either File object or string URL)
  const getLogoPreview = useMemo(() => {
    if (!formData.logo) return null;
    if (formData.logo instanceof File) {
      return URL.createObjectURL(formData.logo);
    }
    if (typeof formData.logo === 'string') {
      return formData.logo;
    }
    return null;
  }, [formData.logo]);

  // Cleanup object URLs when they change
  useEffect(() => {
    return () => {
      // Revoke URLs created for File objects in getPhotoPreviews
      formData.photos.forEach(photo => {
        if (photo instanceof File) {
          // Note: URLs are created in getPhotoPreviews useMemo, but we need to revoke them
          // Since useMemo creates new URLs on each change, we revoke old ones here
        }
      });
      if (getLogoPreview && formData.logo instanceof File) {
        URL.revokeObjectURL(getLogoPreview);
      }
    };
  }, [formData.photos, getLogoPreview, formData.logo]);

  const handleAddService = async () => {
    const missingFields = [];
    if (!formData.name || !formData.name.trim()) missingFields.push('Service Name');
    if (!formData.contact || !formData.contact.trim()) missingFields.push('Contact Number');
    if (!formData.address || !formData.address.trim()) missingFields.push('Address');
    if (!formData.city || !formData.city.trim()) missingFields.push('City');
    if (!formData.services || !formData.services.trim()) missingFields.push('Services/Tags');

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n\n${missingFields.join('\n')}`);
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    setIsAddingService(true);

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('contact', formData.contact);
      if (formData.email) {
        formDataToSend.append('email', formData.email);
      }
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      // Convert services string to tags array and send as JSON
      const tagsArray = formData.services.split(',').map(s => s.trim()).filter(s => s);
      formDataToSend.append('tags', JSON.stringify(tagsArray));
      // Category not sent for now
      // if (formData.category) {
      //   formDataToSend.append('category', formData.category);
      // }
      if (formData.website) {
        formDataToSend.append('website', formData.website);
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }

      // Add file fields (photos and logo)
      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((photo) => {
          if (photo instanceof File) {
            formDataToSend.append('photos', photo);
          }
        });
      }
      if (formData.logo && formData.logo instanceof File) {
        formDataToSend.append('logo', formData.logo);
      }

      // Add quick_info as JSON string or individual fields
      if (formData.quick_info) {
        if (formData.quick_info.starting_price_from) {
          formDataToSend.append('starting_price_from', formData.quick_info.starting_price_from);
        }
        if (formData.quick_info.response_time) {
          formDataToSend.append('response_time', formData.quick_info.response_time);
        }
        if (formData.quick_info.advance_booking) {
          formDataToSend.append('advance_booking', formData.quick_info.advance_booking);
        }
        if (formData.quick_info.cancellation) {
          formDataToSend.append('cancellation', formData.quick_info.cancellation);
        }
      }

      // Console log the payload
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          
        } else {
         
        }
      }

      // Make API POST request
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/management/services/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Handle successful response
      if (response.data) {
        alert('Service added successfully!');
        resetForm();
        setShowAddModal(false);
        await loadServices(); // Reload to update the list
      }
    } catch (error) {
      console.error('Error adding service:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to add service. Please try again.';
      alert(errorMessage);
    } finally {
      setIsAddingService(false);
    }
  };

  const handleEditService = async (service) => {
    if (!service || !service.id) {
      alert('Service ID is missing. Cannot edit.');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    setIsLoadingServiceDetails(true);
    setShowEditModal(true);
    setEditingService(service); // Set temporarily for loading state

    try {
      // Fetch the specific service details from API
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/management/services/${service.id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const serviceData = response.data;

      // Parse place into address and city if needed
      let address = serviceData.address || '';
      let city = serviceData.city || '';
      if (!address && !city && serviceData.place) {
        const parts = serviceData.place.split(',').map(s => s.trim());
        if (parts.length >= 2) {
          address = parts.slice(0, -1).join(', ');
          city = parts[parts.length - 1];
        } else {
          address = serviceData.place;
        }
      }
      
      // Get all photos from photos array - photos is array of objects with image field
      const photosArray = (serviceData.photos && Array.isArray(serviceData.photos) && serviceData.photos.length > 0)
        ? serviceData.photos.map(p => p.image || p).filter(Boolean)
        : [];

      // Get tags or services
      const tagsOrServices = Array.isArray(serviceData.tags) && serviceData.tags.length > 0
        ? serviceData.tags
        : (Array.isArray(serviceData.services) ? serviceData.services : []);

      setFormData({
        name: serviceData.name || '',
        contact: serviceData.contact || '',
        email: serviceData.email || '',
        address: address,
        city: city,
        services: tagsOrServices.join(', '),
        category: serviceData.category || '',
        photos: photosArray,
        logo: serviceData.logo || null,
        website: serviceData.website || '',
        description: serviceData.description || '',
        quick_info: serviceData.quick_info && typeof serviceData.quick_info === 'object' ? {
          starting_price_from: serviceData.quick_info.starting_price_from || '',
          response_time: serviceData.quick_info.response_time || '',
          advance_booking: serviceData.quick_info.advance_booking || '',
          cancellation: serviceData.quick_info.cancellation || ''
        } : {
          starting_price_from: serviceData.starting_price_from || '',
          response_time: serviceData.response_time || '',
          advance_booking: serviceData.advance_booking || '',
          cancellation: serviceData.cancellation || ''
        }
      });

      setEditingService(serviceData); // Set the fetched service data
    } catch (error) {
      console.error('Error fetching service details:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to fetch service details.';
      alert(errorMessage);
      setShowEditModal(false);
      setEditingService(null);
    } finally {
      setIsLoadingServiceDetails(false);
    }
  };

  const handleUpdateService = async () => {
    const missingFields = [];
    if (!formData.name || !formData.name.trim()) missingFields.push('Service Name');
    if (!formData.contact || !formData.contact.trim()) missingFields.push('Contact Number');
    if (!formData.address || !formData.address.trim()) missingFields.push('Address');
    if (!formData.city || !formData.city.trim()) missingFields.push('City');
    if (!formData.services || !formData.services.trim()) missingFields.push('Services/Tags');

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n\n${missingFields.join('\n')}`);
      return;
    }

    if (!editingService || !editingService.id) {
      alert('Service ID is missing. Cannot update.');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    setIsUpdatingService(true);

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('contact', formData.contact);
      if (formData.email) {
        formDataToSend.append('email', formData.email);
      }
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      // Convert services string to tags array and send as JSON
      const tagsArray = formData.services.split(',').map(s => s.trim()).filter(s => s);
      formDataToSend.append('tags', JSON.stringify(tagsArray));
      // Category not sent for now
      if (formData.website) {
        formDataToSend.append('website', formData.website);
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }

      // Add file fields (photos and logo) - only if new files are selected
      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((photo) => {
          if (photo instanceof File) {
            formDataToSend.append('photos', photo); // Use 'photos' (plural) for API
          }
        });
      }
      if (formData.logo && formData.logo instanceof File) {
        formDataToSend.append('logo', formData.logo);
      }

      // Add quick_info fields
      if (formData.quick_info) {
        if (formData.quick_info.starting_price_from) {
          formDataToSend.append('starting_price_from', formData.quick_info.starting_price_from);
        }
        if (formData.quick_info.response_time) {
          formDataToSend.append('response_time', formData.quick_info.response_time);
        }
        if (formData.quick_info.advance_booking) {
          formDataToSend.append('advance_booking', formData.quick_info.advance_booking);
        }
        if (formData.quick_info.cancellation) {
          formDataToSend.append('cancellation', formData.quick_info.cancellation);
        }
      }

      // Console log the payload
      
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
         
        } else {
         
        }
      }

      // Make API PUT request
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/management/services/${editingService.id}/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Handle successful response
      if (response.data) {
        alert('Service updated successfully!');
        resetForm();
        setShowEditModal(false);
        setEditingService(null);
        await loadServices(); // Reload to update the list
      }
    } catch (error) {
      console.error('Error updating service:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to update service. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpdatingService(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('Authorization token missing. Please log in again.');
      return;
    }

    setIsDeletingService(true);

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASEURL}/management/services/${serviceId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      alert('Service deleted successfully!');
      await loadServices(); // Reload to update the list
    } catch (error) {
      console.error('Error deleting service:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to delete service. Please try again.';
      alert(errorMessage);
    } finally {
      setIsDeletingService(false);
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(adminServices.length / ITEMS_PER_PAGE)), [adminServices.length]);
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return adminServices.slice(start, start + ITEMS_PER_PAGE);
  }, [adminServices, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [adminServices.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="py-3 px-1">
      <div className="max-w-7xl mx-auto">
        {/* Add Service Button - Similar to VenuesDashboard */}
        <div className="mb-3 flex justify-end gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        {/* Services List - Always Shown */}
        <div className="flex flex-col gap-2">
          {isLoadingServices ? (
            <CardGridSkeleton count={6} />
          ) : servicesError ? (
            <div className="bg-white rounded-lg p-8 text-center text-red-600">{servicesError}</div>
          ) : adminServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedServices.map((sp) => {
                  const theme = categoryTheme[sp.category] || categoryTheme.Photography;
                  const Icon = categoryIcon[sp.category] || FiCamera;
                  return (
                    <div key={sp.id} className={`relative bg-white rounded-xl shadow-sm ring-1 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all ${theme.ring} flex flex-col`}>
                      <span className={`absolute inset-x-0 top-0 h-1 ${theme.bar}`}></span>
                      <div className="h-36 w-full overflow-hidden">
                        <img
                          src={
                            (sp.photos && Array.isArray(sp.photos) && sp.photos.length > 0)
                              ? (sp.photos.find(p => p.is_primary)?.image || sp.photos[0]?.image)
                              : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop'
                          }
                          alt={sp.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          // onError={(e) => {
                          //   e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop';
                          // }}
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">{sp.name}</h3>
                          </div>
                          <LogoDisplay logo={sp.logo} name={sp.name} Icon={Icon} iconBg={theme.iconBg} />
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-gray-700 flex-grow">
                          <div className="flex items-center gap-2"><FiMapPin className="text-gray-500" />{sp.place || `${sp.address || ''}, ${sp.city || ''}`}</div>
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
                              {Array.isArray(sp.tags) && sp.tags.length > 0 ? (
                                sp.tags.map((s, idx) => (
                                  <span key={idx} className={`px-2 py-0.5 rounded-full text-[11px] ring-1 ${theme.chipBgMuted}`}>{s}</span>
                                ))
                              ) : Array.isArray(sp.services) && sp.services.length > 0 ? (
                                sp.services.map((s, idx) => (
                                  <span key={idx} className={`px-2 py-0.5 rounded-full text-[11px] ring-1 ${theme.chipBgMuted}`}>{s}</span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic text-xs">No tags</span>
                              )}
                            </div>
                          </div>
                          {sp.category && (
                            <div className={`mt-1 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full ${theme.badgeBg}`}>{sp.category}</div>
                          )}
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          {/* <button 
                            onClick={() => {
                              // Navigate to service details page
                              if (sp.category === 'Senior Care') {
                                navigate('/senior-care', { state: sp });
                              } else {
                                navigate(`/services/${sp.category.toLowerCase()}/${sp.id}`, { state: sp });
                              }
                            }}
                            className={`inline-flex items-center justify-center rounded-full text-white px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${theme.button}`}
                          >
                            Select Service
                          </button> */}
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditService(sp)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                              title="Edit Service"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(sp.id)}
                              disabled={isDeletingService}
                              className={`p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 ${isDeletingService ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isDeletingService ? 'Deleting...' : 'Delete Service'}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center text-gray-600">No services found.</div>
            )}
        </div>
        {adminServices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold">
                {adminServices.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, adminServices.length)}
              </span>{' '}
              of <span className="font-semibold">{adminServices.length}</span> services
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

        {/* Edit Service Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); resetForm(); setEditingService(null); setIsLoadingServiceDetails(false); }} />
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Edit Service</h2>
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); setEditingService(null); setIsLoadingServiceDetails(false); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              {isLoadingServiceDetails ? (
                <FormFieldsSkeleton fields={8} />
              ) : (
                <>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter service name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="example@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, State"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Multiple)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can select multiple photos at once. Existing photos will be shown below.</p>
                    {formData.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {formData.photos.map((photo, index) => {
                          const previewUrl = photo instanceof File 
                            ? URL.createObjectURL(photo) 
                            : photo;
                          return (
                            <div key={index} className="relative group">
                              <img
                                src={previewUrl}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove photo"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                              {photo instanceof File && (
                                <p className="text-xs text-gray-500 mt-1 truncate" title={photo.name}>
                                  {photo.name}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {getLogoPreview && (
                      <div className="mt-2">
                        <img
                          src={getLogoPreview}
                          alt="Logo preview"
                          className="w-32 h-32 object-contain rounded-lg border border-gray-300 bg-gray-50"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {formData.logo instanceof File && (
                          <p className="text-xs text-gray-500 mt-1">Selected: {formData.logo.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter service description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Services/Tags *</label>
                  <input
                    type="text"
                    value={formData.services}
                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Wedding Photography, Cinematic Video, Drone Shots (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple services with commas</p>
                </div>
                
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quick Info</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Starting Price From</label>
                      <input
                        type="text"
                        value={formData.quick_info.starting_price_from}
                        onChange={(e) => setFormData({
                          ...formData,
                          quick_info: { ...formData.quick_info, starting_price_from: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., ₹5000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Response Time</label>
                      <input
                        type="text"
                        value={formData.quick_info.response_time}
                        onChange={(e) => setFormData({
                          ...formData,
                          quick_info: { ...formData.quick_info, response_time: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 24 hours"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Advance Booking</label>
                      <input
                        type="text"
                        value={formData.quick_info.advance_booking}
                        onChange={(e) => setFormData({
                          ...formData,
                          quick_info: { ...formData.quick_info, advance_booking: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cancellation</label>
                      <input
                        type="text"
                        value={formData.quick_info.cancellation}
                        onChange={(e) => setFormData({
                          ...formData,
                          quick_info: { ...formData.quick_info, cancellation: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Free cancellation"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); setEditingService(null); setIsLoadingServiceDetails(false); }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateService}
                  disabled={isLoadingServiceDetails || isUpdatingService}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ${isLoadingServiceDetails || isUpdatingService ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdatingService ? 'Updating...' : 'Update Service'}
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); resetForm(); }} />
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Add New Service</h2>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter service name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="example@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, State"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Multiple)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can select multiple photos at once</p>
                    {formData.photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {formData.photos.map((photo, index) => {
                          const previewUrl = photo instanceof File 
                            ? URL.createObjectURL(photo) 
                            : photo;
                          return (
                            <div key={index} className="relative group">
                              <img
                                src={previewUrl}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove photo"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                              {photo instanceof File && (
                                <p className="text-xs text-gray-500 mt-1 truncate" title={photo.name}>
                                  {photo.name}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {getLogoPreview && (
                      <div className="mt-2">
                        <img
                          src={getLogoPreview}
                          alt="Logo preview"
                          className="w-32 h-32 object-contain rounded-lg border border-gray-300 bg-gray-50"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {formData.logo instanceof File && (
                          <p className="text-xs text-gray-500 mt-1">Selected: {formData.logo.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter service description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Services/Tags *</label>
                  <input
                    type="text"
                    value={formData.services}
                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Wedding Photography, Cinematic Video, Drone Shots (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple services with commas</p>
                </div>
                
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quick Info</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Starting Price From</label>
                      <input
                        type="text"
                        value={formData.quick_info.starting_price_from}
                        onChange={(e) => setFormData({
                          ...formData,
                          quick_info: { ...formData.quick_info, starting_price_from: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., ₹5000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Response Time</label>
                      <input
                        type="text"
                        value={formData.quick_info.response_time}
                        onChange={(e) => setFormData({
                          ...formData,
                          quick_info: { ...formData.quick_info, response_time: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 24 hours"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Advance Booking</label>
                      <input
                        type="text"
                        value={formData.quick_info.advance_booking}
                        onChange={(e) => setFormData({
                          ...formData,
                          quick_info: { ...formData.quick_info, advance_booking: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cancellation</label>
                      <input
                        type="text"
                        value={formData.quick_info.cancellation}
                        onChange={(e) => setFormData({
                          ...formData,
                          quick_info: { ...formData.quick_info, cancellation: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Free cancellation"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  disabled={isAddingService}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ${isAddingService ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isAddingService ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </div>
        </div>
        )}
    </div>
  </div>
);
};

export default ServiceDashboard;
