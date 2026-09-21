const rateLimitMap = new Map()

function checkRateLimit(ip, max = 3, windowMs = 60000) {
  const now = Date.now()
  const key = `payment:${ip}`
  const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs }
  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + windowMs
  }
  record.count++
  rateLimitMap.set(key, record)
  return record.count <= max
}

function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str.slice(0, 200).replace(/[<>&"'`/]/g, '').trim()
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

function validateAmount(amount) {
  return typeof amount === 'number' && amount > 0 && amount < 100000 && Number.isFinite(amount)
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'
  if (!checkRateLimit(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many payment attempts. Please try again later.' }) }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { email, items, amount, cardToken } = body

    if (!validateEmail(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email address' }) }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No items in order' }) }
    }

    if (items.length > 50) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Too many items' }) }
    }

    if (!validateAmount(amount)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid payment amount' }) }
    }

    const serverTotal = items.reduce((sum, item) => {
      if (typeof item.price !== 'number' || typeof item.quantity !== 'number') return sum
      if (item.price < 0 || item.price > 999999 || item.quantity < 1 || item.quantity > 99) return sum
      return sum + item.price * item.quantity
    }, 0)

    const expectedTotal = Math.round(serverTotal * 100) / 100
    const providedTotal = Math.round(amount * 100) / 100

    if (Math.abs(expectedTotal - providedTotal) > 0.01) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Payment amount mismatch. Server recalculated the total.',
          expected: expectedTotal,
        }),
      }
    }

    const orderId = `GM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        orderId,
        amount: expectedTotal,
        message: 'Payment processed successfully',
      }),
    }
  } catch {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Payment processing failed' }),
    }
  }
}
