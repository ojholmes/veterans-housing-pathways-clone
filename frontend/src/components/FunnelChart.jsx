import React, { useEffect, useState } from 'react'

// True funnel SVG visualization for client statuses: expects data: [{ name:'Active', value: 10, key: 'ACTIVE' }, ...]
export default function FunnelChart({ data }){
  const [mounted, setMounted] = useState(false)
  const key = JSON.stringify(data)
  // animate on mount and when data changes
  useEffect(()=>{
    setMounted(false)
    const t = setTimeout(()=>setMounted(true),80)
    return ()=>clearTimeout(t)
  },[key])

  const total = data.reduce((s,d)=>s + (d.value||0), 0) || 1
  const colors = { ACTIVE:'#0b4a76', WAITLIST:'#f59e0b', HOUSED:'#10b981' }

  // compute widths proportional to values (top wide -> bottom narrow)
  const baseWidth = 760
  const heights = 64
  const sections = data.map((d,i) => {
    const ratio = d.value ? d.value/total : 0
    const w = Math.max(64, Math.round(Math.max(0.12, ratio) * baseWidth))
    return { ...d, width: w }
  })

  // center each section
  let y = 0

  return (
    <div className="card" style={{padding:12}}>
      <h4 style={{margin:0}}>Client Status Funnel</h4>
      <div style={{overflowX:'auto',paddingTop:12}}>
        <svg width={Math.min(baseWidth+40, 800)} height={heights * sections.length} role="img" aria-label="Client status funnel">
          {sections.map((s, idx) => {
            const topW = s.width
            const next = sections[idx+1]
            const bottomW = next ? next.width : Math.max(40, Math.round(s.width * 0.6))
            const xTop = (800 - topW) / 2
            const xBottom = (800 - bottomW) / 2
            const points = `${xTop},${y} ${xTop+topW},${y} ${xBottom+bottomW},${y+heights} ${xBottom},${y+heights}`
            const color = colors[s.key] || '#0b4a76'
            const labelX = 24
            const labelY = y + heights/2 + 6
            const transformY = mounted ? 0 : 18
            const opacity = mounted ? 1 : 0
            const delay = idx * 90
            y += heights
            return (
              <g key={s.key} style={{transition: `transform 640ms cubic-bezier(.2,.9,.2,1) ${delay}ms, opacity 480ms ease ${delay}ms`, transform: `translateY(${transformY}px)`, opacity}}>
                <polygon points={points} fill={color} opacity={0.96} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
                <text x={labelX} y={labelY} style={{fill:'#fff',fontWeight:700,fontSize:14}}>{s.name} — {s.value}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
