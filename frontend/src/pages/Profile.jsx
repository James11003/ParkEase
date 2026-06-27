import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import API from '../services/api'

function Profile() {
  const [profile,  setProfile]  = useState(null)
  const [form,     setForm]     = useState({ name: '', vehicle_number: '', vehicle_type: 'Bike' })
  const [editing,  setEditing]  = useState(false)
  const [message,  setMessage]  = useState({ text: '', type: '' })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/getProfile.php')
        if (res.data.success) {
          setProfile(res.data)
          setForm({
            name:           res.data.user.name,
            vehicle_number: res.data.user.vehicle_number,
            vehicle_type:   res.data.user.vehicle_type
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })
    setSaving(true)
    try {
      const res = await API.post('/updateProfile.php', form)
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' })
        // Update localStorage too
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...stored, name: form.name, vehicle_number: form.vehicle_number, vehicle_type: form.vehicle_type }))
        setEditing(false)
        setProfile(prev => ({ ...prev, user: { ...prev.user, ...form } }))
      } else {
        setMessage({ text: res.data.message, type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Could not connect to server', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <><Navbar /><div className="container"><p>Loading...</p></div></>

  const { user, booking_counts } = profile

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">My Profile</h1>

        {message.text && (
          <p className={message.type === 'success' ? 'success-msg' : 'error-msg'}>{message.text}</p>
        )}

        {/* Booking stats */}
        <div className="stat-grid" style={{ marginBottom: '20px' }}>
          <div className="stat-card green">
            <div className="stat-number">{booking_counts.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-number">{booking_counts.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card red">
            <div className="stat-number">{booking_counts.cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header-row">
            <h3>Personal Details</h3>
            {!editing && (
              <button className="btn btn-sm btn-outline" onClick={() => setEditing(true)}>Edit</button>
            )}
          </div>

          {!editing ? (
            <table className="simple-table">
              <tbody>
                <tr><td><strong>Name</strong></td><td>{user.name}</td></tr>
                <tr><td><strong>Email</strong></td><td>{user.email}</td></tr>
                <tr><td><strong>Role</strong></td><td style={{ textTransform: 'capitalize' }}>{user.role}</td></tr>
                <tr><td><strong>Vehicle No.</strong></td><td>{user.vehicle_number}</td></tr>
                <tr><td><strong>Vehicle Type</strong></td><td>{user.vehicle_type}</td></tr>
                <tr><td><strong>Joined</strong></td><td>{new Date(user.created_at).toLocaleDateString()}</td></tr>
              </tbody>
            </table>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Vehicle Number</label>
                <input type="text" value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Vehicle Type</label>
                <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
                  <option value="Bike">Bike</option>
                  <option value="Car">Car</option>
                </select>
              </div>
              <div className="form-row">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

export default Profile
