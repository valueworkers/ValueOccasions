import React, { useState, useRef, useEffect } from 'react'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your venue booking assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const predefinedResponses = {
    greeting: [
      "Hello! I'm here to help you find the perfect venue for your event.",
      "Hi there! Looking for a venue? I can help you with that!",
      "Welcome! I'm your venue booking assistant. What kind of event are you planning?"
    ],
    pricing: [
      "Our venue prices start from ₹400 per person and can go up to ₹450 per person depending on guest count and services. Would you like to see specific pricing for your event?",
      "Pricing varies based on guest count: 150 guests (₹450/pax), 200 guests (₹440/pax), 250 guests (₹430/pax), 300+ guests (₹410/pax). What's your expected guest count?"
    ],
    capacity: [
      "Our venues can accommodate anywhere from 50 to 500+ guests. What's your expected guest count?",
      "We have venues for both intimate gatherings (50-100 guests) and large celebrations (300+ guests). What size event are you planning?"
    ],
    amenities: [
      "Our venues come with amenities like AC, WiFi, sound systems, parking, catering services, and more. Are you looking for any specific amenities?",
      "All our venues include basic amenities like parking, AC, and sound systems. Premium venues also offer dance floors, stages, and professional lighting."
    ],
    booking: [
      "To book a venue, simply browse our listings, select your preferred venue, and fill out the availability form. Our team will get back to you within 24 hours!",
      "You can check availability by selecting a venue and filling out the booking form with your event details. Would you like me to guide you through the process?"
    ],
    location: [
      "We have venues across multiple locations. Which city or area are you looking for?",
      "Our venues are available in various prime locations. You can filter by locality to find venues near you."
    ],
    default: [
      "I'd be happy to help you with that! Can you tell me more about what you're looking for?",
      "That's a great question! Let me help you find the right information.",
      "I'm here to assist you with venue bookings. What specific information do you need?"
    ]
  }

  const getResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return predefinedResponses.greeting[Math.floor(Math.random() * predefinedResponses.greeting.length)]
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate')) {
      return predefinedResponses.pricing[Math.floor(Math.random() * predefinedResponses.pricing.length)]
    }
    if (lowerMessage.includes('capacity') || lowerMessage.includes('guest') || lowerMessage.includes('people')) {
      return predefinedResponses.capacity[Math.floor(Math.random() * predefinedResponses.capacity.length)]
    }
    if (lowerMessage.includes('amenity') || lowerMessage.includes('facility') || lowerMessage.includes('feature')) {
      return predefinedResponses.amenities[Math.floor(Math.random() * predefinedResponses.amenities.length)]
    }
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('availability')) {
      return predefinedResponses.booking[Math.floor(Math.random() * predefinedResponses.booking.length)]
    }
    if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('city')) {
      return predefinedResponses.location[Math.floor(Math.random() * predefinedResponses.location.length)]
    }
    
    return predefinedResponses.default[Math.floor(Math.random() * predefinedResponses.default.length)]
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
  }

  const quickActions = [
    "Show me pricing",
    "Venue capacity",
    "Available amenities",
    "How to book?",
    "Locations available"
  ]

  const handleQuickAction = (action) => {
    const userMessage = {
      id: Date.now(),
      text: action,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getResponse(action),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405L3 21l2.595-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">Venue Assistant</h3>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg rounded-bl-none text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="text-xs text-gray-500 mb-2">Quick questions:</div>
              <div className="flex flex-wrap gap-1">
                {quickActions.slice(0, 3).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatBot
