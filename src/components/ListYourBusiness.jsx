import React,{useState, useRef} from 'react'
import emailjs from '@emailjs/browser';
const ListYourBusiness = () => {
  const form = useRef();
   const [submitted , setSubmitted] = useState(false)
   const [businessdata , setBusinessData] = useState({
     user_business:"",
     user_venueType:"",
     user_contactName: "",
     user_city: "",
     user_email: "",
     user_mobile: "",
     message:""
   })
  

   const changeDropdown=(e)=>{
    const { name, value } = e.target
    setBusinessData((prev) => ({ ...prev, [name]: value }))
   }

   const handleSubmit =(e)=>{
    e.preventDefault()
    setSubmitted(true)
    ///  other login email notification goes here
    
    emailjs
      .sendForm(import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID1, form.current, {
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      })
      .then(
        () => {
          
        },
        (error) => {
          
        },
      );


    ////
    setBusinessData({ user_business:"",
     user_venueType:"",
     user_contactName: "",
     user_city: "",
     user_email: "",
     user_mobile: "",
     message:""})
   }
  return (
    <div className='bg-white'>
      <div className='px-20 py-15'>
        
      <form ref={form} onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
    {/* Left Side */}
    <div>
      <h3 className="text-black text-2xl font-semibold">
        List Your Business With Us
      </h3>
      <div className="mt-6 space-y-4">
        <label htmlFor="user_venueType" className="block mb-2 text-sm font-medium text-gray-700">
          Service Type
        </label>
        <div className="relative">
          <select
            id="user_venueType"
            name="user_venueType"
            value={businessdata.user_venueType}
            onChange={changeDropdown}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right .6rem center',
              backgroundSize: '1.1rem',
              paddingRight: '2.25rem'
            }}
          >
            <option value="Venue Listing">Venue Listing</option>
            <option value="Photography">Photography</option>
            <option value="Caterers">Caterers</option>
            <option value="Decorators">Decorators</option>
            <option value="Bridal Makeup Artist">Bridal Makeup Artist</option>
            <option value="Mehndi Artist">Mehndi Artist</option>
            <option value="List Event">List Event</option>
          </select>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="user_business"
            className="block text-sm font-medium text-gray-700"
          >
            Business Name
          </label>
          <input
            id="user_business"
            name="user_business"
            type="text"
            value={businessdata.user_business}
            onChange={changeDropdown}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="user_contactName"
            className="block text-sm font-medium text-gray-700"
          >
            Contact Name
          </label>
          <input
            id="user_contactName"
            name="user_contactName"
            type="text"
            value={businessdata.user_contactName}
            onChange={changeDropdown}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="user_city"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </label>
          <input
            id="user_city"
            name="user_city"
            type="text"
            value={businessdata.user_city}
            onChange={changeDropdown}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="user_email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="user_email"
            name="user_email"
            type="email"
            value={businessdata.user_email}
            onChange={changeDropdown}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="user_mobile"
            className="block text-sm font-medium text-gray-700"
          >
            Mobile
          </label>
          <input
            value={businessdata.user_mobile}
            onChange={changeDropdown}
            id="user_mobile"
            name="user_mobile"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows='4'
            value={businessdata.message}
            onChange={changeDropdown}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
       <button type="submit" className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
            Send message
       </button>
       {submitted && (
            <p className="mt-3 text-green-600 text-sm">Thanks! We’ll get in touch soon.</p>
          )}
    </div>

    {/* Right Side */}
    <div>
      <h3 className="text-black text-2xl font-semibold">Reach Us</h3>
      <div className="mt-6 space-y-2 text-gray-700">
        <p>📍 Address Line</p>
        <p>📞 +91-XXXXXXXXXX</p>
        <p>✉️ contact@example.com</p>
      </div>
    </div>
  </div>
</form>

      </div>
    </div>
  )
}

export default ListYourBusiness