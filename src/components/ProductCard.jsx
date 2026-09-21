import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [adding, setAdding] = useState(false)
  const { addItem, getItemQuantity } = useCart()
  const inCart = getItemQuantity(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    addItem(product.id, 1)
    setTimeout(() => setAdding(false), 600)
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <Link
      to={`/product/${product.id}`}
      className="group card overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square product-image-zoom bg-light-gray">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">Imagen no disponible</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {product.badge && (
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
            product.badge === 'Sale' ? 'bg-red-500 text-white' :
            product.badge === 'New' ? 'bg-blue-500 text-white' :
            product.badge === 'Best Seller' ? 'bg-amber-500 text-white' :
            product.badge === 'Eco' ? 'bg-emerald-600 text-white' :
            product.badge === 'Pro' ? 'bg-purple-600 text-white' :
            product.badge === 'Vegan' ? 'bg-green-600 text-white' :
            product.badge === 'Handmade' ? 'bg-orange-500 text-white' :
            product.badge === 'Popular' ? 'bg-indigo-500 text-white' :
            'bg-gray-800 text-white'
          }`}>
            {product.badge}
          </span>
        )}

        {discount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{discount}%
          </span>
        )}

        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center
            transition-all duration-300 hover:bg-emerald-600 hover:text-white
            ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            ${adding ? 'bg-emerald-600 text-white scale-90' : ''}
          `}
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingBag size={18} />
        </button>

        <button
          className={`absolute top-3 right-3 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center
            transition-all duration-300 hover:bg-red-50 hover:text-red-500
            ${isHovered && !discount ? 'opacity-100' : 'opacity-0'}
          `}
          aria-label={`Agregar ${product.name} a favoritos`}
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-dark group-hover:text-emerald-600 transition-colors line-clamp-1 mb-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-dark">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {inCart > 0 && (
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
              {inCart} en carrito
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
