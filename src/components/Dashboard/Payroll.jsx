import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import PayrollForm from './PayrollForm';
import EmployeeCardGridSkeleton from '../ui/EmployeeCardGridSkeleton';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D';

const Payroll = ({ 
  isVsreOwner, 
  subTab, 
  setSubTab,
  attendanceRecords = {} 
}) => {
  const [staff, setStaff] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [managersError, setManagersError] = useState('');
  const [searchStaff, setSearchStaff] = useState('');
  const [searchManager, setSearchManager] = useState('');
  const [currentPageStaff, setCurrentPageStaff] = useState(1);
  const [currentPageManagers, setCurrentPageManagers] = useState(1);
  const [nextUrlStaff, setNextUrlStaff] = useState(null);
  const [previousUrlStaff, setPreviousUrlStaff] = useState(null);
  const [totalCountStaff, setTotalCountStaff] = useState(0);
  const [nextUrlManagers, setNextUrlManagers] = useState(null);
  const [previousUrlManagers, setPreviousUrlManagers] = useState(null);
  const [totalCountManagers, setTotalCountManagers] = useState(0);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [selectedPayrollEmployee, setSelectedPayrollEmployee] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const extractArray = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.data?.results)) return payload.data.results;
    return [];
  };

  const normalizeManagerFromApi = (data) => {
    if (!data) return null;
    const fullName = [data.first_name, data.middle_name, data.last_name]
      .filter(Boolean)
      .join(' ');
    return {
      id: data.id ?? Date.now(),
      name: fullName || data.name || 'New Manager',
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      mobile: data.mobile_number || data.phone || '',
      email: data.email || '',
      userPersona: 'MANAGER',
      photo: data.profile_pic || data.photo || DEFAULT_PHOTO,
      empActive: data.is_active !== undefined ? data.is_active : true,
    };
  };

  const normalizeStaffFromApi = (data) => {
    if (!data) return null;
    const fullName = [data.first_name, data.middle_name, data.last_name]
      .filter(Boolean)
      .join(' ');
    return {
      id: data.id ?? Date.now(),
      name: fullName || data.name || 'New Staff',
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      mobile: data.mobile_number || data.phone || '',
      email: data.email || '',
      userPersona: 'STAFF',
      photo: data.profile_pic || data.photo || DEFAULT_PHOTO,
      empActive: data.is_active !== undefined ? data.is_active : true,
    };
  };

  const fetchManagers = useCallback(async (url = null, searchQuery = '') => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setManagersError('Authorization token missing. Please log in again.');
      return;
    }

    setIsLoadingManagers(true);
    setManagersError('');

    try {
      const baseUrl = `${import.meta.env.VITE_BASEURL}`.replace(/\/$/, '');
      const managerBaseUrl = `${baseUrl}/accounts/vsre-manager/`;
      
      let apiUrl = url || managerBaseUrl;
      
      if (searchQuery.trim() && !url) {
        const separator = apiUrl.includes('?') ? '&' : '?';
        apiUrl = `${apiUrl}${separator}search=${encodeURIComponent(searchQuery.trim())}`;
      } else if (searchQuery.trim() && url) {
        try {
          const urlObj = new URL(url);
          if (!urlObj.searchParams.has('search')) {
            urlObj.searchParams.set('search', searchQuery.trim());
            apiUrl = urlObj.toString();
          } else {
            apiUrl = url;
          }
        } catch (e) {
          const separator = url.includes('?') ? '&' : '?';
          apiUrl = `${url}${separator}search=${encodeURIComponent(searchQuery.trim())}`;
        }
      }

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const managersPayload = extractArray(response.data);
      
      const nextUrl = response.data?.next;
      const previousUrl = response.data?.previous;
      setNextUrlManagers(nextUrl && typeof nextUrl === 'string' && nextUrl.trim() ? nextUrl : null);
      setPreviousUrlManagers(previousUrl && typeof previousUrl === 'string' && previousUrl.trim() ? previousUrl : null);
      setTotalCountManagers(response.data?.count || managersPayload.length);
      
      if (response.data?.current_page !== undefined) {
        setCurrentPageManagers(response.data.current_page);
      }

      const normalizedManagers = managersPayload.map(normalizeManagerFromApi).filter(Boolean);
      setManagers(normalizedManagers);
    } catch (error) {
      const responseData = error.response?.data;
      let message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        error.message ||
        'Failed to fetch managers.';
      setManagersError(message);
      setManagers([]);
    } finally {
      setIsLoadingManagers(false);
    }
  }, []);

  const fetchStaff = useCallback(async (url = null, searchQuery = '') => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setStaffError('Authorization token missing. Please log in again.');
      return;
    }

    setIsLoadingStaff(true);
    setStaffError('');

    try {
      const baseUrl = `${import.meta.env.VITE_BASEURL}`.replace(/\/$/, '');
      const staffBaseUrl = `${baseUrl}/accounts/vsre-staff/`;
      
      let apiUrl = url || staffBaseUrl;
      
      if (searchQuery.trim() && !url) {
        const separator = apiUrl.includes('?') ? '&' : '?';
        apiUrl = `${apiUrl}${separator}search=${encodeURIComponent(searchQuery.trim())}`;
      } else if (searchQuery.trim() && url) {
        try {
          const urlObj = new URL(url);
          if (!urlObj.searchParams.has('search')) {
            urlObj.searchParams.set('search', searchQuery.trim());
            apiUrl = urlObj.toString();
          } else {
            apiUrl = url;
          }
        } catch (e) {
          const separator = url.includes('?') ? '&' : '?';
          apiUrl = `${url}${separator}search=${encodeURIComponent(searchQuery.trim())}`;
        }
      }

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const staffPayload = extractArray(response.data);
      
      const nextUrl = response.data?.next;
      const previousUrl = response.data?.previous;
      setNextUrlStaff(nextUrl && typeof nextUrl === 'string' && nextUrl.trim() ? nextUrl : null);
      setPreviousUrlStaff(previousUrl && typeof previousUrl === 'string' && previousUrl.trim() ? previousUrl : null);
      setTotalCountStaff(response.data?.count || staffPayload.length);
      
      if (response.data?.current_page !== undefined) {
        setCurrentPageStaff(response.data.current_page);
      }

      const normalizedStaff = staffPayload.map(normalizeStaffFromApi).filter(Boolean);
      setStaff(normalizedStaff);
    } catch (error) {
      const responseData = error.response?.data;
      let message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        error.message ||
        'Failed to fetch staff.';
      setStaffError(message);
      setStaff([]);
    } finally {
      setIsLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    if (isVsreOwner && subTab === 'my-manager') {
      setNextUrlManagers(null);
      setPreviousUrlManagers(null);
      setCurrentPageManagers(1);
      fetchManagers();
    }
    if (isVsreOwner && subTab === 'my-staff') {
      setNextUrlStaff(null);
      setPreviousUrlStaff(null);
      setCurrentPageStaff(1);
      fetchStaff(null, '');
    }
  }, [isVsreOwner, subTab, fetchManagers, fetchStaff]);

  const handleSearchStaff = () => {
    if (subTab === 'my-staff') {
      setCurrentPageStaff(1);
      fetchStaff(null, searchStaff);
    }
  };

  const handleSearchManager = () => {
    if (subTab === 'my-manager') {
      setCurrentPageManagers(1);
      fetchManagers(null, searchManager);
    }
  };

  const filteredStaff = useMemo(() => {
    return staff;
  }, [staff]);

  const filteredManagers = useMemo(() => {
    return managers;
  }, [managers]);

  if (!isVsreOwner) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 text-center">
        <p className="text-gray-700 text-lg font-medium mb-2">Only VSRE_OWNERs can access this section.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between gap-1.5 mb-3">
        <button 
          onClick={() => setSubTab('my-staff')} 
          className={`flex-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all text-xs ${subTab==='my-staff' ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-300'}`}
        >
          <span className="font-semibold italic text-gray-900">My Staff</span>
        </button>
        <button 
          onClick={() => setSubTab('my-manager')} 
          className={`flex-1 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all text-xs ${subTab==='my-manager' ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-300'}`}
        >
          <span className="font-semibold italic text-gray-900">My Manager</span>
        </button>
      </div>

      {/* Payroll Panels - My Staff */}
      {subTab === 'my-staff' && (
        <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h3 className="text-lg font-bold text-gray-900">My Staff</h3>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-700">Search:</label>
              <div className="flex items-center gap-1">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchStaff}
                    onChange={(e) => setSearchStaff(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchStaff();
                      }
                    }}
                    placeholder="Search by name or mobile..."
                    disabled={isLoadingStaff}
                    className={`px-2.5 py-1.5 pr-8 rounded-lg border-2 border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-indigo-500 w-full sm:w-56 ${isLoadingStaff ? 'opacity-60 cursor-wait' : ''}`}
                  />
                  {isLoadingStaff ? (
                    <div className="absolute right-2">
                      <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : searchStaff.trim() ? (
                    <button
                      onClick={() => {
                        setSearchStaff('');
                        setCurrentPageStaff(1);
                        fetchStaff(null, '');
                      }}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clear search"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : null}
                </div>
                <button
                  onClick={handleSearchStaff}
                  disabled={isLoadingStaff}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isLoadingStaff
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  title="Search"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          {isLoadingStaff ? (
            <EmployeeCardGridSkeleton count={6} />
          ) : staffError ? (
            <div className="text-center text-red-600 py-12 text-lg">{staffError}</div>
          ) : filteredStaff.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center">
              <p className="text-gray-600 text-lg">
                {searchStaff.trim() ? 'No staff found matching your search.' : 'No staff found.'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {searchStaff.trim() ? 'Try a different search term.' : 'Staff data will appear here once records are available.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredStaff.map((staffMember) => (
                  <div key={staffMember.id} className="bg-white rounded-lg border-2 border-gray-200 p-2 hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <img 
                        src={staffMember.photo || DEFAULT_PHOTO} 
                        alt={staffMember.name} 
                        onError={(e) => {
                          e.target.src = DEFAULT_PHOTO;
                        }}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-300" 
                      />
                      <div className="font-semibold text-gray-900 text-xs">{staffMember.name}</div>
                      <button
                        onClick={() => {
                          setSelectedPayrollEmployee(staffMember);
                          setShowPayrollForm(true);
                        }}
                        className="w-full px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Payroll
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalCountStaff > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2">
                  <div className="text-xs text-gray-600">
                    {searchStaff.trim() ? (
                      <>Showing <span className="font-semibold">{filteredStaff.length}</span> of <span className="font-semibold">{totalCountStaff}</span> staff (filtered)</>
                    ) : (
                      <>Showing <span className="font-semibold">
                        {filteredStaff.length === 0 ? 0 : (currentPageStaff - 1) * ITEMS_PER_PAGE + 1}-{Math.min((currentPageStaff - 1) * ITEMS_PER_PAGE + filteredStaff.length, totalCountStaff)}
                      </span> of <span className="font-semibold">{totalCountStaff}</span> staff</>
                    )}
                  </div>
                  {totalCountStaff > 0 && (
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          if (previousUrlStaff && !isLoadingStaff) {
                            fetchStaff(previousUrlStaff, searchStaff);
                          }
                        }} 
                        disabled={!previousUrlStaff || isLoadingStaff}
                        className={`px-2 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                          !previousUrlStaff || isLoadingStaff 
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          if (nextUrlStaff && !isLoadingStaff) {
                            fetchStaff(nextUrlStaff, searchStaff);
                          }
                        }} 
                        disabled={!nextUrlStaff || isLoadingStaff}
                        className={`px-2 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                          !nextUrlStaff || isLoadingStaff 
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Payroll Panels - My Manager */}
      {subTab === 'my-manager' && (
        <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h3 className="text-lg font-bold text-gray-900">My Manager</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchManager}
                    onChange={(e) => setSearchManager(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchManager();
                      }
                    }}
                    placeholder="Search by name or mobile..."
                    disabled={isLoadingManagers}
                    className={`px-2.5 py-1.5 pr-8 rounded-lg border-2 border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-indigo-500 w-full sm:w-56 ${isLoadingManagers ? 'opacity-60 cursor-wait' : ''}`}
                  />
                  {isLoadingManagers ? (
                    <div className="absolute right-2">
                      <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : searchManager.trim() ? (
                    <button
                      onClick={() => {
                        setSearchManager('');
                        setCurrentPageManagers(1);
                        fetchManagers(null, '');
                      }}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clear search"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : null}
                </div>
                <button
                  onClick={handleSearchManager}
                  disabled={isLoadingManagers}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isLoadingManagers
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  title="Search"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          {isLoadingManagers ? (
            <EmployeeCardGridSkeleton count={6} />
          ) : managersError ? (
            <div className="text-center text-red-600 py-12 text-lg">{managersError}</div>
          ) : filteredManagers.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center">
              <p className="text-gray-600 text-lg">
                {searchManager.trim() ? 'No managers found matching your search.' : 'No managers found.'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {searchManager.trim() ? 'Try a different search term.' : 'Manager data will appear here once records are available.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredManagers.map((manager) => (
                  <div key={manager.id} className="bg-white rounded-lg border-2 border-gray-200 p-2 hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <img 
                        src={manager.photo || DEFAULT_PHOTO} 
                        alt={manager.name} 
                        onError={(e) => {
                          e.target.src = DEFAULT_PHOTO;
                        }}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-300" 
                      />
                      <div className="font-semibold text-gray-900 text-xs">{manager.name}</div>
                      <button
                        onClick={() => {
                          setSelectedPayrollEmployee(manager);
                          setShowPayrollForm(true);
                        }}
                        className="w-full px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Payroll
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {totalCountManagers > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2">
                  <div className="text-xs text-gray-600">
                    {searchManager.trim() ? (
                      <>Showing <span className="font-semibold">{filteredManagers.length}</span> of <span className="font-semibold">{totalCountManagers}</span> managers (filtered)</>
                    ) : (
                      <>Showing <span className="font-semibold">
                        {filteredManagers.length === 0 ? 0 : (currentPageManagers - 1) * ITEMS_PER_PAGE + 1}-{Math.min((currentPageManagers - 1) * ITEMS_PER_PAGE + filteredManagers.length, totalCountManagers)}
                      </span> of <span className="font-semibold">{totalCountManagers}</span> managers</>
                    )}
                  </div>
                  {totalCountManagers > 0 && (
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          if (previousUrlManagers && !isLoadingManagers) {
                            fetchManagers(previousUrlManagers, searchManager);
                          }
                        }} 
                        disabled={!previousUrlManagers || isLoadingManagers}
                        className={`px-2 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                          !previousUrlManagers || isLoadingManagers 
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          if (nextUrlManagers && !isLoadingManagers) {
                            fetchManagers(nextUrlManagers, searchManager);
                          }
                        }} 
                        disabled={!nextUrlManagers || isLoadingManagers}
                        className={`px-2 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                          !nextUrlManagers || isLoadingManagers 
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {subTab === 'reports' && (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Payroll Reports</h3>
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center">
            <p className="text-gray-600 text-lg">Payroll reports functionality will be available here.</p>
            <p className="text-sm text-gray-500 mt-2">Generate and view payroll reports, summaries, and analytics.</p>
          </div>
        </div>
      )}

      {/* Payroll Form Modal */}
      <PayrollForm
        employee={selectedPayrollEmployee}
        isOpen={showPayrollForm}
        attendanceRecords={selectedPayrollEmployee ? (attendanceRecords[selectedPayrollEmployee.id] || {}) : {}}
        onClose={() => {
          setShowPayrollForm(false);
          setSelectedPayrollEmployee(null);
        }}
      />
    </div>
  );
};

export default Payroll;

