import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { FaCheckCircle, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';

export default function SubscriptionModule() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [newFeature, setNewFeature] = useState('');

  // Subscription plans - editable
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Basic',
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: '',
      features: ['Up to 5 venue listings', 'Basic booking management', 'Email support'],
      ctaText: 'Current Plan',
      highlighted: false
    },
    {
      id: 2,
      name: 'Premium',
      monthlyPrice: 2999,
      yearlyPrice: 29999,
      badge: 'Most Popular',
      features: ['Unlimited venue listings', 'Advanced booking management', 'Priority support', 'Analytics dashboard', 'Custom branding'],
      ctaText: 'Subscribe',
      highlighted: true
    },
    {
      id: 3,
      name: 'Enterprise',
      monthlyPrice: 9999,
      yearlyPrice: 99999,
      badge: 'Best Value',
      features: ['Everything in Premium', 'Dedicated account manager', 'Custom integrations', 'API access', '24/7 priority support'],
      ctaText: 'Contact Sales',
      highlighted: false
    }
  ]);

  const currencySymbol = '₹';

  // Load current subscription from localStorage
  useEffect(() => {
    const savedSubscription = localStorage.getItem('currentSubscription');
    if (savedSubscription) {
      setCurrentSubscription(JSON.parse(savedSubscription));
    } else {
      // Default to Basic plan
      setCurrentSubscription({
        planId: 1,
        planName: 'Basic',
        startDate: new Date().toISOString(),
        billingCycle: 'monthly',
        status: 'active'
      });
    }
  }, []);

  const addTier = () => {
    const newTier = {
      id: Date.now(),
      name: 'New Tier',
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: '',
      features: ['Add your first feature'],
      ctaText: 'Get Started',
      highlighted: false
    };
    setPlans([...plans, newTier]);
  };

  const deleteTier = (id) => {
    setPlans(plans.filter(tier => tier.id !== id));
  };

  const updateTier = (id, field, value) => {
    setPlans(plans.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const addFeature = (tierId) => {
    if (newFeature.trim()) {
      setPlans(plans.map(tier => 
        tier.id === tierId 
          ? { ...tier, features: [...tier.features, newFeature.trim()] }
          : tier
      ));
      setNewFeature('');
    }
  };

  const removeFeature = (tierId, featureIndex) => {
    setPlans(plans.map(tier => 
      tier.id === tierId 
        ? { ...tier, features: tier.features.filter((_, i) => i !== featureIndex) }
        : tier
    ));
  };

  const handleSubscribe = (plan) => {
    if (plan.id === currentSubscription?.planId) {
      alert('You are already subscribed to this plan.');
      return;
    }

    const confirmMessage = `Are you sure you want to subscribe to ${plan.name} plan for ₹${(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString('en-IN')}/${billingCycle === 'monthly' ? 'month' : 'year'}?`;
    
    if (window.confirm(confirmMessage)) {
      const newSubscription = {
        planId: plan.id,
        planName: plan.name,
        startDate: new Date().toISOString(),
        billingCycle: billingCycle,
        status: 'active',
        price: billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
      };
      
      setCurrentSubscription(newSubscription);
      localStorage.setItem('currentSubscription', JSON.stringify(newSubscription));
      alert(`Successfully subscribed to ${plan.name} plan!`);
    }
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      const cancelledSubscription = {
        ...currentSubscription,
        status: 'cancelled',
        cancellationDate: new Date().toISOString()
      };
      
      setCurrentSubscription(cancelledSubscription);
      localStorage.setItem('currentSubscription', JSON.stringify(cancelledSubscription));
      setShowCancelModal(false);
      alert('Subscription cancelled. You will retain access until the end of your billing period.');
    }
  };

  const getRenewalDate = () => {
    if (!currentSubscription?.startDate) return null;
    const startDate = new Date(currentSubscription.startDate);
    const renewalDate = new Date(startDate);
    
    if (currentSubscription.billingCycle === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }
    
    return renewalDate;
  };

  const isCurrentPlan = (planId) => {
    return currentSubscription?.planId === planId && currentSubscription?.status === 'active';
  };

  const getCurrentPlan = () => {
    return plans.find(p => p.id === currentSubscription?.planId);
  };

  const currentPlan = getCurrentPlan();
  const renewalDate = getRenewalDate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
          <p className="text-gray-600">Create and customize your venue booking pricing tiers</p>
        </div>

        {/* Editor Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Editor</h2>
            <button
              onClick={addTier}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaPlus size={20} />
              Add Tier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plans.map((tier) => (
              <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                    className="text-xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                  />
                  <button
                    onClick={() => deleteTier(tier.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrashAlt size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Price ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={tier.monthlyPrice}
                      onChange={(e) => updateTier(tier.id, 'monthlyPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yearly Price ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={tier.yearlyPrice}
                      onChange={(e) => updateTier(tier.id, 'yearlyPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge (optional)
                  </label>
                  <input
                    type="text"
                    value={tier.badge}
                    onChange={(e) => updateTier(tier.id, 'badge', e.target.value)}
                    placeholder="e.g., Most Popular"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={tier.ctaText}
                    onChange={(e) => updateTier(tier.id, 'ctaText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tier.highlighted}
                      onChange={(e) => updateTier(tier.id, 'highlighted', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Highlight this tier</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <div className="space-y-2 mb-2">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 text-sm text-gray-600">{feature}</span>
                        <button
                          onClick={() => removeFeature(tier.id, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <GiCancel size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingTier === tier.id ? newFeature : ''}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onFocus={() => setEditingTier(tier.id)}
                      placeholder="Add feature..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    />
                    <button
                      onClick={() => addFeature(tier.id)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Preview</h2>
          
          {/* Current Subscription Status */}
          {currentSubscription && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Current Subscription</h3>
                    {currentSubscription.status === 'active' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1">
                        <FiX className="w-3 h-3" />
                        Cancelled
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Plan</p>
                      <p className="font-semibold text-gray-900">{currentSubscription.planName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Billing</p>
                      <p className="font-semibold text-gray-900 capitalize">{currentSubscription.billingCycle}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-semibold text-gray-900">
                        {currencySymbol}{currentSubscription.price?.toLocaleString('en-IN')}/{currentSubscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </p>
                    </div>
                  </div>
                </div>
                {currentSubscription.status === 'active' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Pricing Cards Preview */}
          <div className="flex flex-col gap-3">
            {plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const savings = plan.monthlyPrice > 0 
                ? Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100)
                : 0;
              const isCurrent = isCurrentPlan(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`relative border-2 rounded-xl p-6 transition flex flex-row items-center gap-6 ${
                    isCurrent
                      ? 'border-green-500 shadow-lg bg-green-50'
                      : plan.highlighted
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {plan.badge && !isCurrent && (
                    <div className="absolute -top-2 left-4">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-2 left-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3" />
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {currencySymbol}{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-gray-600">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && savings > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Save {savings}% with yearly billing
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FiCheck className="flex-shrink-0 mt-0.5 text-green-500" size={16} />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={isCurrent || plan.name === 'Enterprise'}
                      className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                        isCurrent
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : plan.name === 'Enterprise'
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : plan.highlighted
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : plan.ctaText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <FiAlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Cancel Subscription</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel your subscription? You will retain access to premium features until {renewalDate?.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
