'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    getUserProfile()

    // Ouve alterações no estado de autenticação em tempo real
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getUserProfile()
    })

    // Fecha o dropdown se o usuário clicar fora dele
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      authListener.subscription.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function getUserProfile() {
    const { data } = await supabase.auth.getUser()
    const authUser = data?.user

    if (authUser) {
      // Busca os dados atualizados do perfil sem a antiga coluna 'role'
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          username: profile.username,
          displayName: profile.display_name || profile.username,
          avatarUrl: profile.avatar_url,
        })
      }
    } else {
      setUser(null)
    }

    setLoading(false)
  }

  async function handleLogout() {
    setIsDropdownOpen(false)
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo / Home */}
        <Link 
          href="/" 
          className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors"
        >
          Wiki<span className="text-indigo-500">Fandom</span>
        </Link>

        {/* Status do Usuário */}
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                /* Menu de Perfil / Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 p-1.5 pr-3 hover:border-slate-700 transition-all focus:outline-none"
                  >
                    {/* Foto ou Ícone com Inicial */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-xs overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>

                    <span className="text-sm font-semibold text-slate-200">
                      {user.username}
                    </span>

                    {/* Ícone de Seta */}
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Lista do Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                        <p className="text-xs text-slate-400">Logado como</p>
                        <p className="text-sm font-bold text-white truncate">@{user.username}</p>
                      </div>

                      {/* Opção 1: Configurações */}
                      <Link
                        href="/configuracoes"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Configurações
                      </Link>

                      {/* Opção 2: Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-1"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Botão de Entrar caso esteja deslogado */
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