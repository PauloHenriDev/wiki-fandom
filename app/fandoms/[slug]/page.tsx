interface FandomPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function FandomPage({ params }: FandomPageProps) {
  const { slug } = await params

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Universo / Wiki
        </span>
        <h1 className="mt-2 text-4xl font-bold capitalize text-white">
          Fandom: {slug.replace('-', ' ')}
        </h1>
        <p className="mt-4 text-slate-400">
          Página em construção para o universo <strong className="text-slate-200">{slug}</strong>. 
          Aqui ficarão os artigos, listas de personagens, locais e lore.
        </p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">Artigos Recentes</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li className="hover:text-indigo-400 cursor-pointer">📜 História e Origens</li>
            <li className="hover:text-indigo-400 cursor-pointer">🗺️ Geografia & Províncias</li>
            <li className="hover:text-indigo-400 cursor-pointer">🐉 Linhagens e Criaturas</li>
          </ul>
        </div>
      </div>
    </div>
  )
}