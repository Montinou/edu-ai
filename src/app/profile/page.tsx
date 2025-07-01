import Link from 'next/link'
import { ArrowLeftIcon, SettingsIcon } from 'lucide-react'
import { MobileNav } from '@/components/navigation/MobileNav'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background-primary pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm">
        <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 touch-target">
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
        <button className="p-2 rounded-lg hover:bg-gray-100 touch-target">
          <SettingsIcon className="w-6 h-6 text-gray-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="container-mobile py-8">
        {/* Profile Header */}
        <div className="card-base p-6 text-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alex</h2>
          <p className="text-gray-600 mb-4">Nivel 3 • 250/300 XP</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-game-xp h-3 rounded-full transition-all duration-slow"
              style={{ width: '83%' }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">83% al siguiente nivel</p>
        </div>

        {/* Statistics */}
        <div className="card-base p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Estadísticas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Combates ganados</span>
              <span className="font-semibold text-game-xp">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Precisión promedio</span>
              <span className="font-semibold text-primary-500">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tiempo promedio</span>
              <span className="font-semibold text-gray-900">45s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Racha actual</span>
              <span className="font-semibold text-game-energy">3 victorias</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card-base p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Logros Recientes</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-2xl mr-3">🥇</span>
              <div>
                <div className="font-medium text-gray-900">Primera Victoria</div>
                <div className="text-sm text-gray-600">Gana tu primer combate</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-2xl mr-3">🎯</span>
              <div>
                <div className="font-medium text-gray-900">10 Seguidos</div>
                <div className="text-sm text-gray-600">Resuelve 10 problemas consecutivos</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  )
} 