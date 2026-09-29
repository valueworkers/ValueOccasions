import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FiCalendar, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiPackage, 
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiTrendingDown,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import StatsRowSkeleton from '../ui/StatsRowSkeleton';
import TableSkeleton from '../ui/TableSkeleton';

const CustomerPayment = () => {
  const [payments, setPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPayments, setExpandedPayments] = useState(new Set());
  const [expandedCustomers, setExpandedCustomers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [sortBy, setSortBy] = useState('customerName'); // Default sort by customer name
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

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

  const isVsreOwner = useMemo(() => {
    return authUser?.user_type === 'VSRE_OWNER';
  }, [authUser]);

  const loadPayments = useCallback(() => {
    try {
      const storedPayments = JSON.parse(localStorage.getItem('customerPayments') || '[]');
      const sortedPayments = storedPayments.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setPayments(sortedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isVsreOwner) {
      loadPayments();
      
      const handleStorageChange = () => {
        loadPayments();
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('payment-added', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('payment-added', handleStorageChange);
      };
    } else {
      setIsLoading(false);
    }
  }, [isVsreOwner, loadPayments]);

  // Group payments by month
  const paymentsByMonth = useMemo(() => {
    const grouped = {};
    payments.forEach(payment => {
      const monthKey = payment.monthKey || new Date(payment.timestamp).toISOString().slice(0, 7);
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          monthKey,
          month: payment.month || new Date(payment.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          payments: [],
          totalAmount: 0
        };
      }
      grouped[monthKey].payments.push(payment);
      grouped[monthKey].totalAmount += payment.amount || 0;
    });
    
    return Object.values(grouped).sort((a, b) => 
      new Date(b.monthKey + '-01') - new Date(a.monthKey + '-01')
    );
  }, [payments]);

  // Get unique months and service types for filters
  const availableMonths = useMemo(() => {
    return paymentsByMonth.map(group => ({
      key: group.monthKey,
      label: group.month
    }));
  }, [paymentsByMonth]);

  const availableServiceTypes = useMemo(() => {
    const types = [...new Set(payments.map(p => p.serviceType).filter(Boolean))];
    return types;
  }, [payments]);

  // Group payments by customer and patient
  // IMPORTANT: Customer and Patient are DIFFERENT entities:
  // - Customer = ALWAYS the logged-in user (VSRE_OWNER viewing the dashboard)
  // - Patient = the person receiving care (from payment data)
  const customersData = useMemo(() => {
    const customerPatientMap = {};
    
    // CUSTOMER: Always use the logged-in user (VSRE_OWNER)
    const loggedInCustomerId = authUser?.id || authUser?.email || authUser?.mobile_number || 'logged_in_user';
    const loggedInCustomerName = authUser ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || authUser.email || 'Logged In User' : 'Customer';
    const loggedInCustomerEmail = authUser?.email || '';
    const loggedInCustomerPhone = authUser?.mobile_number || '';
    
    payments.forEach(payment => {
      // PATIENT: The person receiving care (separate entity)
      // Use patient-specific fields from payment data
      const patientId = payment.patientId || `patient_${payment.id}`;
      const patientName = payment.patientName || payment.customerName || 'Patient';
      
      // Ensure customer (logged-in user) and patient are treated as different entities
      // Create unique key combining logged-in customer AND patient IDs
      const customerPatientKey = `customer_${loggedInCustomerId}_patient_${patientId}`;
      
      if (!customerPatientMap[customerPatientKey]) {
        customerPatientMap[customerPatientKey] = {
          customerId: loggedInCustomerId,
          customerName: loggedInCustomerName,
          customerEmail: loggedInCustomerEmail,
          customerPhone: loggedInCustomerPhone,
          patientId,
          patientName,
          transactions: [],
          totalInvoice: 0,
          totalPayment: 0,
        };
      }
      
      // Add transaction
      const transaction = {
        id: payment.id,
        date: payment.timestamp || payment.date,
        invoice: payment.invoiceNumber || `INV-${payment.id}`,
        amountPaid: payment.amount || 0,
        paymentMode: payment.paymentMode || payment.payment_method || 'Cash', // Default to Cash if not available
        serviceType: payment.serviceType,
        serviceDetails: payment.serviceDetails,
      };
      
      customerPatientMap[customerPatientKey].transactions.push(transaction);
      customerPatientMap[customerPatientKey].totalInvoice += payment.amount || 0; // Using amount as invoice for now
      customerPatientMap[customerPatientKey].totalPayment += payment.amount || 0;
    });
    
    // Calculate balance/excess for each customer-patient combination
    const customers = Object.values(customerPatientMap).map(customer => ({
      ...customer,
      balanceExcess: customer.totalPayment - customer.totalInvoice,
    }));
    
    return customers.sort((a, b) => {
      // Sort by customer name first, then patient name
      const customerCompare = (a.customerName || '').localeCompare(b.customerName || '');
      if (customerCompare !== 0) return customerCompare;
      return (a.patientName || '').localeCompare(b.patientName || '');
    });
  }, [payments, authUser]);

  // Filter customers based on search and filters
  const filteredCustomers = useMemo(() => {
    let filtered = customersData;

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.map(customer => ({
        ...customer,
        transactions: customer.transactions.filter(t => {
          const transactionDate = new Date(t.date);
          const monthKey = transactionDate.toISOString().slice(0, 7);
          return monthKey === selectedMonth;
        })
      })).filter(customer => customer.transactions.length > 0);
    }

    // Filter by service type
    if (selectedServiceType) {
      filtered = filtered.map(customer => ({
        ...customer,
        transactions: customer.transactions.filter(t => t.serviceType === selectedServiceType)
      })).filter(customer => customer.transactions.length > 0);
    }

    // Search filter - search customer and patient separately as different entities
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer => {
        // Search customer fields (separate entity)
        const customerName = (customer.customerName || '').toLowerCase();
        const customerEmail = (customer.customerEmail || '').toLowerCase();
        const customerPhone = (customer.customerPhone || '').toLowerCase();
        
        // Search patient fields (separate entity)
        const patientName = (customer.patientName || '').toLowerCase();
        
        return customerName.includes(query) || 
               customerEmail.includes(query) || 
               customerPhone.includes(query) ||
               patientName.includes(query);
      });
    }

    // Recalculate totals after filtering
    const customersWithTotals = filtered.map(customer => {
      const totalInvoice = customer.transactions.reduce((sum, t) => sum + t.amountPaid, 0);
      const totalPayment = customer.transactions.reduce((sum, t) => sum + t.amountPaid, 0);
      return {
        ...customer,
        totalInvoice,
        totalPayment,
        balanceExcess: totalPayment - totalInvoice,
      };
    });

    // Apply sorting
    const sorted = [...customersWithTotals].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'customerName':
          aValue = (a.customerName || '').toLowerCase();
          bValue = (b.customerName || '').toLowerCase();
          break;
        case 'patientName':
          aValue = (a.patientName || '').toLowerCase();
          bValue = (b.patientName || '').toLowerCase();
          break;
        case 'totalInvoice':
          aValue = a.totalInvoice || 0;
          bValue = b.totalInvoice || 0;
          break;
        case 'totalPayment':
          aValue = a.totalPayment || 0;
          bValue = b.totalPayment || 0;
          break;
        case 'balanceExcess':
          aValue = a.balanceExcess || 0;
          bValue = b.balanceExcess || 0;
          break;
        default:
          aValue = (a.customerName || '').toLowerCase();
          bValue = (b.customerName || '').toLowerCase();
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });
    
    return sorted;
  }, [customersData, selectedMonth, selectedServiceType, searchQuery, sortBy, sortOrder]);

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    let filtered = paymentsByMonth;

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter(group => group.monthKey === selectedMonth);
    }

    // Filter by service type
    if (selectedServiceType) {
      filtered = filtered.map(group => ({
        ...group,
        payments: group.payments.filter(p => p.serviceType === selectedServiceType)
      })).filter(group => group.payments.length > 0);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.map(group => ({
        ...group,
        payments: group.payments.filter(p => {
          const customerName = (p.customerName || p.patientName || '').toLowerCase();
          const email = (p.customerEmail || '').toLowerCase();
          const phone = (p.customerPhone || '').toLowerCase();
          const serviceType = (p.serviceType || '').toLowerCase();
          const location = (p.serviceDetails?.location || '').toLowerCase();
          const caregiver = (p.serviceDetails?.caregiverType || '').toLowerCase();
          
          return customerName.includes(query) || 
                 email.includes(query) || 
                 phone.includes(query) ||
                 serviceType.includes(query) ||
                 location.includes(query) ||
                 caregiver.includes(query);
        })
      })).filter(group => group.payments.length > 0);
    }

    return filtered;
  }, [paymentsByMonth, selectedMonth, selectedServiceType, searchQuery]);

  // Calculate statistics
  const totalStats = useMemo(() => {
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPayments = payments.length;
    
    const now = new Date();
    const thisMonthPayments = payments.filter(p => {
      const paymentDate = new Date(p.timestamp);
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    });
    const thisMonthAmount = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Calculate last month for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const lastMonthPayments = payments.filter(p => {
      const paymentDate = new Date(p.timestamp);
      return paymentDate.getMonth() === lastMonth.getMonth() && 
             paymentDate.getFullYear() === lastMonth.getFullYear();
    });
    const lastMonthAmount = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const amountChange = lastMonthAmount > 0 
      ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount * 100).toFixed(1)
      : 0;
    const countChange = lastMonthPayments.length > 0
      ? ((thisMonthPayments.length - lastMonthPayments.length) / lastMonthPayments.length * 100).toFixed(1)
      : 0;

    return {
      totalAmount,
      totalPayments,
      thisMonthAmount,
      thisMonthCount: thisMonthPayments.length,
      amountChange: parseFloat(amountChange),
      countChange: parseFloat(countChange)
    };
  }, [payments]);

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    
    if (numAmount >= 1000) {
      const thousands = numAmount / 1000;
      // If it's a whole number (e.g., 2000 -> 2k), don't show decimals
      if (thousands % 1 === 0) {
        return `₹${thousands}k`;
      }
      // Otherwise show one decimal place (e.g., 2500 -> 2.5k)
      return `₹${thousands.toFixed(1)}k`;
    }
    
    // For amounts less than 1000, show normal format with 2 decimal places
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTableDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const togglePaymentExpansion = (paymentId) => {
    setExpandedPayments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const toggleCustomerExpansion = (customerId) => {
    setExpandedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedServiceType(null);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedMonth || selectedServiceType || searchQuery.trim();

  if (!isVsreOwner) {
    return (
      <div className="py-3 px-1">
        <div className="w-full">
          <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 text-center">
            <p className="text-gray-700 text-lg font-medium mb-2">Only VSRE_OWNER can access this section.</p>
            {authUser ? (
              <p className="text-sm text-gray-500">
                Current user type: <span className="font-semibold">{authUser.user_type || 'Not found'}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500">No user logged in. Please log in as VSRE_OWNER.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-3 px-1">
        <div className="w-full space-y-4">
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
          <StatsRowSkeleton count={4} />
          <TableSkeleton rows={6} columns={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 px-1">
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex flex-row items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Customer Payments</h2>
              <span className="text-gray-400">|</span>
              <p className="text-sm text-gray-600">Track and manage all customer payment transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadPayments}
                className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm text-xs"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <button
                className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1.5 shadow-sm text-xs border border-blue-200"
              >
                <FiDownload className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="bg-blue-200 rounded-lg p-1 flex-shrink-0">
                    <span className="text-blue-700 font-bold text-xs">₹</span>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className="text-blue-600 text-xs">Total Revenue:</p>
                    <p className="text-lg font-bold text-blue-900">{formatAmount(totalStats.totalAmount)}</p>
                  </div>
                </div>
                {totalStats.amountChange !== 0 && (
                  <div className={`flex items-center gap-0.5 text-xs flex-shrink-0 ${totalStats.amountChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalStats.amountChange > 0 ? <FiTrendingUp className="w-2.5 h-2.5" /> : <FiTrendingDown className="w-2.5 h-2.5" />}
                    {Math.abs(totalStats.amountChange)}%
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="bg-green-200 rounded-lg p-1 flex-shrink-0">
                    <FiCalendar className="w-3.5 h-3.5 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className="text-green-600 text-xs">Total Transactions:</p>
                    <p className="text-lg font-bold text-green-900">{totalStats.totalPayments}</p>
                  </div>
                </div>
                {totalStats.countChange !== 0 && (
                  <div className={`flex items-center gap-0.5 text-xs flex-shrink-0 ${totalStats.countChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalStats.countChange > 0 ? <FiTrendingUp className="w-2.5 h-2.5" /> : <FiTrendingDown className="w-2.5 h-2.5" />}
                    {Math.abs(totalStats.countChange)}%
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="bg-purple-200 rounded-lg p-1 flex-shrink-0">
                    <FiTrendingUp className="w-3.5 h-3.5 text-purple-700" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className="text-purple-600 text-xs">This Month:</p>
                    <p className="text-sm font-bold text-purple-900">{totalStats.thisMonthCount}</p>
                    <p className="text-xs text-purple-600">{formatAmount(totalStats.thisMonthAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="bg-amber-200 rounded-lg p-1 flex-shrink-0">
                    <span className="text-amber-700 font-bold text-xs">₹</span>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className="text-amber-600 text-xs">Avg. Transaction:</p>
                    <p className="text-sm font-bold text-amber-900">
                      {totalStats.totalPayments > 0 
                        ? formatAmount(totalStats.totalAmount / totalStats.totalPayments)
                        : formatAmount(0)
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, phone, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-gray-900"
                />
              </div>
            </div>

            {/* Month Filter */}
            <div className="lg:w-56">
              <select
                value={selectedMonth || ''}
                onChange={(e) => setSelectedMonth(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-gray-900 bg-white"
              >
                <option value="">All Months</option>
                {availableMonths.map(month => (
                  <option key={month.key} value={month.key}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type Filter */}
            <div className="lg:w-44">
              <select
                value={selectedServiceType || ''}
                onChange={(e) => setSelectedServiceType(e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-gray-900 bg-white"
              >
                <option value="">All Services</option>
                {availableServiceTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-gray-900 bg-white"
              >
                <option value="customerName">Sort by Customer</option>
                <option value="patientName">Sort by Patient</option>
                <option value="totalInvoice">Sort by Total Invoice</option>
                <option value="totalPayment">Sort by Total Payment</option>
                <option value="balanceExcess">Sort by Balance/Excess</option>
              </select>
            </div>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-gray-700"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? (
                <FiArrowUp className="w-4 h-4" />
              ) : (
                <FiArrowDown className="w-4 h-4" />
              )}
              <span className="text-xs">{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Customer Payments Table */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-gray-400 font-bold">₹</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
              {hasActiveFilters ? 'No Customers Match Your Filters' : 'No Customers Found'}
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              {hasActiveFilters 
                ? 'Try adjusting your search or filter criteria'
                : 'No customer payment transactions have been recorded yet.'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12"></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Patient</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Invoice</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Payment</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Balance/Excess</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer, index) => {
                    // Use composite key for customer-patient combination (ensuring they're separate entities)
                    const customerPatientKey = `customer_${customer.customerId}_patient_${customer.patientId}`;
                    const isExpanded = expandedCustomers.has(customerPatientKey);
                    return (
                      <React.Fragment key={customerPatientKey}>
                        <tr 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => toggleCustomerExpansion(customerPatientKey)}
                        >
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCustomerExpansion(customerPatientKey);
                              }}
                              className="text-gray-600 hover:text-gray-900 font-bold text-lg"
                            >
                              {isExpanded ? '−' : '+'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {customer.customerName || `Customer ${index + 1}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {customer.patientName || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {formatAmount(customer.totalInvoice)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {formatAmount(customer.totalPayment)}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-semibold ${
                            customer.balanceExcess >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatAmount(Math.abs(customer.balanceExcess))}
                            {customer.balanceExcess >= 0 ? ' (Excess)' : ' (Balance)'}
                          </td>
                        </tr>
                        {isExpanded && customer.transactions.length > 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-3 bg-gray-50">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-300">
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
                                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Amount Paid</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Payment Mode</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {customer.transactions.map((transaction) => (
                                      <tr key={transaction.id} className="hover:bg-white">
                                        <td className="px-3 py-2 text-xs text-gray-700">
                                          {formatTableDate(transaction.date)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-700">
                                          {transaction.invoice}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-900 text-right font-medium">
                                          {formatAmount(transaction.amountPaid)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                          {transaction.paymentMode}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPayment;
