import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'

function Dashboard() {
  const user         = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats,      setStats]      = useState(null)
  const [activeBook, setActiveBook] = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotsRes, histRes] = await Promise.all([
          API.get('/getSlots.php'),
          API.get('/bookingHistory.php')
        ])
        if (slotsRes.data.success) setStats(slotsRes.data.stats)
        if (histRes.data.success) {
          const active = histRes.data.bookings.find(b => b.booking_status === 'active')
          setActiveBook(active || null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">Welcome, {user.name}!</h1>
        <p className="page-sub">Manage your campus parking from here.</p>

        {/* Active Booking Alert */}
        {activeBook && (
          <div className="alert alert-info">
            <strong>Active Booking:</strong> Slot <strong>{activeBook.slot_number}</strong> —
            {' '}{activeBook.building_name}, {activeBook.floor_name} |
            {' '}{activeBook.booking_date} from {activeBook.start_time} to {activeBook.end_time}
            <Link to="/history" className="btn btn-sm btn-outline" style={{ marginLeft: '12px' }}>Manage</Link>
          </div>
        )}

        {/* Stats Cards */}
        {loading ? <p>Loading...</p> : stats && (
          <div className="stat-grid">
            <div className="stat-card green">
              <div className="stat-number">{stats.available}</div>
              <div className="stat-label">Available Slots</div>
            </div>
            <div className="stat-card red">
              <div className="stat-number">{stats.occupied}</div>
              <div className="stat-label">Occupied Slots</div>
            </div>
            <div className="stat-card grey">
              <div className="stat-number">{stats.unavailable}</div>
              <div className="stat-label">Unavailable</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Slots</div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="quick-links">
          <h3>Quick Actions</h3>
          <div className="quick-grid">
            <Link to="/slots" className="quick-card">
              <span className="quick-icon">🅿</span>
              <span>Book a Slot</span>
            </Link>
            <Link to="/history" className="quick-card">
              <span className="quick-icon">📋</span>
              <span>My Bookings</span>
            </Link>
            <Link to="/profile" className="quick-card">
              <span className="quick-icon">👤</span>
              <span>My Profile</span>
            </Link>
          </div>
        </div>

        {/* User info card */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Your Vehicle Info</h3>
          <table className="simple-table">
            <tbody>
              <tr><td><strong>Name</strong></td><td>{user.name}</td></tr>
              <tr><td><strong>Email</strong></td><td>{user.email}</td></tr>
              <tr><td><strong>Vehicle No.</strong></td><td>{user.vehicle_number}</td></tr>
              <tr><td><strong>Vehicle Type</strong></td><td>{user.vehicle_type}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Dashboard
