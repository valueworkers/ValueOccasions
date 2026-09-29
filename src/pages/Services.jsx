import React, { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCamera, FiCoffee, FiMusic, FiUsers, FiStar, FiVideo, FiScissors, FiMic, FiSmile } from 'react-icons/fi'
import {GiPalette} from "react-icons/gi"
import {FaArrowRight } from "react-icons/fa"
import { BsFillAwardFill } from "react-icons/bs";
import CarouselShowcase from './CarouselShowcase'

const Services = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const onSearchSubmit = (e) => {
    e.preventDefault()
    const term = searchTerm.trim()
    if (!term) return
    navigate(`/services?search=${encodeURIComponent(term)}`)
  }

  const ServiceCarousel = ({ title, images }) => {
    const containerRef = useRef(null)
    const scroll = (direction) => {
      const node = containerRef.current
      if (!node) return
      node.scrollBy({ left: direction * 320, behavior: 'smooth' })
    }
    return (
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-pink-400/40 via-fuchsia-400/40 to-purple-400/40">
        <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{title}</h3>
            <div className="inline-flex gap-2">
              <button type="button" onClick={() => scroll(-1)} className="h-8 w-8 rounded-lg bg-black ring-1 ring-gray-300 grid place-items-center hover:bg-gray-350">‹</button>
              <button type="button" onClick={() => scroll(1)} className="h-8 w-8 rounded-lg bg-black ring-1 ring-gray-300 grid place-items-center hover:bg-gray-350">›</button>
            </div>
          </div>
          <div ref={containerRef} className="px-4 pb-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]">
            <div className="flex gap-4 snap-x snap-mandatory">
              {images.map((src, idx) => (
                <div key={idx} className="min-w-[80px] snap-start rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white shadow-sm">
                  <div className="h-40 w-20 bg-gray-100">
                    <img src={src} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const cities = useMemo(
    () => [
      'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune'
    ],
    []
  )
  const serviceTypes = useMemo(
    () => [
      'Photography & Video', 'Decoration & Design', 'Catering Services', 'Music & Entertainment'
    ],
    []
  )
  const occasionTypes = useMemo(
    () => [
       'Corporate Events', 'Social Events', 'Religious Events', 'Politcal Events', 'Business Events'
    ],
    []
  )
  const paxRanges = useMemo(
    () => [
      'Up to 100', '100 - 200', '200 - 300', '300 - 500', '500+'
    ],
    []
  )

  const handleServiceExplore =()=>{
   navigate('/services/:city')
  }

 
  return (
    <div className="min-h-screen bg-gray-300">

      <section className="w-full py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">Discover Services</h2>
          <form onSubmit={onSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services (e.g., photography, catering)"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 text-white px-4 py-2 font-semibold hover:bg-purple-700"
            >
              Search
            </button>
          </form>
          <CarouselShowcase />
        </div>
      </section>

      {/* Category Cards */}
      <section className="w-full pb-14">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/*Senior Care Servives */}

          {/* <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 bg-gradient-to-br from-sky-50 to-white">
              <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-600 grid place-items-center">
                <FiCamera className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Health Care Servives</h3>
              <p className="mt-2 text-sm text-gray-600">
                Senior care services to help seniors live independently and maintain their quality of life.
              </p>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2"><FiUsers /> 10 providers</span>
                <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.7+ rating</span>
              </div>
            </div>
            <div className="p-6 border-t">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Home Care</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Residential Care</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Companion Care</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Live-in Care</li>
              </ul>
              <button onClick={handleServiceExplore} className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 text-white py-2.5 font-semibold hover:bg-sky-700 ring-1 ring-sky-500/20">
                Explore <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div> */}

          

          {/* Photography */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 bg-gradient-to-br from-sky-50 to-white">
              <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-600 grid place-items-center">
                <FiCamera className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Photography</h3>
              <p className="mt-2 text-sm text-gray-600">
                Professional photographers to beautifully capture your special moments.
              </p>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2"><FiUsers /> 40 providers</span>
                <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.8+ rating</span>
              </div>
            </div>
            <div className="p-6 border-t">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Event Photography</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Portraits & Studio</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Photo Booths</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" />Drone Shots</li>
              </ul>
              <button onClick={handleServiceExplore} className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 text-white py-2.5 font-semibold hover:bg-sky-700 ring-1 ring-sky-500/20">
                Explore <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        
          {/* Videography */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-white">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-600 grid place-items-center">
                <FiVideo className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Videography</h3>
              <p className="mt-2 text-sm text-gray-600">
                Professional videographers to create cinematic films and timeless memories of your events.
              </p>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2"><FiUsers /> 32 providers</span>
                <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.9+ rating</span>
              </div>
            </div>
            <div className="p-6 border-t">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500" />Wedding Films</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500" />Cinematic Highlight Reels</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500" />Corporate Videos</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500" />Drone Videography</li>
              </ul>
              <button onClick={handleServiceExplore} className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 text-white py-2.5 font-semibold hover:bg-purple-700 ring-1 ring-purple-500/20">
                Explore <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Decoration & Design */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 bg-gradient-to-br from-fuchsia-50 to-white">
              <div className="h-12 w-12 rounded-2xl bg-fuchsia-100 text-fuchsia-600 grid place-items-center">
                <GiPalette  className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Decoration & Design</h3>
              <p className="mt-2 text-sm text-gray-600">Creative decorators to transform your venue into a magical space.</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2"><FiUsers /> 38 providers</span>
                <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.8+ rating</span>
              </div>
            </div>
            <div className="p-6 border-t">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-fuchsia-500"/>Floral Arrangements</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-fuchsia-500"/>Lighting Design</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-fuchsia-500"/>Theme Decoration</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-fuchsia-500"/>Backdrop Setup</li>
              </ul>
              <button onClick={handleServiceExplore} className="mt-13 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-fuchsia-600 text-white py-2.5 font-semibold hover:bg-fuchsia-700 ring-1 ring-fuchsia-500/20">Explore <FaArrowRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Catering Services */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-white">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 grid place-items-center">
                <FiCoffee className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Catering Services</h3>
              <p className="mt-2 text-sm text-gray-600">Delicious food and beverage services for all types of events.</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2"><FiUsers /> 52 providers</span>
                <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.8+ rating</span>
              </div>
            </div>
            <div className="p-6 border-t">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Multi-Cuisine</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Live Counters</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Custom Menus</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Dessert Stations</li>
              </ul>
              <button onClick={handleServiceExplore} className="mt-13 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white py-2.5 font-semibold hover:bg-emerald-700 ring-1 ring-emerald-500/20">Explore <FaArrowRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Music & Entertainment */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="p-6 bg-gradient-to-br from-orange-50 to-white">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 grid place-items-center">
                <FiMusic className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Music & Entertainment</h3>
              <p className="mt-2 text-sm text-gray-600">DJs, live bands, and entertainers to keep your guests engaged.</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2"><FiUsers /> 29 providers</span>
                <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.8+ rating</span>
              </div>
            </div>
            <div className="p-6 border-t">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500"/>DJ Services</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500"/>Live Bands</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500"/>Sound Systems</li>
                <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500"/>Entertainment Shows</li>
              </ul>
              <button onClick={handleServiceExplore} className="mt-13 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 text-white py-2.5 font-semibold hover:bg-orange-700 ring-1 ring-orange-500/20">Explore <FaArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
          
          {/* MakeUp */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
  <div className="p-6 bg-gradient-to-br from-pink-50 to-white">
    <div className="h-12 w-12 rounded-2xl bg-pink-100 text-pink-600 grid place-items-center">
      <FiScissors className="h-6 w-6" />
    </div>
    <h3 className="mt-4 text-xl font-bold text-gray-900">Makeup & Styling</h3>
    <p className="mt-2 text-sm text-gray-600">
      Professional makeup artists and hairstylists to make your special day even more glamorous.
    </p>
    <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
      <span className="inline-flex items-center gap-2"><FiUsers /> 25 providers</span>
      <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.7+ rating</span>
    </div>
  </div>
  <div className="p-6 border-t">
    <ul className="space-y-2 text-gray-700 text-sm">
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-pink-500"/>Bridal Makeup</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-pink-500"/>Hairstyling</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-pink-500"/>Party Makeup</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-pink-500"/>Traditional Saree Draping</li>
    </ul>
    <button onClick={handleServiceExplore} className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 text-white py-2.5 font-semibold hover:bg-pink-700 ring-1 ring-pink-500/20">
      Explore <FaArrowRight className="w-4 h-4" />
    </button>
  </div>
</div>
    

    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
  <div className="p-6 bg-gradient-to-br from-indigo-50 to-white">
    <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 grid place-items-center">
      <FiMic className="h-6 w-6" />
    </div>
    <h3 className="mt-4 text-xl font-bold text-gray-900">Anchors & Hosts</h3>
    <p className="mt-2 text-sm text-gray-600">
      Experienced anchors and MCs to keep your guests entertained and events lively.
    </p>
    <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
      <span className="inline-flex items-center gap-2"><FiUsers /> 18 providers</span>
      <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.6+ rating</span>
    </div>
  </div>
  <div className="p-6 border-t">
    <ul className="space-y-2 text-gray-700 text-sm">
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500"/>Wedding Anchors</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500"/>Corporate Event MCs</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500"/>Birthday Party Hosts</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500"/>Cultural Function Anchors</li>
    </ul>
    <button onClick={handleServiceExplore} className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white py-2.5 font-semibold hover:bg-indigo-700 ring-1 ring-indigo-500/20">
      Explore <FaArrowRight className="w-4 h-4" />
    </button>
  </div>
</div>


<div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
  <div className="p-6 bg-gradient-to-br from-yellow-50 to-white">
    <div className="h-12 w-12 rounded-2xl bg-yellow-100 text-yellow-600 grid place-items-center">
      <FiSmile className="h-6 w-6" />
    </div>
    <h3 className="mt-4 text-xl font-bold text-gray-900">Magic & Puppet Shows</h3>
    <p className="mt-2 text-sm text-gray-600">
      Fun-filled entertainment with magicians and puppeteers for kids and family events.
    </p>
    <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
      <span className="inline-flex items-center gap-2"><FiUsers /> 12 providers</span>
      <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500" /> 4.5+ rating</span>
    </div>
  </div>
  <div className="p-6 border-t">
    <ul className="space-y-2 text-gray-700 text-sm">
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"/>Magic Shows</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"/>Puppet Shows</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"/>Balloon Tricks</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"/>Kids Party Fun</li>
    </ul>
    <button onClick={handleServiceExplore} className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-600 text-white py-2.5 font-semibold hover:bg-yellow-700 ring-1 ring-yellow-500/20">
      Explore <FaArrowRight className="w-4 h-4" />
    </button>
  </div>
</div>

        </div>
      </section>

      {/* Recommended service - carousels */}
      <section className="w-full pb-14">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Recommended service</h2>
          <ServiceCarousel
            title="Photography"
            images={[
              'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1520975922284-5f1b0873edc4?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1520975922284-5f1b0873edc4?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1520975922284-5f1b0873edc4?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511795409834-https://images.unsplash.com/photo-1462926795244-b273f8a5454f?q=80&w=1006&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1520975922284-5f1b0873edc4?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511795409834-https://images.unsplash.com/photo-1462926795244-b273f8a5454f?q=80&w=1006&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1520975922284-5f1b0873edc4?q=80&w=1600&auto=format&fit=crop'
            ]}
          />
          <ServiceCarousel
            title="Caterers"
            images={[
              'https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop'
            ]}
          />
          <ServiceCarousel
            title="Decoration"
            images={[
              'https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1600&auto=format&fit=crop'
            ]}
          />
          <ServiceCarousel
            title="Music"
            images={[
              'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=1600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1521334726092-b509a19597c6?q=80&w=1600&auto=format&fit=crop'
            ]}
          />
        </div>
      </section>

      <div>
        
      </div>
       <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <BsFillAwardFill className="w-4 h-4" />
            <span className="text-sm font-medium">Join Our Network</span>
          </div>
          
          <h3 className="text-3xl md:text-4xl font-bold">Are You a Service Provider?</h3>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join our platform and connect with thousands of customers looking for your services. 
            Grow your business and showcase your expertise.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold"></div>
              <div className="text-white/80"></div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">4.9★</div>
              <div className="text-white/80">Average Rating</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold"></div>
              <div className="text-white/80"></div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a  href='/business' className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-gray-800 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-sm ring-1 ring-white/40">
              Register Your Services
              <FaArrowRight  className="w-5 h-5" />
            </a>
            <button className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white text-white hover:bg-white hover:text-gray-800 px-8 py-3 text-lg font-semibold">
              Learn More
            </button>
          </div>
        </div>
        </div>
    </div>
  )
}

export default Services
