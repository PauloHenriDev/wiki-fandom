'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Fandom {
  id: string
  name: string
  slug: string
  description: string | null
  banner_url: string | null
  owner_id: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function FandomDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [fandom, setFandom] = useState<Fandom | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      loadFandomData()
    }
  }, [slug])

  async function loadFandomData() {
    setLoading(true)

    // 1. Busca os dados da Fandom
    const { data: fandomData, error: fandomError } = await supabase
      .from('fandoms')
      .select('*')
      .eq('slug', slug)
      .single()

    if (fandomError || !fandomData) {
      setLoading(false)
      return
    }

    setFandom(fandomData)

    // 2. Busca as categorias/seções ativas desta Fandom
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('fandom_id', fandomData.id)
      .order('name', { ascending: true })

    if (categoriesData) {
      setCategories(categoriesData)
    }

    // 3. Verifica o papel do usuário atual nesta fandom (ADM, Editor ou null)
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user) {
      const { data: memberData } = await supabase
        .from('fandom_members')
        .select('role')
        .eq('fandom_id', fandomData.id)
        .eq('user_id', userData.user.id)
        .single()

      if (memberData) {
        setUserRole(memberData.role)
      }
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Carregando universo...
      </div>
    )
  }

  if (!fandom) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold">Fandom não encontrada</h1>
        <p className="mt-2 text-slate-400">O universo que você procura não existe ou foi removido.</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Voltar para a Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Banner de Capa */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900 border-b border-slate-800">
        {fandom.banner_url ? (
          <img
            src={fandom.banner_url}
            alt={fandom.name}
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Informações da Fandom no Banner */}
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-6 pb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Wiki de Fandom
              </span>
              <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold text-white">
                {fandom.name}
              </h1>
            </div>

            {/* Ações do ADM / Editor */}
            <div className="flex items-center gap-3">
              {(userRole === 'admin' || userRole === 'editor') && (
                <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400">
                  {userRole === 'admin' ? 'Dono / ADM' : 'Editor'}
                </span>
              )}
              <Link
                href={`/fandoms/${fandom.slug}/criar-artigo`}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
              >
                + Criar Artigo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        {/* Descrição da Fandom */}
        {fandom.description && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Sobre este Universo
            </h2>
            <p className="text-slate-300 leading-relaxed">{fandom.description}</p>
          </section>
        )}

        {/* Seções / Categorias Escolhidas */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Explorar Por Seção</h2>
              <p className="text-sm text-slate-400">Navegue pelos artigos categorizados da comunidade</p>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/fandoms/${fandom.slug}/categoria/${cat.slug}`}
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-slate-600 group-hover:text-indigo-400 transition-colors">
                      &rarr;
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Ver todos os artigos de {cat.name}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
              Nenhuma seção configurada para esta fandom.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}