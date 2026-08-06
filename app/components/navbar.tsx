'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getUserProfile()

    // Ouve alterações no estado de autenticação (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getUserProfile()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function getUserProfile() {
    const { data, error } = await supabase.auth.getUser()
    const authUser = data?.user

    if (error) {
      console.error('supabase.auth.getUser error:', error)
    }

    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({ username: profile.username, role: profile.role })
      }
    } else {
      setUser(null)
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo / Home */}
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
          Wiki<span className="text-indigo-500">Fandom</span>
        </Link>

        {/* Links de Acesso e Status do Usuário */}
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Badge de Cargo */}
                  <span className="text-xs font-semibold text-slate-300">
                    Olá, <strong className="text-white">{user.username}</strong>
                  </span>

                  {/* Link do Painel ADM (só aparece se for ADM) */}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="rounded-lg bg-indigo-600/20 border border-indigo-500/40 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Painel ADM
                    </Link>
                  )}

                  {/* Botão de Logout */}
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                /* Botão de Entrar */
                <Link
                  href="/login"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Entrar
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}