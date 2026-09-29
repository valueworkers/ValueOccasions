import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiStar, FiMapPin, FiPhone, FiBriefcase, FiGlobe, FiCamera, FiCoffee, FiMusic, FiX } from 'react-icons/fi';
import { GiPalette } from 'react-icons/gi';

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
  'Senior Care': FiMusic
};

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

const BookingDashboard = () => {
  const navigate = useNavigate();
  const [adminServices, setAdminServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

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

  const handleServiceClick = (service) => {
    if (adminServices.length > 1) {
      // If more than 1 service, show modal to select
      setSelectedService(service);
      setShowServiceModal(true);
    } else {
      // If only 1 service, navigate directly
      navigateToService(service);
    }
  };

  const navigateToService = (service) => {
    if (!service || !service.id) {
      console.error('Invalid service data:', service);
      return;
    }

    if (service.category === 'Senior Care') {
      navigate('/senior-care', { state: service });
      setShowServiceModal(false);
      setSelectedService(null);
      return;
    }

    // Normalize category for URL (handle Caterers/Catering)
    const normalizeCategoryForUrl = (category) => {
      if (!category) return 'photography'; // default fallback
      if (category === 'Caterers' || category === 'Catering') {
        return 'caterers'; // Use 'caterers' consistently
      }
      return category.toLowerCase();
    };

    const serviceType = normalizeCategoryForUrl(service.category);
    const serviceId = String(service.id); // Ensure it's a string

    const navigationPath = `/services/${serviceType}/${serviceId}`;
    
    
    navigate(navigationPath, { state: service });
    setShowServiceModal(false);
    setSelectedService(null);
  };

  return (
    <div className="py-3 px-1">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Select a Service to Book</h2>
        
        {isLoadingServices ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">Loading services...</div>
        ) : servicesError ? (
          <div className="bg-white rounded-lg p-8 text-center text-red-600">{servicesError}</div>
        ) : adminServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminServices.map((sp) => {
              const theme = categoryTheme[sp.category] || categoryTheme.Photography;
              const Icon = categoryIcon[sp.category] || FiCamera;
              return (
                <div 
                  key={sp.id} 
                  onClick={() => handleServiceClick(sp)}
                  className={`relative bg-white rounded-xl shadow-sm ring-1 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${theme.ring} flex flex-col`}
                >
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
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop';
                      }}
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
                            onClick={(e) => e.stopPropagation()}
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

                    <div className="mt-4">
                      <button 
                        className={`w-full inline-flex items-center justify-center rounded-full text-white px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${theme.button}`}
                      >
                        View Your Service
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">
            <p className="mb-4">No services available for booking.</p>
            <p className="text-sm text-gray-500">Please add services in the Services tab first.</p>
          </div>
        )}

        {/* Service Selection Modal - shown when multiple services exist */}
        {showServiceModal && selectedService && adminServices.length > 1 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowServiceModal(false); setSelectedService(null); }} />
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Select Service to Book</h2>
                <button
                  onClick={() => { setShowServiceModal(false); setSelectedService(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-4">You have multiple services available. Which service would you like to book?</p>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {adminServices.map((service) => {
                    const theme = categoryTheme[service.category] || categoryTheme.Photography;
                    const Icon = categoryIcon[service.category] || FiCamera;
                    const isSelected = selectedService?.id === service.id;
                    
                    return (
                      <div
                        key={service.id}
                        onClick={() => navigateToService(service)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? (service.category === 'Photography' ? 'border-sky-500 bg-sky-50' :
                               service.category === 'Caterers' ? 'border-emerald-500 bg-emerald-50' :
                               service.category === 'Decoration' ? 'border-fuchsia-500 bg-fuchsia-50' :
                               service.category === 'Music' ? 'border-orange-500 bg-orange-50' :
                               'border-teal-500 bg-teal-50')
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <LogoDisplay logo={service.logo} name={service.name} Icon={Icon} iconBg={theme.iconBg} />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            {/* <p className="text-sm text-gray-600">{service.category || 'N/A'}</p> */}
                            <p className="text-xs text-gray-500 mt-1">{service.place || `${service.address || ''}, ${service.city || ''}`}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              navigateToService(service);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${theme.button}`}
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDashboard;

