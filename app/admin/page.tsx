'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  username: string
  role: 'admin' | 'user'
}

export default function AdminPanel() {
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAndFetchUsers()
  }, [])

  async function checkAdminAndFetchUsers() {
    // 1. Obter usuário logado
    const { data, error } = await supabase.auth.getUser()
    const user = data?.user

    if (error) {
      console.error('supabase.auth.getUser error:', error)
      setLoading(false)
      return
    }

    if (!user) {
      setLoading(false)
      return
    }

    // 2. Buscar perfil do usuário logado
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      setCurrentUserRole('admin')

      // 3. Buscar lista completa de usuários
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true })

      if (allUsers) setUsers(allUsers)
    }

    setLoading(false)
  }

  async function toggleAdminRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } else {
      alert('Erro ao atualizar permissão: ' + error.message)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-8 text-slate-400">Carregando...</div>
  }

  if (currentUserRole !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">Acesso Negado</h1>
          <p className="mt-2 text-slate-400">Você não tem permissão de administrador para ver esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white">Painel do Administrador</h1>
        <p className="mt-2 text-slate-400">Gerencie as permissões e atribua ADM para outros membros da Wiki.</p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Nickname</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-semibold text-white">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      u.role === 'admin' 
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleAdminRole(u.id, u.role)}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      {u.role === 'admin' ? 'Remover ADM' : 'Tornar ADM'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}