'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Fandom {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Article {
  id: string
  title: string
  slug: string
  summary: string | null
  created_at: string
}

export default function CategoryDetailPage() {
  const params = useParams()
  const fandomSlug = params?.slug as string
  const categorySlug = params?.categorySlug as string

  const [fandom, setFandom] = useState<Fandom | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (fandomSlug && categorySlug) {
      loadCategoryAndArticles()
    }
  }, [fandomSlug, categorySlug])

  async function loadCategoryAndArticles() {
    setLoading(true)

    // 1. Busca os dados da Fandom
    const { data: fandomData, error: fandomError } = await supabase
      .from('fandoms')
      .select('id, name, slug')
      .eq('slug', fandomSlug)
      .single()

    if (fandomError || !fandomData) {
      setLoading(false)
      return
    }

    setFandom(fandomData)

    // 2. Busca a categoria específica dentro da Fandom
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('fandom_id', fandomData.id)
      .eq('slug', categorySlug)
      .single()

    if (categoryError || !categoryData) {
      setLoading(false)
      return
    }

    setCategory(categoryData)

    // 3. Busca todos os artigos vinculados a esta categoria
    const { data: articlesData } = await supabase
      .from('articles')
      .select('id, title, slug, summary, created_at')
      .eq('fandom_id', fandomData.id)
      .eq('category_id', categoryData.id)
      .order('created_at', { ascending: false })

    if (articlesData) {
      setArticles(articlesData)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Carregando seção...
      </div>
    )
  }

  if (!fandom || !category) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold">Categoria não encontrada</h1>
        <p className="mt-2 text-slate-400">A seção solicitada não existe ou foi removida.</p>
        <Link
          href={`/fandoms/${fandomSlug}`}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Voltar para a Fandom
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Cabeçalho da Categoria */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb de navegação */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/fandoms/${fandom.slug}`} className="hover:text-indigo-400 transition-colors">{fandom.name}</Link>
            <span>/</span>
            <span className="text-indigo-400">{category.name}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Seção da Wiki
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                {category.name}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Todos os artigos cadastrados em {category.name} no universo {fandom.name}
              </p>
            </div>

            {/* Botão de criar novo artigo diretamente nesta categoria */}
            <Link
              href={`/fandoms/${fandom.slug}/criar-artigo?categoria=${category.id}`}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:scale-105"
            >
              + Criar Novo Artigo em {category.name}
            </Link>
          </div>
        </div>
      </div>

      {/* Grid de Artigos */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/fandoms/${fandom.slug}/artigo/${article.slug}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400 line-clamp-3">
                    {article.summary || 'Nenhum resumo informado.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {new Date(article.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                    Ler artigo &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-300">Nenhum artigo nesta seção</h3>
            <p className="mt-1 text-sm text-slate-500">
              Ainda não existem registros em {category.name}. Seja o primeiro a escrever um!
            </p>
            <Link
              href={`/fandoms/${fandom.slug}/criar-artigo?categoria=${category.id}`}
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Criar Primeiro Artigo
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}