import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-checkout-js')) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'razorpay-checkout-js'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const PaymentGateway = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  useEffect(() => {
    const openCheckout = async () => {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        alert('Payment SDK failed to load. Please check your network.')
        return
      }

      const amountInPaise = Math.max(1, Math.floor((state.amount || 499) * 100))

      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag',
        amount: amountInPaise,
        currency: 'INR',
        name: state.merchantName || 'Booking Website',
        description: state.description || 'Service booking payment',
        image: state.logo || undefined,
        handler: function () {
          alert('Payment popup demonstrated successfully')
          navigate(-1)
        },
        prefill: {
          name: state.customerName || 'John Doe',
          email: state.customerEmail || 'john.doe@example.com',
          contact: state.customerPhone || '9999999999'
        },
        theme: {
          color: '#1995AD'
        }
      }

      // eslint-disable-next-line no-undef
      const rzp = new window.Razorpay(options)
      rzp.open()
    }

    openCheckout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Opening Payment...</h1>
        <p className="text-gray-600 mt-2">If the popup didn’t appear, click the button below.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-white text-sm font-semibold hover:bg-gray-800"
        >
          Retry
        </button>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default PaymentGateway


