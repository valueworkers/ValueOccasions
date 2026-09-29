import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const Venues = () => {
  const navigate = useNavigate()

  const cities = useMemo(
    () => [
      'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
      'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
      'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad',
      'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada',
      'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli–Dharwad', 'Bareilly', 'Mysore',
    ],
    []
  )

  const handleCityChange = (event) => {
    const chosenCity = event.target.value
    if (chosenCity) {
      navigate(`/venues/${encodeURIComponent(chosenCity)}`)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <label htmlFor="city-select" className="block text-sm font-medium text-gray-700">Select a city</label>
      <select
        id="city-select"
        defaultValue=""
        onChange={handleCityChange}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="" disabled>Choose...</option>
        {cities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  )
}

export default Venues