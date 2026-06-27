import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../services/api'

function ParkingSlots() {
  const [slots,          setSlots]          = useState([])
  const [buildings,      setBuildings]      = useState([])
  const [bookedIds,      setBookedIds]      = useState([])
  const [stats,          setStats]          = useState({})
  const [selectedDate,   setSelectedDate]   = useState('')
  const [selBuilding,    setSelBuilding]    = useState('All')
  const [selFloor,       setSelFloor]       = useState('All')
  const [selected,       setSelected]       = useState(null)
  const [bookingForm,    setBookingForm]    = useState({ start_time: '', end_time: '' })
  const [message,        setMessage]        = useState({ text: '', type: '' })
  const [loading,        setLoading]        = useState(false)
  const [submitting,     setSubmitting]     = useState(false)

  // Fetch slots (with optional date for availability check)
  const fetchSlots = async (date = '') => {
    setLoading(true)
    try {
      const res = await API.get('/getSlots.php' + (date ? `?date=${date}` : ''))
      if (res.data.success) {
        setSlots(res.data.slots)
        setBuildings(res.data.buildings)
        setBookedIds(res.data.booked_slot_ids || [])
        setStats(res.data.stats)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSlots() }, [])

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelected(null)
    setMessage({ text: '', type: '' })
    if (date) fetchSlots(date)
  }

  // A slot is bookable on the selected date if:
  // - physical status is not 'unavailable'
  // - not already booked on that date
  const isAvailableOnDate = (slot) => {
    if (!selectedDate) return slot.status === 'available'
    if (slot.status === 'unavailable') return false
    return !bookedIds.includes(parseInt(slot.id))
  }

  const floorOptions = selBuilding === 'All'
    ? []
    : (buildings.find(b => b.name === selBuilding)?.floors || [])

  const handleBuildingChange = (val) => { setSelBuilding(val); setSelFloor('All') }

  const filtered = slots.filter(s => {
    const bMatch = selBuilding === 'All' || s.building_name === selBuilding
    const fMatch = selFloor    === 'All' || String(s.floor_id) === String(selFloor)
    return bMatch && fMatch
  })

  const grouped = filtered.reduce((acc, slot) => {
    const bKey = slot.building_name
    const fKey = `${slot.floor_id}`
    if (!acc[bKey]) acc[bKey] = {}
    if (!acc[bKey][fKey]) acc[bKey][fKey] = { floor_name: slot.floor_name, floor_number: slot.floor_number, slots: [] }
    acc[bKey][fKey].slots.push(slot)
    return acc
  }, {})

  const handleBook = async (e) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })
    setSubmitting(true)
    try {
      const res = await API.post('/createBooking.php', {
        slot_id:      selected.id,
        booking_date: selectedDate,
        start_time:   bookingForm.start_time,
        end_time:     bookingForm.end_time
      })
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' })
        setSelected(null)
        setBookingForm({ start_time: '', end_time: '' })
        fetchSlots(selectedDate)
      } else {
        setMessage({ text: res.data.message, type: 'error' })
      }
    } catch {
      setMessage({ text: 'Could not connect to server', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusClass = (slot) => {
    if (slot.status === 'unavailable') return 'slot-unavailable'
    if (selectedDate) return isAvailableOnDate(slot) ? 'slot-available' : 'slot-occupied'
    if (slot.status === 'available') return 'slot-available'
    return 'slot-occupied'
  }

  const getStatusLabel = (slot) => {
    if (slot.status === 'unavailable') return 'unavailable'
    if (selectedDate) return isAvailableOnDate(slot) ? 'available' : 'booked'
    return slot.status
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">Parking Slots</h1>

        {/* Date Picker — prominent, required first */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>Select a Date to Check Availability</h3>
          <div className="form-group-inline">
            <label>Date:</label>
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={(e) => handleDateChange(e.target.value)}
              style={{ fontSize: '1rem', padding: '6px 10px' }}
            />
            {selectedDate && (
              <button className="btn btn-sm btn-outline" style={{ marginLeft: '10px' }}
                onClick={() => { setSelectedDate(''); setSelected(null); fetchSlots() }}>
                Clear
              </button>
            )}
          </div>
          {!selectedDate && (
            <p style={{ color: '#888', marginTop: '8px', fontSize: '0.9rem' }}>
              Pick a date to see which slots are available for booking.
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="slot-stats">
          <span className="badge badge-green">✅ Available: {stats.available}</span>
          <span className="badge badge-red">🔴 Occupied: {stats.occupied}</span>
          <span className="badge badge-grey">⛔ Unavailable: {stats.unavailable}</span>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="form-group-inline">
            <label>Building:</label>
            <select value={selBuilding} onChange={(e) => handleBuildingChange(e.target.value)}>
              <option value="All">All Buildings</option>
              {buildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group-inline">
            <label>Floor:</label>
            <select value={selFloor} onChange={(e) => setSelFloor(e.target.value)} disabled={selBuilding === 'All'}>
              <option value="All">All Floors</option>
              {floorOptions.map(f => <option key={f.id} value={f.id}>{f.floor_name}</option>)}
            </select>
          </div>
        </div>

        {message.text && (
          <p className={message.type === 'success' ? 'success-msg' : 'error-msg'}>{message.text}</p>
        )}

        {/* Booking Form */}
        {selected && (
          <div className="card booking-form-card">
            <h3>Book Slot: {selected.slot_number} — {selected.building_name}, {selected.floor_name}</h3>
            <p style={{ color: '#555', marginBottom: '10px' }}>Date: <strong>{selectedDate}</strong></p>
            <form onSubmit={handleBook} className="booking-form">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={bookingForm.start_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={bookingForm.end_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Slots grouped by Building → Floor */}
        {loading ? <p>Loading slots...</p> : (
          Object.keys(grouped).length === 0
            ? <p>No slots found for selected filters.</p>
            : Object.entries(grouped).map(([bName, floors]) => (
              <div key={bName} className="building-section">
                <h2 className="building-title">🏢 {bName}</h2>
                {Object.entries(floors).map(([fId, floorData]) => (
                  <div key={fId} className="floor-section">
                    <h3 className="floor-title">📍 {floorData.floor_name}</h3>
                    <div className="slot-grid">
                      {floorData.slots.map(slot => (
                        <div key={slot.id} className={`slot-card ${getStatusClass(slot)}`}>
                          <div className="slot-number">{slot.slot_number}</div>
                          <div className={`slot-badge ${getStatusLabel(slot)}`}>{getStatusLabel(slot)}</div>
                          {selectedDate && isAvailableOnDate(slot) && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => { setSelected(slot); setMessage({ text: '', type: '' }) }}
                            >
                              Book
                            </button>
                          )}
                          {!selectedDate && slot.status === 'available' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => { setSelected(slot); setMessage({ text: '', type: '' }) }}
                              disabled
                              title="Select a date first"
                            >
                              Book
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
        )}
      </div>
    </>
  )
}

export default ParkingSlots
