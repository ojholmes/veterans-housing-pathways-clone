import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar(){
  const { user, logout } = useAuth()

  return (
    <nav className="nav container" role="navigation">
      <div style={{fontWeight:700,color:'#0b4a76'}}>Veterans Housing Pathways</div>
      <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center'}}>
        <NavLink to="/" end className={({isActive}) => isActive? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/clients" className={({isActive}) => isActive? 'active' : ''}>Clients</NavLink>
        <NavLink to="/navigator-performance" className={({isActive}) => isActive? 'active' : ''}>Navigator Performance</NavLink>
        <NavLink to="/landlord-performance" className={({isActive}) => isActive? 'active' : ''}>Landlord Performance</NavLink>
        <NavLink to="/ws-demo" className={({isActive}) => isActive? 'active' : ''}>WS Demo</NavLink>
        <NavLink to="/templates" className={({isActive}) => isActive? 'active' : ''}>Templates</NavLink>
        {user ? (
          <>
            <div style={{padding:'6px 10px',borderRadius:6,background:'#eef6fb',color:'#0b4a76'}}>{user.fullName || user.email}</div>
            <button onClick={logout} style={{background:'transparent',border:'none',color:'#0b4a76',cursor:'pointer'}}>Sign out</button>
          </>
        ) : (
          <NavLink to="/login" className={({isActive}) => isActive? 'active' : ''}>Sign in</NavLink>
        )}
      </div>
    </nav>
  )
}
