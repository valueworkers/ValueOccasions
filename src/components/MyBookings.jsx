import React, { useMemo, useState } from 'react'
import { FiCalendar, FiMapPin, FiUser, FiSearch, FiDownload, FiExternalLink, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'

const MyBookings = () => {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const bookings = useMemo(() => ([
    {
      id: 'BK-2025-001',
      serviceName: 'Vaishnavi Health Care',
      caregiverType: 'Skilled Female Nurse',
      location: 'Indiranagar Facility, Bengaluru',
      startDate: '2025-11-01',
      endDate: '2025-11-06',
      numDates: 6,
      amount: 15000,
      status: 'completed',
      placedAt: '2025-10-20T10:30:00Z'
    },
    {
      id: 'BK-2025-002',
      serviceName: 'Home Physiotherapy',
      caregiverType: 'Physiotherapist',
      location: 'Client Location - Whitefield',
      startDate: '2025-11-10',
      endDate: '2025-11-10',
      numDates: 1,
      amount: 2500,
      status: 'upcoming',
      placedAt: '2025-10-28T15:05:00Z'
    },
    {
      id: 'BK-2025-003',
      serviceName: 'Companion Care',
      caregiverType: 'Care Taker',
      location: 'JP Nagar Center',
      startDate: '2025-09-05',
      endDate: '2025-09-12',
      numDates: 8,
      amount: 18000,
      status: 'cancelled',
      placedAt: '2025-08-25T09:10:00Z'
    }
  ]), [])

  const filtered = useMemo(() => {
    return bookings
      .filter(b => activeTab === 'all' ? true : b.status === activeTab)
      .filter(b => {
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (
          b.id.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.caregiverType.toLowerCase().includes(q)
        )
      })
  }, [bookings, query, activeTab])

  const formatRange = (start, end) => {
    const startStr = new Date(start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const endStr = new Date(end).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    return start === end ? startStr : `${startStr} - ${endStr}`
  }

  const badgeFor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-200'
    if (status === 'upcoming') return 'bg-blue-100 text-blue-700 border-blue-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  const iconFor = (status) => {
    if (status === 'completed') return <FiCheckCircle className="w-4 h-4" />
    if (status === 'upcoming') return <FiClock className="w-4 h-4" />
    return <FiXCircle className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">View your booking history and upcoming services</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden flex-1 max-w-xl">
              <span className="px-3 flex items-center text-gray-500"><FiSearch className="w-4 h-4" /></span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by service, location, or ID..."
                className="w-full p-2 outline-none"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'upcoming', 'completed', 'cancelled'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    activeTab === tab ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <div className="bg-white p-8 rounded-xl text-center border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-500 mb-3">
                <FiCalendar className="w-6 h-6" />
              </div>
              <p className="text-gray-800 font-medium">No bookings found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search</p>
            </div>
          )}

          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{b.serviceName}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center gap-1 ${badgeFor(b.status)}`}>
                      {iconFor(b.status)}
                      <span className="capitalize">{b.status}</span>
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiUser className="w-4 h-4 text-teal-600" />
                      <span>{b.caregiverType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiMapPin className="w-4 h-4 text-teal-600" />
                      <span>{b.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiCalendar className="w-4 h-4 text-teal-600" />
                      <span>{formatRange(b.startDate, b.endDate)} • {b.numDates} {b.numDates > 1 ? 'days' : 'day'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-xs">Booking ID</div>
                  <div className="font-mono text-sm text-gray-900">{b.id}</div>
                  <div className="mt-2 text-gray-500 text-xs">Placed on</div>
                  <div className="text-sm text-gray-900">{new Date(b.placedAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xl font-bold text-gray-900">₹{b.amount.toLocaleString('en-IN')}</div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2">
                    <FiExternalLink className="w-4 h-4" /> View details
                  </button>
                  <button className="px-3 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2">
                    <FiDownload className="w-4 h-4" /> Download receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyBookings