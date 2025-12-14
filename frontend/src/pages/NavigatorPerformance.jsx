import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function NavigatorPerformance(){
  const [data,setData] = useState([])
  const [days,setDays] = useState(30)

  useEffect(()=>{
    load()
  },[days])

  async function load(){
    try{
      const res = await api.getNavigatorPerformance(days)
      setData(res)
    }catch(err){
      console.error(err)
    }
  }

  return (
    <div className="container">
      <div className="card header">
        <div>
          <div className="title">Navigator Performance</div>
          <div style={{color:'#6b7280'}}>Active clients, interactions in last {days} days, and avg days since contact</div>
        </div>
        <div>
          <label style={{color:'#6b7280'}}>Period (days)</label>
          <select value={days} onChange={e=>setDays(Number(e.target.value))}>
            <option value={7}>7</option>
            <option value={30}>30</option>
            <option value={90}>90</option>
          </select>
        </div>
      </div>

      {data.map(d => (
        <div className="card" key={d.navigator.id}>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:700}}>{d.navigator.fullName}</div>
              <div style={{color:'#6b7280'}}>{d.navigator.email}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontWeight:700}}>{d.activeClients}</div>
              <div style={{color:'#6b7280'}}>Active clients</div>
            </div>
          </div>
          <div style={{marginTop:8,display:'flex',gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:'#6b7280'}}>Interactions ({days}d)</div>
              <div style={{fontWeight:700}}>{d.interactionsCount}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:'#6b7280'}}>Avg days since last contact</div>
              <div style={{fontWeight:700}}>{d.avgDaysSinceLastContact ? d.avgDaysSinceLastContact.toFixed(1) : 'N/A'}</div>
            </div>
          </div>
        </div>
      ))}

    </div>
  )
}
