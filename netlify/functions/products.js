import products from '../../src/data/products.js'

const rateLimitMap = new Map()

function checkRateLimit(ip, max = 30, windowMs = 60000) {
  const now = Date.now()
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs }
  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + windowMs
  }
  record.count++
  rateLimitMap.set(ip, record)
  return record.count <= max
}

function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str.slice(0, 200).replace(/[<>&"'`/]/g, '').trim()
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=300',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'
  if (!checkRateLimit(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests' }) }
  }

  try {
    const params = event.queryStringParameters || {}
    const { search, category, sort, minPrice, maxPrice } = params

    let result = [...products]

    if (search) {
      const query = sanitize(search).toLowerCase()
      if (query) {
        result = result.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        )
      }
    }

    if (category && category !== 'All') {
      const cleanCategory = sanitize(category)
      result = result.filter(p => p.category === cleanCategory)
    }

    if (minPrice) {
      const min = parseFloat(minPrice)
      if (!isNaN(min) && min >= 0) {
        result = result.filter(p => p.price >= min)
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice)
      if (!isNaN(max) && max <= 999999) {
        result = result.filter(p => p.price <= max)
      }
    }

    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        products: result,
        total: result.length,
      }),
    }
  } catch {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
