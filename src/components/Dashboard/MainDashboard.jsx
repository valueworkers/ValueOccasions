import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Lazy load all dashboard components to prevent unnecessary API calls
const VenuesDashboard = lazy(() => import('./VenuesDashboard'));
const ServiceDashboard = lazy(() => import('./ServiceDashboard'));
const ResourcesDashboard = lazy(() => import('./ResourcesDashboard'));
const ManageStaff = lazy(() => import('./ManageStaff'));
const Analytics = lazy(() => import('./Analytics'));
const StaffSchedule = lazy(() => import('./StaffSchedule'));
const Attendence = lazy(() => import('./Attendence'));
const CustomerPayment = lazy(() => import('./CustomerPayment'));
const PayrollWrapper = lazy(() => import('./PayrollWrapper'));
const TransactionWrapper = lazy(() => import('./TransactionWrapper'));

const sidebarItems = [
  { key: 'venues', label: <><span className="italic font-semibold">Venues</span></>, component: VenuesDashboard },
  { key: 'services', label: <><span className="font-semibold">Services</span></>, component: ServiceDashboard },
  { key: 'resources', label: <><span className="font-semibold">Resources</span></>, component: ResourcesDashboard },
  { key: 'analytics', label: <><span className="font-semibold">Analytics</span></>, component: Analytics },
  { key: 'manage-staff', label: <><span className="font-semibold">Manage Staff</span></>, component: ManageStaff },
];

const ownerOnlyItems = [

  { key: 'customer-payment', label: <><span className="font-semibold">Customer Payment</span></>, component: CustomerPayment },
  { key: 'payroll', label: <><span className="font-semibold">Payroll</span></>, component: PayrollWrapper },
  { key: 'transaction', label: <><span className="font-semibold">Transaction</span></>, component: TransactionWrapper },
];

const staffOnlyItem = {
  key: 'staff-schedule',
  label: <><span className="font-semibold">My Schedule</span></>,
  component: StaffSchedule,
};

const ownerOnlyItem = {
  key: 'attendance',
  label: <><span className="font-semibold">Attendance</span></>,
  component: Attendence,
};

const allSidebarItems = [...sidebarItems, staffOnlyItem, ownerOnlyItem, ...ownerOnlyItems];

const MainDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [selected, setSelected] = useState('venues');

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

    // Listen for auth changes
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Filter sidebar items based on user type
  const filteredSidebarItems = useMemo(() => {
    if (authUser?.user_type === 'VSRE_STAFF') {
      const base = sidebarItems.filter(item => item.key !== 'manage-staff');
      return [...base, staffOnlyItem];
    }
    if (authUser?.user_type === 'VSRE_MANAGER') {
      return [...sidebarItems, staffOnlyItem];
    }
    if (authUser?.user_type === 'VSRE_OWNER') {
      return [...sidebarItems, ...ownerOnlyItems, ownerOnlyItem];
    }
    return sidebarItems;
  }, [authUser]);

  // Read section from URL parameter on mount
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam && allSidebarItems.some(item => item.key === sectionParam)) {
      setSelected(sectionParam);
    }
  }, [searchParams]);

  // Ensure selected item is valid if manager was filtered out
  useEffect(() => {
    const isValid = filteredSidebarItems.some(item => item.key === selected);
    if (!isValid && filteredSidebarItems.length > 0) {
      setSelected(filteredSidebarItems[0].key);
    }
  }, [filteredSidebarItems, selected]);

  const SelectedComponent = filteredSidebarItems.find(item => item.key === selected)?.component || (() => null);

  return (
    <div>
      {/* Main dashboard title - white card, centered, italic */}
      <div className="w-full flex justify-center">
      <h2 className="bg-white text-black text-center font-bold italic py-1 w-full">
        Admin/ Manager panel
      </h2>
      </div>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-pink-50 py-2 px-2 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Sidebar - make it a white rounded card to match panel */}
            <aside className="md:col-span-1">
              <div className="rounded-2xl shadow bg-white border border-gray-100 px-5 py-8 flex flex-col gap-2 md:min-h-[400px] mt-0">
                {filteredSidebarItems.map(item => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setSelected(item.key);
                      navigate(`/dashboard?section=${item.key}`, { replace: true });
                    }}
                    className={
                      'w-full text-left px-1 py-0.5 rounded-lg mb-1 text-sm focus:outline-none transition-all ' +
                      (selected === item.key
                        ? 'font-bold bg-linear-to-r from-indigo-100 via-blue-100 to-pink-100 border-l-4 border-indigo-400 text-indigo-700 shadow-sm'
                        : 'font-normal text-gray-700 hover:bg-blue-50')
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </aside>
            {/* Main Section - wrap content in similar white rounded card */}
            <main className="md:col-span-4 flex flex-col gap-7">
              <div className="rounded-2xl shadow-md border border-gray-200 bg-white p-2 sm:p-3 mt-0 md:mt-0">
                <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="text-gray-500">Loading...</div></div>}>
                  <SelectedComponent />
                </Suspense>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
