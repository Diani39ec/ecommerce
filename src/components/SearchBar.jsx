import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { sanitizeInput } from '../utils/security'

export default function SearchBar({ compact = false, onClose }) {
  const [query, setQuery] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const param = searchParams.get('search') || ''
    setQuery(param)
  }, [searchParams])

  const handleSearch = useCallback((value) => {
    const sanitized = sanitizeInput(value)
    setQuery(sanitized)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      if (sanitized.trim()) {
        setSearchParams({ search: sanitized })
        if (window.location.pathname !== '/products') {
          navigate(`/products?search=${encodeURIComponent(sanitized)}`)
        }
      } else {
        setSearchParams({})
      }
    }, 300)
  }, [navigate, setSearchParams])

  const handleClear = () => {
    setQuery('')
    setSearchParams({})
    if (onClose) onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim()) {
      setSearchParams({ search: query })
      if (window.location.pathname !== '/products') {
        navigate(`/products?search=${encodeURIComponent(query)}`)
      }
    }
    if (onClose) onClose()
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${compact ? '' : 'w-full'}`}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar productos..."
          maxLength={200}
          className={`w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl text-sm text-dark
            placeholder-gray-400 outline-none transition-all duration-200
            focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500
            ${compact ? '' : 'border border-gray-200'}
          `}
          aria-label="Buscar productos"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  )
}
