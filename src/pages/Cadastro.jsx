import React, { useState } from 'react'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const handleCadastro = (e) => {
    e.preventDefault()
    // Aqui chamaremos o backend futuramente
    console.log('Cadastro:', nome, email, senha)
  }

  return (
    <form onSubmit={handleCadastro}>
      <h2>Cadastro</h2>
      <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
      <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
      <button type="submit">Cadastrar</button>
    </form>
  )
}
