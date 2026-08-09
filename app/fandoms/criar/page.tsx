'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Seções pré-definidas para fácil seleção
const DEFAULT_SECTIONS = [
  { name: 'Personagens', slug: 'personagens' },
  { name: 'Raças', slug: 'racas' },
  { name: 'Regiões / Lugares', slug: 'regioes-lugares' },
  { name: 'Magia / Poderes', slug: 'magia-poderes' },
  { name: 'Classes / Trabalhos', slug: 'classes-trabalhos' },
  { name: 'Itens', slug: 'itens' },
  { name: 'Sistema / Lore', slug: 'sistema' },
  { name: 'Organizações / Facções', slug: 'organizacoes' },
]

export default function CreateFandomPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [selectedSections, setSelectedSections] = useState<string[]>(
    DEFAULT_SECTIONS.map((s) => s.slug) // Todas selecionadas por padrão
  )
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Redireciona para o login se o usuário não estiver autenticado
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  // Gerador automático de Slug amigável para URLs
  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  function handleNameChange(value: string) {
    setName(value)
    setSlug(generateSlug(value))
  }

  function toggleSection(sectionSlug: string) {
    if (selectedSections.includes(sectionSlug)) {
      setSelectedSections(selectedSections.filter((s) => s !== sectionSlug))
    } else {
      setSelectedSections([...selectedSections, sectionSlug])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      setError('Você precisa estar logado para criar uma Fandom.')
      setLoading(false)
      return
    }

    if (!name.trim() || !slug.trim()) {
      setError('Preencha o nome da fandom.')
      setLoading(false)
      return
    }

    // 1. Criar a Fandom
    const { data: fandom, error: fandomError } = await supabase
      .from('fandoms')
      .insert({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        banner_url: bannerUrl.trim() || null,
        owner_id: user.id,
      })
      .select('id, slug')
      .single()

    if (fandomError) {
      setError(
        fandomError.message.includes('unique')
          ? 'Já existe uma fandom com este identificador (slug).'
          : fandomError.message
      )
      setLoading(false)
      return
    }

    // 2. Inserir as Seções/Categorias selecionadas para esta Fandom
    if (fandom && selectedSections.length > 0) {
      const categoriesToInsert = DEFAULT_SECTIONS.filter((s) =>
        selectedSections.includes(s.slug)
      ).map((s) => ({
        fandom_id: fandom.id,
        name: s.name,
        slug: s.slug,
      }))

      const { error: catError } = await supabase
        .from('categories')
        .insert(categoriesToInsert)

      if (catError) {
        console.error('Erro ao salvar categorias:', catError)
      }
    }

    // Redireciona para a página da Fandom criada
    router.push(`/fandoms/${fandom.slug}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-white">Criar Novo Universo</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure a sua fandom e escolha as seções que organizarão os artigos.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Nome e Slug */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nome da Fandom *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Naruto Shippuden"
                className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="naruto-shippuden"
                className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Descrição do Universo
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumo sobre o que é esta comunidade..."
              className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* URL do Banner */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              URL da Imagem de Capa (Banner)
            </label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://imagem.com/banner.jpg"
              className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Seleção de Seções */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Seções da Página Inicial
            </label>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Marque as seções que estarão ativas para categorizar os artigos desta fandom:
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DEFAULT_SECTIONS.map((section) => {
                const isSelected = selectedSections.includes(section.slug)
                return (
                  <button
                    key={section.slug}
                    type="button"
                    onClick={() => toggleSection(section.slug)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{section.name}</span>
                    <span className="text-base">{isSelected ? '✓' : '+'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-1/3 rounded-xl border border-slate-800 bg-slate-950 py-3 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando Universo...' : 'Criar Fandom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}