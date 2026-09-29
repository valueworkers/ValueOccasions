import React, { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight, FiPlus, FiMinus, FiShoppingCart, FiX, FiCheck, FiEye, FiStar, FiClock, FiUsers, FiHeart, FiSearch, FiFilter, FiUser, FiSettings, FiShare2, FiBookmark, FiTrendingUp, FiAward, FiShield, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
const Menu = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [modalPackageType, setModalPackageType] = useState(null)
  const [cartPackages, setCartPackages] = useState([])
  
  // New interactive states
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState([])
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    spicy: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    avatar: '👤',
    loyaltyPoints: 1250,
    memberSince: '2023',
    favoriteCuisine: 'Indian'
  })
  const [recentOrders, setRecentOrders] = useState([
    { id: 1, items: ['Paneer Butter Masala', 'Naan'], date: '2024-01-15', rating: 5 },
    { id: 2, items: ['Dal Makhani', 'Roti'], date: '2024-01-10', rating: 4 }
  ])

  const categories = [
    'Welcome Drinks',
    'Salad',
    'Payasam',
    'Starters',
    'Curry/Gravy',
    'Flavoured Rice',
    'Breads/Roti',
    'Sambar',
    'Rasam',
    'Desserts',
    'Beverages',

  ]

  const packageData = {
    classic: {
      name: 'Classic Package',
      price: 450,
      items: [
        { id: 1, name: 'Watermelon Juice', price: 20, description: 'Fresh watermelon juice with mint' },
        { id: 5, name: 'Green Salad', price: 30, description: 'Mixed greens with dressing' },
        { id: 10, name: 'Sabakki', price: 30, description: 'Sabakki Kheer' },
        { id: 14, name: 'Paneer Kebab', price: 30, description: 'Mixed greens with dressing' },
        { id: 19, name: 'Veg Kholapuri', price: 90, description: '' }
      ],
      additionalItems: [
        { id: 2, name: 'Jaljeera', price: 20, description: 'Spiced cumin water with lemon' },
        { id: 3, name: 'Mango Lassi', price: 30, description: 'Sweet yogurt drink with mango' },
        { id: 6, name: 'Caesar Salad', price: 30, description: 'Romaine lettuce with caesar dressing' },
        { id: 7, name: 'Fruit Salad', price: 40, description: 'Seasonal fruits with honey' },
        { id: 11, name: 'Shavige', price: 30, description: 'Shavige Kheer' },
        { id: 12, name: 'Gasagase', price: 40, description: 'Gasagase Kheer' },
        { id: 15, name: 'Gobi Manchurian', price: 30, description: 'Romaine lettuce with caesar dressing' },
        { id: 16, name: 'Babycorn Manchurian', price: 40, description: 'Seasonal fruits with honey' },
        { id: 20, name: 'Paneer Butter Masala', price: 100, description: 'Cottage cheese in rich tomato gravy' },
        { id: 21, name: 'Dal Makhani', price: 100, description: 'Creamy black lentils' }
      ]
    },
    gold: {
      name: 'Gold Package',
      price: 500,
      items: [
        { id: 3, name: 'Mango Lassi', price: 30, description: 'Sweet yogurt drink with mango' },
        { id: 6, name: 'Caesar Salad', price: 30, description: 'Romaine lettuce with caesar dressing' },
        { id: 11, name: 'Shavige', price: 30, description: 'Shavige Kheer' },
        { id: 15, name: 'Gobi Manchurian', price: 30, description: 'Romaine lettuce with caesar dressing' },
        { id: 20, name: 'Paneer Butter Masala', price: 100, description: 'Cottage cheese in rich tomato gravy' }
      ],
      additionalItems: [
        { id: 1, name: 'Watermelon Juice', price: 20, description: 'Fresh watermelon juice with mint' },
        { id: 2, name: 'Jaljeera', price: 20, description: 'Spiced cumin water with lemon' },
        { id: 4, name: 'Fresh Lime Soda', price: 40, description: 'Refreshing lime soda with mint' },
        { id: 5, name: 'Green Salad', price: 30, description: 'Mixed greens with dressing' },
        { id: 7, name: 'Fruit Salad', price: 40, description: 'Seasonal fruits with honey' },
        { id: 8, name: 'Corn Kosambari', price: 30, description: 'Sweet Corn Salad' },
        { id: 10, name: 'Sabakki', price: 30, description: 'Sabakki Kheer' },
        { id: 12, name: 'Gasagase', price: 40, description: 'Gasagase Kheer' },
        { id: 14, name: 'Paneer Kebab', price: 30, description: 'Mixed greens with dressing' },
        { id: 16, name: 'Babycorn Manchurian', price: 40, description: 'Seasonal fruits with honey' },
        { id: 17, name: 'Paneer 65', price: 30, description: 'Sweet Corn Salad' },
        { id: 19, name: 'Veg Kholapuri', price: 90, description: '' },
        { id: 21, name: 'Dal Makhani', price: 100, description: 'Creamy black lentils' },
        { id: 22, name: 'Aalu Channa Masala', price: 100, description: '' }
      ]
    }
  }

  const menuData = {
    'Welcome Drinks': [
      { id: 1, name: 'Watermelon Juice', price: 20, description: 'Fresh watermelon juice with mint', rating: 4.5, reviews: 23, isVegetarian: true, isVegan: true, allergens: [], prepTime: '5 min', calories: 45, trending: true },
      { id: 2, name: 'Jaljeera', price: 20, description: 'Spiced cumin water with lemon', rating: 4.2, reviews: 18, isVegetarian: true, isVegan: true, allergens: [], prepTime: '3 min', calories: 8, trending: false },
      { id: 3, name: 'Mango Lassi', price: 30, description: 'Sweet yogurt drink with mango', rating: 4.8, reviews: 35, isVegetarian: true, isVegan: false, allergens: ['dairy'], prepTime: '7 min', calories: 120, trending: true },
      { id: 4, name: 'Fresh Lime Soda', price: 40, description: 'Refreshing lime soda with mint', rating: 4.3, reviews: 21, isVegetarian: true, isVegan: true, allergens: [], prepTime: '4 min', calories: 25, trending: false },
      { id: 5, name: 'Vanilla Milkshake', price: 50, description: 'Creamy vanilla milkshake', rating: 4.6, reviews: 28, isVegetarian: true, isVegan: false, allergens: ['dairy'], prepTime: '6 min', calories: 180, trending: false }
    ],
    'Salad': [
      { id: 5, name: 'Green Salad', price: 30, description: 'Mixed greens with dressing' },
      { id: 6, name: 'Caesar Salad', price:30, description: 'Romaine lettuce with caesar dressing' },
      { id: 7, name: 'Fruit Salad', price: 40, description: 'Seasonal fruits with honey' },
      { id: 8, name: 'Corn Kosambari', price: 30, description: 'Sweet Corn Salad' },
      { id: 9, name: 'Pomegranate Kosambari', price: 30, description: 'Pomegranate Salad with vegies' }
    ],
    'Payasam': [
      { id: 10, name: 'Sabakki', price: 30, description: 'Sabakki Kheer' },
      { id: 11, name: 'Shavige', price:30, description: 'Shavige Kheer' },
      { id: 12, name: 'Gasagase', price: 40, description: 'Gasagase Kheer' },
      { id: 13, name: 'Akki Kadlebele', price: 30, description: 'Akki Kadlebele Kheer' },
     ],
    'Starters': [
      { id: 14, name: 'Paneer Kebab', price: 30, description: 'Mixed greens with dressing' },
      { id: 15, name: 'Gobi Manchurian', price:30, description: 'Romaine lettuce with caesar dressing' },
      { id: 16, name: 'Babycorn Manchurian', price: 40, description: 'Seasonal fruits with honey' },
      { id: 17, name: 'Paneer 65', price: 30, description: 'Sweet Corn Salad' },
      { id: 18, name: 'Babycorn Pepper Dry', price: 30, description: 'Sweet Corn Salad' },
     ],
    'Curry/Gravy': [
      { id: 19, name: 'Veg Kholapuri', price: 90, description: '' },
      { id: 20, name: 'Paneer Butter Masala', price: 100, description: 'Cottage cheese in rich tomato gravy' },
      { id: 21, name: 'Dal Makhani', price: 100, description: 'Creamy black lentils' },
      { id: 22, name: 'Aalu Channa Masala', price: 100, description: '' }
    ],
    'Flavoured Rice': [
      { id: 23, name: 'Veg Dum Biryani', price: 100, description: 'Aromatic rice with spiced Vegetables' },
      { id: 24, name: 'Ghee Rice', price: 100, description: '' },
      { id: 25, name: 'Vegetable Pulao', price: 100, description: 'Rice cooked with vegetables' },
      { id: 26, name: 'Bisibelebath', price: 100, description: '' }
    ],
    'Breads/Roti': [
      { id: 27, name: 'Naan', price: 60, description: 'Soft leavened bread' },
      { id: 28, name: 'Roti', price: 40, description: 'Whole wheat flatbread' },
      { id: 29, name: 'Poori', price: 20, description: '' },
      { id: 30, name: 'Akki Rotti', price: 20, description: '' },
      { id: 31, name: 'Ragi Rotti', price: 20, description: '' },
    ],
     'Sambar': [
      { id: 32, name: 'Nuggekaiyi Sambar', price: 60, description: '' },
      { id: 33, name: 'Andra Pappu', price: 60, description: '' },
      { id: 34, name: 'Soppina Huli', price: 60, description: '' },
    ],
     'Rasam': [
      { id: 32, name: 'Tomato Rasam', price: 60, description: '' },
      { id: 33, name: 'Mysore Rasam', price: 60, description: '' },
      { id: 34, name: 'Carrot Rasam', price: 60, description: '' },
    ],
    'Desserts': [
      { id: 32, name: 'Gulab Jamun', price: 80, description: 'Milk dumplings in sugar syrup' },
      { id: 33, name: 'Ras Malai', price: 100, description: 'Cottage cheese in sweetened milk' },
      { id: 34, name: 'Ice Cream', price: 60, description: 'Vanilla, chocolate, strawberry' },
    ],
    'Beverages': [
      { id: 36, name: 'Masala Chai', price: 50, description: 'Spiced tea with milk' },
      { id: 37, name: 'Coffee', price: 60, description: 'Freshly brewed coffee' },
      { id: 38, name: 'Cold Coffee', price: 80, description: 'Iced coffee with cream' },
      { id: 39, name: 'Fresh Juice', price: 100, description: 'Seasonal fresh fruit juice' }
    ]
  }

  const addToCart = (item) => {
    const existingItem = selectedItems.find(selectedItem => selectedItem.id === item.id)
    if (existingItem) {
      setSelectedItems(selectedItems.map(selectedItem =>
        selectedItem.id === item.id
          ? { ...selectedItem, quantity: selectedItem.quantity + 1 }
          : selectedItem
      ))
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId) => {
    const existingItem = selectedItems.find(selectedItem => selectedItem.id === itemId)
    if (existingItem && existingItem.quantity > 1) {
      setSelectedItems(selectedItems.map(selectedItem =>
        selectedItem.id === itemId
          ? { ...selectedItem, quantity: selectedItem.quantity - 1 }
          : selectedItem
      ))
    } else {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== itemId))
    }
  }

  const removeItemCompletely = (itemId) => {
    setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== itemId))
  }

  const getTotalPrice = () => {
    const itemsTotal = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    const packagesTotal = cartPackages.reduce((total, pkg) => total + (pkg.price * pkg.quantity), 0)
    return itemsTotal + packagesTotal
  }

  const navigateCategory = (direction) => {
    if (direction === 'left' && selectedCategory > 0) {
      setSelectedCategory(selectedCategory - 1)
    } else if (direction === 'right' && selectedCategory < categories.length - 1) {
      setSelectedCategory(selectedCategory + 1)
    }
  }

  const selectPackage = (packageType) => {
    setSelectedPackage(packageType)
    // Clear individual items when package is selected
    setSelectedItems([])
  }

  const addPackageToCart = (packageType) => {
    const existingPackage = cartPackages.find(pkg => pkg.type === packageType)
    if (existingPackage) {
      setCartPackages(cartPackages.map(pkg =>
        pkg.type === packageType
          ? { ...pkg, quantity: pkg.quantity + 1 }
          : pkg
      ))
    } else {
      setCartPackages([...cartPackages, { 
        type: packageType, 
        name: packageData[packageType].name,
        price: packageData[packageType].price,
        quantity: 1 
      }])
    }
  }

  const removePackageFromCart = (packageType) => {
    const existingPackage = cartPackages.find(pkg => pkg.type === packageType)
    if (existingPackage && existingPackage.quantity > 1) {
      setCartPackages(cartPackages.map(pkg =>
        pkg.type === packageType
          ? { ...pkg, quantity: pkg.quantity - 1 }
          : pkg
      ))
    } else {
      setCartPackages(cartPackages.filter(pkg => pkg.type !== packageType))
    }
  }

  const removePackageCompletely = (packageType) => {
    setCartPackages(cartPackages.filter(pkg => pkg.type !== packageType))
  }

  const openPackageModal = (packageType) => {
    setModalPackageType(packageType)
    setShowPackageModal(true)
  }

  const closePackageModal = () => {
    setShowPackageModal(false)
    setModalPackageType(null)
  }

  const addPackageItemToCart = (item) => {
    const existingItem = selectedItems.find(selectedItem => selectedItem.id === item.id)
    if (existingItem) {
      setSelectedItems(selectedItems.map(selectedItem =>
        selectedItem.id === item.id
          ? { ...selectedItem, quantity: selectedItem.quantity + 1 }
          : selectedItem
      ))
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
    }
  }

  // New interactive functions
  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const toggleDietaryPreference = (preference) => {
    setDietaryPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }))
  }

  const getFilteredMenuItems = () => {
    let items = menuData[categories[selectedCategory]] || []
    
    // Search filter
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Dietary preferences filter
    if (dietaryPreferences.vegetarian) {
      items = items.filter(item => item.isVegetarian)
    }
    if (dietaryPreferences.vegan) {
      items = items.filter(item => item.isVegan)
    }
    if (dietaryPreferences.glutenFree) {
      items = items.filter(item => !item.allergens?.includes('gluten'))
    }
    
    return items
  }

  const getRecommendedItems = () => {
    // Based on user's recent orders and preferences
    const allItems = Object.values(menuData).flat()
    return allItems.filter(item => 
      item.trending || 
      recentOrders.some(order => order.items.includes(item.name)) ||
      favorites.includes(item.id)
    ).slice(0, 3)
  }

  const shareMenu = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this amazing menu!',
        text: 'I found some great dishes at this restaurant',
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Menu link copied to clipboard!')
    }
  }

  const handleBookNow = () => {
    navigate("/pay", {
      state: {
        amount: getTotalPrice(),
        merchantName: "Booking Website",
        description: `Menu booking for ${selectedItems.length + cartPackages.length} items`,
        customerName: userProfile.name,
        customerEmail: "john.doe@example.com",
        customerPhone: "9999999999",
        selectedItems: selectedItems,
        cartPackages: cartPackages,
        totalPrice: getTotalPrice(),
        loyaltyPoints: userProfile.loyaltyPoints
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2">
      <style jsx>{`
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
        .package-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .package-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-4px) scale(1.02);
        }
        .menu-item-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .menu-item-card:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .cart-item {
          transition: all 0.2s ease-in-out;
        }
        .cart-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .floating-animation {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .pulse-animation {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* User Profile Bar */}
        <div className="mb-6">
          <div className="glass-effect rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {userProfile.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Welcome back, {userProfile.name}!</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiAward className="w-4 h-4 text-yellow-500" />
                      <span>{userProfile.loyaltyPoints} points</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiTrendingUp className="w-4 h-4 text-green-500" />
                      <span>Member since {userProfile.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={shareMenu}
                  className="p-3 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Share Menu"
                >
                  <FiShare2 className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-3 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Filter Options"
                >
                  <FiFilter className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  className="p-3 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Settings"
                >
                  <FiSettings className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="glass-effect rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for dishes, ingredients, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
              {showFilters && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleDietaryPreference('vegetarian')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      dietaryPreferences.vegetarian 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-green-50'
                    }`}
                  >
                    <FiShield className="w-4 h-4" />
                    Vegetarian
                  </button>
                  <button
                    onClick={() => toggleDietaryPreference('vegan')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      dietaryPreferences.vegan 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-green-50'
                    }`}
                  >
                    <FiShield className="w-4 h-4" />
                    Vegan
                  </button>
                  <button
                    onClick={() => toggleDietaryPreference('glutenFree')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      dietaryPreferences.glutenFree 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-blue-50'
                    }`}
                  >
                    <FiZap className="w-4 h-4" />
                    Gluten-Free
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {getRecommendedItems().length > 0 && (
          <div className="mb-6">
            <div className="glass-effect rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full shadow-lg"></div>
                <h2 className="text-xl font-bold text-gray-900">🌟 Recommended for You</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-300 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getRecommendedItems().map((item) => (
                  <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                      <div className="flex items-center gap-1">
                        <FiStar className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-600">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="floating-animation">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                🍽️ Our Delicious Menu
              </h1>
            </div>
            <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
              Discover our carefully crafted dishes made with love and premium ingredients. 
              Choose from our curated packages or customize your own culinary journey.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FiStar className="w-4 h-4 text-yellow-500" />
                <span>Premium Quality</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <FiClock className="w-4 h-4 text-blue-500" />
                <span>Fresh Daily</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <FiUsers className="w-4 h-4 text-green-500" />
                <span>Family Friendly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Package Selection - Top Row */}
        <div className="glass-effect rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full shadow-lg"></div>
            <h2 className="text-2xl font-bold text-gray-900">✨ Choose Your Perfect Package</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-300 via-teal-300 to-transparent"></div>
            <div className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
              <span className="text-sm font-medium text-emerald-700">Best Value</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Classic Package */}
            <div className={`package-card border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
              selectedPackage === 'classic' 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl ring-4 ring-blue-200' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
            }`} onClick={() => selectPackage('classic')}>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/40 to-purple-100/40 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-xl">Classic Package</h3>
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Popular
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Perfect for casual dining</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FiUsers className="w-3 h-3" />
                      <span>2-4 people</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-blue-600">₹450</span>
                      <span className="text-sm text-gray-500 line-through">₹550</span>
                    </div>
                    <p className="text-xs text-gray-500">per person</p>
                    <div className="mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Save ₹100
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full pulse-animation"></div>
                    Included Items:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {packageData.classic.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-white/50">
                        <FiCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openPackageModal('classic')
                    }}
                    className="flex-1 bg-white/80 backdrop-blur-sm text-gray-700 py-3 px-4 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-300"
                  >
                    <FiEye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addPackageToCart('classic')
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Add Package
                  </button>
                  {selectedPackage === 'classic' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium px-4 py-3 bg-green-100 rounded-xl shadow-sm">
                      <FiCheck className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gold Package */}
            <div className={`package-card border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
              selectedPackage === 'gold' 
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 shadow-xl ring-4 ring-yellow-200' 
                : 'border-gray-200 hover:border-yellow-300 hover:shadow-lg'
            }`} onClick={() => selectPackage('gold')}>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100/40 to-red-100/40 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-xl">Gold Package</h3>
                      <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Premium
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Premium dining experience</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FiUsers className="w-3 h-3" />
                      <span>4-6 people</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-yellow-600">₹500</span>
                      <span className="text-sm text-gray-500 line-through">₹650</span>
                    </div>
                    <p className="text-xs text-gray-500">per person</p>
                    <div className="mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Save ₹150
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full pulse-animation"></div>
                    Included Items:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {packageData.gold.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-white/50">
                        <FiCheck className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openPackageModal('gold')
                    }}
                    className="flex-1 bg-white/80 backdrop-blur-sm text-gray-700 py-3 px-4 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 hover:border-yellow-300"
                  >
                    <FiEye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addPackageToCart('gold')
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white py-3 px-4 rounded-xl text-sm font-medium hover:from-yellow-700 hover:via-orange-700 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Add Package
                  </button>
                  {selectedPackage === 'gold' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium px-4 py-3 bg-green-100 rounded-xl shadow-sm">
                      <FiCheck className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Menu Items and Cart Side by Side */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-2 h-10 bg-gradient-to-b from-orange-500 via-red-500 to-pink-500 rounded-full shadow-lg"></div>
            <h2 className="text-3xl font-bold text-gray-900">🎨 Customize Your Menu</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-300 via-red-300 to-transparent"></div>
            <div className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
              <span className="text-sm font-medium text-orange-700">Build Your Own</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Selected Items (Cart) */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="glass-effect rounded-2xl p-6 sticky top-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                <h2 className="text-xl font-bold text-gray-900">🛒 Your Cart</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-purple-300 to-transparent"></div>
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                  <span className="text-xs font-medium text-purple-700">
                    {selectedItems.length + cartPackages.length} items
                  </span>
                </div>
              </div>
              
              {/* Loyalty Points Display */}
              <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiAward className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Loyalty Points</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-yellow-800">{userProfile.loyaltyPoints}</span>
                    <p className="text-xs text-yellow-600">+{Math.floor(getTotalPrice() / 10)} points on this order</p>
                  </div>
                </div>
              </div>
              
              {selectedItems.length === 0 && cartPackages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 floating-animation">
                    <FiShoppingCart className="w-10 h-10 text-purple-400" />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg mb-2">Your cart is empty</p>
                  <p className="text-gray-500 text-sm">Add items from the menu or choose a package to get started</p>
                  <div className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <span className="text-xs text-purple-600">💡 Tip: Try our packages for the best value!</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {/* Packages */}
                  {cartPackages.map((pkg) => (
                    <div key={pkg.type} className="cart-item flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-sm">📦 {pkg.name}</h4>
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Package
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">₹{pkg.price} per person</p>
                        <div className="mt-1 text-xs text-gray-500">
                          Total: ₹{pkg.price * pkg.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
                          <button
                            onClick={() => removePackageFromCart(pkg.type)}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Decrease quantity"
                            disabled={pkg.quantity <= 1}
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-gray-900 min-w-[28px] text-center text-sm">
                            {pkg.quantity}
                          </span>
                          <button
                            onClick={() => addPackageToCart(pkg.type)}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Increase quantity"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removePackageCompletely(pkg.type)}
                          className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                          title="Remove package completely"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Individual Items */}
                  {selectedItems.map((item) => (
                    <div key={item.id} className="cart-item flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 rounded-xl border border-gray-200 shadow-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-sm">🍽️ {item.name}</h4>
                          <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            Individual
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">₹{item.price} each</p>
                        <div className="mt-1 text-xs text-gray-500">
                          Total: ₹{item.price * item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-gray-900 min-w-[28px] text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Increase quantity"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeItemCompletely(item.id)}
                          className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                          title="Remove item completely"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 mb-4 shadow-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-gray-900">💰 Total Amount:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ₹{getTotalPrice()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 text-center">
                        Per Person • {selectedItems.length + cartPackages.length} items selected
                      </div>
                    </div>
                    <button 
                      onClick={handleBookNow} 
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      Proceed to Checkout
                      <div className="w-2 h-2 bg-white rounded-full pulse-animation"></div>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Favorites Section */}
              {favorites.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FiHeart className="w-4 h-4 text-red-500" />
                    <h3 className="text-lg font-bold text-gray-900">❤️ Your Favorites</h3>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {favorites.map((favoriteId) => {
                      const allItems = Object.values(menuData).flat()
                      const favoriteItem = allItems.find(item => item.id === favoriteId)
                      if (!favoriteItem) return null
                      
                      return (
                        <div key={favoriteId} className="flex items-center justify-between p-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{favoriteItem.name}</h4>
                            <p className="text-xs text-gray-600">₹{favoriteItem.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => addToCart(favoriteItem)}
                              className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                              title="Add to cart"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => toggleFavorite(favoriteId)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                              title="Remove from favorites"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Recent Orders Section */}
              {recentOrders.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FiClock className="w-4 h-4 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-900">🕒 Recent Orders</h3>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{order.date}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar 
                                key={i} 
                                className={`w-3 h-3 ${i < order.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {order.items.join(', ')}
                        </div>
                        <button
                          onClick={() => {
                            // Reorder functionality
                            const itemsToAdd = order.items.map(itemName => {
                              const allItems = Object.values(menuData).flat()
                              return allItems.find(item => item.name === itemName)
                            }).filter(Boolean)
                            
                            itemsToAdd.forEach(item => addToCart(item))
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Reorder this meal
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Menu Categories and Items */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Category Navigation */}
            <div className="glass-effect rounded-2xl p-6 mb-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                <span>📋</span>
                <span>Menu Categories</span>
              </h3>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateCategory('left')}
                  disabled={selectedCategory === 0}
                  className="p-2 md:p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Previous category"
                >
                  <FiChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                
                <div className="flex space-x-2 md:space-x-3 overflow-x-auto category-scroll px-2 md:px-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(index)}
                      className={`px-3 py-2 md:px-5 md:py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200 text-xs md:text-sm ${
                        selectedCategory === index
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                          : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:shadow-md border border-gray-200'
                      }`}
                      aria-label={`Select ${category} category`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => navigateCategory('right')}
                  disabled={selectedCategory === categories.length - 1}
                  className="p-2 md:p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Next category"
                >
                  <FiChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="glass-effect rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🍽️</span>
                  <span>{categories[selectedCategory]}</span>
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-300 via-purple-300 to-transparent"></div>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <span className="text-xs font-medium text-blue-700">
                    {menuData[categories[selectedCategory]]?.length || 0} items
                  </span>
                </div>
              </div>
              <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
                {getFilteredMenuItems().map((item) => {
                  const cartItem = selectedItems.find(selectedItem => selectedItem.id === item.id)
                  const quantity = cartItem ? cartItem.quantity : 0
                  const isFavorite = favorites.includes(item.id)
                  
                  return (
                    <div key={item.id} className={`menu-item-card border rounded-xl p-3 md:p-4 relative overflow-hidden ${
                      quantity > 0 ? 'border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-lg ring-2 ring-blue-200' : 'border-gray-200 bg-white/80 backdrop-blur-sm'
                    }`}>
                      {/* Background decoration for selected items */}
                      {quantity > 0 && (
                        <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-8 translate-x-8 md:-translate-y-10 md:translate-x-10"></div>
                      )}
                      
                      {/* Trending badge */}
                      {item.trending && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                          🔥 Trending
                        </div>
                      )}
                      
                      <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-base md:text-lg">{item.name}</h3>
                            <div className="flex items-center gap-2">
                              {quantity > 0 && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full shadow-sm w-fit">
                                  <FiShoppingCart className="w-3 h-3" />
                                  {quantity} {quantity === 1 ? 'item' : 'items'} in cart
                                </div>
                              )}
                              <button
                                onClick={() => toggleFavorite(item.id)}
                                className={`p-1 rounded-full transition-all duration-200 ${
                                  isFavorite 
                                    ? 'text-red-500 bg-red-100' 
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.description}</p>
                          
                          {/* Rating and Reviews */}
                          {item.rating && (
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-1">
                                <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                                <span className="text-xs text-gray-500">({item.reviews} reviews)</span>
                              </div>
                              {item.prepTime && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <FiClock className="w-3 h-3" />
                                  <span>{item.prepTime}</span>
                                </div>
                              )}
                              {item.calories && (
                                <div className="text-xs text-gray-500">
                                  {item.calories} cal
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Dietary and Allergen Info */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.isVegetarian && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                <FiShield className="w-3 h-3" />
                                Vegetarian
                              </div>
                            )}
                            {item.isVegan && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                <FiShield className="w-3 h-3" />
                                Vegan
                              </div>
                            )}
                            {item.allergens && item.allergens.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                <FiShield className="w-3 h-3" />
                                Contains: {item.allergens.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-4 md:ml-6">
                          <div className="text-right">
                            <span className="text-xl md:text-2xl font-bold text-gray-900">₹{item.price}</span>
                            <p className="text-xs text-gray-500">per item</p>
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-2 md:p-3 rounded-full hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            aria-label={`Add ${item.name} to cart`}
                          >
                            <FiPlus className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Modal */}
      {showPackageModal && modalPackageType && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200/50 flex-shrink-0 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <span>✨</span>
                    <span>{packageData[modalPackageType].name}</span>
                  </h2>
                  <p className="text-gray-600 mt-1">Additional items you can add to your package</p>
                </div>
              </div>
              <button
                onClick={closePackageModal}
                className="p-4 rounded-full hover:bg-white/80 transition-all duration-200 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid gap-6">
                {packageData[modalPackageType].additionalItems.map((item) => {
                  const cartItem = selectedItems.find(selectedItem => selectedItem.id === item.id)
                  const quantity = cartItem ? cartItem.quantity : 0
                  
                  return (
                    <div key={item.id} className={`menu-item-card border rounded-2xl p-6 transition-all duration-300 relative overflow-hidden ${
                      quantity > 0 ? 'border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-xl ring-2 ring-blue-200' : 'border-gray-200 bg-white/80 backdrop-blur-sm'
                    }`}>
                      {/* Background decoration for selected items */}
                      {quantity > 0 && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-12 translate-x-12"></div>
                      )}
                      
                      <div className="relative z-10 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-gray-900 text-xl">{item.name}</h3>
                            {quantity > 0 && (
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full shadow-sm">
                                <FiShoppingCart className="w-4 h-4" />
                                {quantity} {quantity === 1 ? 'item' : 'items'} in cart
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-base leading-relaxed mb-4">{item.description}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FiStar className="w-4 h-4 text-yellow-500" />
                              <span>Premium</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="flex items-center gap-1">
                              <FiClock className="w-4 h-4 text-blue-500" />
                              <span>Fresh</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="flex items-center gap-1">
                              <FiHeart className="w-4 h-4 text-red-500" />
                              <span>Popular</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 ml-8">
                          <div className="text-right">
                            <span className="text-3xl font-bold text-gray-900">₹{item.price}</span>
                            <p className="text-sm text-gray-500">per item</p>
                          </div>
                          <button
                            onClick={() => addPackageItemToCart(item)}
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 rounded-full hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-110"
                          >
                            <FiPlus className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Footer - Fixed at bottom */}
            <div className="p-8 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex gap-6">
                <button
                  onClick={closePackageModal}
                  className="flex-1 bg-gray-600/90 backdrop-blur-sm text-white py-5 px-8 rounded-2xl font-bold text-lg hover:bg-gray-700/90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                >
                  Close Modal
                </button>
                <button
                  onClick={() => {
                    addPackageToCart(modalPackageType)
                    closePackageModal()
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Add Complete Package to Cart
                  <div className="w-2 h-2 bg-white rounded-full pulse-animation"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu
