import { createContext, useContext, useReducer, useEffect } from 'react'
import { loadSecureJSON, saveSecureJSON, validateCartItem, validatePrice } from '../utils/security'
import products from '../data/products'

const CartContext = createContext()

const CART_KEY = 'cart'

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload || []

    case 'ADD_ITEM': {
      const productData = products.find(p => p.id === action.payload.id)
      if (!productData) return state

      const serverPrice = productData.price
      if (!validatePrice(serverPrice)) return state

      const existingIndex = state.findIndex(item => item.id === action.payload.id)
      if (existingIndex >= 0) {
        const updated = [...state]
        const newQty = Math.min(updated[existingIndex].quantity + (action.payload.quantity || 1), 99)
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          price: serverPrice,
        }
        return updated
      }

      const newItem = {
        id: productData.id,
        name: productData.name,
        price: serverPrice,
        image: productData.image,
        quantity: Math.min(action.payload.quantity || 1, 99),
      }

      if (!validateCartItem(newItem)) return state
      return [...state, newItem]
    }

    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload)

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity < 1 || quantity > 99) return state
      return state.map(item =>
        item.id === id ? { ...item, quantity: Math.floor(quantity) } : item
      )
    }

    case 'CLEAR_CART':
      return []

    case 'REFRESH_PRICES': {
      return state.map(item => {
        const productData = products.find(p => p.id === item.id)
        if (productData && validatePrice(productData.price)) {
          return { ...item, price: productData.price }
        }
        return item
      })
    }

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => loadSecureJSON(CART_KEY, []))

  useEffect(() => {
    saveSecureJSON(CART_KEY, cart)
  }, [cart])

  useEffect(() => {
    dispatch({ type: 'REFRESH_PRICES' })
  }, [])

  const addItem = (productId, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { id: productId, quantity } })
  }

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const cartTotal = cart.reduce((sum, item) => {
    if (!validatePrice(item.price)) return sum
    return sum + item.price * item.quantity
  }, 0)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const getItemQuantity = (productId) => {
    const item = cart.find(i => i.id === productId)
    return item ? item.quantity : 0
  }

  const value = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartTotal: Math.round(cartTotal * 100) / 100,
    cartCount,
    getItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
