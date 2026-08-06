'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Converte o nickname em um formato compatível com o Supabase Auth
  const formatEmail = (nick: string) => `${nick.trim().toLowerCase()}@wiki.internal`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const internalEmail = formatEmail(username)

    if (isSignUp) {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: internalEmail,
        password,
      })

      if (authError) {
        setError(authError.message.includes('already registered') 
          ? 'Este nickname já está em uso.' 
          : authError.message)
        setLoading(false)
        return
      }

      // 2. Criar registro na tabela profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: username.trim(),
            role: 'user', // Por padrão todo novo usuário é 'user'
          })

        if (profileError) {
          setError('Erro ao criar perfil de usuário.')
          setLoading(false)
          return
        }
      }

      router.push('/')
      router.refresh()
    } else {
      // Login com Nickname e Senha
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: internalEmail,
        password,
      })

      if (loginError) {
        setError('Nickname ou senha incorretos.')
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-center text-white">
          {isSignUp ? 'Criar Conta na Wiki' : 'Entrar na Wiki'}
        </h2>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">
              Nickname
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="SeuNickname"
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-indigo-400"
          >
            {isSignUp
              ? 'Já tem uma conta? Faça login'
              : 'Não tem uma conta? Registre-se'}
          </button>
        </div>
      </div>
    </div>
  )
}