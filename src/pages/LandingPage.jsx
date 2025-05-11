import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Bem-vindo ao WallTea</h1>
      <Link to="/login">Login</Link> | <Link to="/cadastro">Cadastro</Link>
    </div>
  )
}
