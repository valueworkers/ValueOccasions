import React, { useState, useRef } from 'react'
import emailjs from '@emailjs/browser';

const Contact = () => {
  const form = useRef();
  const [form1, setForm] = useState({ user_name: '', user_email: '', user_mobile: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    emailjs
      .sendForm(import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID, form.current, {
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      })
      .then(
        () => {
        },
        (error) => {
         
        },
      );
    setForm({ user_name: '', user_email: '', user_mobile: '', message: '' })
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">We'd love to hear from you</h1>
          <p className="mt-3 text-gray-600">Have a question about venues, services, or bookings? Send us a message and our team will respond within 24 hours.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <form ref={form} onSubmit={handleSubmit} className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl ring-1 ring-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white grid place-items-center">✉️</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contact us</h2>
                <p className="text-gray-600 text-sm">We’ll get back within 24 hours</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="user_name"
                  name="user_name"
                  type="text"
                  value={form1.user_name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    name="user_email"
                    type="email"
                    value={form1.user_email}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile number</label>
                  <input
                    id="mobile"
                    name="user_mobile"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    value={form1.user_mobile}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={form1.message}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:opacity-95">
                Send message
              </button>
              {submitted && (
                <span className="text-green-600 text-sm">Thanks! We’ll get in touch soon.</span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200 items-center justify-center">📞</span>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p>+91 9999999999</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 rounded-lg bg-purple-50 text-purple-700 ring-1 ring-purple-200 items-center justify-center">✉️</span>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p>support@example.com</p>
                </div>
              </div>
            </div>
          </form>

          <div className="relative h-80 md:h-full rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop"
              alt="Event celebration"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6">
              <div className="rounded-xl bg-white/85 backdrop-blur px-4 py-3 ring-1 ring-white/50 shadow">
                <p className="text-sm text-gray-700">Looking for bulk bookings or corporate events?</p>
                <p className="text-sm font-semibold text-gray-900">Talk to our concierge team for tailored solutions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact