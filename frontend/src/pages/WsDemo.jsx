import React, { useEffect, useState } from 'react'

export default function WsDemo(){
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState('disconnected')

  useEffect(()=>{
    const ws = new WebSocket((import.meta.env.VITE_WS_BASE || 'ws://localhost:4000'))
    ws.addEventListener('open', () => setStatus('connected'))
    ws.addEventListener('close', () => setStatus('closed'))
    ws.addEventListener('message', (ev)=>{
      try{
        const msg = JSON.parse(ev.data)
        setEvents(prev => [msg].concat(prev).slice(0,50))
      }catch(e){ console.error(e) }
    })
    return ()=>{ try{ ws.close() }catch(e){} }
  },[])

  return (
    <div className="container">
      <div className="card header">
        <div>
          <div className="title">WebSocket Demo</div>
          <div style={{color:'#6b7280'}}>Live events from the backend</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:700}}>{status}</div>
        </div>
      </div>

      <div className="card">
        <div style={{fontWeight:700}}>Recent events</div>
        <div style={{marginTop:8}}>
          {events.map((e, i) => (
            <pre key={i} style={{background:'#f8fafc',padding:8,borderRadius:8,overflow:'auto'}}>{JSON.stringify(e,null,2)}</pre>
          ))}
        </div>
      </div>
    </div>
  )
}
