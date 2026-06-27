import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import API from '../../services/api'

function AdminDashboard() {
  const [tab,          setTab]          = useState('overview')
  const [slots,        setSlots]        = useState([])
  const [buildings,    setBuildings]    = useState([])
  const [stats,        setStats]        = useState({})
  const [reservations, setReservations] = useState([])
  const [users,        setUsers]        = useState([])
  const [search,       setSearch]       = useState('')
  const [message,      setMessage]      = useState({ text: '', type: '' })
  const [loading,      setLoading]      = useState(false)

  // Slots accordion open state
  const [openBuildings, setOpenBuildings] = useState({})
  const [openFloors,    setOpenFloors]    = useState({})

  const toggleBuilding = (id) => setOpenBuildings(p => ({ ...p, [id]: !p[id] }))
  const toggleFloor    = (id) => setOpenFloors(p =>    ({ ...p, [id]: !p[id] }))

  // Add Building form
  const [newBuilding, setNewBuilding] = useState('')

  // Edit Building
  const [editBuilding, setEditBuilding] = useState(null) // { id, name }

  // Edit Floor
  const [editFloor, setEditFloor] = useState(null) // { id, floor_name }

  // Add Floor form
  const [newFloor, setNewFloor] = useState({ building_id: '', floor_number: '', floor_name: '' })

  // Add Slot form
  const [newSlot, setNewSlot] = useState({ floor_id: '', slot_number: '' })

  // Floors for selected building in add-slot form
  const floorOptions = newSlot.floor_id
    ? buildings.find(b => b.floors?.some(f => String(f.id) === String(newSlot.floor_id)))?.floors || []
    : []

  const allFloors = buildings.flatMap(b => b.floors?.map(f => ({ ...f, building_name: b.name })) || [])

  useEffect(() => { fetchAll() }, [])

  const fetchAll = () => {
    fetchSlotsAndBuildings()
    fetchReservations()
    fetchUsers()
  }

  const fetchSlotsAndBuildings = async () => {
    try {
      const res = await API.get('/getSlots.php')
      if (res.data.success) {
        setSlots(res.data.slots)
        setBuildings(res.data.buildings)
        setStats(res.data.stats)
      }
    } catch (e) {}
  }

  const fetchReservations = async (q = '') => {
    try {
      const res = await API.get(`/adminGetReservations.php${q ? '?search=' + q : ''}`)
      if (res.data.success) setReservations(res.data.bookings)
    } catch (e) {}
  }

  const fetchUsers = async () => {
    try {
      const res = await API.get('/adminGetUsers.php')
      if (res.data.success) setUsers(res.data.users)
    } catch (e) {}
  }

  const showMsg = (text, type = 'success') => setMessage({ text, type })

  // ── Add Building ──────────────────────────────────────────────
  const handleAddBuilding = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/adminAddBuilding.php', { name: newBuilding })
      showMsg(res.data.message, res.data.success ? 'success' : 'error')
      if (res.data.success) { setNewBuilding(''); fetchSlotsAndBuildings() }
    } catch { showMsg('Server error', 'error') }
    finally { setLoading(false) }
  }

  // ── Delete Building ──────────────────────────────────────────
  const handleDeleteBuilding = async (building) => {
    if (!window.confirm(`Delete "${building.name}"? This will remove all its floors, slots, and cancel any active bookings.`)) return
    try {
      const res = await API.post('/adminDeleteBuilding.php', { building_id: building.id })
      showMsg(res.data.message, res.data.success ? 'success' : 'error')
      if (res.data.success) { fetchSlotsAndBuildings(); fetchReservations() }
    } catch { showMsg('Server error', 'error') }
  }

  // ── Edit Building ────────────────────────────────────────────
  const handleEditBuilding = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/adminEditBuilding.php', { building_id: editBuilding.id, name: editBuilding.name })
      showMsg(res.data.message, res.data.success ? 'success' : 'error')
      if (res.data.success) { setEditBuilding(null); fetchSlotsAndBuildings() }
    } catch { showMsg('Server error', 'error') }
  }

  // ── Edit Floor ───────────────────────────────────────────────
  const handleEditFloor = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/adminEditFloor.php', { floor_id: editFloor.id, floor_name: editFloor.floor_name })
      showMsg(res.data.message, res.data.success ? 'success' : 'error')
      if (res.data.success) { setEditFloor(null); fetchSlotsAndBuildings() }
    } catch { showMsg('Server error', 'error') }
  }

  // ── Add Floor ────────────────────────────────────────────────
  const handleAddFloor = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/adminAddFloor.php', {
        building_id:  parseInt(newFloor.building_id),
        floor_number: parseInt(newFloor.floor_number),
        floor_name:   newFloor.floor_name
      })
      showMsg(res.data.message, res.data.success ? 'success' : 'error')
      if (res.data.success) { setNewFloor({ building_id: '', floor_number: '', floor_name: '' }); fetchSlotsAndBuildings() }
    } catch { showMsg('Server error', 'error') }
    finally { setLoading(false) }
  }

  // ── Add Slot ─────────────────────────────────────────────────
  const handleAddSlot = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/adminAddSlot.php', {
        floor_id:    parseInt(newSlot.floor_id),
        slot_number: newSlot.slot_number
      })
      showMsg(res.data.message, res.data.success ? 'success' : 'error')
      if (res.data.success) { setNewSlot({ floor_id: '', slot_number: '' }); fetchSlotsAndBuildings() }
    } catch { showMsg('Server error', 'error') }
    finally { setLoading(false) }
  }

  // ── Slot actions ─────────────────────────────────────────────
  const handleSlotAction = async (slot_id, action, status = '') => {
    setMessage({ text: '', type: '' })
    try {
      const res = await API.post('/adminManageSlots.php', { action, slot_id, status })
      showMsg(res.data.message, res.data.success ? 'success' : 'error')
      if (res.data.success) { fetchSlotsAndBuildings(); fetchReservations() }
    } catch { showMsg('Server error', 'error') }
  }

  const statusBadge = (status) => {
    const map = {
      active: 'badge-green', cancelled: 'badge-red', completed: 'badge-grey',
      available: 'badge-green', occupied: 'badge-red', unavailable: 'badge-grey'
    }
    return <span className={`badge ${map[status] || ''}`}>{status}</span>
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="tabs">
          {['overview', 'buildings', 'slots', 'reservations', 'users'].map(t => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); setMessage({ text: '', type: '' }) }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {message.text && (
          <p className={message.type === 'success' ? 'success-msg' : 'error-msg'}>{message.text}</p>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="stat-grid">
              <div className="stat-card green">
                <div className="stat-number">{stats.available  ?? 0}</div>
                <div className="stat-label">Available</div>
              </div>
              <div className="stat-card red">
                <div className="stat-number">{stats.occupied   ?? 0}</div>
                <div className="stat-label">Occupied</div>
              </div>
              <div className="stat-card grey">
                <div className="stat-number">{stats.unavailable ?? 0}</div>
                <div className="stat-label">Unavailable</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-number">{stats.total      ?? 0}</div>
                <div className="stat-label">Total Slots</div>
              </div>
            </div>
            <div className="stat-grid" style={{ marginTop: '12px' }}>
              <div className="stat-card blue">
                <div className="stat-number">{buildings.length}</div>
                <div className="stat-label">Buildings</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-number">{allFloors.length}</div>
                <div className="stat-label">Total Floors</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-number">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card green">
                <div className="stat-number">{reservations.filter(r => r.booking_status === 'active').length}</div>
                <div className="stat-label">Active Bookings</div>
              </div>
            </div>
          </>
        )}

        {/* ── BUILDINGS ── */}
        {tab === 'buildings' && (
          <>
            {/* Add Building */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Add New Building</h3>
              <form onSubmit={handleAddBuilding} className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Building Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Block D"
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Building'}
                  </button>
                </div>
              </form>
            </div>

            {/* Add Floor */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Add Floor to Building</h3>
              <form onSubmit={handleAddFloor} className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Building</label>
                  <select
                    value={newFloor.building_id}
                    onChange={(e) => setNewFloor({ ...newFloor, building_id: e.target.value })}
                    required
                  >
                    <option value="">Select Building</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Floor Number</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    min="1"
                    value={newFloor.floor_number}
                    onChange={(e) => setNewFloor({ ...newFloor, floor_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Floor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Floor 4"
                    value={newFloor.floor_name}
                    onChange={(e) => setNewFloor({ ...newFloor, floor_name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Floor'}
                  </button>
                </div>
              </form>
            </div>

            {/* Buildings overview */}
            {buildings.map(b => (
              <div key={b.id} className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  {editBuilding?.id === b.id ? (
                    <form onSubmit={handleEditBuilding} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        value={editBuilding.name}
                        onChange={(e) => setEditBuilding({ ...editBuilding, name: e.target.value })}
                        style={{ fontSize: '1rem', padding: '4px 8px' }}
                        required
                      />
                      <button type="submit" className="btn btn-sm btn-primary">Save</button>
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditBuilding(null)}>Cancel</button>
                    </form>
                  ) : (
                    <h3 style={{ margin: 0 }}>🏢 {b.name}</h3>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {editBuilding?.id !== b.id && (
                      <button className="btn btn-sm btn-outline" onClick={() => setEditBuilding({ id: b.id, name: b.name })}>Edit Name</button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBuilding(b)}>Delete</button>
                  </div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Floor Number</th><th>Floor Name</th><th>Slots</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {(b.floors || []).map(f => {
                      const count = slots.filter(s => String(s.floor_id) === String(f.id)).length
                      return (
                        <tr key={f.id}>
                          <td>Floor {f.floor_number}</td>
                          <td>
                            {editFloor?.id === f.id ? (
                              <form onSubmit={handleEditFloor} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  value={editFloor.floor_name}
                                  onChange={(e) => setEditFloor({ ...editFloor, floor_name: e.target.value })}
                                  style={{ padding: '2px 6px' }}
                                  required
                                />
                                <button type="submit" className="btn btn-sm btn-primary">Save</button>
                                <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditFloor(null)}>Cancel</button>
                              </form>
                            ) : (
                              f.floor_name
                            )}
                          </td>
                          <td>{count} slots</td>
                          <td>
                            {editFloor?.id !== f.id && (
                              <button className="btn btn-sm btn-outline" onClick={() => setEditFloor({ id: f.id, floor_name: f.floor_name })}>
                                Edit Name
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {(!b.floors || b.floors.length === 0) && (
                      <tr><td colSpan="4" style={{ textAlign: 'center' }}>No floors added yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}

        {/* ── SLOTS ── */}
        {tab === 'slots' && (
          <>
            {/* Add Slot */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Add New Slot</h3>
              <form onSubmit={handleAddSlot} className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Floor</label>
                  <select
                    value={newSlot.floor_id}
                    onChange={(e) => setNewSlot({ ...newSlot, floor_id: e.target.value })}
                    required
                  >
                    <option value="">Select Floor</option>
                    {allFloors.map(f => (
                      <option key={f.id} value={f.id}>{f.building_name} — {f.floor_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Slot Number</label>
                  <input
                    type="text"
                    placeholder="e.g. A-GF-26"
                    value={newSlot.slot_number}
                    onChange={(e) => setNewSlot({ ...newSlot, slot_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Slot'}
                  </button>
                </div>
              </form>
            </div>

            {/* Slots — collapsible Building → Floor → Slots */}
            {buildings.map(b => {
              const bOpen = !!openBuildings[b.id]
              const totalSlots = slots.filter(s => (b.floors || []).some(f => String(f.id) === String(s.floor_id))).length
              return (
                <div key={b.id} className="card" style={{ marginBottom: '12px', padding: 0, overflow: 'hidden' }}>
                  {/* Building row */}
                  <div
                    onClick={() => toggleBuilding(b.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                             padding: '12px 16px', cursor: 'pointer', background: '#f0f4ff',
                             borderBottom: bOpen ? '1px solid #dde3f0' : 'none' }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>🏢 {b.name}</span>
                    <span style={{ color: '#666', fontSize: '0.85rem' }}>
                      {(b.floors || []).length} floors · {totalSlots} slots &nbsp;
                      <span style={{ fontSize: '1rem' }}>{bOpen ? '▲' : '▼'}</span>
                    </span>
                  </div>

                  {bOpen && (b.floors || []).map(f => {
                    const fOpen = !!openFloors[f.id]
                    const floorSlots = slots.filter(s => String(s.floor_id) === String(f.id))
                    return (
                      <div key={f.id} style={{ borderBottom: '1px solid #eee' }}>
                        {/* Floor row */}
                        <div
                          onClick={() => toggleFloor(f.id)}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                   padding: '10px 24px', cursor: 'pointer', background: '#fafbff' }}
                        >
                          <span style={{ fontWeight: 500 }}>📍 {f.floor_name}</span>
                          <span style={{ color: '#666', fontSize: '0.85rem' }}>
                            {floorSlots.length} slots &nbsp;
                            <span style={{ fontSize: '0.9rem' }}>{fOpen ? '▲' : '▼'}</span>
                          </span>
                        </div>

                        {fOpen && (
                          <div style={{ padding: '0 24px 16px' }}>
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th>Slot No.</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {floorSlots.map(slot => (
                                  <tr key={slot.id}>
                                    <td><strong>{slot.slot_number}</strong></td>
                                    <td>{statusBadge(slot.status)}</td>
                                    <td className="action-btns">
                                      {slot.status !== 'available' && (
                                        <button className="btn btn-sm btn-outline" onClick={() => handleSlotAction(slot.id, 'set_status', 'available')}>
                                          Set Available
                                        </button>
                                      )}
                                      {slot.status !== 'unavailable' && (
                                        <button className="btn btn-sm btn-outline" onClick={() => handleSlotAction(slot.id, 'set_status', 'unavailable')}>
                                          Set Unavailable
                                        </button>
                                      )}
                                      <button className="btn btn-sm btn-danger" onClick={() => {
                                        if (window.confirm('Delete this slot?')) handleSlotAction(slot.id, 'delete')
                                      }}>
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {floorSlots.length === 0 && (
                                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No slots on this floor</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </>
        )}

        {/* ── RESERVATIONS ── */}
        {tab === 'reservations' && (
          <div className="card">
            <div className="card-header-row">
              <h3>All Reservations ({reservations.length})</h3>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by name, email, slot, building..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-sm btn-primary" onClick={() => fetchReservations(search)}>Search</button>
                <button className="btn btn-sm btn-outline" onClick={() => { setSearch(''); fetchReservations() }}>Reset</button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Vehicle No.</th>
                  <th>Slot</th>
                  <th>Building</th>
                  <th>Floor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{r.user_name}</strong><br />
                      <small>{r.email}</small>
                    </td>
                    <td>{r.vehicle_number}</td>
                    <td>{r.slot_number}</td>
                    <td>{r.building_name}</td>
                    <td>{r.floor_name}</td>
                    <td>{r.booking_date}</td>
                    <td>{r.start_time} – {r.end_time}</td>
                    <td>{statusBadge(r.booking_status)}</td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: 'center' }}>No reservations found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="card">
            <h3>Registered Users ({users.length})</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Vehicle No.</th>
                  <th>Vehicle Type</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-green'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.vehicle_number}</td>
                    <td>{u.vehicle_type}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
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

export default AdminDashboard
