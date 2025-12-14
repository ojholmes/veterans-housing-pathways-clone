import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  async function submit(e){
    e.preventDefault()
    try{
      const data = await login(email)
      if (!data || !data.token) setError('Login failed')
    }catch(err){
      console.error(err)
      setError(err.response?.data?.error || err.message || 'login error')
    }
  }

  return (
    <div className="container">
      <div className="card header">
        <div><div className="title">Sign in</div><div style={{color:'#6b7280'}}>Demo login: enter navigator email</div></div>
      </div>
      <div className="card">
        <form onSubmit={submit} style={{display:'grid',gap:8}}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="ava.carter@example.org" />
          <div style={{display:'flex',gap:8}}>
            <button type="submit" style={{background:'#0b4a76',color:'white',padding:8,borderRadius:8}}>Sign in</button>
          </div>
          {error && <div style={{color:'crimson'}}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
