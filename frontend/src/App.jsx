import { useEffect, useMemo, useState } from 'react'
import {
  clearAuthToken,
  createBooking,
  createCustomer,
  deleteBooking,
  deleteDestination,
  deletePackage,
  getAuthToken,
  getBookings,
  getCustomers,
  getDestinations,
  getMyCustomer,
  getPackages,
  loginAccount,
  registerAccount,
  saveAuthToken,
  saveDestination,
  savePackage,
  updateBooking,
} from './services/api.js'
import './App.css'

const emptyBooking = {
  customerName: '',
  email: '',
  phone: '',
  packageId: '',
  travelers: '1',
  travelDate: '',
}

function formatAvailability(availability) {
  if (availability === 0) return 'Currently unavailable'
  return `${availability} ${availability === 1 ? 'seat' : 'seats'} available`
}

function DestinationCard({ destination, onViewPackages }) {
  return (
    <article className="col-12 col-sm-6 col-lg-4">
      <div className="destination-card">
        {destination.imageUrl && <img src={destination.imageUrl} alt={`${destination.name}, ${destination.location}`} loading="lazy" />}
        <div className="destination-card-content">
          <h3>{destination.name}</h3>
          <p>{destination.description}</p>
          <button className="destination-action" type="button" onClick={() => onViewPackages(destination.id)}>
            View Packages <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </article>
  )
}

function PackageCard({ trip, destination, isCompared, onCompare, onBook, onViewDetails }) {
  const availability = formatAvailability(trip.availability)

  return (
    <article className="col-12 col-md-6 col-xl-4" id={`package-${trip.id}`}>
      <div className="trip-card">
        <div className="trip-image-wrap">
          {destination?.imageUrl && <img className="trip-image" src={destination.imageUrl} alt={`${destination.name}, ${destination.location}`} loading="lazy" />}
          <span className="trip-label">{destination.name}</span>
          <button
            className={`compare-toggle ${isCompared ? 'is-selected' : ''}`}
            type="button"
            aria-pressed={isCompared}
            aria-label={`${isCompared ? 'Remove' : 'Add'} ${trip.name} ${isCompared ? 'from' : 'to'} comparison`}
            onClick={() => onCompare(trip.id)}
          >
            {isCompared ? '✓' : '+'}
          </button>
        </div>
        <div className="trip-card-body">
          <div className="trip-destination">{destination.name}<span>{destination.location}</span></div>
          <h3>{trip.name}</h3>
          <p className="trip-detail">{trip.description}</p>
          <div className="trip-meta"><span>{trip.duration}</span></div>
          <div className="trip-availability"><span className="availability-dot" />{availability}</div>
          <div className="trip-price"><strong>${trip.price.toLocaleString()}</strong><span> / person</span></div>
          <div className="package-actions">
            <button className="booking-button" type="button" onClick={() => onBook(trip)}>Book Now</button>
            <button className="details-button" type="button" onClick={() => onViewDetails(trip)}>View Details</button>
          </div>
        </div>
      </div>
    </article>
  )
}

function PackageDetailsDialog({ trip, onClose, onBook }) {
  const destination = trip.destination
  const availability = formatAvailability(trip.availability)

  return (
    <div className="feature-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="feature-dialog details-dialog" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close package details">&times;</button>
        {destination.imageUrl && <img className="details-image" src={destination.imageUrl} alt={`${destination.name}, ${destination.location}`} />}
        <p className="eyebrow">{destination.name}</p>
        <h2 id="details-title">{trip.name}</h2>
        <p className="dialog-copy">{trip.description}</p>
        <div className="details-grid">
          <div><span>Duration</span><strong>{trip.duration}</strong></div>
          <div><span>Price per traveler</span><strong>${trip.price.toLocaleString()}</strong></div>
          <div><span>Availability</span><strong>{availability}</strong></div>
        </div>
        <button className="booking-button dialog-book-button" type="button" onClick={() => onBook(trip)}>Book Now</button>
      </section>
    </div>
  )
}

function AuthDialog({ mode, onModeChange, onClose, onLogin }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRegister = mode === 'register'

  function updateField(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      if (isRegister) {
        await registerAccount({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        })
        setMessage('Your account was created. You can now log in.')
        setIsError(false)
        setFormData((currentData) => ({ ...currentData, password: '' }))
        return
      }

      const response = await loginAccount({
        email: formData.email.trim(),
        password: formData.password,
      })
      if (typeof response.token !== 'string' || !response.token) {
        throw new Error('Login succeeded but the server did not return a token.')
      }
      saveAuthToken(response.token)
      onLogin(response)
      onClose()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.')
      setIsError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  function changeMode(nextMode) {
    setMessage('')
    onModeChange(nextMode)
  }

  return (
    <div className="feature-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="feature-dialog booking-dialog auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">WAYFARER ACCOUNT</p>
            <h2 id="auth-title">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          </div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="Close authentication form">&times;</button>
        </div>
        <p className="dialog-copy">{isRegister ? 'Register to start planning your next trip.' : 'Log in to your Wayfarer account.'}</p>
        {message && <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`} role={isError ? 'alert' : 'status'}>{message}</div>}
        <form noValidate onSubmit={handleSubmit}>
          <div className="row g-3">
            {isRegister && (
              <div className="col-12">
                <label className="form-label" htmlFor="authName">Name</label>
                <input className="form-control" id="authName" name="name" value={formData.name} onChange={updateField} autoComplete="name" required />
              </div>
            )}
            <div className="col-12">
              <label className="form-label" htmlFor="authEmail">Email</label>
              <input className="form-control" id="authEmail" name="email" type="email" value={formData.email} onChange={updateField} autoComplete="email" required />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="authPassword">Password</label>
              <input className="form-control" id="authPassword" name="password" type="password" value={formData.password} onChange={updateField} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : undefined} required />
            </div>
          </div>
          <div className="dialog-actions auth-dialog-actions">
            <button className="details-button" type="button" onClick={() => changeMode(isRegister ? 'login' : 'register')}>
              {isRegister ? 'Log in instead' : 'Create account'}
            </button>
            <button className="booking-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isRegister ? 'Register' : 'Log in'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function BookingDialog({ initialPackage, packages, authUser, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    ...emptyBooking,
    customerName: authUser?.role === 'CUSTOMER' ? authUser.name : '',
    email: authUser?.role === 'CUSTOMER' ? authUser.email : '',
    packageId: String(initialPackage.id),
  })
  const [errors, setErrors] = useState({})
  const [today] = useState(() => new Date().toLocaleDateString('en-CA'))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const selectedPackage = packages.find((trip) => String(trip.id) === formData.packageId)

  function updateField(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!formData.customerName.trim()) nextErrors.customerName = 'Enter a customer name.'
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!/^[+\d][\d\s()-]{6,19}$/.test(formData.phone.trim())) nextErrors.phone = 'Enter a valid phone number.'
    if (!selectedPackage) nextErrors.packageId = 'Choose a travel package.'
    if (!Number.isInteger(Number(formData.travelers)) || Number(formData.travelers) < 1 || Number(formData.travelers) > 20) {
      nextErrors.travelers = 'Choose between 1 and 20 travelers.'
    }
    if (!formData.travelDate || formData.travelDate < today) nextErrors.travelDate = 'Choose today or a future travel date.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      await onSubmit({
        customerName: formData.customerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        packageId: Number(formData.packageId),
        numberOfTravelers: Number(formData.travelers),
        travelDate: formData.travelDate,
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create the booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="feature-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="feature-dialog booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <div className="dialog-heading">
          <div><p className="eyebrow">YOUR NEXT ADVENTURE</p><h2 id="booking-title">Booking request</h2></div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="Close booking form">&times;</button>
        </div>
        <p className="dialog-copy">Share your details to submit a booking request.</p>
        {submitError && <div className="alert alert-danger" role="alert">{submitError}</div>}
        <form noValidate onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="customerName">Customer name</label>
              <input className={`form-control ${errors.customerName ? 'is-invalid' : ''}`} id="customerName" name="customerName" value={formData.customerName} onChange={updateField} autoComplete="name" />
              {errors.customerName && <div className="invalid-feedback d-block">{errors.customerName}</div>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="bookingEmail">Email</label>
              <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="bookingEmail" name="email" type="email" value={formData.email} onChange={updateField} autoComplete="email" readOnly={authUser?.role === 'CUSTOMER'} />
              {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="bookingPhone">Phone</label>
              <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} id="bookingPhone" name="phone" type="tel" value={formData.phone} onChange={updateField} autoComplete="tel" />
              {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="bookingPackage">Selected package</label>
              <select className={`form-select ${errors.packageId ? 'is-invalid' : ''}`} id="bookingPackage" name="packageId" value={formData.packageId} onChange={updateField}>
                {packages.map((trip) => <option key={trip.id} value={trip.id}>{trip.name}</option>)}
              </select>
              {errors.packageId && <div className="invalid-feedback d-block">{errors.packageId}</div>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="travelers">Number of travelers</label>
              <input className={`form-control ${errors.travelers ? 'is-invalid' : ''}`} id="travelers" name="travelers" type="number" min="1" max="20" value={formData.travelers} onChange={updateField} />
              {errors.travelers && <div className="invalid-feedback d-block">{errors.travelers}</div>}
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="travelDate">Travel date</label>
              <input className={`form-control ${errors.travelDate ? 'is-invalid' : ''}`} id="travelDate" name="travelDate" type="date" min={today} value={formData.travelDate} onChange={updateField} />
              {errors.travelDate && <div className="invalid-feedback d-block">{errors.travelDate}</div>}
            </div>
          </div>
          <div className="dialog-actions">
            <button className="details-button" type="button" onClick={onClose}>Cancel</button>
            <button className="booking-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit booking'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function AdminDashboard({ destinations, packages, bookings, onRefresh }) {
  const [destinationForm, setDestinationForm] = useState({ name: '', description: '', location: '', imageUrl: '' })
  const [packageForm, setPackageForm] = useState({ name: '', description: '', duration: '', price: '', availability: '', destinationId: '' })
  const [editingDestinationId, setEditingDestinationId] = useState(null)
  const [editingPackageId, setEditingPackageId] = useState(null)
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [bookingForm, setBookingForm] = useState({ customerId: '', packageId: '', numberOfTravelers: '', travelDate: '', bookingStatus: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function runAdminAction(action, successMessage) {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await action()
      await onRefresh()
      setMessage(successMessage)
      return true
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Admin action failed.')
      return false
    } finally {
      setSaving(false)
    }
  }

  function submitDestination(event) {
    event.preventDefault()
    const editing = editingDestinationId !== null
    runAdminAction(
      () => saveDestination({ ...destinationForm, id: editingDestinationId }),
      editing ? 'Destination updated.' : 'Destination created.',
    ).then((succeeded) => {
      if (succeeded) {
        setDestinationForm({ name: '', description: '', location: '', imageUrl: '' })
        setEditingDestinationId(null)
      }
    })
  }

  function submitPackage(event) {
    event.preventDefault()
    const editing = editingPackageId !== null
    runAdminAction(
      () => savePackage({ ...packageForm, id: editingPackageId }),
      editing ? 'Package updated.' : 'Package created.',
    ).then((succeeded) => {
      if (succeeded) {
        setPackageForm({ name: '', description: '', duration: '', price: '', availability: '', destinationId: '' })
        setEditingPackageId(null)
      }
    })
  }

  function editDestination(destination) {
    setEditingDestinationId(destination.id)
    setDestinationForm({
      name: destination.name,
      description: destination.description,
      location: destination.location,
      imageUrl: destination.imageUrl || '',
    })
    setError('')
    setMessage('')
  }

  function editPackage(trip) {
    setEditingPackageId(trip.id)
    setPackageForm({
      name: trip.name,
      description: trip.description,
      duration: trip.duration,
      price: String(trip.price),
      availability: String(trip.availability),
      destinationId: String(trip.destination.id),
    })
    setError('')
    setMessage('')
  }

  function editBooking(booking) {
    setEditingBookingId(booking.id)
    setBookingForm({
      customerId: String(booking.customer.id),
      packageId: String(booking.travelPackage.id),
      numberOfTravelers: String(booking.numberOfTravelers),
      travelDate: booking.travelDate,
      bookingStatus: booking.bookingStatus,
    })
    setError('')
    setMessage('')
  }

  function submitBookingEdit(event) {
    event.preventDefault()
    runAdminAction(
      () => updateBooking(editingBookingId, bookingForm),
      'Booking updated.',
    ).then((succeeded) => {
      if (succeeded) {
        setEditingBookingId(null)
        setBookingForm({ customerId: '', packageId: '', numberOfTravelers: '', travelDate: '', bookingStatus: '' })
      }
    })
  }

  return (
    <section className="booking-records container" id="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <div className="section-heading">
        <div><p className="eyebrow">ADMINISTRATION</p><h2 id="admin-dashboard-title">Admin <em>dashboard.</em></h2></div>
        <p className="section-note">{destinations.length} destinations · {packages.length} packages · {bookings.length} bookings</p>
      </div>
      {message && <div className="alert alert-success mt-3" role="status">{message}</div>}
      {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}

      <div className="row g-4 mt-2">
        <div className="col-12 col-xl-6">
          <h3 className="admin-section-title">Destinations</h3>
          <form className="admin-form row g-2 mb-3" onSubmit={submitDestination}>
            <div className="col-sm-6"><label className="visually-hidden" htmlFor="adminDestinationName">Name</label><input id="adminDestinationName" className="form-control" placeholder="Name" required value={destinationForm.name} onChange={(event) => setDestinationForm({ ...destinationForm, name: event.target.value })} /></div>
            <div className="col-sm-6"><label className="visually-hidden" htmlFor="adminDestinationLocation">Location</label><input id="adminDestinationLocation" className="form-control" placeholder="Location" required value={destinationForm.location} onChange={(event) => setDestinationForm({ ...destinationForm, location: event.target.value })} /></div>
            <div className="col-12"><label className="visually-hidden" htmlFor="adminDestinationDescription">Description</label><input id="adminDestinationDescription" className="form-control" placeholder="Description" required value={destinationForm.description} onChange={(event) => setDestinationForm({ ...destinationForm, description: event.target.value })} /></div>
            <div className="col-12"><label className="visually-hidden" htmlFor="adminDestinationImage">Image URL</label><input id="adminDestinationImage" className="form-control" placeholder="Image URL (optional)" value={destinationForm.imageUrl} onChange={(event) => setDestinationForm({ ...destinationForm, imageUrl: event.target.value })} /></div>
            <div className="col-12 d-flex gap-2"><button className="booking-button" type="submit" disabled={saving}>{editingDestinationId ? 'Update destination' : 'Add destination'}</button>{editingDestinationId && <button className="details-button" type="button" onClick={() => { setEditingDestinationId(null); setDestinationForm({ name: '', description: '', location: '', imageUrl: '' }) }}>Cancel</button>}</div>
          </form>
          <div className="table-responsive">
            <table className="table booking-table">
              <thead><tr><th>ID</th><th>Destination</th><th>Actions</th></tr></thead>
              <tbody>{destinations.map((destination) => (
                <tr key={destination.id}><td>{destination.id}</td><td>{destination.name}<span>{destination.location}</span></td><td><button className="admin-text-button" type="button" onClick={() => editDestination(destination)}>Edit</button><button className="admin-text-button" type="button" onClick={() => window.confirm(`Delete ${destination.name}?`) && runAdminAction(() => deleteDestination(destination.id), 'Destination deleted.')}>Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <h3 className="admin-section-title">Packages</h3>
          <form className="admin-form row g-2 mb-3" onSubmit={submitPackage}>
            <div className="col-sm-6"><label className="visually-hidden" htmlFor="adminPackageName">Name</label><input id="adminPackageName" className="form-control" placeholder="Name" required value={packageForm.name} onChange={(event) => setPackageForm({ ...packageForm, name: event.target.value })} /></div>
            <div className="col-sm-6"><label className="visually-hidden" htmlFor="adminPackageDestination">Destination</label><select id="adminPackageDestination" className="form-select" required value={packageForm.destinationId} onChange={(event) => setPackageForm({ ...packageForm, destinationId: event.target.value })}><option value="">Choose destination</option>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}</select></div>
            <div className="col-sm-6"><label className="visually-hidden" htmlFor="adminPackageDuration">Duration</label><input id="adminPackageDuration" className="form-control" placeholder="Duration" required value={packageForm.duration} onChange={(event) => setPackageForm({ ...packageForm, duration: event.target.value })} /></div>
            <div className="col-sm-3"><label className="visually-hidden" htmlFor="adminPackagePrice">Price</label><input id="adminPackagePrice" className="form-control" placeholder="Price" type="number" min="0.01" step="0.01" required value={packageForm.price} onChange={(event) => setPackageForm({ ...packageForm, price: event.target.value })} /></div>
            <div className="col-sm-3"><label className="visually-hidden" htmlFor="adminPackageAvailability">Seats</label><input id="adminPackageAvailability" className="form-control" placeholder="Seats" type="number" min="0" required value={packageForm.availability} onChange={(event) => setPackageForm({ ...packageForm, availability: event.target.value })} /></div>
            <div className="col-12"><label className="visually-hidden" htmlFor="adminPackageDescription">Description</label><input id="adminPackageDescription" className="form-control" placeholder="Description" required value={packageForm.description} onChange={(event) => setPackageForm({ ...packageForm, description: event.target.value })} /></div>
            <div className="col-12 d-flex gap-2"><button className="booking-button" type="submit" disabled={saving || destinations.length === 0}>{editingPackageId ? 'Update package' : 'Add package'}</button>{editingPackageId && <button className="details-button" type="button" onClick={() => { setEditingPackageId(null); setPackageForm({ name: '', description: '', duration: '', price: '', availability: '', destinationId: '' }) }}>Cancel</button>}</div>
          </form>
          <div className="table-responsive">
            <table className="table booking-table">
              <thead><tr><th>ID</th><th>Package</th><th>Price</th><th>Actions</th></tr></thead>
              <tbody>{packages.map((trip) => (
                <tr key={trip.id}><td>{trip.id}</td><td>{trip.name}<span>{trip.destination.name}</span></td><td>${Number(trip.price).toLocaleString()}</td><td><button className="admin-text-button" type="button" onClick={() => editPackage(trip)}>Edit</button><button className="admin-text-button" type="button" onClick={() => window.confirm(`Delete ${trip.name}?`) && runAdminAction(() => deletePackage(trip.id), 'Package deleted.')}>Delete</button></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>

      <h3 className="admin-section-title mt-4">Bookings</h3>
      {bookings.length === 0
        ? <p className="empty-state">No bookings have been submitted yet.</p>
        : <div className="table-responsive"><table className="table booking-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Package</th><th>Travelers</th><th>Travel date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.customer.name}<span>{booking.customer.email}</span></td>
              <td>{booking.travelPackage.name}<span>{booking.travelPackage.destination.name}</span></td>
              <td>{booking.numberOfTravelers}</td>
              <td>{booking.travelDate}</td>
              <td>{booking.bookingStatus}</td>
              <td>
                <button className="admin-text-button" type="button" onClick={() => editBooking(booking)}>Edit</button>
                <button className="admin-text-button" type="button" onClick={() => window.confirm(`Delete booking #${booking.id}?`) && runAdminAction(() => deleteBooking(booking.id), 'Booking deleted.')}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table></div>}
      {editingBookingId !== null && (
        <form className="admin-form row g-2 mt-2" onSubmit={submitBookingEdit}>
          <div className="col-sm-3"><label className="visually-hidden" htmlFor="editBookingCustomer">Customer</label><select id="editBookingCustomer" className="form-select" required value={bookingForm.customerId} onChange={(event) => setBookingForm({ ...bookingForm, customerId: event.target.value })}>{Array.from(new Map(bookings.map((booking) => [booking.customer.id, booking.customer])).values()).map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></div>
          <div className="col-sm-3"><label className="visually-hidden" htmlFor="editBookingPackage">Package</label><select id="editBookingPackage" className="form-select" required value={bookingForm.packageId} onChange={(event) => setBookingForm({ ...bookingForm, packageId: event.target.value })}>{packages.map((trip) => <option key={trip.id} value={trip.id}>{trip.name}</option>)}</select></div>
          <div className="col-sm-2"><label className="visually-hidden" htmlFor="editBookingTravelers">Travelers</label><input id="editBookingTravelers" className="form-control" type="number" min="1" required value={bookingForm.numberOfTravelers} onChange={(event) => setBookingForm({ ...bookingForm, numberOfTravelers: event.target.value })} /></div>
          <div className="col-sm-2"><label className="visually-hidden" htmlFor="editBookingDate">Travel date</label><input id="editBookingDate" className="form-control" type="date" required value={bookingForm.travelDate} onChange={(event) => setBookingForm({ ...bookingForm, travelDate: event.target.value })} /></div>
          <div className="col-sm-2"><label className="visually-hidden" htmlFor="editBookingStatus">Status</label><input id="editBookingStatus" className="form-control" required value={bookingForm.bookingStatus} onChange={(event) => setBookingForm({ ...bookingForm, bookingStatus: event.target.value })} /></div>
          <div className="col-12 d-flex gap-2"><button className="booking-button" type="submit" disabled={saving}>Save booking</button><button className="details-button" type="button" onClick={() => setEditingBookingId(null)}>Cancel</button></div>
        </form>
      )}
    </section>
  )
}

function App() {
  const [authToken, setAuthToken] = useState(() => getAuthToken())
  const [authUser, setAuthUser] = useState(() => {
    if (!getAuthToken()) {
      localStorage.removeItem('wayfarer.authUser')
      return null
    }
    try {
      return JSON.parse(localStorage.getItem('wayfarer.authUser') || 'null')
    } catch {
      return null
    }
  })
  const [authMode, setAuthMode] = useState(null)
  const [authNotice, setAuthNotice] = useState('')
  const [destinations, setDestinations] = useState([])
  const [packages, setPackages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [destinationFilter, setDestinationFilter] = useState('all')
  const [comparedIds, setComparedIds] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [bookingPackage, setBookingPackage] = useState(null)
  const [detailsPackage, setDetailsPackage] = useState(null)
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(() => Boolean(getAuthToken()))
  const [bookingsError, setBookingsError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')

  useEffect(() => {
    function handleAuthExpired() {
      setAuthToken(null)
      setAuthUser(null)
      setBookings([])
      setBookingsLoading(false)
      setBookingsError('')
      setAuthNotice('Your session expired. Please log in again.')
    }

    window.addEventListener('wayfarer:auth-expired', handleAuthExpired)
    return () => window.removeEventListener('wayfarer:auth-expired', handleAuthExpired)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getDestinations(controller.signal),
      getPackages(controller.signal),
    ])
      .then(([loadedDestinations, loadedPackages]) => {
        setDestinations(loadedDestinations)
        setPackages(loadedPackages)
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : 'Unable to reach the API.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!authToken || !authUser) {
      return undefined
    }

    const controller = new AbortController()
    getBookings(controller.signal)
      .then(setBookings)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setBookingsError(error instanceof Error ? error.message : 'Unable to load bookings.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setBookingsLoading(false)
      })

    return () => controller.abort()
  }, [authToken, authUser])

  const visiblePackages = useMemo(() => {
    const query = search.trim().toLowerCase()

    return packages.filter((trip) => {
      const matchesSearch = !query || `${trip.name} ${trip.destination.name}`.toLowerCase().includes(query)
      const matchesDestination = destinationFilter === 'all' || String(trip.destination.id) === destinationFilter
      return matchesSearch && matchesDestination
    })
  }, [destinationFilter, packages, search])

  const comparedPackages = packages.filter((trip) => comparedIds.includes(trip.id))

  function toggleCompare(id) {
    setComparedIds((currentIds) => {
      if (currentIds.includes(id)) return currentIds.filter((currentId) => currentId !== id)
      if (currentIds.length === 3) return currentIds
      return [...currentIds, id]
    })
    setShowComparison(false)
  }

  function showDestinationPackages(destinationId) {
    setDestinationFilter(String(destinationId))
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })
  }

  async function saveBooking(booking) {
    if (!authToken || !authUser) {
      throw new Error('Log in before submitting a booking.')
    }

    let customer
    if (authUser.role === 'ADMIN') {
      const customers = await getCustomers()
      customer = customers.find((existing) => existing.email.toLowerCase() === booking.email.toLowerCase())
      if (!customer) {
        customer = await createCustomer({
          name: booking.customerName,
          email: booking.email,
          phone: booking.phone,
        })
      }
    } else if (authUser.role === 'CUSTOMER') {
      if (booking.email.toLowerCase() !== authUser.email.toLowerCase()) {
        throw new Error('Bookings must use the email address on your account.')
      }
      try {
        customer = await getMyCustomer()
      } catch (error) {
        if (error.status !== 404) throw error
        customer = await createCustomer({
          name: booking.customerName,
          email: booking.email,
          phone: booking.phone,
        })
      }
    } else {
      throw new Error('Your account is not authorized to create a booking.')
    }

    const createdBooking = await createBooking({
      customerId: customer.id,
      packageId: booking.packageId,
      numberOfTravelers: booking.numberOfTravelers,
      travelDate: booking.travelDate,
    })
    setBookingMessage(`Booking #${createdBooking.id} for ${createdBooking.travelPackage.name} was submitted successfully.`)
    setBookingPackage(null)
    setDetailsPackage(null)
    try {
      setBookings(await getBookings())
      setBookingsError('')
    } catch (error) {
      setBookingsError(error instanceof Error ? error.message : 'Booking submitted, but the booking list could not be refreshed.')
    }
    window.setTimeout(() => setBookingMessage(''), 7000)
  }

  async function refreshAdminData() {
    const [loadedDestinations, loadedPackages, loadedBookings] = await Promise.all([
      getDestinations(),
      getPackages(),
      getBookings(),
    ])
    setDestinations(loadedDestinations)
    setPackages(loadedPackages)
    setBookings(loadedBookings)
  }

  function handleLogin(response) {
    const user = {
      name: response.name,
      email: response.email,
      role: response.role,
    }
    setAuthToken(response.token)
    setAuthUser(user)
    setBookingsLoading(true)
    setBookingsError('')
    localStorage.setItem('wayfarer.authUser', JSON.stringify(user))
    setAuthNotice(`Signed in as ${response.name}.`)
  }

  function handleLogout() {
    clearAuthToken()
    localStorage.removeItem('wayfarer.authUser')
    setAuthToken(null)
    setAuthUser(null)
    setBookings([])
    setBookingsLoading(false)
    setBookingsError('')
    setAuthNotice('You have been logged out.')
  }

  return (
    <div className="agency-app">
      <header className="site-header">
        <nav className="navbar navbar-expand-md container site-nav" aria-label="Main navigation">
          <a className="navbar-brand brand-mark" href="#home" aria-label="Tours and Travels home">
            <span className="brand-symbol" aria-hidden="true">W</span>
            <span>wayfarer<span className="brand-period">.</span></span>
          </a>
          <div className="nav-links">
            <a href="#destinations">Destinations</a>
            <a href="#packages">Packages</a>
            {authUser?.role === 'ADMIN' && <a href="#admin-dashboard">Admin</a>}
          </div>
          <div className="nav-account">
            {authToken
              ? <>
                <span className="nav-user">{authUser?.name || 'Signed in'}</span>
                <button className="auth-nav-button" type="button" onClick={handleLogout}>Log out</button>
              </>
              : <>
                <button className="auth-nav-button" type="button" onClick={() => { setAuthMode('login'); setAuthNotice('') }}>Log in</button>
                <button className="auth-nav-button auth-nav-primary" type="button" onClick={() => { setAuthMode('register'); setAuthNotice('') }}>Register</button>
              </>}
            <a className="nav-contact" href="mailto:hello@wayfarer.travel">Contact us <span aria-hidden="true">&rarr;</span></a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero-banner" id="home" aria-labelledby="hero-title">
          <div className="hero-shade" />
          <div className="container hero-content">
            <p className="eyebrow hero-eyebrow"><span /> SMALL GROUPS. BIGGER STORIES.</p>
            <h1 id="hero-title">Explore the<br /><em>world.</em></h1>
            <p className="hero-copy">Discover memorable destinations and thoughtfully planned travel packages for every kind of traveler.</p>
            <a className="hero-link" href="#destinations">Explore destinations <span aria-hidden="true">&darr;</span></a>
          </div>
          <div className="hero-caption">{destinations[0]?.name.toUpperCase()} <span>{destinations[0]?.location}</span></div>
          <div className="hero-count"><strong>01</strong> / {String(destinations.length).padStart(2, '0')}</div>
        </section>

        {loadError && (
          <div className="container mt-4">
            <div className="alert alert-danger" role="alert">
              Unable to load destinations and packages: {loadError}
            </div>
          </div>
        )}
        {authNotice && (
          <div className="container mt-3">
            <div className="alert alert-success mb-0" role="status">{authNotice}</div>
          </div>
        )}

        <section className="destination-section container" id="destinations" aria-labelledby="destinations-title">
          <div className="section-heading">
            <div><p className="eyebrow">GO SOMEWHERE NEW</p><h2 id="destinations-title">Popular <em>destinations.</em></h2></div>
            <p className="section-note">Find a place that feels like yours.</p>
          </div>
          <div className="row g-3 destination-grid">
            {isLoading
              ? <p className="empty-state col-12" role="status">Loading destinations...</p>
              : destinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} onViewPackages={showDestinationPackages} />
              ))}
          </div>
        </section>

        <section className="trip-section container" id="packages" aria-labelledby="packages-title">
          <div className="section-heading">
            <div><p className="eyebrow">THOUGHTFULLY PLANNED GETAWAYS</p><h2 id="packages-title">Travel <em>packages.</em></h2></div>
            <p className="section-note">Compare details, check availability, and choose your next trip.</p>
          </div>

          <div className="trip-controls">
            <label className="destination-filter-label" htmlFor="destinationFilter">
              <span>Destination</span>
              <select id="destinationFilter" className="form-select destination-filter" value={destinationFilter} onChange={(event) => setDestinationFilter(event.target.value)}>
                <option value="all">All destinations</option>
                {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}
              </select>
            </label>
            <label className="trip-search">
              <span aria-hidden="true">&#9906;</span>
              <span className="visually-hidden">Search packages and destinations</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search packages or destinations" />
            </label>
          </div>

          <div className="row g-4 trip-grid">
            {isLoading
              ? <p className="empty-state col-12" role="status">Loading packages...</p>
              : visiblePackages.map((trip) => (
                <PackageCard
                  key={trip.id}
                  trip={trip}
                  destination={trip.destination}
                  isCompared={comparedIds.includes(trip.id)}
                  onCompare={toggleCompare}
                  onBook={setBookingPackage}
                  onViewDetails={setDetailsPackage}
                />
              ))}
          </div>

          {!isLoading && !loadError && visiblePackages.length === 0 && <p className="empty-state">No packages match your search. Try another destination or package name.</p>}
        </section>

        {bookingMessage && (
          <div className="container booking-message-wrap">
            <div className="alert alert-success booking-message" role="status">{bookingMessage}</div>
          </div>
        )}

        {authToken && authUser?.role === 'CUSTOMER' && (
          <section className="booking-records container" id="booking-records" aria-labelledby="booking-records-title">
            <div className="section-heading">
              <div><p className="eyebrow">FROM THE BACKEND</p><h2 id="booking-records-title">{authUser?.role === 'ADMIN' ? 'Booking ' : 'My booking '}<em>requests.</em></h2></div>
            </div>
            {bookingsLoading && <p className="empty-state" role="status">Loading bookings...</p>}
            {bookingsError && <div className="alert alert-danger" role="alert">{bookingsError}</div>}
            {!bookingsLoading && !bookingsError && bookings.length === 0 && <p className="empty-state">No bookings yet. Choose a package to get started.</p>}
            {bookings.length > 0 && (
              <div className="table-responsive">
                <table className="table booking-table">
                  <thead><tr><th scope="col">Customer</th><th scope="col">Package</th><th scope="col">Travelers</th><th scope="col">Travel date</th><th scope="col">Booking ID</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.customer.name}<span>{booking.customer.email}</span></td>
                        <td>{booking.travelPackage.name}<span>{booking.travelPackage.destination.name}</span></td>
                        <td>{booking.numberOfTravelers}</td>
                        <td>{booking.travelDate}</td>
                        <td>{booking.id}</td>
                        <td>{booking.bookingStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {authToken && authUser?.role === 'ADMIN' && (
          <AdminDashboard
            destinations={destinations}
            packages={packages}
            bookings={bookings}
            onRefresh={refreshAdminData}
          />
        )}

        <section className="promise-band" id="why-wayfarer">
          <div className="container promise-inner">
            <p className="eyebrow">A LITTLE MORE HUMAN</p>
            <p className="promise-copy">The best stories happen <em>between</em> the landmarks.</p>
            <span className="promise-signoff">That's where we take you.</span>
          </div>
        </section>
      </main>

      <footer className="site-footer container">
        <a className="footer-brand" href="#home">wayfarer<span>.</span></a>
        <p>Tours and Travels Agency Management System</p>
        <a className="footer-contact" href="mailto:hello@wayfarer.travel">Contact our team</a>
        <span>© 2026 Wayfarer Travel Co.</span>
      </footer>

      {comparedIds.length > 0 && (
        <aside className="compare-dock" aria-label="Package comparison">
          {showComparison ? (
            <div className="compare-panel container">
              <div className="compare-panel-heading">
                <div><p className="eyebrow">SIDE BY SIDE</p><h2>Find your fit.</h2></div>
                <button className="close-compare" type="button" onClick={() => setShowComparison(false)} aria-label="Close comparison">&times;</button>
              </div>
              <div className="table-responsive">
                <table className="table compare-table">
                  <thead><tr><th scope="col">Package detail</th>{comparedPackages.map((trip) => <th scope="col" key={trip.id}>{trip.destination.name}</th>)}</tr></thead>
                  <tbody>
                    <tr><th scope="row">Package</th>{comparedPackages.map((trip) => <td key={trip.id}>{trip.name}</td>)}</tr>
                    <tr><th scope="row">Duration</th>{comparedPackages.map((trip) => <td key={trip.id}>{trip.duration}</td>)}</tr>
                    <tr><th scope="row">Availability</th>{comparedPackages.map((trip) => <td key={trip.id}>{formatAvailability(trip.availability)}</td>)}</tr>
                    <tr><th scope="row">Price</th>{comparedPackages.map((trip) => <td key={trip.id}><strong>${trip.price.toLocaleString()}</strong> / person</td>)}</tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="container compare-dock-inner">
              <p><strong>{comparedIds.length} {comparedIds.length === 1 ? 'package' : 'packages'}</strong> selected to compare <span className="compare-hint">(up to 3)</span></p>
              <button className="compare-action" type="button" onClick={() => setShowComparison(true)} disabled={comparedIds.length < 2}>Compare packages <span aria-hidden="true">&rarr;</span></button>
            </div>
          )}
        </aside>
      )}

      {bookingPackage && (
        <BookingDialog initialPackage={bookingPackage} packages={packages} authUser={authUser} onClose={() => setBookingPackage(null)} onSubmit={saveBooking} />
      )}

      {detailsPackage && (
        <PackageDetailsDialog
          trip={detailsPackage}
          onClose={() => setDetailsPackage(null)}
          onBook={(trip) => { setDetailsPackage(null); setBookingPackage(trip) }}
        />
      )}

      {authMode && (
        <AuthDialog
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthMode(null)}
          onLogin={handleLogin}
        />
      )}
    </div>
  )
}

export default App
