import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AddToCart = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '', // Flat / House / Building / Company
      line2: '', // Area / Street / Sector
      landmark: '',
      pincode: '',
      city: '',
      state: ''
    }
  })
  const [deliveryOption, setDeliveryOption] = useState('standard')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart')
      const parsed = raw ? JSON.parse(raw) : []
      setItems(Array.isArray(parsed) ? parsed : [])
    } catch (e) {
      setItems([])
    }
  }, [])

  const save = (next) => {
    setItems(next)
    localStorage.setItem('cart', JSON.stringify(next))
  }

  const incrementQty = (idx) => {
    const next = items.map((it, i) => i === idx ? { ...it, quantity: Math.min(99, (it.quantity || 1) + 1) } : it)
    save(next)
  }

  const decrementQty = (idx) => {
    const next = items.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, (it.quantity || 1) - 1) } : it)
    save(next)
  }

  const removeItem = (idx) => {
    const next = items.filter((_, i) => i !== idx)
    save(next)
  }

  const totalItems = useMemo(() => items.reduce((acc, it) => acc + (it.quantity || 1), 0), [items])
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0
    const m = String(priceStr).match(/\d[\d,]*/)
    if (!m) return 0
    return parseInt(m[0].replace(/,/g, ''), 10) || 0
  }
  const subtotal = useMemo(() => items.reduce((acc, it) => acc + parsePrice(it.price) * (it.quantity || 1), 0), [items])
  const deliveryFee = useMemo(() => ({ pickup: 0, standard: 0, express: 199 }[deliveryOption] || 0), [deliveryOption])
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-1">Items selected to buy</p>
        </div>

        

        {items.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-700">Your cart is empty.</p>
            <button onClick={() => navigate('/resources')} className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700">Browse Resources</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact & Delivery Details</h2>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" value={customer.name} onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))} placeholder="Your full name" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={customer.email} onChange={(e) => setCustomer((prev) => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={customer.phone} onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))} placeholder="10-digit mobile number" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flat / House / Building / Company</label>
                        <input type="text" value={customer.address.line1} onChange={(e) => setCustomer((prev) => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} placeholder="e.g., Flat 203, ABC Apartments" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area / Street / Sector</label>
                        <input type="text" value={customer.address.line2} onChange={(e) => setCustomer((prev) => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} placeholder="e.g., Sector 21, MG Road" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                        <input type="text" value={customer.address.landmark} onChange={(e) => setCustomer((prev) => ({ ...prev, address: { ...prev.address, landmark: e.target.value } }))} placeholder="Nearby landmark (optional)" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input type="text" value={customer.address.pincode} onChange={(e) => setCustomer((prev) => ({ ...prev, address: { ...prev.address, pincode: e.target.value } }))} placeholder="e.g., 560001" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Town / City</label>
                        <input type="text" value={customer.address.city} onChange={(e) => setCustomer((prev) => ({ ...prev, address: { ...prev.address, city: e.target.value } }))} placeholder="City" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input type="text" value={customer.address.state} onChange={(e) => setCustomer((prev) => ({ ...prev, address: { ...prev.address, state: e.target.value } }))} placeholder="State" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => { localStorage.setItem('customer_details', JSON.stringify(customer)) }} className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">Save details</button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery & Payment</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" className="accent-emerald-600" name="delivery" checked={deliveryOption==='pickup'} onChange={() => setDeliveryOption('pickup')} />
                      <span className="text-gray-800">Self Pickup</span>
                      <span className="text-gray-500">(Free)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" className="accent-emerald-600" name="delivery" checked={deliveryOption==='standard'} onChange={() => setDeliveryOption('standard')} />
                      <span className="text-gray-800">Standard Delivery</span>
                      <span className="text-gray-500">(Free)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" className="accent-emerald-600" name="delivery" checked={deliveryOption==='express'} onChange={() => setDeliveryOption('express')} />
                      <span className="text-gray-800">Express Delivery</span>
                      <span className="text-gray-500">(₹199)</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-gray-700"><span>Items ({totalItems})</span><span className="font-medium">₹{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-700"><span>{deliveryOption==='pickup' ? 'Pickup' : 'Delivery'}</span><span className="font-medium">{deliveryFee ? `₹${deliveryFee.toLocaleString()}` : 'Free'}</span></div>
                  <div className="flex justify-between text-gray-900 text-lg font-bold border-t pt-2"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => navigate('/resources?mode=sell')} className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-all">Add more items</button>
                  <button onClick={() => navigate('/pay')} disabled={items.length===0} className={(items.length===0 ? 'opacity-60 cursor-not-allowed ' : '') + 'flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 transition-all'}>Proceed to Payment</button>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Items</h3>
                <div className="space-y-4 max-h-[560px] overflow-auto pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="ring-1 ring-gray-200 rounded-lg p-3 flex gap-3">
                      <div className="h-16 w-16 rounded-md overflow-hidden shrink-0">
                        <img src={it.photo} alt={it.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{it.name}</div>
                            {it.options?.sizeInches && (<div className="text-xs text-gray-600">Size: <span className="font-medium text-gray-800">{it.options.sizeInches}"</span></div>)}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Price</div>
                            <div className="text-sm font-bold text-gray-900">{it.price}</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-gray-300 overflow-hidden">
                            <button onClick={() => decrementQty(idx)} className="px-2 py-1.5 text-gray-700 hover:bg-gray-50">-</button>
                            <span className="px-3 py-1.5 min-w-[2.25rem] text-center text-gray-900 text-sm">{it.quantity || 1}</span>
                            <button onClick={() => incrementQty(idx)} className="px-2 py-1.5 text-gray-700 hover:bg-gray-50">+</button>
                          </div>
                          <button onClick={() => removeItem(idx)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddToCart


