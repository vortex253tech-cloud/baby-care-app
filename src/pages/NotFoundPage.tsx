import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <p className="text-6xl mb-4">🍼</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Página não encontrada</h1>
      <p className="text-gray-500 mb-6">Essa página não existe ou foi movida.</p>
      <Link to="/dashboard" className="text-pink-500 font-medium underline">Voltar para o início</Link>
    </div>
  )
}
