const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const AUTH_TOKEN_KEY = 'wayfarer.authToken'
const AUTH_USER_KEY = 'wayfarer.authUser'

function hasExpiredToken(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return true
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
    const claims = JSON.parse(decoded)
    return typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

async function requestJson(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const isAuthRequest = path === '/api/auth/login' || path === '/api/auth/register'
  const token = isAuthRequest ? null : getAuthToken()
  if (isAuthRequest) {
    headers.delete('Authorization')
  } else if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAuthToken()
      localStorage.removeItem(AUTH_USER_KEY)
      window.dispatchEvent(new Event('wayfarer:auth-expired'))
    }
    const responseBody = await response.json().catch(() => null)
    const message = responseBody?.detail
      ?? responseBody?.message
      ?? responseBody?.error
      ?? `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

export async function getDestinations(signal) {
  const destinations = await requestJson('/api/destinations', { signal })
  if (!Array.isArray(destinations)) {
    throw new Error('The destinations response was not a list.')
  }
  return destinations
}

export async function getPackages(signal) {
  const packages = await requestJson('/api/packages', { signal })
  if (!Array.isArray(packages)) {
    throw new Error('The packages response was not a list.')
  }
  return packages
}

export async function getBookings(signal) {
  const bookings = await requestJson('/api/bookings', { signal })
  if (!Array.isArray(bookings)) {
    throw new Error('The bookings response was not a list.')
  }
  return bookings
}

export async function getCustomers(signal) {
  const customers = await requestJson('/api/customers', { signal })
  if (!Array.isArray(customers)) {
    throw new Error('The customers response was not a list.')
  }
  return customers
}

export function getMyCustomer(signal) {
  return requestJson('/api/customers/me', { signal })
}

export function createCustomer(customer) {
  const { name, email, phone } = customer
  return requestJson('/api/customers', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone }),
  })
}

export function createBooking({ customerId, packageId, numberOfTravelers, travelDate }) {
  return requestJson('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({
      customer: { id: customerId },
      travelPackage: { id: packageId },
      numberOfTravelers,
      travelDate,
    }),
  })
}

export function updateBooking(id, { customerId, packageId, numberOfTravelers, travelDate, bookingStatus }) {
  return requestJson(`/api/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      customer: { id: Number(customerId) },
      travelPackage: { id: Number(packageId) },
      numberOfTravelers: Number(numberOfTravelers),
      travelDate,
      bookingStatus,
    }),
  })
}

export function deleteBooking(id) {
  return requestJson(`/api/bookings/${id}`, { method: 'DELETE' })
}

export function saveDestination(destination) {
  const { id, name, description, location, imageUrl } = destination
  return requestJson(id ? `/api/destinations/${id}` : '/api/destinations', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify({ name, description, location, imageUrl: imageUrl || null }),
  })
}

export function deleteDestination(id) {
  return requestJson(`/api/destinations/${id}`, { method: 'DELETE' })
}

export function savePackage(travelPackage) {
  const { id, name, description, duration, price, availability, destinationId } = travelPackage
  return requestJson(id ? `/api/packages/${id}` : '/api/packages', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify({
      name,
      description,
      duration,
      price: Number(price),
      availability: Number(availability),
      destination: { id: Number(destinationId) },
    }),
  })
}

export function deletePackage(id) {
  return requestJson(`/api/packages/${id}`, { method: 'DELETE' })
}

export function registerAccount({ name, email, password }) {
  return requestJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role: 'CUSTOMER' }),
  })
}

export function loginAccount({ email, password }) {
  return requestJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function saveAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getAuthToken() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token && hasExpiredToken(token)) {
    clearAuthToken()
    localStorage.removeItem(AUTH_USER_KEY)
    window.dispatchEvent(new Event('wayfarer:auth-expired'))
    return null
  }
  return token
}
