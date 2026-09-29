import React from 'react'
import { Link } from 'react-router-dom'
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { FaFacebook, FaInstagram, FaPinterestSquare, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-white tracking-wide">Mysore</h3>
            <ul className="mt-3 space-y-2 text-sm md:text-[15px] leading-6">
              <li><a href="#" className="hover:text-white">Banquet Halls in Mysore</a></li>
              <li><a href="#" className="hover:text-white">Party Halls in Mysore</a></li>
              <li><a href="#" className="hover:text-white">Birthday Party Halls in Mysore</a></li>
              <li><a href="#" className="hover:text-white">Wedding Halls in Mysore</a></li>
              <li><a href="#" className="hover:text-white">Wedding Venues in Mysore</a></li>
              <li><a href="#" className="hover:text-white">Wedding Resorts in Mysore</a></li>
              <li><a href="#" className="hover:text-white">Corporate Party Venues in Mysore</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-white tracking-wide">Bangalore</h3>
            <ul className="mt-3 space-y-2 text-sm md:text-[15px] leading-6">
              <li><a href="#" className="hover:text-white">Banquet Halls in Bangalore</a></li>
              <li><a href="#" className="hover:text-white">Party Halls in Bangalore</a></li>
              <li><a href="#" className="hover:text-white">Birthday Party Halls in Bangalore</a></li>
              <li><a href="#" className="hover:text-white">Wedding Halls in Bangalore</a></li>
              <li><a href="#" className="hover:text-white">Wedding Venues in Bangalore</a></li>
              <li><a href="#" className="hover:text-white">Wedding Resorts in Bangalore</a></li>
              <li><a href="#" className="hover:text-white">Corporate Party Venues in Bangalore</a></li>
            </ul>
          </div>

           <div>
            <h3 className="text-base md:text-lg font-semibold text-white tracking-wide">Mumbai</h3>
            <ul className="mt-3 space-y-2 text-sm md:text-[15px] leading-6">
              <li><a href="#" className="hover:text-white">Banquet Halls in Mumbai</a></li>
              <li><a href="#" className="hover:text-white">Party Halls in Mumbai</a></li>
              <li><a href="#" className="hover:text-white">Birthday Party Halls in Mumbai</a></li>
              <li><a href="#" className="hover:text-white">Wedding Halls in Mumbai</a></li>
              <li><a href="#" className="hover:text-white">Wedding Venues in Mumbai</a></li>
              <li><a href="#" className="hover:text-white">Wedding Resorts in Mumbai</a></li>
              <li><a href="#" className="hover:text-white">Corporate Party Venues in Mumbai</a></li>
            </ul>
          </div>

           <div>
            <h3 className="text-base md:text-lg font-semibold text-white tracking-wide">Delhi</h3>
            <ul className="mt-3 space-y-2 text-sm md:text-[15px] leading-6">
              <li><a href="#" className="hover:text-white">Banquet Halls in Delhi</a></li>
              <li><a href="#" className="hover:text-white">Party Halls in Delhi</a></li>
              <li><a href="#" className="hover:text-white">Birthday Party Halls in Delhi</a></li>
              <li><a href="#" className="hover:text-white">Wedding Halls in Delhi</a></li>
              <li><a href="#" className="hover:text-white">Wedding Venues in Delhi</a></li>
              <li><a href="#" className="hover:text-white">Wedding Resorts in Delhi</a></li>
              <li><a href="#" className="hover:text-white">Corporate Party Venues in Delhi</a></li>
            </ul>
          </div>
          
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white">Follow us</h4>
            <div className="mt-4 flex items-center gap-5 text-2xl">
              <a href="https://www.facebook.com" className="hover:text-white"><FaFacebook /></a>
              <a href="https://www.pinterest.com" className="hover:text-white"><FaPinterestSquare/></a>
              <a href="https://www.twitter.com" className="hover:text-white"> <FaTwitter/> </a>
              <a href="https://www.youtube.com" className="hover:text-white">< FaYoutube/></a>
              <a href="https://www.instagram.com" className="hover:text-white">< FaInstagram/></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-semibold text-white">Reach Us</h4>
            <div className="mt-4 flex flex-col gap-3 text-gray-300 text-sm md:text-base">
              <a href='tel:9999999999' className="flex items-center gap-3"><PhoneIcon className="w-5 h-5" /> <span className="font-medium">+91 9999999999</span></a>
              <a  href='mailto:test@example.com'className="flex items-center gap-3"><EnvelopeIcon className="w-5 h-5" /> <span className="font-medium">test@example.com</span></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-xs md:text-sm flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/" className="hover:text-white">About us</Link>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <Link to="/blogs" className="hover:text-white">Blog</Link>
            <a href="#" className="hover:text-white">States</a>
            <a href="#" className="hover:text-white">Cities</a>
            <a href="#" className="hover:text-white">Latest Reviews</a>
          </div>
          <p className="text-gray-400">2025 © ValueOccasions®. ALL Rights Reserved.</p>
        </div>

      </div>
    </footer>
  )
}

export default Footer