import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { CityProvider } from './contexts/CityContext'
import { store } from './store'
import Blogs from './components/Blogs'
import Contact from './components/Contact'
import Venues from './components/Venues'
import ListofVenues from './components/ListofVenues'
import IndividualVenue from './components/IndividualVenue'
import Landing from './components/Landing'
import Footer from './components/Footer'
import NavBar from './components/NavBar'
import Login from './components/Login'
import ChatBot from './components/ChatBot'
import Resources from './pages/Resources'
import './App.css'
import ListYourBusiness from './components/ListYourBusiness'
import Services from './pages/Services'
import ListofServices from './pages/ListofServices'
import IndividualServices from './pages/IndividualServices'
import PaymentGateway from './pages/PaymentGateway'
import IndividualResources from './pages/IndividualResources'
import AddToCart from './pages/AddToCart'
import Menu from './pages/Menu'
import Subscription from './components/Admin/Subscription'
import SeniorCare from './pages/SeniorCare'
import AddPersona from './components/Admin/AddPersona'
import MyBookings from './components/MyBookings'
import Settings from './components/Settings'
import CustomizeProfile from './components/CustomizeProfile'
import MainDashboard from './components/Dashboard/MainDashboard'
import ScrollToTop from './contexts/ScrollToTop'
import PriceTier from './components/PriceTier'

function App() {
  const RouterComponent = (typeof window !== 'undefined' && window.location.protocol === 'file:')
    ? HashRouter
    : BrowserRouter;

  return (
    <Provider store={store}>
      <CityProvider>
        <RouterComponent gestureEnabled={false}>
          {/* Add this line */}
          <ScrollToTop />

          <div className="App min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/business" element={<ListYourBusiness/>}/>
                <Route path="/venues" element={<Venues />} />
                <Route path="/login" element={<Login/>}/>
                <Route path="/services" element={<Services/>}/>
                <Route path="/venues/:city" element={<ListofVenues />} />
                <Route path="/venue/:city/:venueId" element={<IndividualVenue />} />
                <Route path="/services/:city" element={<ListofServices/>}/>
                <Route path="/services/:serviceType/:serviceId" element={<IndividualServices/>}/>
                <Route path="/pay" element={<PaymentGateway/>}/>
                <Route path="/resources" element={<Resources/>}/>
                <Route path="/resources/:resourceId" element={<IndividualResources/>}/>
                <Route path="/cart" element={<AddToCart/>}/>
                <Route path="/menu" element={<Menu/>}/>
                <Route path="/admin/subscriptions" element={<Subscription/>}/>
                <Route path="/admin/add-persona" element={<AddPersona/>}/>
                <Route path="/my-bookings" element={<MyBookings/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/customize-profile" element={<CustomizeProfile/>}/>
                <Route path="/dashboard" element={<MainDashboard/>}/>
                <Route path="/priceList" element={<PriceTier/>}/>
              </Routes>
            </main>
            <Footer />
          </div>
        </RouterComponent>
      </CityProvider>
    </Provider>
  );
}


export default App
