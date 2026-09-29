import React, { createContext, useContext, useState } from 'react'

const CityContext = createContext()

export const useCity = () => {
  const context = useContext(CityContext)
  if (!context) {
    throw new Error('useCity must be used within a CityProvider')
  }
  return context
}

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState('Select City')

  const updateCity = (city) => {
    setSelectedCity(city)
  }

  const value = {
    selectedCity,
    updateCity
  }

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  )
}
