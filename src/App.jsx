import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProductGrid from './components/ProductGrid'
import ProductDetail from './components/ProductDetail'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import Footer from './components/Footer'
import Toast from './components/Toast'
import { useState } from 'react'

function HomePage() {
  return (
    <>
      <Hero />
      <ProductGrid />
    </>
  )
}

export default function App() {
  const location = useLocation()
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductGrid />} />
            <Route path="/product/:id" element={<ProductDetail addToast={addToast} />} />
            <Route path="/cart" element={<Cart addToast={addToast} />} />
            <Route path="/checkout" element={<Checkout addToast={addToast} />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <Toast toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
