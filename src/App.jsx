import { Routes, Route } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Home from './pages/Home'
import Katalog from './pages/Katalog'
import ProductDetail from './pages/ProductDetail'
import Keranjang from './pages/Keranjang'
import CaraPesan from './pages/CaraPesan'
import KonfirmasiPembayaran from './pages/KonfirmasiPembayaran'
import TentangKami from './pages/TentangKami'

export default function App() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Patung Buddha Meditasi',  size: 'Besar',  color: 'Alami', price: 999000, qty: 1, image: '/images/stone_product2_1780322918796.png' },
    { id: 2, name: 'Cobek Batu Premium',     size: 'Sedang', color: 'Alami',   price: 185000, qty: 1, image: '/images/media__1780324962198.jpg' },
    { id: 3, name: 'Replika Patung Moai',    size: 'Besar',  color: 'Alami', price: 399000, qty: 1, image: '/images/media__1780324640762.jpg' },
  ])

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)

  const addToCart = useCallback((product, size, qty) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.name === product.name && item.size === size)
      if (existing) {
        return prev.map(item =>
          item.name === product.name && item.size === size
            ? { ...item, qty: item.qty + qty }
            : item
        )
      }
      return [...prev, {
        id: Date.now(),
        name: product.name,
        size,
        color: 'Alami',
        price: product.priceNum,
        qty,
        image: product.image,
      }]
    })
  }, [])

  const updateCartQty = useCallback((id, delta) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item)
    )
  }, [])

  const removeCartItem = useCallback((id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const sharedProps = { cartCount }

  return (
    <Routes>
      <Route path="/"           element={<Home              {...sharedProps} />} />
      <Route path="/katalog"    element={<Katalog           {...sharedProps} />} />
      <Route path="/produk/:id" element={<ProductDetail     {...sharedProps} addToCart={addToCart} />} />
      <Route path="/keranjang"  element={<Keranjang         {...sharedProps} cartItems={cartItems} updateCartQty={updateCartQty} removeCartItem={removeCartItem} clearCart={clearCart} />} />
      <Route path="/cara-pesan" element={<CaraPesan         {...sharedProps} />} />
      <Route path="/konfirmasi" element={<KonfirmasiPembayaran {...sharedProps} />} />
      <Route path="/tentang"    element={<TentangKami       {...sharedProps} />} />
    </Routes>
  )
}
