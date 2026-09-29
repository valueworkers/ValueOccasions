import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaCreditCard, FaCalendarAlt, FaClock, FaDollarSign, FaCog } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

const Subscription = () => {
  // Plan types state
  const [planTypes, setPlanTypes] = useState(() => {
    try {
      const saved = localStorage.getItem('planTypes')
      return saved ? JSON.parse(saved) : [
        { id: 1, name: 'monthly', label: 'Monthly', icon: 'calendar', color: 'blue' },
        { id: 2, name: 'quarterly', label: 'Quarterly', icon: 'clock', color: 'green' },
        { id: 3, name: 'yearly', label: 'Yearly', icon: 'credit-card', color: 'purple' },
        { id: 4, name: 'pay-per-instance', label: 'Pay Per Event', icon: 'dollar', color: 'orange' }
      ]
    } catch (error) {
      return []
    }
  })

  // Subscription plans state
  const [subscriptionPlans, setSubscriptionPlans] = useState(() => {
    try {
      const saved = localStorage.getItem('subscriptionPlans')
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          name: 'Basic Monthly',
          type: 'monthly',
          price: 99,
          features: ['Up to 5 venues', 'Basic support', 'Standard features'],
          isActive: true
        },
        {
          id: 2,
          name: 'Pro Quarterly',
          type: 'quarterly',
          price: 249,
          features: ['Up to 15 venues', 'Priority support', 'Advanced features', 'Analytics'],
          isActive: true
        },
        {
          id: 3,
          name: 'Enterprise Yearly',
          type: 'yearly',
          price: 899,
          features: ['Unlimited venues', '24/7 support', 'All features', 'Custom integrations'],
          isActive: true
        },
        {
          id: 4,
          name: 'Pay Per Event',
          type: 'pay-per-instance',
          price: 25,
          features: ['Per event booking', 'No monthly commitment', 'Basic features'],
          isActive: true
        }
      ]
    } catch (error) {
      return []
    }
  })

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPlanTypeModal, setShowPlanTypeModal] = useState(false)
  const [showAddPlanTypeModal, setShowAddPlanTypeModal] = useState(false)
  const [showEditPlanTypeModal, setShowEditPlanTypeModal] = useState(false)
  const [showDeletePlanTypeModal, setShowDeletePlanTypeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedPlanType, setSelectedPlanType] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly',
    price: '',
    features: [],
    isActive: true
  })

  // Plan type form data
  const [planTypeFormData, setPlanTypeFormData] = useState({
    name: '',
    label: '',
    icon: 'calendar',
    color: 'blue'
  })

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('subscriptionPlans', JSON.stringify(subscriptionPlans))
  }, [subscriptionPlans])

  useEffect(() => {
    localStorage.setItem('planTypes', JSON.stringify(planTypes))
  }, [planTypes])

  const handleAddPlan = () => {
    setFormData({
      name: '',
      type: 'monthly',
      price: '',
      features: [],
      isActive: true
    })
    setShowAddModal(true)
  }

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name,
      type: plan.type,
      price: plan.price.toString(),
      features: plan.features,
      isActive: plan.isActive
    })
    setShowEditModal(true)
  }

  const handleDeletePlan = (plan) => {
    setSelectedPlan(plan)
    setShowDeleteModal(true)
  }

  const savePlan = () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in all required fields')
      return
    }

    const newPlan = {
      id: selectedPlan ? selectedPlan.id : Date.now(),
      name: formData.name,
      type: formData.type,
      price: parseFloat(formData.price),
      features: formData.features,
      isActive: formData.isActive
    }

    if (selectedPlan) {
      setSubscriptionPlans(prev => prev.map(p => p.id === selectedPlan.id ? newPlan : p))
      setShowEditModal(false)
    } else {
      setSubscriptionPlans(prev => [...prev, newPlan])
      setShowAddModal(false)
    }
    setSelectedPlan(null)
  }

  const confirmDelete = () => {
    if (selectedPlan) {
      setSubscriptionPlans(prev => prev.filter(p => p.id !== selectedPlan.id))
      setShowDeleteModal(false)
      setSelectedPlan(null)
    }
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }))
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // Plan type management functions
  const handleAddPlanType = () => {
    setPlanTypeFormData({
      name: '',
      label: '',
      icon: 'calendar',
      color: 'blue'
    })
    setShowAddPlanTypeModal(true)
  }

  const handleEditPlanType = (planType) => {
    setSelectedPlanType(planType)
    setPlanTypeFormData({
      name: planType.name,
      label: planType.label,
      icon: planType.icon,
      color: planType.color
    })
    setShowEditPlanTypeModal(true)
  }

  const handleDeletePlanType = (planType) => {
    setSelectedPlanType(planType)
    setShowDeletePlanTypeModal(true)
  }

  const savePlanType = () => {
    if (!planTypeFormData.name || !planTypeFormData.label) {
      alert('Please fill in all required fields')
      return
    }

    const newPlanType = {
      id: selectedPlanType ? selectedPlanType.id : Date.now(),
      name: planTypeFormData.name,
      label: planTypeFormData.label,
      icon: planTypeFormData.icon,
      color: planTypeFormData.color
    }

    if (selectedPlanType) {
      setPlanTypes(prev => prev.map(p => p.id === selectedPlanType.id ? newPlanType : p))
      setShowEditPlanTypeModal(false)
    } else {
      setPlanTypes(prev => [...prev, newPlanType])
      setShowAddPlanTypeModal(false)
    }
    setSelectedPlanType(null)
  }

  const confirmDeletePlanType = () => {
    if (selectedPlanType) {
      // Check if any subscription plans are using this plan type
      const plansUsingType = subscriptionPlans.filter(plan => plan.type === selectedPlanType.name)
      if (plansUsingType.length > 0) {
        alert(`Cannot delete plan type "${selectedPlanType.label}" because it's being used by ${plansUsingType.length} subscription plan(s). Please update or delete those plans first.`)
        return
      }
      
      setPlanTypes(prev => prev.filter(p => p.id !== selectedPlanType.id))
      setShowDeletePlanTypeModal(false)
      setSelectedPlanType(null)
    }
  }

  const getTypeIcon = (type) => {
    const planType = planTypes.find(pt => pt.name === type)
    if (!planType) return <FaCreditCard className="w-4 h-4" />
    
    switch (planType.icon) {
      case 'calendar': return <FaCalendarAlt className="w-4 h-4" />
      case 'clock': return <FaClock className="w-4 h-4" />
      case 'credit-card': return <FaCreditCard className="w-4 h-4" />
      case 'dollar': return <FaDollarSign className="w-4 h-4" />
      default: return <FaCreditCard className="w-4 h-4" />
    }
  }

  const getTypeColor = (type) => {
    const planType = planTypes.find(pt => pt.name === type)
    if (!planType) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    switch (planType.color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'green': return 'bg-green-100 text-green-800 border-green-200'
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'red': return 'bg-red-100 text-red-800 border-red-200'
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type) => {
    const planType = planTypes.find(pt => pt.name === type)
    return planType ? planType.label : type
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage subscription plans and pricing models for your platform</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleAddPlan}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Add New Subscription Plan
          </button>
          <button
            onClick={() => setShowPlanTypeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaCog className="w-4 h-4" />
            Manage Plan Types
          </button>
        </div>

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md flex flex-col ${
              plan.isActive ? 'border-green-200' : 'border-gray-200'
            }`}>
              <div className="p-6 flex flex-col flex-1">
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(plan.type)}`}>
                    {getTypeIcon(plan.type)}
                    {getTypeLabel(plan.type)}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${plan.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-600 ml-1">
                    {plan.type === 'pay-per-instance' ? '/event' : `/${plan.type}`}
                  </span>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    <FaEdit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    <FaTrash className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Plan Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Subscription Plan</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="e.g., Pro Monthly"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  >
                    {planTypes.map((planType) => (
                      <option key={planType.id} value={planType.name}>
                        {planType.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Features</label>
                    <button
                      onClick={addFeature}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md text-black"
                          placeholder="Enter feature"
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active Plan</label>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePlan}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Plan Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Subscription Plan</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  >
                    {planTypes.map((planType) => (
                      <option key={planType.id} value={planType.name}>
                        {planType.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Features</label>
                    <button
                      onClick={addFeature}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md text-black"
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active Plan</label>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePlan}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete <strong>"{selectedPlan?.name}"</strong>?
                </p>
                <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plan Type Management Modal */}
        {showPlanTypeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Manage Plan Types</h3>
                <button
                  onClick={() => setShowPlanTypeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={handleAddPlanType}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                  Add New Plan Type
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planTypes.map((planType) => (
                  <div key={planType.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(planType.name)}`}>
                        {getTypeIcon(planType.name)}
                        {planType.label}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p><strong>Name:</strong> {planType.name}</p>
                      <p><strong>Label:</strong> {planType.label}</p>
                      <p><strong>Icon:</strong> {planType.icon}</p>
                      <p><strong>Color:</strong> {planType.color}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlanType(planType)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlanType(planType)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Plan Type Modal */}
        {showAddPlanTypeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Plan Type</h3>
                <button
                  onClick={() => setShowAddPlanTypeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={planTypeFormData.name}
                    onChange={(e) => setPlanTypeFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="e.g., weekly"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                  <input
                    type="text"
                    value={planTypeFormData.label}
                    onChange={(e) => setPlanTypeFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    placeholder="e.g., Weekly"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={planTypeFormData.icon}
                    onChange={(e) => setPlanTypeFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  >
                    <option value="calendar">Calendar</option>
                    <option value="clock">Clock</option>
                    <option value="credit-card">Credit Card</option>
                    <option value="dollar">Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select
                    value={planTypeFormData.color}
                    onChange={(e) => setPlanTypeFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowAddPlanTypeModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePlanType}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Plan Type
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Plan Type Modal */}
        {showEditPlanTypeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Plan Type</h3>
                <button
                  onClick={() => setShowEditPlanTypeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={planTypeFormData.name}
                    onChange={(e) => setPlanTypeFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                  <input
                    type="text"
                    value={planTypeFormData.label}
                    onChange={(e) => setPlanTypeFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={planTypeFormData.icon}
                    onChange={(e) => setPlanTypeFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  >
                    <option value="calendar">Calendar</option>
                    <option value="clock">Clock</option>
                    <option value="credit-card">Credit Card</option>
                    <option value="dollar">Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select
                    value={planTypeFormData.color}
                    onChange={(e) => setPlanTypeFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setShowEditPlanTypeModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePlanType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Plan Type Confirmation Modal */}
        {showDeletePlanTypeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeletePlanTypeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete plan type <strong>"{selectedPlanType?.label}"</strong>?
                </p>
                <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeletePlanTypeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePlanType}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Plan Type
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Subscription