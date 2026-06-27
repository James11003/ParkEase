import { Link, useNavigate, useLocation } from 'react-router-dom'
import API from '../services/api'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = async () => {
    try { await API.post('/logout.php') } catch (e) {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="nav-brand">🅿 ParkEase</div>
      <div className="nav-links">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        <Link to="/slots"     className={isActive('/slots')}>Slots</Link>
        <Link to="/history"   className={isActive('/history')}>My Bookings</Link>
        <Link to="/profile"   className={isActive('/profile')}>Profile</Link>
        {user.role === 'admin' && (
          <Link to="/admin" className={isActive('/admin')}>Admin</Link>
        )}
        <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
      </div>
    </nav>
  )
}

export default Navbar
