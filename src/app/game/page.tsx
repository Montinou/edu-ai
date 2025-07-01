import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { MobileNav } from '@/components/navigation/MobileNav'

export default function GamePage() {
  return (
    <div className="min-h-screen bg-background-primary pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm">
        <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 touch-target">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Seleccionar Nivel</h1>
        <div className="w-10 h-10"></div> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="container-mobile py-8">
        {/* World Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Academia Elemental
          </h2>
          <p className="text-gray-600">
            Domina las operaciones básicas
          </p>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Level 1 - Completed */}
          <button className="card-interactive p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">1</div>
            <div className="flex justify-center mb-2">
              <span className="text-yellow-500">⭐⭐⭐</span>
            </div>
            <div className="text-xs text-gray-600">Completado</div>
          </button>

          {/* Level 2 - Completed */}
          <button className="card-interactive p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">2</div>
            <div className="flex justify-center mb-2">
              <span className="text-yellow-500">⭐⭐</span>
              <span className="text-gray-300">⭐</span>
            </div>
            <div className="text-xs text-gray-600">Completado</div>
          </button>

          {/* Level 3 - Available */}
          <button className="card-interactive p-6 text-center bg-primary-50 border-primary-200">
            <div className="text-2xl font-bold text-primary-600 mb-2">3</div>
            <div className="flex justify-center mb-2">
              <span className="text-gray-300">⭐⭐⭐</span>
            </div>
            <div className="text-xs text-primary-600 font-medium">Disponible</div>
          </button>

          {/* Level 4 - Locked */}
          <button className="card-base p-6 text-center opacity-50 cursor-not-allowed">
            <div className="text-2xl font-bold text-gray-400 mb-2">4</div>
            <div className="flex justify-center mb-2">
              <span className="text-gray-300">🔒</span>
            </div>
            <div className="text-xs text-gray-400">Bloqueado</div>
          </button>

          {/* Level 5 - Locked */}
          <button className="card-base p-6 text-center opacity-50 cursor-not-allowed">
            <div className="text-2xl font-bold text-gray-400 mb-2">5</div>
            <div className="flex justify-center mb-2">
              <span className="text-gray-300">🔒</span>
            </div>
            <div className="text-xs text-gray-400">Bloqueado</div>
          </button>

          {/* Level 6 - Locked */}
          <button className="card-base p-6 text-center opacity-50 cursor-not-allowed">
            <div className="text-2xl font-bold text-gray-400 mb-2">6</div>
            <div className="flex justify-center mb-2">
              <span className="text-gray-300">🔒</span>
            </div>
            <div className="text-xs text-gray-400">Bloqueado</div>
          </button>
        </div>

        {/* Next Challenge Preview */}
        <div className="card-base p-4 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Próximo Desafío</h3>
          <p className="text-gray-600 text-sm mb-3">
            Suma y resta hasta 20
          </p>
          <button className="btn-primary w-full">
            Comenzar Nivel 3
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  )
} 