import React, { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // Aqui chamaremos o backend futuramente
    console.log('Login:', email, senha)
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
      <button type="submit">Entrar</button>
    </form>
  )
}
