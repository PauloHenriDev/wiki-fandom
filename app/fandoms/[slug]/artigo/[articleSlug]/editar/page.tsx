'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
}

interface InfoboxField {
  key: string
  value: string
}

interface ArticleSection {
  title: string
  content: string
}

export default function EditArticlePage() {
  const params = useParams()
  const fandomSlug = params?.slug as string
  const articleSlug = params?.articleSlug as string

  const [articleId, setArticleId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [quote, setQuote] = useState('')
  const [quoteAuthor, setQuoteAuthor] = useState('')
  const [infoboxImage, setInfoboxImage] = useState('')
  const [summary, setSummary] = useState('')
  const [infoboxFields, setInfoboxFields] = useState<InfoboxField[]>([])
  const [sections, setSections] = useState<ArticleSection[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (fandomSlug && articleSlug) loadArticleAndCategories()
  }, [fandomSlug, articleSlug])

  async function loadArticleAndCategories() {
    setLoading(true)

    const { data: fandom } = await supabase
      .from('fandoms')
      .select('id')
      .eq('slug', fandomSlug)
      .single()

    if (!fandom) {
      setError('Fandom não encontrada.')
      setLoading(false)
      return
    }

    const { data: catData } = await supabase
      .from('categories')
      .select('id, name')
      .eq('fandom_id', fandom.id)

    if (catData) setCategories(catData)

    const { data: article, error: articleErr } = await supabase
      .from('articles')
      .select('*')
      .eq('fandom_id', fandom.id)
      .eq('slug', articleSlug)
      .single()

    if (articleErr || !article) {
      setError('Artigo não encontrado.')
      setLoading(false)
      return
    }

    setArticleId(article.id)
    setTitle(article.title)
    setCategoryId(article.category_id)
    setHasSpoiler(article.has_spoiler || false)
    setQuote(article.quote || '')
    setQuoteAuthor(article.quote_author || '')
    setInfoboxImage(article.infobox_image || '')
    setSummary(article.summary || '')
    setInfoboxFields(article.infobox_data || [])

    // Carrega seções salvas ou migra o conteúdo antigo para a primeira seção
    if (article.sections && article.sections.length > 0) {
      setSections(article.sections)
    } else if (article.content) {
      setSections([{ title: 'História & Detalhes', content: article.content }])
    } else {
      setSections([{ title: 'História', content: '' }])
    }

    setLoading(false)
  }

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!articleId) return

    setError(null)
    setSaving(true)

    const validInfobox = infoboxFields.filter((f) => f.key.trim() && f.value.trim())
    const validSections = sections.filter((s) => s.title.trim() && s.content.trim())

    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title: title.trim(),
        category_id: categoryId,
        has_spoiler: hasSpoiler,
        quote: quote.trim() || null,
        quote_author: quoteAuthor.trim() || null,
        infobox_image: infoboxImage.trim() || null,
        summary: summary.trim() || null,
        infobox_data: validInfobox,
        sections: validSections,
      })
      .eq('id', articleId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/fandoms/${fandomSlug}/artigo/${articleSlug}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Carregando formulário...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-2xl font-extrabold text-white">Editar Artigo</h1>

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Título do Artigo</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Seção</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none"
              >
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
              Exibir caixa de aviso de SPOILERS
            </label>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase text-amber-400">Citação de Destaque</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Texto da Citação"
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
              placeholder="URL da Imagem"
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs text-white focus:outline-none"
            />

            <div className="space-y-2">
              {infoboxFields.map((field, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleInfoboxChange(idx, 'key', e.target.value)}
                    className="w-1/3 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleInfoboxChange(idx, 'value', e.target.value)}
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

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">Resumo Inicial</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none resize-none"
            />
          </div>

          {/* Gerenciamento de Seções */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Seções do Artigo</h3>
              <button
                type="button"
                onClick={handleAddSection}
                className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white"
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
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 text-xs font-bold text-indigo-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 px-2"
                    >
                      Excluir
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={sec.content}
                    onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
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
              disabled={saving}
              className="w-2/3 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}