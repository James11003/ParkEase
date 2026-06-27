import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../services/api'

function BookingHistory() {
  const [bookings,    setBookings]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [message,     setMessage]     = useState('')
  const [cancelling,  setCancelling]  = useState(null)

  const fetchHistory = async () => {
    try {
      const res = await API.get('/bookingHistory.php')
      if (res.data.success) setBookings(res.data.bookings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(bookingId)
    setMessage('')
    try {
      const res = await API.post('/cancelBooking.php', { booking_id: bookingId })
      if (res.data.success) {
        setMessage(res.data.message)
        fetchHistory()
      } else {
        setMessage(res.data.message)
      }
    } catch (err) {
      setMessage('Could not connect to server')
    } finally {
      setCancelling(null)
    }
  }

  const statusBadge = (status) => {
    const cls = { active: 'badge-green', cancelled: 'badge-red', completed: 'badge-grey' }
    return <span className={`badge ${cls[status] || ''}`}>{status}</span>
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">My Booking History</h1>
        {message && <p className="success-msg">{message}</p>}

        {loading ? <p>Loading...</p> : bookings.length === 0 ? (
          <div className="card">
            <p>No bookings found. <a href="/slots">Book a slot now!</a></p>
          </div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Slot</th>
                  <th>Building</th>
                  <th>Floor</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td><strong>{b.slot_number}</strong></td>
                    <td>{b.building_name}</td>
                    <td>{b.floor_name}</td>
                    <td>{b.booking_date}</td>
                    <td>{b.start_time}</td>
                    <td>{b.end_time}</td>
                    <td>{statusBadge(b.booking_status)}</td>
                    <td>
                      {b.booking_status === 'active' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancel(b.id)}
                          disabled={cancelling === b.id}
                        >
                          {cancelling === b.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default BookingHistory
