import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('vhp_user') || 'null') }catch(e){ return null }
  })
  const navigate = useNavigate()

  useEffect(()=>{
    function onLogout(){
      setUser(null)
      localStorage.removeItem('vhp_token')
      localStorage.removeItem('vhp_user')
      navigate('/login')
    }
    window.addEventListener('vhp:logout', onLogout)
    return () => window.removeEventListener('vhp:logout', onLogout)
  },[navigate])

  async function login(email){
    const data = await api.login(email)
    if (data && data.token){
      localStorage.setItem('vhp_token', data.token)
      localStorage.setItem('vhp_user', JSON.stringify(data.navigator || {}))
      setUser(data.navigator || {})
    }
    return data
  }

  function logout(){
    localStorage.removeItem('vhp_token')
    localStorage.removeItem('vhp_user')
    setUser(null)
    // notify other windows
    window.dispatchEvent(new Event('vhp:logout'))
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}

export default AuthContext
