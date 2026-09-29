import React, { useState, useEffect, useRef } from 'react'
import { FiCamera, FiUser, FiMail, FiPhone, FiMapPin, FiSave } from 'react-icons/fi'
import axios from 'axios'

const CustomizeProfile = () => {
  const [avatarUrl, setAvatarUrl] = useState('https://ui-avatars.com/api/?name=John+Doe&background=14b8a6&color=fff')
  const [avatarFile, setAvatarFile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' })
  const objectUrlRef = useRef(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  })

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      // Clean up previous object URL if it exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
      const objectUrl = URL.createObjectURL(file)
      objectUrlRef.current = objectUrl
      setAvatarFile(file)
      setAvatarUrl(objectUrl)
    }
  }

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveMessage({ type: '', text: '' })
      
      const access = localStorage.getItem('access_token')
      if (!access) {
        setSaveMessage({ type: 'error', text: 'Please login to update your profile' })
        setIsSaving(false)
        return
      }

      // Split fullName into first_name, middle_name, last_name
      const nameParts = form.fullName.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

      const baseUrl = import.meta.env.VITE_BASEURL
      
      // If avatar file is selected, use FormData, otherwise use JSON
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        formData.append('first_name', firstName)
        if (middleName) formData.append('middle_name', middleName)
        if (lastName) formData.append('last_name', lastName)
        formData.append('email', form.email)
        formData.append('mobile_number', form.phone)
        formData.append('address', form.address)
        formData.append('instagram', form.instagram)
        formData.append('twitter', form.twitter)
        formData.append('linkedin', form.linkedin)

        await axios.put(`${baseUrl}/accounts/profile/`, formData, {
          headers: {
            Authorization: `Bearer ${access}`,
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        // Send JSON payload
        const payload = {
          first_name: firstName,
          email: form.email,
          mobile_number: form.phone,
          address: form.address,
          instagram: form.instagram,
          twitter: form.twitter,
          linkedin: form.linkedin
        }
        
        if (middleName) payload.middle_name = middleName
        if (lastName) payload.last_name = lastName

        await axios.put(`${baseUrl}/accounts/profile/`, payload, {
          headers: {
            Authorization: `Bearer ${access}`,
            'Content-Type': 'application/json'
          }
        })
      }

      // Refetch profile to get updated data (especially avatar URL if uploaded)
      try {
        const refreshResponse = await axios.get(`${baseUrl}/accounts/profile/`, {
          headers: { Authorization: `Bearer ${access}` }
        })
        
        const refreshData = refreshResponse.data || {}
        const refreshUser = refreshData.user || refreshData
        
        // Update authUser in localStorage with new name, email, and avatar
        const authUserRaw = localStorage.getItem('authUser')
        if (authUserRaw) {
          const authUser = JSON.parse(authUserRaw)
          // Update name fields
          authUser.first_name = refreshUser.first_name || firstName
          if (refreshUser.middle_name) authUser.middle_name = refreshUser.middle_name
          if (refreshUser.last_name) authUser.last_name = refreshUser.last_name
          // Update email if changed
          if (refreshUser.email) authUser.email = refreshUser.email
          // Update avatar if available
          const newAvatar = refreshData.avatar || refreshUser.avatar || refreshData.profile_picture || refreshUser.profile_picture
          if (newAvatar) {
            authUser.avatar = newAvatar
            authUser.profile_picture = newAvatar
            // Clean up object URL if it was created from a file
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current)
              objectUrlRef.current = null
            }
            // Update the displayed avatar URL
            setAvatarUrl(newAvatar)
          }
          // Save updated authUser back to localStorage
          localStorage.setItem('authUser', JSON.stringify(authUser))
          // Dispatch event to notify other components (like NavBar) of the change
          window.dispatchEvent(new Event('auth-changed'))
        }
      } catch (error) {
        console.error('Error updating authUser in localStorage:', error)
        // Still update with what we have
        try {
          const authUserRaw = localStorage.getItem('authUser')
          if (authUserRaw) {
            const authUser = JSON.parse(authUserRaw)
            authUser.first_name = firstName
            if (middleName) authUser.middle_name = middleName
            if (lastName) authUser.last_name = lastName
            if (form.email) authUser.email = form.email
            localStorage.setItem('authUser', JSON.stringify(authUser))
            window.dispatchEvent(new Event('auth-changed'))
          }
        } catch (e) {
          console.error('Error updating authUser fallback:', e)
        }
      }

      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Clear the avatar file after successful save
      setAvatarFile(null)
      
      // Optionally refresh the profile data
      setTimeout(() => {
        setSaveMessage({ type: '', text: '' })
      }, 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update profile. Please try again.'
      setSaveMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }
 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const access = localStorage.getItem('access_token')
        if (!access) return

        const response = await axios.get(`${import.meta.env.VITE_BASEURL}/accounts/profile/`, {
          headers: { Authorization: `Bearer ${access}` }
        })

        const rawData = response.data || {}
        const user = rawData.user || rawData

        const firstName = (user.first_name || '').trim()
        const middleName = (user.middle_name || '').trim()
        const lastName = (user.last_name || '').trim()
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ')

        setForm({
          fullName,
          email: user.email || '',
          phone: user.mobile_number || '',
          address: user.address || rawData.address || '',
          instagram: rawData.instagram || '',
          twitter: rawData.twitter || '',
          linkedin: rawData.linkedin || ''
        })

        const avatarCandidate =
          rawData.avatar ||
          user.avatar ||
          rawData.profile_picture ||
          user.profile_picture
        if (avatarCandidate) {
          setAvatarUrl(avatarCandidate)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Customize Profile</h1>
          <p className="text-gray-600 mt-1">Update your personal information and profile picture</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-1/3">
              <div className="relative w-36 h-36 rounded-full overflow-hidden mx-auto sm:mx-0">
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                <label className="absolute bottom-2 right-2 bg-teal-600 text-white rounded-full p-2 cursor-pointer shadow">
                  <FiCamera />
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </label>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 text-black">
                  <FiUser className="text-gray-400" />
                  <input value={form.fullName} onChange={(e)=>update('fullName', e.target.value)} placeholder="Your name" className="w-full p-2 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 text-black">
                  <FiMail className="text-gray-400" />
                  <input value={form.email} onChange={(e)=>update('email', e.target.value)} placeholder="Email address" className="w-full p-2 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 text-black">
                  <FiPhone className="text-gray-400" />
                  <input value={form.phone} onChange={(e)=>update('phone', e.target.value)} placeholder="Phone number" className="w-full p-2 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 text-black">
                  <FiMapPin className="text-gray-400" />
                  <input value={form.address} onChange={(e)=>update('address', e.target.value)} placeholder="Address" className="w-full p-2 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <input value={form.instagram} onChange={(e)=>update('instagram', e.target.value)} placeholder="@yourhandle" className="w-full p-2 border rounded-lg outline-none text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input value={form.twitter} onChange={(e)=>update('twitter', e.target.value)} placeholder="@yourhandle" className="w-full p-2 border rounded-lg outline-none text-black" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input value={form.linkedin} onChange={(e)=>update('linkedin', e.target.value)} placeholder="Profile URL" className="w-full p-2 border rounded-lg outline-none text-black" />
              </div>
            </div>
          </div>

          {saveMessage.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveMessage.text}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizeProfile