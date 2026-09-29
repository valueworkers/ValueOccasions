import React from 'react'

const testimonials = [
  {
    name: 'Aarav Mehta',
    location: 'Mumbai',
    quote:
      'Seamless experience! We booked our engagement venue in minutes and it was exactly as listed. Highly recommended.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=256&auto=format&fit=crop',
    rating: 5,
  },
  {
    name: 'Ishita Rao',
    location: 'Bengaluru',
    quote:
      'The filters and photos made shortlisting easy. Support team was super helpful with last-minute changes.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
    rating: 5,
  },
  {
    name: 'Rohit Sharma',
    location: 'Delhi',
    quote:
      'Great collection of venues and transparent pricing. Our corporate event went flawlessly.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop',
    rating: 4,
  },
]

const Star = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill={filled ? 'currentColor' : 'none'}
    className={`h-5 w-5 ${filled ? 'text-yellow-400' : 'text-gray-300'} stroke-current`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"
    />
  </svg>
)

const Blogs = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What our customers say</h2>
        <p className="mt-2 text-gray-600">Real experiences from events booked through our platform.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-4">
              <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.location}</p>
              </div>
            </div>

            <div className="mt-4 flex">{[1,2,3,4,5].map((n) => <Star key={n} filled={n <= t.rating} />)}</div>
            <p className="mt-3 text-gray-700 leading-relaxed">“{t.quote}”</p>

            <div className="mt-4 flex gap-3">
              <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">View Venue</button>
              <button className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200">Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Blogs