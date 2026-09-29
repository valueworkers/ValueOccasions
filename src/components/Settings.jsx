import React, { useState } from 'react'
import { FiLock, FiBell, FiShield } from 'react-icons/fi'

const Settings = () => {
  const [tab, setTab] = useState('notifications')

  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    promotions: false,
    reminders: true
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    deviceTrust: true
  })

  const handleNotifChange = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  const handleSecurityChange = (key) => setSecurity(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your notifications and security</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex gap-2 p-4 border-b">
            <button onClick={() => setTab('notifications')} className={`px-3 py-2 rounded-lg text-sm font-medium ${tab==='notifications'?'bg-teal-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Notifications</button>
            <button onClick={() => setTab('security')} className={`px-3 py-2 rounded-lg text-sm font-medium ${tab==='security'?'bg-teal-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Security</button>
          </div>

          {tab === 'notifications' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FiBell className="text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Booking updates</div>
                    <div className="text-sm text-gray-500">Get alerts for confirmations and changes</div>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifications.bookingUpdates} onChange={()=>handleNotifChange('bookingUpdates')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-teal-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FiBell className="text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Promotions</div>
                    <div className="text-sm text-gray-500">Occasional offers and updates</div>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifications.promotions} onChange={()=>handleNotifChange('promotions')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-teal-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FiBell className="text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Reminders</div>
                    <div className="text-sm text-gray-500">Remind me before my service starts</div>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifications.reminders} onChange={()=>handleNotifChange('reminders')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-teal-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FiLock className="text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Two-factor authentication</div>
                    <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={security.twoFactor} onChange={()=>handleSecurityChange('twoFactor')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-teal-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FiShield className="text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Login alerts</div>
                    <div className="text-sm text-gray-500">Email me when a new device logs in</div>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={security.loginAlerts} onChange={()=>handleSecurityChange('loginAlerts')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-teal-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FiShield className="text-teal-600" />
                  <div>
                    <div className="font-medium text-gray-900">Trust this device</div>
                    <div className="text-sm text-gray-500">Skip verification on this device</div>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={security.deviceTrust} onChange={()=>handleSecurityChange('deviceTrust')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-teal-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings