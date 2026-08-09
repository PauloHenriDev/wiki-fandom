'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  slug: string
}

interface InfoboxField {
  key: string
  value: string
}

interface ArticleSection {
  title: string
  content: string
}

export default function CreateArticlePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const fandomSlug = params?.slug as string
  const defaultCategory = searchParams.get('categoria')

  const [categories, setCategories] = useState<Category[]>([])
  const [fandomId, setFandomId] = useState<string | null>(null)
  
  // Campos Gerais
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(defaultCategory || '')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [quote, setQuote] = useState('')
  const [quoteAuthor, setQuoteAuthor] = useState('')
  const [infoboxImage, setInfoboxImage] = useState('')
  const [summary, setSummary] = useState('')
  
  // Infobox Lateral
  const [infoboxFields, setInfoboxFields] = useState<InfoboxField[]>([
    { key: 'Status', value: '' },
  ])

  // Seções Dinâmicas do Artigo
  const [sections, setSections] = useState<ArticleSection[]>([
    { title: 'Aparência', content: '' },
    { title: 'Personalidade', content: '' },
    { title: 'História', content: '' },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (fandomSlug) loadCategories()
  }, [fandomSlug])

  async function loadCategories() {
    const { data: fandom } = await supabase
      .from('fandoms')
      .select('id')
      .eq('slug', fandomSlug)
      .single()

    if (fandom) {
      setFandomId(fandom.id)
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('fandom_id', fandom.id)

      if (catData) setCategories(catData)
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  // Manipulação da Infobox
  function handleAddInfoboxField() {
    setInfoboxFields([...infoboxFields, { key: '', value: '' }])
  }
  function handleRemoveInfoboxField(index: number) {
    setInfoboxFields(infoboxFields.filter((_, i) => i !== index))
  }
  function handleInfoboxChange(index: number, field: 'key' | 'value', val: string) {
    const updated = [...infoboxFields]
    updated[index][field] = val
    setInfoboxFields(updated)
  }

  // Manipulação das Seções do Conteúdo
  function handleAddSection() {
    setSections([...sections, { title: '', content: '' }])
  }
  function handleRemoveSection(index: number) {
    setSections(sections.filter((_, i) => i !== index))
  }
  function handleSectionChange(index: number, field: 'title' | 'content', val: string) {
    const updated = [...sections]
    updated[index][field] = val
    setSections(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!title || !categoryId || !fandomId) {
      setError('Preencha o título e selecione uma seção.')
      setLoading(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      setError('Você precisa estar logado para publicar.')
      setLoading(false)
      return
    }

    const articleSlug = generateSlug(title)
    const validInfobox = infoboxFields.filter(f => f.key.trim() && f.value.trim())
    const validSections = sections.filter(s => s.title.trim() && s.content.trim())

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        fandom_id: fandomId,
        category_id: categoryId,
        title: title.trim(),
        slug: articleSlug,
        summary: summary.trim() || null,
        has_spoiler: hasSpoiler,
        quote: quote.trim() || null,
        quote_author: quoteAuthor.trim() || null,
        infobox_image: infoboxImage.trim() || null,
        infobox_data: validInfobox,
        sections: validSections,
        author_id: userData.user.id,
      })
      .select('slug')
      .single()

    if (articleError) {
      setError(articleError.message.includes('unique') ? 'Já existe um artigo com este título nesta fandom.' : articleError.message)
      setLoading(false)
      return
    }

    router.push(`/fandoms/${fandomSlug}/artigo/${article.slug}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-white">Novo Artigo da Wiki</h1>
        <p className="text-sm text-slate-400 mt-1">Configure o perfil e crie seções personalizadas para o artigo.</p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Título do Artigo *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Izuku Midoriya"
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Seção Principal *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <input
              type="checkbox"
              id="spoiler"
              checked={hasSpoiler}
              onChange={(e) => setHasSpoiler(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500"
            />
            <label htmlFor="spoiler" className="text-sm font-semibold text-slate-300 cursor-pointer">
              Exibir caixa de aviso de SPOILERS no topo
            </label>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase text-amber-400">Citação de Destaque</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder='Ex: "You can be a hero!"'
                className="sm:col-span-2 rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                placeholder="Autor"
                className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Infobox Lateral */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Infobox (Ficha Lateral)</h3>
              <button
                type="button"
                onClick={handleAddInfoboxField}
                className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white"
              >
                + Adicionar Atributo
              </button>
            </div>

            <input
              type="url"
              value={infoboxImage}
              onChange={(e) => setInfoboxImage(e.target.value)}
              placeholder="URL da Imagem de Capa da Infobox"
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs text-white focus:outline-none"
            />

            <div className="space-y-2">
              {infoboxFields.map((field, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleInfoboxChange(idx, 'key', e.target.value)}
                    placeholder="Campo (ex: Idade)"
                    className="w-1/3 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleInfoboxChange(idx, 'value', e.target.value)}
                    placeholder="Valor (ex: 16 anos)"
                    className="w-2/3 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveInfoboxField(idx)}
                    className="text-red-400 hover:text-red-300 px-2 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">Resumo Inicial</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Parágrafo de introdução..."
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
            />
          </div>

          {/* Seções Dinâmicas de Conteúdo */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Seções do Artigo</h3>
                <p className="text-xs text-slate-500">Crie e renomeie seções para montar o índice do artigo.</p>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                + Nova Seção
              </button>
            </div>

            <div className="space-y-6">
              {sections.map((sec, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      required
                      value={sec.title}
                      onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                      placeholder={`Título da Seção ${idx + 1} (ex: Aparência, Relacionamentos)`}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 text-xs font-bold text-indigo-300 focus:outline-none"
                    />
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 px-2"
                      >
                        Excluir
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={4}
                    value={sec.content}
                    onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
                    placeholder={`Conteúdo da seção "${sec.title || 'sem título'}"...`}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-1/3 rounded-xl border border-slate-800 bg-slate-950 py-3 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Publicando...' : 'Publicar Artigo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}