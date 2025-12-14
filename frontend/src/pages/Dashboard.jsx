import React, { useEffect, useState } from 'react'
import FunnelChart from '../components/FunnelChart'
import api from '../services/api'
import { useRef } from 'react'

export default function Dashboard(){
  const [counts, setCounts] = useState({ACTIVE:0,HOUSED:0,WAITLIST:0})

  useEffect(()=>{
    async function load(){
      try{
        const clients = await api.getClients()
        const map = {ACTIVE:0,HOUSED:0,WAITLIST:0}
        clients.forEach(c => map[c.status] = (map[c.status]||0) + 1)
        setCounts(map)
      }catch(err){
        console.error(err)
      }
    }
    load()
    // WebSocket for live updates
    const ws = new WebSocket((import.meta.env.VITE_WS_BASE || 'ws://localhost:4000'));
    ws.addEventListener('message', async (ev) => {
      try{
        const msg = JSON.parse(ev.data)
        if (msg.type === 'interaction_created' || msg.type === 'client_updated'){
          const clients = await api.getClients()
          const map = {ACTIVE:0,HOUSED:0,WAITLIST:0}
          clients.forEach(c => map[c.status] = (map[c.status]||0) + 1)
          setCounts(map)
        }
      }catch(e){}
    })
    return ()=>{ try{ ws.close() }catch(e){} }
  },[])

  const data = [
    { name: 'Active', value: counts.ACTIVE, key: 'ACTIVE' },
    { name: 'Waitlist', value: counts.WAITLIST, key: 'WAITLIST' },
    { name: 'Housed', value: counts.HOUSED, key: 'HOUSED' }
  ]

  return (
    <div className="container">
      <div className="card header">
        <div>
          <div className="title">Dashboard</div>
          <div style={{color:'#6b7280'}}>Overview of client funnel and quick stats</div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat card">
          <div style={{fontWeight:700}}>{counts.ACTIVE}</div>
          <div style={{color:'#6b7280'}}>Active clients</div>
        </div>
        <div className="stat card">
          <div style={{fontWeight:700}}>{counts.HOUSED}</div>
          <div style={{color:'#6b7280'}}>Housed</div>
        </div>
        <div className="stat card">
          <div style={{fontWeight:700}}>{counts.WAITLIST}</div>
          <div style={{color:'#6b7280'}}>Waitlist</div>
        </div>
      </div>

      <FunnelChart data={data} />
    </div>
  )
}
