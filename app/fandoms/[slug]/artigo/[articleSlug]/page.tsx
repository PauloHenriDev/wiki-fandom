'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface ArticleSection {
  title: string
  content: string
}

interface Article {
  id: string
  title: string
  summary: string | null
  content: string | null
  sections: ArticleSection[] | null
  has_spoiler: boolean
  quote: string | null
  quote_author: string | null
  infobox_image: string | null
  infobox_data: { key: string; value: string }[] | null
  author_id: string | null
  category: { name: string; slug: string }
  fandom: { name: string; slug: string }
}

export default function ArticleDetailPage() {
  const params = useParams()
  const fandomSlug = params?.slug as string
  const articleSlug = params?.articleSlug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [showToc, setShowToc] = useState(true)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    if (fandomSlug && articleSlug) loadArticle()
  }, [fandomSlug, articleSlug])

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  async function loadArticle() {
    setLoading(true)

    const { data: fandomData } = await supabase
      .from('fandoms')
      .select('id')
      .eq('slug', fandomSlug)
      .single()

    if (fandomData) {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(name, slug),
          fandom:fandoms(name, slug)
        `)
        .eq('fandom_id', fandomData.id)
        .eq('slug', articleSlug)
        .single()

      if (!error && data) {
        setArticle(data as unknown as Article)

        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          if (data.author_id === userData.user.id) {
            setCanEdit(true)
          } else {
            const { data: member } = await supabase
              .from('fandom_members')
              .select('role')
              .eq('fandom_id', fandomData.id)
              .eq('user_id', userData.user.id)
              .single()

            if (member && (member.role === 'admin' || member.role === 'editor')) {
              setCanEdit(true)
            }
          }
        }
      }
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Carregando artigo...
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold">Artigo não encontrado</h1>
        <Link href={`/fandoms/${fandomSlug}`} className="mt-4 text-indigo-400 hover:underline">
          Voltar para a Fandom
        </Link>
      </div>
    )
  }

  // Seções a serem exibidas (com compatibilidade para o campo antigo 'content')
  const articleSections: ArticleSection[] =
    article.sections && article.sections.length > 0
      ? article.sections
      : article.content
      ? [{ title: 'História & Detalhes', content: article.content }]
      : []

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-3 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>em:</span>
            <Link href={`/fandoms/${article.fandom.slug}/categoria/${article.category.slug}`} className="text-indigo-400 font-semibold hover:underline">
              {article.category.name}
            </Link>
          </div>

          {canEdit && (
            <Link
              href={`/fandoms/${fandomSlug}/artigo/${articleSlug}/editar`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-indigo-500 hover:text-white"
            >
              ✏️ Editar Artigo
            </Link>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h1 className="text-4xl font-extrabold text-white">{article.title}</h1>
        </div>

        {article.has_spoiler && (
          <div className="mt-6 flex items-center gap-4 rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-red-200">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-red-400 text-sm uppercase tracking-wider">Aviso de Spoilers</h4>
              <p className="text-xs text-red-300/80">Este artigo contém detalhes importantes da trama.</p>
            </div>
          </div>
        )}

        {article.quote && (
          <div className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-500/10 p-5 text-amber-200 italic font-serif">
            <p className="text-base sm:text-lg">"{article.quote}"</p>
            {article.quote_author && (
              <p className="mt-2 text-xs font-bold text-amber-400 font-sans not-italic text-right">
                — {article.quote_author}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse lg:flex-row gap-8 items-start">
          
          <div className="flex-1 space-y-6 w-full">
            {article.summary && (
              <p className="text-slate-300 leading-relaxed text-base">
                {article.summary}
              </p>
            )}

            {/* Tabela de Conteúdo Dinâmica */}
            {articleSections.length > 0 && (
              <div className="inline-block rounded-xl border border-slate-800 bg-slate-900/90 p-4 min-w-[260px]">
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Conteúdo</span>
                  <button
                    onClick={() => setShowToc(!showToc)}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    [{showToc ? 'ocultar' : 'mostrar'}]
                  </button>
                </div>

                {showToc && (
                  <ol className="mt-3 space-y-1.5 text-xs text-indigo-400">
                    {articleSections.map((sec, idx) => {
                      const anchor = generateSlug(sec.title)
                      return (
                        <li key={idx}>
                          <a href={`#${anchor}`} className="hover:underline">
                            {idx + 1}. {sec.title}
                          </a>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
            )}

            {/* Renderização das Seções Dinâmicas */}
            <div className="pt-4 space-y-8 border-t border-slate-800">
              {articleSections.map((sec, idx) => {
                const anchor = generateSlug(sec.title)
                return (
                  <section key={idx} id={anchor} className="space-y-3">
                    <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-2">
                      {sec.title}
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                      {sec.content}
                    </p>
                  </section>
                )
              })}
            </div>
          </div>

          {/* Infobox Lateral */}
          <div className="w-full lg:w-80 shrink-0 rounded-2xl border border-amber-500/40 bg-slate-900 overflow-hidden shadow-xl">
            <div className="bg-amber-500 px-4 py-2.5 text-center font-bold text-slate-950 text-lg">
              {article.title}
            </div>

            {article.infobox_image ? (
              <div className="p-3 bg-slate-950 flex justify-center border-b border-slate-800">
                <img
                  src={article.infobox_image}
                  alt={article.title}
                  className="max-h-80 w-auto object-contain rounded"
                />
              </div>
            ) : (
              <div className="h-48 bg-slate-950 flex items-center justify-center text-xs text-slate-600 border-b border-slate-800">
                Sem imagem
              </div>
            )}

            <div className="bg-amber-600/20 px-3 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 text-center">
              Informações Gerais
            </div>

            {article.infobox_data && article.infobox_data.length > 0 ? (
              <div className="divide-y divide-slate-800/60 text-xs">
                {article.infobox_data.map((item, idx) => (
                  <div key={idx} className="flex p-2.5 hover:bg-slate-800/40 transition-colors">
                    <span className="w-1/3 font-semibold text-slate-400 shrink-0 pr-2">
                      {item.key}
                    </span>
                    <span className="w-2/3 text-slate-200 font-medium break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                Sem atributos cadastrados.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}