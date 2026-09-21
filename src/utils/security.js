const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  const maxLength = 500
  return input
    .slice(0, maxLength)
    .replace(/[&<>"'`/]/g, char => ENTITY_MAP[char] || '')
    .trim()
}

export function sanitizeHTML(html) {
  if (typeof html !== 'string') return ''
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function validatePrice(price) {
  if (typeof price !== 'number' || isNaN(price)) return false
  if (price < 0 || price > 999999.99) return false
  return true
}

export function validateCartItem(item) {
  if (!item || typeof item !== 'object') return false
  if (!item.id || typeof item.id !== 'number') return false
  if (!item.name || typeof item.name !== 'string') return false
  if (!validatePrice(item.price)) return false
  if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 99) return false
  return true
}

export function generateCSRFToken() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function storeCSRFToken(token) {
  sessionStorage.setItem('csrf_token', token)
}

export function getCSRFToken() {
  return sessionStorage.getItem('csrf_token')
}

export function validateCSRFToken(token) {
  const stored = getCSRFToken()
  return stored && stored === token
}

const rateLimitMap = new Map()

export function rateLimiter(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs }

  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + windowMs
  }

  record.count++
  rateLimitMap.set(key, record)

  return record.count <= maxRequests
}

export function validateEmail(email) {
  if (typeof email !== 'string') return false
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email) && email.length <= 254
}

export function validatePhone(phone) {
  if (typeof phone !== 'string') return false
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  return /^\+?\d{7,15}$/.test(cleaned)
}

export function validateAddress(address) {
  if (!address || typeof address !== 'object') return { valid: false, errors: ['Invalid address'] }
  const errors = []

  if (!address.street || address.street.trim().length < 3) errors.push('Street address is required')
  if (address.street && address.street.length > 200) errors.push('Street address too long')
  if (!address.city || address.city.trim().length < 2) errors.push('City is required')
  if (address.city && address.city.length > 100) errors.push('City name too long')
  if (!address.state || address.state.trim().length < 2) errors.push('State is required')
  if (!address.zip || !/^\d{5}(-\d{4})?$/.test(address.zip)) errors.push('Valid ZIP code is required')
  if (!address.country || address.country.trim().length < 2) errors.push('Country is required')

  return { valid: errors.length === 0, errors }
}

export function validateCard(card) {
  if (!card || typeof card !== 'object') return { valid: false, errors: ['Invalid card data'] }
  const errors = []

  if (!card.number || !/^\d{13,19}$/.test(card.number.replace(/\s/g, ''))) errors.push('Invalid card number')
  if (!card.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) errors.push('Invalid expiry date')
  if (!card.cvv || !/^\d{3,4}$/.test(card.cvv)) errors.push('Invalid CVV')
  if (!card.name || card.name.trim().length < 2) errors.push('Cardholder name is required')
  if (card.name && card.name.length > 100) errors.push('Name too long')

  return { valid: errors.length === 0, errors }
}

export function sanitizeCartForStorage(items) {
  if (!Array.isArray(items)) return []
  return items.filter(validateCartItem).map(item => ({
    id: Number(item.id),
    name: sanitizeInput(item.name),
    price: Math.round(item.price * 100) / 100,
    quantity: Math.min(Math.max(Math.floor(item.quantity), 1), 99),
    image: item.image || '',
  }))
}

export function loadSecureJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (key === 'cart') return sanitizeCartForStorage(parsed)
    return parsed
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

export function saveSecureJSON(key, data) {
  try {
    if (key === 'cart') {
      data = sanitizeCartForStorage(data)
    }
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
