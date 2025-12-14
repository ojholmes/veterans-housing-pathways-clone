import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function TemplateManager(){
  const [templates, setTemplates] = useState([])
  const [editing, setEditing] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')

  async function load(){
    try{
      const list = await api.listTemplates()
      setTemplates(list)
    }catch(err){
      console.error(err)
      setError(err.response?.data?.error || err.message || 'Failed to load templates')
    }
  }

  useEffect(()=>{ load() }, [])

  function startNew(){
    setEditing({ name:'', subject:'', html:'<p>Dear {{clientName}},</p><p>Message</p>' })
    setPreview('')
  }

  async function save(){
    try{
      if (!editing.name) throw new Error('Name is required')
      if (editing.id) await api.updateTemplate(editing.id, editing)
      else await api.createTemplate(editing)
      setEditing(null)
      await load()
    }catch(err){ setError(err.response?.data?.error || err.message || 'save failed') }
  }

  async function remove(id){
    if (!confirm('Delete template?')) return
    await api.deleteTemplate(id)
    await load()
  }

  async function previewTemplate(){
    try{
      const data = await api.previewTemplate({ templateHtml: editing.html, clientName: 'John Veteran', clientId: '1', htmlFallback:'', navigatorName: (JSON.parse(localStorage.getItem('vhp_user')||'{}')).fullName })
      setPreview(data.html)
    }catch(err){ setError(err.response?.data?.error || err.message || 'preview failed') }
  }

  if (error) return (
    <div className="container"><div className="card"><div style={{color:'crimson'}}>{error}</div><div style={{marginTop:8}}><button onClick={()=>setError('')}>Dismiss</button></div></div></div>
  )

  return (
    <div className="container">
      <div className="card header">
        <div>
          <div className="title">Template Manager</div>
          <div style={{color:'#6b7280'}}>Create and manage email templates (admin)</div>
        </div>
      </div>

      <div className="card">
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={startNew} style={{background:'#0b4a76',color:'white',padding:8,borderRadius:8}}>New Template</button>
        </div>
        <div style={{marginTop:12}}>
          {templates.map(t => (
            <div key={t.id} style={{display:'flex',justifyContent:'space-between',padding:8,borderBottom:'1px solid #f0f4f8'}}>
              <div>
                <div style={{fontWeight:700}}>{t.name}</div>
                <div style={{color:'#6b7280'}}>{t.subject}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setEditing(t)}>Edit</button>
                <button onClick={()=>remove(t.id)} style={{color:'crimson'}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="card">
          <div style={{display:'grid',gap:8}}>
            <label>Name</label>
            <input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} />
            <label>Subject</label>
            <input value={editing.subject} onChange={e=>setEditing({...editing,subject:e.target.value})} />
            <label>HTML</label>
            <textarea rows={8} value={editing.html} onChange={e=>setEditing({...editing,html:e.target.value})} />
            <div style={{display:'flex',gap:8}}>
              <button onClick={save} style={{background:'#0b4a76',color:'white',padding:8,borderRadius:8}}>Save</button>
              <button onClick={()=>setEditing(null)}>Cancel</button>
              <button onClick={previewTemplate}>Preview</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{fontWeight:700}}>Preview</div>
        <iframe title="preview" srcDoc={preview} style={{width:'100%',height:300,border:'1px solid #eef6fb',borderRadius:8}} />
      </div>
    </div>
  )
}
