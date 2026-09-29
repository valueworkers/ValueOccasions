import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { FiMapPin, FiClock, FiStar, FiHeart, FiShare2, FiPhone, FiMail, FiUser, FiCalendar, FiCheckCircle, FiXCircle, FiUsers, FiEdit2 } from 'react-icons/fi'

const SeniorCare = () => {
  const location = useLocation()
  const service = location.state || {}
  const navigate = useNavigate()
  
  const [isSaved, setIsSaved] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDates, setSelectedDates] = useState([])
  const [hoveredDate, setHoveredDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCaregiver, setSelectedCaregiver] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedLocationType, setSelectedLocationType] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientName, setClientName] = useState('')
  const [partnersName, setPartnersName] = useState('')
  const [partnersAddress, setPartnersAddress] = useState('')
  const [selectedPackage, setSelectedPackage] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [showMoreFacilities, setShowMoreFacilities] = useState(false)
  const [clientAddressSuggestions, setClientAddressSuggestions] = useState([])
  const [partnerAddressSuggestions, setPartnerAddressSuggestions] = useState([])
  const [showClientSuggestions, setShowClientSuggestions] = useState(false)
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false)
  
  // Customer Registration Form States
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false)
  const [showRegistrationRequiredPopup, setShowRegistrationRequiredPopup] = useState(false)
  const [showExistingRegistrations, setShowExistingRegistrations] = useState(false)
  const [existingRegistrations, setExistingRegistrations] = useState([])
  const [registrationToDelete, setRegistrationToDelete] = useState(null)
  const [activeRegistration, setActiveRegistration] = useState(null)
  const [registrationForm, setRegistrationForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    address: '',
    dateOfBirth: '',
    dontKnowDOB: false,
    age: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyCountryCode: '+91',
    medicalConditions: '',
    allergies: '',
    preferredLanguage: '',
    gender: '',
    bloodGroup: '',
    idProof: '',
    idProofNumber: '',
    educationQualifications: '',
    earlierOccupation: '',
    yearOfRetirement: '',
    presentHealthCondition: '',
    advancePayment: '',
    paymentMode: ''
  })
  const [registrationErrors, setRegistrationErrors] = useState({})

  // Load existing registrations from localStorage
  const loadExistingRegistrations = () => {
    try {
      const savedRegistrations = localStorage.getItem('seniorCareRegistrations')
      if (savedRegistrations) {
        const registrations = JSON.parse(savedRegistrations)
        setExistingRegistrations(registrations)
        return registrations
      }
    } catch (error) {
      console.error('Error loading existing registrations:', error)
    }
    setExistingRegistrations([])
    return []
  }

  // Load existing registrations on component mount
  useEffect(() => {
    loadExistingRegistrations()
  }, [])

  // Search address using OpenStreetMap Nominatim (free, no API key required)
  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      return []
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      return data.map(item => ({
        display: item.display_name,
        lat: item.lat,
        lon: item.lon,
        address: item.address || {}
      }))
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      return []
    }
  }

  // Debounce function to reduce API calls
  const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Handle client address search with debounce
  const handleClientAddressSearch = async (value) => {
    setClientAddress(value)
    if (value.length >= 3) {
      const suggestions = await searchAddress(value)
      // Add the typed text as first option for manual entry
      const allSuggestions = [
        { display: value, isManualEntry: true },
        ...suggestions
      ]
      setClientAddressSuggestions(allSuggestions)
      setShowClientSuggestions(true)
    } else {
      setClientAddressSuggestions([])
      setShowClientSuggestions(false)
    }
  }

  // Handle partner address search with debounce
  const handlePartnerAddressSearch = async (value) => {
    setPartnersAddress(value)
    if (value.length >= 3) {
      const suggestions = await searchAddress(value)
      // Add the typed text as first option for manual entry
      const allSuggestions = [
        { display: value, isManualEntry: true },
        ...suggestions
      ]
      setPartnerAddressSuggestions(allSuggestions)
      setShowPartnerSuggestions(true)
    } else {
      setPartnerAddressSuggestions([])
      setShowPartnerSuggestions(false)
    }
  }

  // Select suggestion for client
  const selectClientSuggestion = (suggestion) => {
    setClientAddress(suggestion.display)
    setClientAddressSuggestions([])
    setShowClientSuggestions(false)
  }

  // Select suggestion for partner
  const selectPartnerSuggestion = (suggestion) => {
    setPartnersAddress(suggestion.display)
    setPartnerAddressSuggestions([])
    setShowPartnerSuggestions(false)
  }

  // Caregiver options
  const caregiverOptions = [
    'Skilled Male Nurse',
    'Skilled Female Nurse', 
    'Semi Skilled Male Care Taker',
    'Semi Skilled Female Care Taker'
  ]

  // Location options
  const locationOptions = {
    'In House': [
      'Malleshwaram Unit 1',
      'Hebbal Unit 1', 
      'Malleshwaram Unit 2',
      'Hebbal Unit 2',
      'Malleshwaram Unit 3',
      'Hebbal Unit 3',
      'Malleshwaram 11th Cross',
      'Malleshwaram 17th Corss',
    ],
    'Client Location': 'form',
    'Partners Location': 'form'
  }

  // Caregiver availability data
  const caregiverAvailability = {
    'Skilled Male Nurse': 7,
    'Skilled Female Nurse': 5,
    'Semi Skilled Male Care Taker': 8,
    'Semi Skilled Female Care Taker': 6
  }

  // Service data from ListofServices or fallback
  const serviceData = useMemo(() => ({
    id: service.id || '1',
    name: service.name || 'Vaishnavi Health Care',
    location: service.place || 'Bengaluru, KA',
    experience: '10+ years experience',
    rating: service.rating || 4.8,
    reviewCount: 89,
    isFeatured: true,
    startingPrice: '₹1,500/day',
    responseTime: 'Within 1 hour',
    advanceBooking: '7 days',
    cancellation: 'Free up to 24 hours',
    contact: service.contact || '+91 9898989898',
    email: 'care@srivashnavi.com',
    description: `With over 10 years of dedicated experience in senior care, we provide compassionate and professional care services for elderly individuals. Our team of skilled nurses and caregivers ensures your loved ones receive the best possible care in the comfort of their own home.`,
    services: service.services || ['Home Care', 'Residential Care', 'Companion Care', 'Live-in Care'],
    packages: [
      { 
        name: 'Basic Care Package', 
        price: '₹1,500/day', 
        features: ['8 hours daily care', 'Basic medical assistance', 'Medication reminders', 'Meal preparation'] 
      },
      { 
        name: 'Premium Care Package', 
        price: '₹2,500/day', 
        features: ['12 hours daily care', 'Skilled nursing', 'Physical therapy', '24/7 emergency support'] 
      },
      { 
        name: 'Live-in Care Package', 
        price: '₹4,500/day', 
        features: ['24/7 live-in caregiver', 'Complete personal care', 'Medical monitoring', 'Family updates'] 
      }
    ],
    reviews: [
      { name: 'Mrs. Radha Sharma', rating: 5, comment: 'Excellent care for my mother. The caregivers are very professional and compassionate.' },
      { name: 'Mr. Rajesh Kumar', rating: 5, comment: 'Highly recommended! They took great care of my father during his recovery.' },
      { name: 'Mrs. Anita Singh', rating: 4, comment: 'Good service with caring staff. Very satisfied with the quality of care provided.' }
    ]
  }), [service])

  // Color scheme for senior care
  const colorClasses = {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    button: 'bg-teal-600 hover:bg-teal-700',
    badge: 'bg-teal-100 text-teal-700',
    border: 'border-teal-200'
  }

  // Mock unavailable dates
  const unavailableDates = useMemo(() => {
    const today = new Date()
    const unavailable = []
    
    // Add some random unavailable dates for demo
    for (let i = 0; i < 8; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1)
      unavailable.push(date.toDateString())
    }
    
    return unavailable
  }, [])

  // Calendar utility functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const isDateAvailable = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Calculate minimum booking date (2 days from today)
    const minBookingDate = new Date(today)
    minBookingDate.setDate(today.getDate() + 2)
    
    // Date must be at least 2 days in the future
    if (date < minBookingDate) return false
    return !unavailableDates.includes(date.toDateString())
  }

  // Registration Form Handlers
  const handleRegistrationInputChange = (field, value) => {
    setRegistrationForm(prev => {
      const updated = {
        ...prev,
        [field]: value
      }
      // Clear ID number when ID proof type changes
      if (field === 'idProof') {
        updated.idProofNumber = ''
      }
      // Calculate age when DOB changes
      if (field === 'dateOfBirth' && value) {
        updated.age = calculateAge(value)
      }
      // Handle "Don't know DOB" checkbox
      if (field === 'dontKnowDOB') {
        if (value) {
          // If checked, clear DOB and age
          updated.dateOfBirth = ''
          updated.age = ''
        } else {
          // If unchecked, clear age (will be calculated from DOB)
          updated.age = ''
        }
      }
      return updated
    })
    // Clear error for this field when user starts typing
    if (registrationErrors[field]) {
      setRegistrationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    // Clear ID number error when ID proof type changes
    if (field === 'idProof' && registrationErrors.idProofNumber) {
      setRegistrationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.idProofNumber
        return newErrors
      })
    }
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return ''
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age.toString()
  }

  const validateRegistrationForm = () => {
    const errors = {}
    
    if (!registrationForm.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!registrationForm.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!registrationForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationForm.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!registrationForm.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(registrationForm.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number'
    }
    if (!registrationForm.address.trim()) {
      errors.address = 'Address is required'
    }
    
    // Date of Birth / Age validation
    if (!registrationForm.dontKnowDOB) {
      if (!registrationForm.dateOfBirth.trim()) {
        errors.dateOfBirth = 'Date of birth is required'
      } else {
        const dob = new Date(registrationForm.dateOfBirth)
        const today = new Date()
        const minDate = new Date('1925-01-01')
        const maxDate = new Date()
        maxDate.setFullYear(today.getFullYear() - 1) // At least 1 year old
        
        if (dob < minDate || dob > maxDate) {
          errors.dateOfBirth = 'Date of birth must be between 1925 and today (at least 1 year old)'
        }
      }
    } else {
      if (!registrationForm.age.trim()) {
        errors.age = 'Age is required'
      } else {
        const ageNum = parseInt(registrationForm.age)
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
          errors.age = 'Age must be between 1 and 100 years'
        }
      }
    }
    
    if (!registrationForm.emergencyContact.trim()) {
      errors.emergencyContact = 'Emergency contact name is required'
    }
    if (!registrationForm.emergencyPhone.trim()) {
      errors.emergencyPhone = 'Emergency contact phone is required'
    } else if (!/^[0-9]{10}$/.test(registrationForm.emergencyPhone.replace(/\D/g, ''))) {
      errors.emergencyPhone = 'Please enter a valid 10-digit phone number'
    }
    if (!registrationForm.gender.trim()) {
      errors.gender = 'Gender is required'
    }
    if (!registrationForm.bloodGroup.trim()) {
      errors.bloodGroup = 'Blood group is required'
    }
    if (!registrationForm.idProof.trim()) {
      errors.idProof = 'ID proof type is required'
    }
    if (registrationForm.idProof.trim() && !registrationForm.idProofNumber.trim()) {
      errors.idProofNumber = 'ID number is required'
    }
    // Validate Aadhar number (12 digits)
    if (registrationForm.idProof === 'aadhar' && registrationForm.idProofNumber.trim()) {
      if (!/^[0-9]{12}$/.test(registrationForm.idProofNumber.replace(/\s/g, ''))) {
        errors.idProofNumber = 'Aadhar number must be exactly 12 digits'
      }
    }
    // Validate PAN number (10 characters: 5 letters, 4 digits, 1 letter)
    if (registrationForm.idProof === 'pan' && registrationForm.idProofNumber.trim()) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(registrationForm.idProofNumber.toUpperCase().replace(/\s/g, ''))) {
        errors.idProofNumber = 'PAN number must be in format: ABCDE1234F'
      }
    }
    
    // Advance Payment validation
    if (registrationForm.advancePayment.trim()) {
      const paymentAmount = parseFloat(registrationForm.advancePayment)
      if (isNaN(paymentAmount) || paymentAmount < 0) {
        errors.advancePayment = 'Payment amount cannot be negative'
      } else if (paymentAmount > 100000) {
        errors.advancePayment = 'Payment amount cannot exceed ₹1,00,000'
      }
      if (!registrationForm.paymentMode.trim()) {
        errors.paymentMode = 'Payment mode is required when advance payment is entered'
      }
    }
    
    setRegistrationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegistrationSubmit = (e) => {
    e.preventDefault()
    if (validateRegistrationForm()) {
      // Prepare registration data with form data and current selections
      const registrationData = {
        firstName: registrationForm.firstName,
        lastName: registrationForm.lastName,
        fullName: `${registrationForm.firstName} ${registrationForm.lastName}`, // For backward compatibility
        phone: registrationForm.phone,
        countryCode: registrationForm.countryCode,
        email: registrationForm.email,
        address: registrationForm.address,
        dateOfBirth: registrationForm.dateOfBirth,
        dontKnowDOB: registrationForm.dontKnowDOB,
        age: registrationForm.age,
        emergencyContact: registrationForm.emergencyContact,
        emergencyPhone: registrationForm.emergencyPhone,
        emergencyCountryCode: registrationForm.emergencyCountryCode,
        medicalConditions: registrationForm.medicalConditions,
        allergies: registrationForm.allergies,
        preferredLanguage: registrationForm.preferredLanguage,
        gender: registrationForm.gender,
        bloodGroup: registrationForm.bloodGroup,
        idProof: registrationForm.idProof,
        idProofNumber: registrationForm.idProofNumber,
        educationQualifications: registrationForm.educationQualifications,
        earlierOccupation: registrationForm.earlierOccupation,
        yearOfRetirement: registrationForm.yearOfRetirement,
        presentHealthCondition: registrationForm.presentHealthCondition,
        advancePayment: registrationForm.advancePayment,
        paymentMode: registrationForm.paymentMode,
        // Include booking selections if available
        selectedPackage: selectedPackage || null,
        caregiverType: selectedCaregiver || '',
        location: selectedLocationType || '',
        locationDetails: selectedLocationType === 'Client Location' 
          ? `${clientName} - ${clientAddress}` 
          : selectedLocationType === 'Partners Location'
          ? `${partnersName} - ${partnersAddress}`
          : selectedLocation || '',
        selectedDates: selectedDates.length > 0 ? selectedDates : []
      }
      
      // Save to localStorage
      const savedRegistration = saveRegistrationToStorage(registrationData)
      
      setIsRegistrationComplete(true)
      setActiveRegistration(savedRegistration)
      setShowRegistrationModal(false)
      setShowRegistrationRequiredPopup(false)
    }
  }

  const handleOpenRegistrationModal = () => {
    setShowRegistrationModal(true)
  }

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false)
    setRegistrationErrors({})
  }

  const handleOpenExistingRegistrations = () => {
    loadExistingRegistrations()
    setShowExistingRegistrations(true)
  }

  const handleCloseExistingRegistrations = () => {
    setShowExistingRegistrations(false)
  }

  const handleSelectExistingRegistration = (registration) => {
    if (!registration) return
    setActiveRegistration(registration)
    setIsRegistrationComplete(true)
    setShowExistingRegistrations(false)
    setShowRegistrationRequiredPopup(false)
  }

  // Save registration to localStorage
  const saveRegistrationToStorage = (registrationData) => {
    try {
      const existing = loadExistingRegistrations()
      const newRegistration = {
        id: Date.now(), // Use timestamp as unique ID
        ...registrationData,
        status: 'Active',
        dateOfRegistration: new Date().toISOString().split('T')[0]
      }
      const updatedRegistrations = [...existing, newRegistration]
      localStorage.setItem('seniorCareRegistrations', JSON.stringify(updatedRegistrations))
      setExistingRegistrations(updatedRegistrations)
      return newRegistration
    } catch (error) {
      console.error('Error saving registration:', error)
      return null
    }
  }

  // Remove registration from localStorage
  const removeRegistrationFromStorage = (registrationId) => {
    try {
      const existing = loadExistingRegistrations()
      const updatedRegistrations = existing.filter(reg => reg.id !== registrationId)
      localStorage.setItem('seniorCareRegistrations', JSON.stringify(updatedRegistrations))
      setExistingRegistrations(updatedRegistrations)
      setRegistrationToDelete(null)
      if (activeRegistration?.id === registrationId) {
        setActiveRegistration(null)
        setIsRegistrationComplete(false)
      }
    } catch (error) {
      console.error('Error removing registration:', error)
    }
  }

  const handleDeleteRegistration = (registrationId) => {
    setRegistrationToDelete(registrationId)
  }

  const handleConfirmDelete = () => {
    if (registrationToDelete) {
      removeRegistrationFromStorage(registrationToDelete)
    }
  }

  const handleCancelDelete = () => {
    setRegistrationToDelete(null)
  }

  const handleCaregiverSelect = (caregiver) => {
    if (!isRegistrationComplete) {
      setShowRegistrationRequiredPopup(true)
      return
    }
    setSelectedCaregiver(caregiver)
    setCurrentStep(2)
  }

  const handleLocationTypeSelect = (locationType) => {
    setSelectedLocationType(locationType)
    setShowMoreFacilities(false) // Reset dropdown when changing location type
    if (locationType === 'In House') {
      // Stay on step 2 to show In House options - don't change step
      return
    } else if (locationType === 'Client Location') {
      setCurrentStep(2.5) // Special step for client form
    } else if (locationType === 'Partners Location') {
      setCurrentStep(2.6) // Special step for partners form
    }
  }

  const handleRemoveLocationSelection = () => {
    setSelectedLocationType('')
    setSelectedLocation('')
    setShowMoreFacilities(false)
  }

  const handleLocationSelect = (location) => {
    if (location && location.trim() !== '') {
      setSelectedLocation(location)
      setCurrentStep(3)
    }
  }

  const handleClientAddressSubmit = () => {
    if (clientAddress.trim() && clientName.trim()) {
      setCurrentStep(3)
    }
  }

  const handlePartnersFormSubmit = () => {
    if (partnersAddress.trim() && partnersName.trim()) {
      setCurrentStep(3)
    }
  }

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setCurrentStep(4)
  }

  const handleDateSelect = (date) => {
    if (!isDateAvailable(date)) return;

    const dateString = date.toDateString();
    setSelectedDates(prev =>
      prev.includes(dateString)
        ? prev.filter(d => d !== dateString)
        : [...prev, dateString]
    );
    setSelectedDate(date);
  }

  const isDateSelected = (date) => {
    return selectedDates.includes(date.toDateString())
  }

  const getDateAvailability = (date) => {
    if (!selectedCaregiver) return null
    // Mock availability data - you can replace this with real data
    const availability = {
      'Skilled Male Nurse': Math.floor(Math.random() * 5) + 3,
      'Skilled Female Nurse': Math.floor(Math.random() * 4) + 2,
      'Semi Skilled Male Care Taker': Math.floor(Math.random() * 6) + 4,
      'Semi Skilled Female Care Taker': Math.floor(Math.random() * 5) + 3
    }
    return availability[selectedCaregiver] || 0
  }

  const handlePayment = () => {
    const serviceData1 = { 
        amount: 1500,
        merchantName: "Vaishnavi Health Care",
        description: `Senior Care booking for ${selectedCaregiver} - ${selectedDate.toLocaleDateString()}`,
        customerName: "John Doe",
        customerEmail: "john.doe@example.com",
        customerPhone: "9999999999",
        logo: service.photo,
        serviceDetails: {
          serviceName: serviceData.name,
          caregiverType: selectedCaregiver,
          location: selectedLocationType === 'Client Location' 
            ? `${clientName} - ${clientAddress}` 
            : selectedLocationType === 'Partners Location'
            ? `${partnersName} - ${partnersAddress}`
            : selectedLocation || selectedLocationType,
          package: selectedPackage,
          selectedDate: selectedDate.toLocaleDateString(),
          price: serviceData.startingPrice
      }
    }
    navigate("/pay", {
      state: serviceData1
    })
  }

  const handleStepClick = (stepNumber) => {
    // Check registration before allowing step 1
    if (stepNumber === 1 && !isRegistrationComplete) {
      setShowRegistrationRequiredPopup(true)
      return
    }
    
    // Only allow navigation to completed steps or the next logical step
    if (stepNumber === 1) {
      setCurrentStep(1)
    } else if (stepNumber === 2) {
      // Can go to step 2 if caregiver is selected
      if (selectedCaregiver) {
        setCurrentStep(2)
      }
    } else if (stepNumber === 3) {
      // Can go to step 3 if location is selected
      if (selectedCaregiver && selectedLocationType) {
        if (selectedLocationType === 'In House' && selectedLocation) {
          setCurrentStep(3)
        } else if (selectedLocationType === 'Client Location' && clientName && clientAddress) {
          setCurrentStep(3)
        } else if (selectedLocationType === 'Partners Location' && partnersName && partnersAddress) {
          setCurrentStep(3)
        }
      }
    } else if (stepNumber === 4) {
      // Can go to step 4 if package is selected
      if (selectedCaregiver && selectedLocationType && selectedPackage) {
        if (selectedLocationType === 'In House' && selectedLocation) {
          setCurrentStep(4)
        } else if (selectedLocationType === 'Client Location' && clientName && clientAddress) {
          setCurrentStep(4)
        } else if (selectedLocationType === 'Partners Location' && partnersName && partnersAddress) {
          setCurrentStep(4)
        }
      }
    } else if (stepNumber === 5) {
      // Can go to step 5 if dates are selected
      if (selectedCaregiver && selectedLocationType && selectedPackage && selectedDates.length > 0) {
        if (selectedLocationType === 'In House' && selectedLocation) {
          setCurrentStep(5)
        } else if (selectedLocationType === 'Client Location' && clientName && clientAddress) {
          setCurrentStep(5)
        } else if (selectedLocationType === 'Partners Location' && partnersName && partnersAddress) {
          setCurrentStep(5)
        }
      }
    }
  }

  const isStepAccessible = (stepNumber) => {
    if (stepNumber === 1) return isRegistrationComplete
    if (stepNumber === 2) return !!selectedCaregiver
    if (stepNumber === 3) {
      if (!selectedCaregiver || !selectedLocationType) return false
      if (selectedLocationType === 'In House') return !!selectedLocation
      if (selectedLocationType === 'Client Location') return !!(clientName && clientAddress)
      if (selectedLocationType === 'Partners Location') return !!(partnersName && partnersAddress)
    }
    if (stepNumber === 4) {
      if (!selectedCaregiver || !selectedLocationType || !selectedPackage) return false
      if (selectedLocationType === 'In House') return !!selectedLocation
      if (selectedLocationType === 'Client Location') return !!(clientName && clientAddress)
      if (selectedLocationType === 'Partners Location') return !!(partnersName && partnersAddress)
    }
    if (stepNumber === 5) {
      if (!selectedCaregiver || !selectedLocationType || !selectedPackage || selectedDates.length === 0) return false
      if (selectedLocationType === 'In House') return !!selectedLocation
      if (selectedLocationType === 'Client Location') return !!(clientName && clientAddress)
      if (selectedLocationType === 'Partners Location') return !!(partnersName && partnersAddress)
    }
    return false
  }

  const handleGoBack = () => {
    if (currentStep > 1) {
      // Handle special steps first
      if (currentStep === 2.5) {
        // From Client Location form back to Step 2
        setCurrentStep(2)
        return
      }
      if (currentStep === 2.6) {
        // From Partners Location form back to Step 2
        setCurrentStep(2)
        return
      }
      if (currentStep === 3) {
        // From Package selection back to Step 2 (or appropriate location step)
        if (selectedLocationType === 'Client Location' || selectedLocationType === 'Partners Location') {
          setCurrentStep(2)
        } else {
          setCurrentStep(2)
        }
        return
      }
      if (currentStep === 4) {
        // From Date selection back to Package selection
        setCurrentStep(3)
        return
      }
      if (currentStep === 5) {
        // From Payment review back to Date selection
        setCurrentStep(4)
        return
      }
      
      // Default case: go back one step
      setCurrentStep(currentStep - 1)
    }
  }

  const handleResetAll = () => {
    setSelectedCaregiver('')
    setSelectedLocation('')
    setSelectedLocationType('')
    setClientAddress('')
    setClientName('')
    setPartnersName('')
    setPartnersAddress('')
    setSelectedPackage('')
    setSelectedDate(null)
    setSelectedDates([])
    setHoveredDate(null)
    setCurrentStep(1)
    setCurrentMonth(new Date())
    setShowResetConfirm(false)
    setShowMoreFacilities(false)
  }

  const handleResetConfirm = () => {
    setShowResetConfirm(true)
  }

  const handleResetCancel = () => {
    setShowResetConfirm(false)
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const handleBookNow = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      return
    }
    handlePayment()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/services" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Service Header */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{serviceData.name}</h1>
                    {serviceData.isFeatured && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses.badge} self-start`}>
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      <span className="text-sm sm:text-base">{serviceData.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm sm:text-base">{serviceData.experience}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-gray-900 font-medium text-sm sm:text-base">{serviceData.rating}</span>
                    <span className="text-gray-500 text-sm sm:text-base">({serviceData.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${colorClasses.bg} flex-shrink-0`}>
                  <FiUser className={`w-6 h-6 sm:w-8 sm:h-8 ${colorClasses.text}`} />
                </div>
              </div>
            </div>


            {/* Senior Care Registration Button */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Senior Care Registration</h3>
                  <p className="text-sm text-gray-600"> 
                    {isRegistrationComplete 
                      ? 'Registration completed ✓' 
                      : 'Please complete your registration to proceed with booking'}
                  </p>
                  {activeRegistration && (
                    <p className="text-xs text-green-700 mt-1">
                      Using registration for <span className="font-semibold">{activeRegistration.fullName}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleOpenExistingRegistrations}
                    className="px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    <FiUsers className="w-4 h-4" />
                    <span className="hidden sm:inline">View Existing</span>
                    <span className="sm:hidden">View</span>
                  </button>
                  <button
                    onClick={handleOpenRegistrationModal}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                      isRegistrationComplete
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : `${colorClasses.button} text-white hover:opacity-90`
                    }`}
                  >
                    <FiEdit2 className="w-4 h-4" />
                    {isRegistrationComplete ? 'Edit Registration' : 'Register Now'}
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Selection Process */}
            <div className="bg-white rounded-xl shadow-sm">
              {/* Progress Steps */}
              <div className="border-b border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-between flex-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className="flex items-center">
                        <button
                          onClick={() => handleStepClick(step)}
                          disabled={!isStepAccessible(step)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                            currentStep >= step 
                              ? `${colorClasses.button} text-white hover:opacity-90` 
                              : isStepAccessible(step)
                              ? 'bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          title={
                            !isStepAccessible(step) 
                              ? 'Complete previous steps first' 
                              : `Go to Step ${step}`
                          }
                        >
                          {step}
                        </button>
                        {step < 5 && (
                          <div className={`w-12 h-1 mx-2 ${
                            currentStep > step ? colorClasses.bg : 'bg-gray-200'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Reset Button */}
                  {(selectedCaregiver || selectedLocationType || selectedPackage || selectedDate) && (
                    <button
                      onClick={handleResetConfirm}
                      className="ml-4 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FiXCircle className="w-4 h-4" />
                      Reset All
                    </button>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Caregiver</span>
                  <span>Location</span>
                  <span>Package</span>
                  <span>Date</span>
                  <span>Payment</span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* Step 1: Caregiver Selection */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Step 1: Select Caregiver Type</h3>
                      <button
                        onClick={handleGoBack}
                        disabled={currentStep === 1}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {caregiverOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleCaregiverSelect(option)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedCaregiver === option
                              ? `${colorClasses.border} bg-teal-50 border-teal-500`
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedCaregiver === option
                                ? 'border-teal-500 bg-teal-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedCaregiver === option && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{option}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {option.includes('Skilled') ? 'Professional medical care' : 'Basic care and assistance'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* About and Reviews Section */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mt-6">
                      {/* Tab Navigation */}
                      <div className="flex space-x-6 mb-6 border-b border-gray-200">
                        <button
                          onClick={() => setActiveTab('about')}
                          className={`pb-3 text-sm sm:text-base font-medium transition-colors ${
                            activeTab === 'about'
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          About
                        </button>
                        <button
                          onClick={() => setActiveTab('reviews')}
                          className={`pb-3 text-sm sm:text-base font-medium transition-colors ${
                            activeTab === 'reviews'
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Reviews
                        </button>
                      </div>

                      {/* Tab Content */}
                      {activeTab === 'about' && (
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">About {serviceData.name}</h3>
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">{serviceData.description}</p>
                          
                          <div className="mb-6">
                            <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-3">Services Offered</h4>
                            <div className="flex flex-wrap gap-2">
                              {serviceData.services.map((serviceItem, index) => (
                                <span key={index} className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                                  {serviceItem}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm sm:text-md font-semibold text-gray-900 mb-3">Care Features</h4>
                            <div className="space-y-2">
                              {[
                                'Professional medical care and monitoring',
                                'Personal hygiene and grooming assistance',
                                'Medication management and reminders',
                                'Meal planning and preparation',
                                'Physical therapy and mobility assistance',
                                'Companionship and emotional support'
                              ].map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-gray-600">
                                  <div className={`w-2 h-2 rounded-full ${colorClasses.bg}`}></div>
                                  <span className="text-sm sm:text-base">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'reviews' && (
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                          <div className="space-y-4">
                            {serviceData.reviews.map((review, index) => (
                              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{review.name}</h4>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <FiStar 
                                        key={i} 
                                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Location Type Selection */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Step 2: Select Location Type</h3>
                      <button
                        onClick={handleGoBack}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                      >
                        ← Back
                      </button>
                    </div>
                    
                    {/* Show all location options */}
                    <div className="space-y-3">
                      {/* Always show In House option */}
                      <button
                        onClick={() => handleLocationTypeSelect('In House')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedLocationType === 'In House'
                            ? `${colorClasses.border} bg-teal-50 border-teal-500`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedLocationType === 'In House'
                              ? 'border-teal-500 bg-teal-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedLocationType === 'In House' && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">In House</h4>
                            <p className="text-sm text-gray-600 mt-1">Care provided at our facilities</p>
                          </div>
                        </div>
                      </button>
                      
                      {/* Always show Client and Partner options */}
                      <button
                        onClick={() => handleLocationTypeSelect('Client Location')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedLocationType === 'Client Location'
                            ? `${colorClasses.border} bg-teal-50 border-teal-500`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedLocationType === 'Client Location'
                              ? 'border-teal-500 bg-teal-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedLocationType === 'Client Location' && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Client Location</h4>
                            <p className="text-sm text-gray-600 mt-1">Care provided at your location</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleLocationTypeSelect('Partners Location')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedLocationType === 'Partners Location'
                            ? `${colorClasses.border} bg-teal-50 border-teal-500`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedLocationType === 'Partners Location'
                              ? 'border-teal-500 bg-teal-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedLocationType === 'Partners Location' && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Partners Location</h4>
                            <p className="text-sm text-gray-600 mt-1">Care provided at partner facilities</p>
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    {/* Remove Selection Button - Show when In House is selected */}
                    {selectedLocationType === 'In House' && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={handleRemoveLocationSelection}
                          className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 border border-red-200"
                        >
                          <FiXCircle className="w-4 h-4" />
                          Remove In House Selection
                        </button>
                      </div>
                    )}
                    
                    {/* In House Location Selection */}
                    {selectedLocationType === 'In House' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Select Facility Location:</h4>
                        
                        <div className="space-y-3">
                          {/* Always show first 4 facilities in grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {locationOptions['In House'].slice(0, 4).map((location) => (
                              <button
                                key={location}
                                onClick={() => handleLocationSelect(location)}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${
                                  selectedLocation === location
                                    ? `${colorClasses.border} bg-teal-50 border-teal-500`
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full border-2 ${
                                    selectedLocation === location
                                      ? 'border-teal-500 bg-teal-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {selectedLocation === location && (
                                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                    )}
                                  </div>
                                  <span className="font-medium text-gray-900">{location}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          
                          {/* Show More button if there are more than 4 facilities */}
                          {locationOptions['In House'].length > 4 && (
                            <button
                              onClick={() => setShowMoreFacilities(!showMoreFacilities)}
                              className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-center"
                            >
                              <div className="flex items-center justify-center gap-2 text-gray-600">
                                <span className="font-medium">
                                  {showMoreFacilities 
                                    ? `Show Less Facilities` 
                                    : `Show ${locationOptions['In House'].length - 4} More Facilities`
                                  }
                                </span>
                                <span className={`transform transition-transform ${showMoreFacilities ? 'rotate-180' : ''}`}>
                                  ▼
                                </span>
                              </div>
                            </button>
                          )}
                          
                          {/* Dropdown for additional facilities */}
                          {showMoreFacilities && locationOptions['In House'].length > 4 && (
                            <div className="space-y-3">
                              <div className="relative">
                                <select
                                  value={selectedLocation}
                                  onChange={(e) => handleLocationSelect(e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white appearance-none"
                                >
                                  <option value="">Select additional facility...</option>
                                  {locationOptions['In House'].slice(4).map((location) => (
                                    <option key={location} value={location}>
                                      {location}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Show selected location confirmation */}
                          {selectedLocation && (
                            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-teal-500 bg-teal-500">
                                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                </div>
                                <span className="font-medium text-teal-900">Selected: {selectedLocation}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2.5: Client Location Form */}
                {currentStep === 2.5 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Step 2.5: Client Location Details</h3>
                      <button
                        onClick={handleGoBack}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Enter client name..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Address</label>
                        <input
                          type="text"
                          value={clientAddress}
                          onChange={(e) => handleClientAddressSearch(e.target.value)}
                          placeholder="Start typing any address worldwide..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                        />
                        {showClientSuggestions && clientAddressSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {clientAddressSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => selectClientSuggestion(suggestion)}
                                className={`p-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                  suggestion.isManualEntry ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <FiMapPin className={`w-4 h-4 flex-shrink-0 ${
                                    suggestion.isManualEntry ? 'text-blue-600' : 'text-teal-600'
                                  }`} />
                                  <span className={`text-sm ${
                                    suggestion.isManualEntry ? 'text-blue-900 font-medium' : 'text-gray-700'
                                  }`}>
                                    {suggestion.display}
                                    {suggestion.isManualEntry && <span className="ml-2 text-xs text-blue-600">(Use as entered)</span>}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Start typing to search any location worldwide</p>
                      </div>
                      <button
                        onClick={handleClientAddressSubmit}
                        disabled={!clientAddress.trim() || !clientName.trim()}
                        className={`px-6 py-2 rounded-lg font-medium ${
                          clientAddress.trim() && clientName.trim()
                            ? `${colorClasses.button} text-white hover:opacity-90`
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2.6: Partners Location Form */}
                {currentStep === 2.6 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Step 2.6: Partners Location Details</h3>
                      <button
                        onClick={handleGoBack}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Partner Name</label>
                        <input
                          type="text"
                          value={partnersName}
                          onChange={(e) => setPartnersName(e.target.value)}
                          placeholder="Enter partner name..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Partner Address</label>
                        <input
                          type="text"
                          value={partnersAddress}
                          onChange={(e) => handlePartnerAddressSearch(e.target.value)}
                          placeholder="Start typing any address worldwide..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                        />
                        {showPartnerSuggestions && partnerAddressSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {partnerAddressSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => selectPartnerSuggestion(suggestion)}
                                className={`p-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                  suggestion.isManualEntry ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <FiMapPin className={`w-4 h-4 flex-shrink-0 ${
                                    suggestion.isManualEntry ? 'text-blue-600' : 'text-teal-600'
                                  }`} />
                                  <span className={`text-sm ${
                                    suggestion.isManualEntry ? 'text-blue-900 font-medium' : 'text-gray-700'
                                  }`}>
                                    {suggestion.display}
                                    {suggestion.isManualEntry && <span className="ml-2 text-xs text-blue-600">(Use as entered)</span>}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Start typing to search any location worldwide</p>
                      </div>
                      <button
                        onClick={handlePartnersFormSubmit}
                        disabled={!partnersAddress.trim() || !partnersName.trim()}
                        className={`px-6 py-2 rounded-lg font-medium ${
                          partnersAddress.trim() && partnersName.trim()
                            ? `${colorClasses.button} text-white hover:opacity-90`
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Package Selection */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Step 3: Select Package</h3>
                      <button
                        onClick={handleGoBack}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="space-y-3">
                      {serviceData.packages.map((pkg, index) => (
                        <button
                          key={index}
                          onClick={() => handlePackageSelect(pkg)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedPackage === pkg
                              ? `${colorClasses.border} bg-teal-50 border-teal-500`
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                selectedPackage === pkg
                                  ? 'border-teal-500 bg-teal-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedPackage === pkg && (
                                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{pkg.features.join(', ')}</p>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{pkg.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Date Selection */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Step 4: Select Date(s)
                      </h3>
                      <button
                        onClick={handleGoBack}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                      >
                        ← Back
                      </button>
                    </div>
                    
                    {/* Minimum Booking Advance Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="font-medium text-yellow-900">Minimum 2-Day Advance Booking</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Please select a date at least 2 days from today. This allows us to prepare your service and ensure the best care experience.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 rounded-lg text-black bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 rounded-lg text-black bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            →
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
                          const days = []
                          
                          for (let i = 0; i < startingDayOfWeek; i++) {
                            days.push(<div key={`empty-${i}`} className="p-2"></div>)
                          }
                          
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                            const isAvailable = isDateAvailable(date)
                            const isSelected = isDateSelected(date)
                            const isToday = date.toDateString() === new Date().toDateString()
                            
                            days.push(
                              <div key={day} className="relative">
                                <button
                                  onClick={() => handleDateSelect(date)}
                                  onMouseEnter={() => setHoveredDate(date)}
                                  onMouseLeave={() => setHoveredDate(null)}
                                  disabled={!isAvailable}
                                  className={`p-2 text-sm rounded-lg transition-all w-full ${
                                    isSelected
                                      ? `${colorClasses.button} text-white`
                                      : isAvailable
                                      ? 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  } ${isToday ? 'ring-2 ring-teal-300' : ''}`}
                                >
                                  {day}
                                </button>
                                
                                {/* Availability Tooltip */}
                                {hoveredDate && hoveredDate.toDateString() === date.toDateString() && selectedCaregiver && isAvailable && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                    <div className="flex items-center gap-2">
                                      <FiUsers className="w-3 h-3" />
                                      <span>{getDateAvailability(date)} {selectedCaregiver.toLowerCase()} available</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                )}
                              </div>
                            )
                          }
                          
                          return days
                        })()}
                      </div>
                    </div>
                    
                    {/* Date Selection Feedback */}
                    {selectedDates.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FiCalendar className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-blue-900">
                              {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''} Selected
                            </h4>
                            <p className="text-blue-700 text-sm mt-1">
                              {selectedDates.map((dateStr, index) => (
                                <span key={index}>
                                  {new Date(dateStr).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                  {index < selectedDates.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </p>
                            <p className="text-blue-600 text-xs mt-2">
                              💡 You can select multiple dates for extended care. Click "Continue to Review" when ready.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Payment */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Step 5: Review & Payment</h3>
                      <button
                        onClick={handleGoBack}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Caregiver:</span>
                        <span className="font-medium text-gray-900">{selectedCaregiver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900">
                          {selectedLocationType === 'Client Location' 
                            ? `${clientName} - ${clientAddress}` 
                            : selectedLocationType === 'Partners Location'
                            ? `${partnersName} - ${partnersAddress}`
                            : selectedLocation || selectedLocationType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Package:</span>
                        <span className="font-medium text-gray-900">
                          {selectedPackage?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Selected Date{selectedDates.length > 1 ? 's' : ''}:
                        </span>
                        <div className="text-right">
                          {selectedDates.length > 0 ? (
                            <div className="font-medium text-gray-900 space-y-1">
                              {selectedDates.length <= 3 ? (
                                selectedDates.map((dateStr, index) => (
                                  <div key={index} className="text-sm">
                                    {new Date(dateStr).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric'
                                    })}
                                  </div>
                                ))
                              ) : (
                                <>
                                  {selectedDates.slice(0, 2).map((dateStr, index) => (
                                    <div key={index} className="text-sm">
                                      {new Date(dateStr).toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        month: 'short', 
                                        day: 'numeric'
                                      })}
                                    </div>
                                  ))}
                                  <div className="text-xs text-gray-600">
                                    +{selectedDates.length - 2} more dates
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="font-medium text-gray-900">No dates selected</span>
                          )}
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900">
                            {selectedPackage?.price || serviceData.startingPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handlePayment}
                      className={`w-full py-3 px-4 rounded-lg font-medium ${colorClasses.button} text-white hover:opacity-90`}
                    >
                      Proceed to Payment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reset Confirmation Dialog */}
            {showResetConfirm && (
              <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full border-2 border-black">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <FiXCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Reset All Selections</h3>
                      <p className="text-sm text-gray-600">This will clear all your current selections</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-700 mb-3">Are you sure you want to reset all selections? This action will:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Clear selected caregiver</li>
                      <li>• Clear location preferences and forms</li>
                      <li>• Clear package selection</li>
                      <li>• Clear selected date</li>
                      <li>• Return to Step 1</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleResetCancel}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetAll}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Registration Modal */}
            {showRegistrationModal && (
              <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto border-2 border-black">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Customer Registration</h2>
                    <button
                      onClick={handleCloseRegistrationModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiXCircle className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={registrationForm.firstName}
                          onChange={(e) => handleRegistrationInputChange('firstName', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your first name"
                        />
                        {registrationErrors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.firstName}</p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={registrationForm.lastName}
                          onChange={(e) => handleRegistrationInputChange('lastName', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your last name"
                        />
                        {registrationErrors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.lastName}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={registrationForm.email}
                          onChange={(e) => handleRegistrationInputChange('email', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {registrationErrors.email && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={registrationForm.countryCode}
                            onChange={(e) => handleRegistrationInputChange('countryCode', e.target.value)}
                            className="w-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                          >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+61">+61</option>
                            <option value="+971">+971</option>
                            <option value="+65">+65</option>
                            <option value="+60">+60</option>
                            <option value="+66">+66</option>
                          </select>
                          <input
                            type="tel"
                            value={registrationForm.phone}
                            onChange={(e) => handleRegistrationInputChange('phone', e.target.value)}
                            className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                              registrationErrors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="10-digit phone number"
                            maxLength="10"
                          />
                        </div>
                        {registrationErrors.phone && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.phone}</p>
                        )}
                      </div>

                      {/* Date of Birth / Age */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth / Age <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="dontKnowDOB"
                              checked={registrationForm.dontKnowDOB}
                              onChange={(e) => handleRegistrationInputChange('dontKnowDOB', e.target.checked)}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor="dontKnowDOB" className="text-sm text-gray-700">
                              I don't know my date of birth
                            </label>
                          </div>
                          
                          {!registrationForm.dontKnowDOB ? (
                            <div className="space-y-2">
                              <input
                                type="date"
                                value={registrationForm.dateOfBirth}
                                onChange={(e) => handleRegistrationInputChange('dateOfBirth', e.target.value)}
                                min="1925-01-01"
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                                  registrationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {registrationErrors.dateOfBirth && (
                                <p className="text-red-500 text-xs">{registrationErrors.dateOfBirth}</p>
                              )}
                              {registrationForm.dateOfBirth && registrationForm.age && (
                                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-sm text-blue-700">
                                    <span className="font-medium">Age:</span> {registrationForm.age} years
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <input
                                type="number"
                                value={registrationForm.age}
                                onChange={(e) => handleRegistrationInputChange('age', e.target.value)}
                                min="1"
                                max="100"
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                                  registrationErrors.age ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter age (1-100 years)"
                              />
                              {registrationErrors.age && (
                                <p className="text-red-500 text-xs mt-1">{registrationErrors.age}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={registrationForm.address}
                          onChange={(e) => handleRegistrationInputChange('address', e.target.value)}
                          rows="3"
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your complete address"
                        />
                        {registrationErrors.address && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.address}</p>
                        )}
                      </div>

                      {/* Emergency Contact Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={registrationForm.emergencyContact}
                          onChange={(e) => handleRegistrationInputChange('emergencyContact', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Emergency contact person name"
                        />
                        {registrationErrors.emergencyContact && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.emergencyContact}</p>
                        )}
                      </div>

                      {/* Emergency Contact Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={registrationForm.emergencyCountryCode}
                            onChange={(e) => handleRegistrationInputChange('emergencyCountryCode', e.target.value)}
                            className="w-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                          >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                            <option value="+61">+61</option>
                            <option value="+971">+971</option>
                            <option value="+65">+65</option>
                            <option value="+60">+60</option>
                            <option value="+66">+66</option>
                          </select>
                          <input
                            type="tel"
                            value={registrationForm.emergencyPhone}
                            onChange={(e) => handleRegistrationInputChange('emergencyPhone', e.target.value)}
                            className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                              registrationErrors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="10-digit phone number"
                            maxLength="10"
                          />
                        </div>
                        {registrationErrors.emergencyPhone && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.emergencyPhone}</p>
                        )}
                      </div>

                      {/* Medical Conditions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical Conditions
                        </label>
                        <textarea
                          value={registrationForm.medicalConditions}
                          onChange={(e) => handleRegistrationInputChange('medicalConditions', e.target.value)}
                          rows="3"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          placeholder="List any medical conditions (optional)"
                        />
                      </div>

                      {/* Allergies */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allergies
                        </label>
                        <textarea
                          value={registrationForm.allergies}
                          onChange={(e) => handleRegistrationInputChange('allergies', e.target.value)}
                          rows="3"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          placeholder="List any allergies (optional)"
                        />
                      </div>

                      {/* Preferred Language */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Language
                        </label>
                        <select
                          value={registrationForm.preferredLanguage}
                          onChange={(e) => handleRegistrationInputChange('preferredLanguage', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                        >
                          <option value="">Select preferred language</option>
                          <option value="english">English</option>
                          <option value="hindi">Hindi</option>
                          <option value="kannada">Kannada</option>
                          <option value="tamil">Tamil</option>
                          <option value="telugu">Telugu</option>
                          <option value="malayalam">Malayalam</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={registrationForm.gender}
                          onChange={(e) => handleRegistrationInputChange('gender', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.gender ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                        {registrationErrors.gender && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.gender}</p>
                        )}
                      </div>

                      {/* Blood Group */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Group <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={registrationForm.bloodGroup}
                          onChange={(e) => handleRegistrationInputChange('bloodGroup', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.bloodGroup ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select blood group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                        {registrationErrors.bloodGroup && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.bloodGroup}</p>
                        )}
                      </div>

                      {/* ID Proof */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID Proof <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={registrationForm.idProof}
                          onChange={(e) => handleRegistrationInputChange('idProof', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.idProof ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select ID proof type</option>
                          <option value="aadhar">Aadhar Card</option>
                          <option value="pan">PAN Card</option>
                          <option value="passport">Passport</option>
                          <option value="driving-license">Driving License</option>
                          <option value="voter-id">Voter ID</option>
                          <option value="other">Other</option>
                        </select>
                        {registrationErrors.idProof && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.idProof}</p>
                        )}
                      </div>

                      {/* ID Proof Number */}
                      {registrationForm.idProof && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {registrationForm.idProof === 'aadhar' ? 'Aadhar Number' :
                             registrationForm.idProof === 'pan' ? 'PAN Number' :
                             registrationForm.idProof === 'passport' ? 'Passport Number' :
                             registrationForm.idProof === 'driving-license' ? 'Driving License Number' :
                             registrationForm.idProof === 'voter-id' ? 'Voter ID Number' :
                             'ID Number'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={registrationForm.idProofNumber}
                            onChange={(e) => {
                              let value = e.target.value
                              // Auto-uppercase for PAN
                              if (registrationForm.idProof === 'pan') {
                                value = value.toUpperCase()
                              }
                              // Only allow numbers for Aadhar
                              if (registrationForm.idProof === 'aadhar') {
                                value = value.replace(/\D/g, '')
                              }
                              handleRegistrationInputChange('idProofNumber', value)
                            }}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                              registrationErrors.idProofNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder={`Enter ${registrationForm.idProof === 'aadhar' ? 'Aadhar' :
                                         registrationForm.idProof === 'pan' ? 'PAN' :
                                         registrationForm.idProof === 'passport' ? 'Passport' :
                                         registrationForm.idProof === 'driving-license' ? 'Driving License' :
                                         registrationForm.idProof === 'voter-id' ? 'Voter ID' :
                                         'ID'} number`}
                            maxLength={registrationForm.idProof === 'aadhar' ? '12' :
                                       registrationForm.idProof === 'pan' ? '10' : ''}
                          />
                          {registrationErrors.idProofNumber && (
                            <p className="text-red-500 text-xs mt-1">{registrationErrors.idProofNumber}</p>
                          )}
                          {registrationForm.idProof === 'aadhar' && (
                            <p className="text-gray-500 text-xs mt-1">Enter 12-digit Aadhar number</p>
                          )}
                          {registrationForm.idProof === 'pan' && (
                            <p className="text-gray-500 text-xs mt-1">Enter 10-character PAN number</p>
                          )}
                        </div>
                      )}

                      {/* Education Qualifications */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Education Qualifications
                        </label>
                        <textarea
                          value={registrationForm.educationQualifications}
                          onChange={(e) => handleRegistrationInputChange('educationQualifications', e.target.value)}
                          rows="3"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          placeholder="Enter your educational qualifications"
                        />
                      </div>

                      {/* Earlier Occupation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Earlier Occupation
                        </label>
                        <input
                          type="text"
                          value={registrationForm.earlierOccupation}
                          onChange={(e) => handleRegistrationInputChange('earlierOccupation', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          placeholder="Enter your previous occupation"
                        />
                      </div>

                      {/* Year of Retirement */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year of Retirement
                        </label>
                        <input
                          type="number"
                          value={registrationForm.yearOfRetirement}
                          onChange={(e) => handleRegistrationInputChange('yearOfRetirement', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          placeholder="YYYY"
                          min="1950"
                          max={new Date().getFullYear()}
                        />
                      </div>

                      {/* Present Health Condition */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Present Health Condition
                        </label>
                        <textarea
                          value={registrationForm.presentHealthCondition}
                          onChange={(e) => handleRegistrationInputChange('presentHealthCondition', e.target.value)}
                          rows="3"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                          placeholder="Describe your current health condition"
                        />
                      </div>

                      {/* Advance Payment */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Advance Payment
                        </label>
                        <input
                          type="number"
                          value={registrationForm.advancePayment}
                          onChange={(e) => {
                            const value = e.target.value
                            // Prevent negative values
                            if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100000)) {
                              handleRegistrationInputChange('advancePayment', value)
                            }
                          }}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                            registrationErrors.advancePayment ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter amount (₹)"
                          min="0"
                          max="100000"
                          step="0.01"
                        />
                        {registrationErrors.advancePayment && (
                          <p className="text-red-500 text-xs mt-1">{registrationErrors.advancePayment}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Maximum: ₹1,00,000</p>
                      </div>

                      {/* Payment Mode */}
                      {registrationForm.advancePayment && registrationForm.advancePayment.trim() !== '' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Mode <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={registrationForm.paymentMode}
                            onChange={(e) => handleRegistrationInputChange('paymentMode', e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 ${
                              registrationErrors.paymentMode ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select payment mode</option>
                            <option value="cash">Cash</option>
                            <option value="credit-card">Credit Card</option>
                            <option value="debit-card">Debit Card</option>
                            <option value="net-banking">Net Banking</option>
                            <option value="upi">UPI</option>
                            <option value="cheque">Cheque</option>
                            <option value="bank-transfer">Bank Transfer</option>
                          </select>
                          {registrationErrors.paymentMode && (
                            <p className="text-red-500 text-xs mt-1">{registrationErrors.paymentMode}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleCloseRegistrationModal}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 px-4 py-3 rounded-lg font-medium ${colorClasses.button} text-white hover:opacity-90 transition-colors`}
                      >
                        Submit Registration
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Registration Required Popup */}
            {showRegistrationRequiredPopup && (
              <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full border-2 border-black">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Registration Required</h3>
                      <p className="text-sm text-gray-600">Please complete your registration first</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-700 mb-3">
                      You need to complete the customer registration form before proceeding with the booking process.
                    </p>
                    <p className="text-sm text-gray-600">
                      This helps us provide you with the best care service and maintain accurate records.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRegistrationRequiredPopup(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowRegistrationRequiredPopup(false)
                        setShowRegistrationModal(true)
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium ${colorClasses.button} text-white hover:opacity-90 transition-colors`}
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Registrations Modal */}
            {showExistingRegistrations && (
              <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto border-2 border-black">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Existing Registered Seniors</h2>
                      <p className="text-sm text-gray-600 mt-1">View registered seniors and their package details</p>
                    </div>
                    <button
                      onClick={handleCloseExistingRegistrations}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiXCircle className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {existingRegistrations.length > 0 ? (
                    <div className="space-y-4">
                      {existingRegistrations.map((registration) => {
                        const isActive = activeRegistration?.id === registration.id
                        return (
                        <div 
                          key={registration.id} 
                          className={`border border-gray-200 rounded-lg p-4 sm:p-6 transition-shadow ${isActive ? 'shadow-lg border-teal-400 bg-teal-50/40' : 'hover:shadow-md'}`}
                        >
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200">
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{registration.fullName}</h3>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                                {registration.applicationNo && (
                                  <span className="flex items-center gap-1">
                                    <FiUser className="w-4 h-4" />
                                    App No: {registration.applicationNo}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <FiCalendar className="w-4 h-4" />
                                  Registered: {new Date(registration.dateOfRegistration).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isActive
                                    ? 'bg-teal-200 text-teal-900'
                                    : registration.status === 'Active' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {isActive ? 'Selected' : registration.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Summary: Caregiver, Package, Dates */}
                          <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FiCheckCircle className="w-4 h-4 text-teal-600" />
                              Booking Summary
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Caregiver */}
                              <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <FiUsers className="w-4 h-4 text-blue-600" />
                                  <span className="text-xs font-medium text-gray-600">Caregiver</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {registration.caregiverType ? registration.caregiverType : <span className="text-gray-400 italic">Not selected</span>}
                                </p>
                              </div>

                              {/* Package */}
                              <div className="bg-white rounded-lg p-3 border border-teal-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <FiCheckCircle className="w-4 h-4 text-teal-600" />
                                  <span className="text-xs font-medium text-gray-600">Package</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {registration.selectedPackage?.name ? registration.selectedPackage.name : <span className="text-gray-400 italic">Not selected</span>}
                                </p>
                                {registration.selectedPackage?.price && (
                                  <p className="text-xs text-teal-600 mt-1">{registration.selectedPackage.price}</p>
                                )}
                              </div>

                              {/* Dates */}
                              <div className="bg-white rounded-lg p-3 border border-orange-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <FiCalendar className="w-4 h-4 text-orange-600" />
                                  <span className="text-xs font-medium text-gray-600">Dates</span>
                                </div>
                                {registration.selectedDates && registration.selectedDates.length > 0 ? (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {registration.selectedDates.length} {registration.selectedDates.length === 1 ? 'date' : 'dates'}
                                    </p>
                                    <p className="text-xs text-orange-600 mt-1">
                                      {registration.selectedDates.length <= 2 ? (
                                        registration.selectedDates.map((date, idx) => (
                                          <span key={idx}>
                                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {idx < registration.selectedDates.length - 1 ? ', ' : ''}
                                          </span>
                                        ))
                                      ) : (
                                        <>
                                          {new Date(registration.selectedDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(registration.selectedDates[registration.selectedDates.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </>
                                      )}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm font-semibold text-gray-400 italic">Not selected</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Package Details */}
                          {registration.selectedPackage ? (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FiCheckCircle className="w-4 h-4 text-teal-600" />
                                Selected Package
                              </h4>
                              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                  <h5 className="text-base font-semibold text-teal-900">{registration.selectedPackage.name}</h5>
                                  <span className="text-lg font-bold text-teal-700">{registration.selectedPackage.price}</span>
                                </div>
                                {registration.selectedPackage.duration && (
                                  <p className="text-sm text-teal-700 mb-2">
                                    Duration: {registration.selectedPackage.duration}
                                  </p>
                                )}
                                {registration.selectedPackage.features && registration.selectedPackage.features.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-teal-800 mb-1">Package Features:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {registration.selectedPackage.features.map((feature, index) => (
                                        <li key={index} className="text-sm text-teal-700">{feature}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FiCheckCircle className="w-4 h-4 text-gray-400" />
                                Selected Package
                              </h4>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600">No package selected yet</p>
                              </div>
                            </div>
                          )}

                          {/* Caregiver and Location */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FiUsers className="w-4 h-4 text-blue-600" />
                                Caregiver Type
                              </h4>
                              <p className="text-sm text-gray-900 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                {registration.caregiverType || 'Not selected'}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FiMapPin className="w-4 h-4 text-purple-600" />
                                Location
                              </h4>
                              <p className="text-sm text-gray-900 bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <span className="font-medium">{registration.location || 'Not selected'}</span>
                                {registration.locationDetails && (
                                  <span className="block mt-1 text-gray-600">{registration.locationDetails}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Selected Dates */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <FiCalendar className="w-4 h-4 text-orange-600" />
                              Selected Dates ({registration.selectedDates?.length || 0} {(registration.selectedDates?.length || 0) === 1 ? 'date' : 'dates'})
                            </h4>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              {registration.selectedDates && registration.selectedDates.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {registration.selectedDates.map((date, index) => (
                                    <span 
                                      key={index}
                                      className="px-2 py-1 bg-white border border-orange-300 rounded text-xs text-orange-900 font-medium"
                                    >
                                      {new Date(date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600">No dates selected yet</p>
                              )}
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FiPhone className="w-4 h-4" />
                                {registration.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiMail className="w-4 h-4" />
                                {registration.email}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              onClick={() => handleSelectExistingRegistration(registration)}
                              disabled={isActive}
                              className={`flex-1 min-w-[140px] px-4 py-2 rounded-lg font-semibold text-sm ${
                                isActive
                                  ? 'bg-teal-200 text-teal-800 cursor-not-allowed'
                                  : `${colorClasses.button} text-white hover:opacity-90`
                              }`}
                            >
                              {isActive ? 'Selected Registration' : 'Use this Registration'}
                            </button>
                            <button
                              onClick={() => handleDeleteRegistration(registration.id)}
                              className="flex-1 min-w-[120px] px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-red-200 flex items-center justify-center gap-2"
                              title="Remove registration"
                            >
                              <FiXCircle className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registered Seniors</h3>
                      <p className="text-gray-600 mb-4">There are no existing registrations to display.</p>
                      <button
                        onClick={() => {
                          handleCloseExistingRegistrations()
                          handleOpenRegistrationModal()
                        }}
                        className={`px-4 py-2 rounded-lg font-medium ${colorClasses.button} text-white hover:opacity-90 transition-colors`}
                      >
                        Register New Senior
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <button
                      onClick={handleCloseExistingRegistrations}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Registration Confirmation Dialog */}
            {registrationToDelete && (
              <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full border-2 border-black">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <FiXCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Remove Registration</h3>
                      <p className="text-sm text-gray-600">This action cannot be undone</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-700 mb-3">
                      Are you sure you want to remove this registration? This will permanently delete all information for this senior.
                    </p>
                    {existingRegistrations.find(reg => reg.id === registrationToDelete) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">
                          {existingRegistrations.find(reg => reg.id === registrationToDelete).fullName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {existingRegistrations.find(reg => reg.id === registrationToDelete).email}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelDelete}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove Registration
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Get in Touch */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Get in Touch</h3>
              <div className="space-y-2 sm:space-y-3">
                <button 
                  onClick={handleBookNow} 
                  disabled={currentStep === 1 && !selectedCaregiver || currentStep === 4 && selectedDates.length === 0}
                  className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    (currentStep === 1 && selectedCaregiver) || (currentStep > 1 && !(currentStep === 4 && selectedDates.length === 0))
                      ? `${colorClasses.button} text-white hover:opacity-90`
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentStep === 1 ? 'Select Date, Venue and Package' : 
                   currentStep === 4 ? (selectedDates.length > 0 ? 'Review and Confirm Booking' : 'Select at least one date') :
                   currentStep === 5 ? 'Proceed to Payment' : 
                   'Continue to Next Step'}
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                  <FiPhone className="w-4 h-4" />
                  Call Now for Booking
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                  <FiMail className="w-4 h-4" />
                  Send Email
                </button>
              </div>
              
              {/* Selected Options Display */}
              {(selectedCaregiver || selectedLocationType || selectedPackage || selectedDate) && (
                <div className="mt-3 sm:mt-4 space-y-2">
                  {selectedCaregiver && (
                    <div className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span className="text-xs sm:text-sm font-medium text-green-900">Caregiver:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-green-700 mt-1">{selectedCaregiver}</p>
                    </div>
                  )}
                  
                  {selectedLocationType && (
                    <div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="text-xs sm:text-sm font-medium text-blue-900">Location:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        {selectedLocationType === 'Client Location' 
                          ? `${clientName} - ${clientAddress}` 
                          : selectedLocationType === 'Partners Location'
                          ? `${partnersName} - ${partnersAddress}`
                          : selectedLocation || selectedLocationType}
                      </p>
                    </div>
                  )}
                  
                  {selectedPackage && (
                    <div className="p-2 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                        <span className="text-xs sm:text-sm font-medium text-purple-900">Package:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-purple-700 mt-1">{selectedPackage.name}</p>
                    </div>
                  )}
                  
                  {selectedDates.length > 0 && (
                    <div className="p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                        <span className="text-xs sm:text-sm font-medium text-orange-900">Selected Dates:</span>
                      </div>
                      <div className="text-xs sm:text-sm text-orange-700 mt-1">
                        <div>
                          <span className="font-medium">Start:</span>
                          {' '}
                          {new Date(Math.min(...selectedDates.map(d => new Date(d)))).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div>
                          <span className="font-medium">End:</span>
                          {' '}
                          {new Date(Math.max(...selectedDates.map(d => new Date(d)))).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-gray-700">
                          {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Info</h3>
              <div className="space-y-2 sm:space-y-3">
                
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Response Time:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceData.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Advance Booking:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceData.advanceBooking}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Cancellation:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{serviceData.cancellation}</span>
                </div>
              </div>
              
              {/* Social Media Icons */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Follow Us</h4>
                <div className="flex justify-center gap-3">
                  {/* Facebook */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    title="Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  
                  {/* LinkedIn */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors"
                    title="LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  
                  {/* WhatsApp */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                    title="WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </a>
                  
                  {/* Instagram */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
                    title="Instagram"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  
                  {/* Discord */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
                    title="Discord"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </a>
                  
                  {/* Snapchat */}
                  <a 
                    href="#" 
                    className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white hover:bg-yellow-600 transition-colors"
                    title="Snapchat"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeniorCare