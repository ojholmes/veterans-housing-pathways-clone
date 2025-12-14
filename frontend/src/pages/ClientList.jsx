import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ClientList(){
  const [clients,setClients] = useState([])
  const [query,setQuery] = useState('')
  const [statusFilter,setStatusFilter] = useState('ALL')

  useEffect(()=>{ load() },[])
  async function load(){
    try{
      const res = await api.getClients()
      setClients(res)
    }catch(err){ console.error(err) }
  }

  const filtered = clients.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
    if (query && !c.fullName.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <div className="container">
      <div className="card header">
        <div>
          <div className="title">Clients</div>
          <div style={{color:'#6b7280'}}>Search, filter and view client details</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name" style={{padding:8,borderRadius:8,border:'1px solid #e6eef6'}} />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="HOUSED">Housed</option>
            <option value="WAITLIST">Waitlist</option>
          </select>
        </div>
      </div>

      {filtered.map(c => (
        <Link key={c.id} to={`/clients/${c.id}`} style={{textDecoration:'none',color:'inherit'}}>
          <div className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:700}}>{c.fullName}</div>
              <div style={{color:'#6b7280'}}>{c.housingSituation} · {c.phone}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontWeight:700}}>{c.status}</div>
              <div style={{color:'#6b7280'}}>{c.assignedNavigator?.fullName || 'Unassigned'}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
