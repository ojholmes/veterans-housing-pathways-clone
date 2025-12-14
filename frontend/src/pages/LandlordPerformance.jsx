import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function LandlordPerformance(){
  const [data,setData] = useState([])

  useEffect(()=>{ load() },[])

  async function load(){
    try{
      const res = await api.getLandlordPerformance()
      setData(res)
    }catch(err){ console.error(err) }
  }

  return (
    <div className="container">
      <div className="card header">
        <div>
          <div className="title">Landlord Performance</div>
          <div style={{color:'#6b7280'}}>Track placements, average lease durations, and responsiveness</div>
        </div>
      </div>

      {data.map(item => (
        <div className="card" key={item.landlord.id}>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:700}}>{item.landlord.propertyName}</div>
              <div style={{color:'#6b7280'}}>{item.landlord.contactPerson} · {item.landlord.phone}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontWeight:700}}>{item.placements}</div>
              <div style={{color:'#6b7280'}}>Placements</div>
            </div>
          </div>
          <div style={{marginTop:8,display:'flex',gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:'#6b7280'}}>Avg lease (months)</div>
              <div style={{fontWeight:700}}>{item.avgLeaseDurationMonths ?? 'N/A'}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:'#6b7280'}}>Responsiveness</div>
              <div style={{fontWeight:700}}>{item.responsivenessScore ?? 'N/A'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
