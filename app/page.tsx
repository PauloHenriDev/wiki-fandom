'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Fandom {
  id: string
  name: string
  slug: string
  description: string | null
  banner_url: string | null
  created_at: string
}

export default function Home() {
  const [fandoms, setFandoms] = useState<Fandom[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFandoms()
  }, [])

  async function loadFandoms() {
    setLoading(true)

    const { data, error } = await supabase
      .from('fandoms')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar fandoms:', error)
    } else if (data) {
      setFandoms(data)
    }

    setLoading(false)
  }

  // Filtra as fandoms em tempo real com base no termo digitado
  const filteredFandoms = fandoms.filter((fandom) => {
    const term = searchQuery.toLowerCase()
    return (
      fandom.name.toLowerCase().includes(term) ||
      (fandom.description && fandom.description.toLowerCase().includes(term))
    )
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
            Fandom Wiki Hub
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Explore e documente os seus <span className="text-indigo-500">Universos</span> favoritos
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Crie artigos, explore histórias, mapas, personagens e mitologias em um só lugar.
          </p>

          {/* Botão Principal de Ação */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/fandoms/criar"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:scale-105"
            >
              + Criar uma Fandom
            </Link>
          </div>

          {/* Barra de Busca Dinâmica */}
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}w
                placeholder="Pesquise por uma fandom ou universo..."
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-5 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Fandoms */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Universos Disponíveis</h2>
            <p className="text-sm text-slate-400">Selecione uma comunidade para acessar a wiki completa</p>
          </div>
          <Link
            href="/fandoms/criar"
            className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-indigo-400 hover:border-indigo-500/40 hover:text-indigo-300 transition-all"
          >
            + Nova Fandom
          </Link>
        </div>

        {/* Estado de Carregamento */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse" />
            ))}
          </div>
        ) : filteredFandoms.length > 0 ? (
          /* Renderização das Fandoms do Banco */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFandoms.map((fandom) => (
              <Link
                key={fandom.id}
                href={`/fandoms/${fandom.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 w-full overflow-hidden bg-slate-800 relative">
                    {fandom.banner_url ? (
                      <img
                        src={fandom.banner_url}
                        alt={fandom.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 flex items-center justify-center text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        Sem Imagem de Capa
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {fandom.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                      {fandom.description || 'Nenhuma descrição fornecida.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 mt-auto">
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                    <span>Acessar Wiki</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Estado Vazio (Nenhuma Fandom encontrada) */
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-300">Nenhum universo encontrado</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery
                ? `Nenhum resultado para "${searchQuery}".`
                : 'Seja o primeiro a documentar uma nova história!'}
            </p>
            <Link
              href="/fandoms/criar"
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Criar Primeira Fandom
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}