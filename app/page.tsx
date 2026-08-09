import Link from 'next/link'

// Exemplo de dados mockados (no futuro virão do Supabase)
// const FEATURED_FANDOMS = [
//   {
//     id: '1',
//     name: 'Lumirep & O Universo Antigo',
//     slug: 'lumirep',
//     description: 'Explore a geografia, as linhagens de dragões, vilas e segredos da província.',
//     category: 'Fantasia',
//     articleCount: 42,
//     bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
//   },
//   {
//     id: '2',
//     name: 'Sci-Fi Cyberpunk',
//     slug: 'cyberpunk-chronicles',
//     description: 'Corporações, tecnologias proibidas e a história da metrópole neon.',
//     category: 'Ficção Científica',
//     articleCount: 18,
//     bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600',
//   },
//   {
//     id: '3',
//     name: 'Sistemas de RPG & Lore',
//     slug: 'rpg-lore',
//     description: 'Guias de regras, fichas de monstros, feitiços e itens mágicos.',
//     category: 'Jogos',
//     articleCount: 29,
//     bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600',
//   },
// ]

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-20 text-center">
        <div className="mx-auto max-auto max-w-4xl">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
            Fandom Wiki Hub
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Explore e documente os seus <span className="text-indigo-500">Universos</span> favoritos
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Crie artigos, explore histórias, mapas, personagens e mitologias em um só lugar.
          </p>

          {/* Barra de Busca */}
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-lg">
              <input
                type="text"
                placeholder="Pesquise por um fandom, artigo ou personagem..."
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
            <h2 className="text-2xl font-bold text-white">Fandoms em Destaque</h2>
            <p className="text-sm text-slate-400">Selecione um universo para acessar a wiki completa</p>
          </div>
          <Link
            href="/fandoms"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Ver todos &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* {FEATURED_FANDOMS.map((fandom) => (
            <Link
              key={fandom.id}
              href={`/fandoms/${fandom.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-40 w-full overflow-hidden bg-slate-800">
                <img
                  src={fandom.bannerUrl}
                  alt={fandom.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
                  <span>{fandom.category}</span>
                  <span className="text-slate-500">{fandom.articleCount} artigos</span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {fandom.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                  {fandom.description}
                </p>
              </div>
            </Link>
          ))} */}
        </div>





        <section>
          
        </section>
      </main>
    </div>
  )
}