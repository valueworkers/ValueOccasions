import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';
import { updateCity } from '../store/slices/citySlice';
import axios from 'axios'

const NavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const selectedCity = useSelector((state) => state.city.selectedCity)
  const [authUser, setAuthUser] = useState(null)
  
  // Check if user is admin and on dashboard
  const isAdminOnDashboard = authUser && 
    ['MASTER_ADMIN', 'VSRE_OWNER', 'VSRE_MANAGER'].includes(authUser.user_type) && 
    location.pathname === '/dashboard'
  const [isOpen, setIsOpen] = useState(false);
  const [isVenueOpen, setIsVenueOpen] = useState(false); // Add this state for venue dropdown
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [apiCities, setApiCities] = useState([]);
  const dropdownRef = useRef(null);
  const navigations = [
    { name: 'Home', to: '/' },
    { name: 'Contact', to: '/contact' },
    {name: "Price", to:"/priceList"}
  ];

  useEffect(() => {
    const syncAuthFromStorage = () => {
      const newRaw = localStorage.getItem('authUser')
      setAuthUser(newRaw ? JSON.parse(newRaw) : null)
    }
    // initial
    syncAuthFromStorage()
    // listen to storage (cross-tab) and custom in-tab events
    window.addEventListener('storage', syncAuthFromStorage)
    window.addEventListener('auth-changed', syncAuthFromStorage)
    return () => {
      window.removeEventListener('storage', syncAuthFromStorage)
      window.removeEventListener('auth-changed', syncAuthFromStorage)
    }
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setShowUserDropdown(false);
    setIsOpen(false);

    const refresh = localStorage.getItem('refresh_token');
    const access = localStorage.getItem('access_token');

    if (!refresh || !access) {
      clearAuthData();
      navigate('/');
      setIsLoggingOut(false);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BASEURL}/accounts/logout/`,
        { refresh_token: refresh },
        {
          headers: {
            Authorization: `Bearer ${access}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error(
        'Logout error:',
        error.response?.status,
        error.response?.data || error.message
      );
    } finally {
      clearAuthData();
      navigate('/');
      setIsLoggingOut(false);
    }
  };

// helper function to clear localStorage and notify listeners
const clearAuthData = () => {
  localStorage.removeItem("authUser");
  localStorage.removeItem("authTokens");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("access_token");
  window.dispatchEvent(new Event("auth-changed"));
};

  const popularCities = [
    { name: 'Mumbai', icon: '🌉' },        // Gateway of India / Marine Drive
  { name: 'Delhi-NCR', icon: '🕌' },     // India Gate / Red Fort
  { name: 'Bengaluru', icon: '🏢' },    // Modern IT skyline
  { name: 'Hyderabad', icon: '🏰' },    // Charminar
  { name: 'Ahmedabad', icon: '🕌' },    // Jama Masjid
  { name: 'Chandigarh', icon: '🏛️' },  // Capitol Complex
  { name: 'Chennai', icon: '🛕' },      // Kapaleeshwarar Temple
  { name: 'Pune', icon: '🏰' },         // Shaniwar Wada
  { name: 'Kolkata', icon: '🌉' },      // Howrah Bridge
  { name: 'Kochi', icon: '⛵' },        // Backwaters / Chinese Fishing Nets
  { name: 'Jaipur', icon: '🏰' },       // Hawa Mahal / Amber Fort
  { name: 'Lucknow', icon: '🏛️' },     // Bara Imambara
  { name: 'Nagpur', icon: '🛕' },       // Deekshabhoomi
  { name: 'Indore', icon: '🏢' },       // Rajwada Palace
  { name: 'Bhopal', icon: '🏰' },       // Taj-ul-Masajid
  { name: 'Patna', icon: '🕌' },        // Golghar
  { name: 'Vadodara', icon: '🏰' },     // Laxmi Vilas Palace
  { name: 'Surat', icon: '🏙️' },       // Textile city skyline
  { name: 'Visakhapatnam', icon: '🏖️' }, // Beaches
  { name: 'Coimbatore', icon: '🏭' }    // Industrial city / textile mills
  ];

  // Base cities list (fallback if API fails)
  const baseCities = ["Mumbai","Delhi","Bengaluru","Chennai","Kolkata","Hyderabad","Pune",
    "Ahmedabad","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Bhopal","Patna","Vadodara",
    "Surat","Varanasi","Visakhapatnam","Coimbatore","Kochi","Thiruvananthapuram","Madurai",
    "Mysuru","Mangaluru","Belagavi","Hubballi","Kalaburagi","Davangere","Shivamogga","Ballari",
    "Tumakuru","Raichur","Bidar","Hassan","Mandya","Chitradurga","Kolar","Karwar","Hospet",
    "Bagalkot","Bijapur","Chikkamagaluru","Gadag","Udupi","Sirsi","Bhadravati","Yadgir",
    "Koppal","Dharwad","Amritsar","Ludhiana","Chandigarh","Guwahati","Ranchi","Raipur",
    "Bhubaneswar","Noida","Gurugram","Faridabad","Ghaziabad","Jodhpur","Udaipur","Agra",
    "Meerut","Prayagraj","Jabalpur","Aurangabad","Nashik","Rajkot","Gwalior","Jamshedpur",
    "Dehradun","Shimla","Srinagar","Jammu","Panaji","Margao","Dhanbad","Asansol","Durgapur",
    "Siliguri","Howrah","Navi Mumbai","Thane","Solapur","Kolhapur","Satara","Sangli",
    "Tiruchirappalli","Erode","Salem","Tirunelveli","Tiruppur","Vellore","Kanchipuram",
    "Nagercoil","Tuticorin","Rajahmundry","Kakinada","Guntur","Nellore","Anantapur","Tirupati",
    "Kurnool","Ongole","Eluru","Nizamabad","Karimnagar","Warangal","Khammam","Adilabad",
    "Mahbubnagar","Suryapet","Nalgonda","Imphal","Aizawl","Agartala","Shillong","Itanagar",
    "Kohima","Gangtok","Dibrugarh","Tinsukia","Silchar","Tezpur","Jorhat","Bongaigaon",
    "Aligarh","Moradabad","Saharanpur","Bareilly","Gorakhpur","Firozabad","Mathura","Ayodhya",
    "Muzaffarnagar","Sitapur","Etawah","Jhansi","Shahjahanpur","Bulandshahr","Mirzapur",
    "Barabanki","Deoria","Ghazipur","Morena","Sagar","Satna","Rewa","Katni","Chhindwara",
    "Seoni","Betul","Ratlam","Khandwa","Khargone","Burhanpur","Dewas","Ujjain"]

  // Combine base cities with API cities, remove duplicates
  const allCities = useMemo(() => {
    // Extract city names from API response (handle both object and string formats)
    const apiCityNames = apiCities.map(city => 
      typeof city === 'string' ? city : (city.name || city.cityName || '')
    ).filter(Boolean);
    
    // Combine base cities with API cities and remove duplicates
    const combined = [...new Set([...baseCities, ...apiCityNames])];
    return combined.sort();
  }, [apiCities])

  const filteredCities = allCities.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (city) => {
    dispatch(updateCity(city));
    setShowCityModal(false);
    setCitySearch('');
  };
  

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Using BigDataCloud API (CORS-friendly)
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await res.json();
            
            // Update the selected city with the detected city
            if (data.city) {
              dispatch(updateCity(data.city));
              setShowCityModal(false);
              setCitySearch('');
            } else {
              alert('Unable to detect your city. Please select manually.');
            }
          } catch (err) {
            console.error('Error fetching location data:', err);
            alert('Error detecting your location. Please select manually.');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to detect your location. Please select manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.countrystatecity.in/v1/countries/IN/cities', {
          headers: {
            'X-CSCAPI-KEY': import.meta.env.VITE_COUNTRY_STATE_CITY_API_KEY
          }
        });
        
        if (response.ok) {
          const cities = await response.json();
          setApiCities(cities);
        } else {
          console.error('Failed to fetch cities from API:', response.status);
        }
      } catch (error) {
        console.error('Error fetching cities from API:', error);
      }
    };

    fetchData();
  }, [])
  return (
    <div>
      <nav className="bg-white shadow-lg sticky top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/">
                  <h1 className="text-3xl md:text-4xl font-extrabold ml-4 tracking-wide">
                    <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                      ValueOccasions
                    </span>
                  </h1>
                </Link>
              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8 ml-8">
              {/* City Selection Button */}
              {!isAdminOnDashboard && (
                <button
                  onClick={() => setShowCityModal(true)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <MapPinIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{selectedCity}</span>
                  <span className="text-gray-500">▾</span>
                </button>
              )}

              {navigations.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 text-gray-700 hover:text-blue-600"
                >
                  {item.name}
                </Link>
              ))}

              {!authUser ? (
                <Link to="/login" className="px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 text-gray-700 hover:text-blue-600">Login</Link>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-semibold">
                    {authUser.first_name ? authUser.first_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="font-medium">{authUser.first_name} {authUser.last_name}</div>
                    
                  </div>
                  
                  {/* User Dropdown for all logged-in users */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="text-gray-700">Menu</span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          {['MASTER_ADMIN','VSRE_OWNER','VSRE_MANAGER'].includes(authUser?.user_type) && (
                            <Link
                              to="/dashboard"
                              onClick={() => setShowUserDropdown(false)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            >
                              Dashboard
                            </Link>
                          )}
                          <Link
                            to="/my-bookings"
                            onClick={() => setShowUserDropdown(false)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            My Bookings
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setShowUserDropdown(false)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            Settings
                          </Link>
                          <Link
                            to="/customize-profile"
                            onClick={() => setShowUserDropdown(false)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            Customize Profile
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            type="button"
                            disabled={isLoggingOut}
                            onClick={() => handleLogout()}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2 ${
                              isLoggingOut
                                ? 'text-gray-400 cursor-wait opacity-60'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {isLoggingOut ? (
                              <>
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-300 border-t-indigo-600 inline-block shrink-0" aria-hidden />
                                Logging out…
                              </>
                            ) : (
                              'Logout'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              {/* Mobile City Selection Button */}
              {!isAdminOnDashboard && (
                <button
                  onClick={() => setShowCityModal(true)}
                  className="w-full text-left text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                >
                  <MapPinIcon className="h-4 w-4" />
                  {selectedCity}
                </button>
              )}

              {navigations.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {!authUser ? (
                <Link to="/login" className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Login</Link>
              ) : (
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-semibold">
                      {authUser.first_name ? authUser.first_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{authUser.first_name} {authUser.last_name}</div>
                      <div className="text-xs text-gray-500">{authUser.user_type_display}</div>
                    </div>
                  </div>
                  
                  {/* User Dropdown for Mobile */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="text-gray-700">Menu</span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          {['MASTER_ADMIN','VSRE_OWNER','VSRE_MANAGER'].includes(authUser?.user_type) && (
                            <Link
                              to="/dashboard"
                              onClick={() => {
                                setShowUserDropdown(false);
                                setIsOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            >
                              Dashboard
                            </Link>
                          )}
                          <Link
                            to="/my-bookings"
                            onClick={() => {
                              setShowUserDropdown(false);
                              setIsOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            My Bookings
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => {
                              setShowUserDropdown(false);
                              setIsOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            Settings
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => {
                              setShowUserDropdown(false);
                              setIsOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            Customize Profile
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            type="button"
                            disabled={isLoggingOut}
                            onClick={() => handleLogout()}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2 ${
                              isLoggingOut
                                ? 'text-gray-400 cursor-wait opacity-60'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {isLoggingOut ? (
                              <>
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-300 border-t-indigo-600 inline-block shrink-0" aria-hidden />
                                Logging out…
                              </>
                            ) : (
                              'Logout'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {isLoggingOut && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          role="status"
          aria-busy="true"
          aria-live="polite"
          aria-label="Signing out"
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 px-8 py-6 flex flex-col items-center gap-3 max-w-sm w-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            <p className="text-base font-semibold text-gray-900">Signing you out</p>
            <p className="text-sm text-gray-500 text-center">Please wait a moment…</p>
          </div>
        </div>
      )}

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-2 sm:pt-4 px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCityModal(false)} />
          <div className="relative w-full max-w-2xl mb-4">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-white">
              {/* Modal Header with Close Button */}
              <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Select Your City</h2>
                <button
                  onClick={() => setShowCityModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-3 max-h-[70vh] overflow-y-auto">
                {/* Search Bar */}
                <div className="relative mb-2">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for your city"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full pl-9 pr-3 text-black py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Detect Location Button */}
                <button
                  onClick={handleLocationDetect}
                  className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-700 font-medium">Detect my location</span>
                </button>

                {/* Popular Cities */}
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Popular Cities</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                    {popularCities.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city.name)}
                        className="flex flex-col items-center p-1.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <span className="text-base mb-0.5">{city.icon}</span>
                        <span className="text-xs font-medium text-gray-700 text-center">{city.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Cities List */}
                
                  <div className="relative p-2 bg-white rounded-xl shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5">All Cities</h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {filteredCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          aria-label={`Select city ${city}`}
                          className={`text-left px-2 py-1 rounded-lg transition-colors duration-200 
          hover:bg-gray-100 
          ${selectedCity === city ? "bg-gray-200 font-medium" : "bg-white"}`}
                        >
                          <span className="text-xs text-gray-700">{city}</span>
                        </button>
                      ))}
                    </div>
                  </div>


                

                {/* View All Cities Link */}
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NavBar