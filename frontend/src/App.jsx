import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
