import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../services/api'

function Register() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '', vehicle_number: '', vehicle_type: 'Bike' })
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')
    setSuccess(false)

    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      setMessage('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await API.post('/register.php', {
        name:           form.name,
        email:          form.email,
        password:       form.password,
        vehicle_number: form.vehicle_number,
        vehicle_type:   form.vehicle_type
      })
      if (res.data.success) {
        setSuccess(true)
        setMessage(res.data.message)
        setTimeout(() => navigate('/'), 1500)
      } else {
        setMessage(res.data.message)
      }
    } catch (err) {
      setMessage('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">🅿 ParkEase</div>
        <p className="auth-subtitle">Campus Parking Slot Reservation</p>
        <h2>Register</h2>
        {message && <p className={success ? 'success-msg' : 'error-msg'}>{message}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="your@college.edu" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Vehicle Number</label>
            <input type="text" name="vehicle_number" placeholder="e.g. TN01AB1234" value={form.vehicle_number} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Vehicle Type</label>
            <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange}>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirm" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
