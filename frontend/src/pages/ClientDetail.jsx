import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function ClientDetail(){
  const { id } = useParams()
  const [client,setClient] = useState(null)

  useEffect(()=>{ load() },[id])
  async function load(){
    try{
      const res = await api.getClient(id)
      setClient(res)
    }catch(err){ console.error(err) }
  }

  if (!client) return <div className="container"><div className="card">Loading...</div></div>

  return (
    <div className="container">
      <div className="card header">
        <div>
          <div className="title">{client.fullName}</div>
          <div style={{color:'#6b7280'}}>{client.housingSituation} · {client.phone} · {client.email}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:700}}>{client.status}</div>
          <div style={{color:'#6b7280'}}>{client.assignedNavigator?.fullName || 'Unassigned'}</div>
        </div>
      </div>

      <div className="card">
        <div style={{fontWeight:700}}>Interactions</div>
        {client.interactions.length === 0 && <div style={{color:'#6b7280',marginTop:8}}>No interactions yet.</div>}
        {client.interactions.map(it => (
          <div key={it.id} style={{marginTop:10,borderTop:'1px dashed #eef6fb',paddingTop:8}}>
            <div style={{fontSize:12,color:'#6b7280'}}>{new Date(it.dateTime).toLocaleString()} · {it.contactType} · {it.actor}</div>
            <div style={{fontWeight:700}}>{it.progressSummary}</div>
            {it.aiSummary && <div style={{marginTop:6,color:'#374151'}}>AI: {it.aiSummary}</div>}
          </div>
        ))}
      </div>
      
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:700}}>Add Interaction / Quick Contact</div>
          <div>
            <button onClick={async ()=>{
              try{
                await api.markClientContact(client.id, { progressSummary: 'Quick check-in via app' })
                const updated = await api.getClient(client.id)
                setClient(updated)
              }catch(err){ console.error(err) }
            }} style={{background:'#0b4a76',color:'white',padding:'8px 12px',borderRadius:8,border:'none'}}>Mark Contact Done</button>
          </div>
        </div>

        <InteractionForm clientId={client.id} onSaved={async ()=>{ const updated = await api.getClient(client.id); setClient(updated); }} />
      </div>
    </div>
  )
}

function InteractionForm({ clientId, onSaved }){
  const [contactType,setContactType] = React.useState('phone')
  const [serviceType,setServiceType] = React.useState('case_management')
  const [duration,setDuration] = React.useState(15)
  const [summary,setSummary] = React.useState('')
  const [loading,setLoading] = React.useState(false)

  async function submit(e){
    e && e.preventDefault()
    setLoading(true)
    try{
      await api.postInteraction({ clientId, contactType, serviceType, durationMins: Number(duration), progressSummary: summary, actor: 'NAVIGATOR' })
      setSummary('')
      setDuration(15)
      onSaved && onSaved()
    }catch(err){ console.error(err) }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} style={{marginTop:12,display:'grid',gap:8}}>
      <div style={{display:'flex',gap:8}}>
        <select value={contactType} onChange={e=>setContactType(e.target.value)}>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
          <option value="in_person">In-person</option>
        </select>
        <select value={serviceType} onChange={e=>setServiceType(e.target.value)}>
          <option value="case_management">Case Management</option>
          <option value="referral">Referral</option>
          <option value="placement">Placement</option>
        </select>
        <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} style={{width:90}} />
      </div>
      <textarea placeholder="Progress summary" value={summary} onChange={e=>setSummary(e.target.value)} rows={3} style={{padding:8,borderRadius:8}} />
      <div>
        <button type="submit" disabled={loading} style={{background:'#0b4a76',color:'white',padding:'8px 12px',borderRadius:8,border:'none'}}>Save Interaction</button>
      </div>
    </form>
  )
}
