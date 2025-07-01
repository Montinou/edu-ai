'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { CardCollection } from '@/components/cards/CardCollection';

export default function TestCardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🧪 Prueba de Cartas EduCard
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">🎴✨</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Academia Mágica EduCard - Prueba de Sistema
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Esta página muestra todas las cartas generadas en la base de datos. 
            Puedes probar filtros, búsqueda y ver los detalles de cada carta.
          </p>
        </div>

        {/* Card Size Examples */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔍 Diferentes Tamaños de Cartas
          </h3>
          
          {/* Small Cards */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Cartas Pequeñas (ideal para inventario)</h4>
            <CardCollection 
              showSearch={false}
              showFilters={false}
              cardSize="small"
              maxCards={8}
              className="mb-4"
            />
          </div>

          {/* Medium Cards */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Cartas Medianas (ideal para colección)</h4>
            <CardCollection 
              showSearch={false}
              showFilters={false}
              cardSize="medium"
              maxCards={6}
              className="mb-4"
            />
          </div>

          {/* Large Cards */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Cartas Grandes (ideal para showcase)</h4>
            <CardCollection 
              showSearch={false}
              showFilters={false}
              cardSize="large"
              maxCards={4}
              className="mb-4"
            />
          </div>
        </div>

        {/* Full Interactive Collection */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🎯 Colección Completa Interactiva
          </h3>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <CardCollection 
              showSearch={true}
              showFilters={true}
              cardSize="medium"
            />
          </div>
        </div>

        {/* Testing Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              🔧 Información de Pruebas
            </h3>
            <Link 
              href="/admin/storage" 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              🗄️ Storage Admin
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-medium mb-2">Características implementadas:</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>Conexión a base de datos Supabase</li>
                <li>Cartas reales del sistema CARD_PROMT.md</li>
                <li>Filtros por tipo y rareza</li>
                <li>Búsqueda por nombre y contenido</li>
                <li>Diferentes tamaños de carta</li>
                <li>Modal detallado con problemas matemáticos</li>
                <li>Estadísticas de colección</li>
                <li>Animaciones y efectos visuales</li>
                <li>🆕 Sistema de almacenamiento de imágenes</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Próximas características:</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>🔄 Generación automática de imágenes</li>
                <li>Sistema de usuarios y autenticación</li>
                <li>Colección personal de cartas</li>
                <li>Sistema de batalla con cartas</li>
                <li>Sonidos y efectos especiales</li>
                <li>Modo multijugador</li>
                <li>Logros y progreso</li>
                <li>Integración con Three.js para 3D</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-lg font-bold text-green-900 mb-2">Estado de la Base de Datos</h3>
          <p className="text-green-700">
            Todas las cartas mostradas provienen directamente de la base de datos Supabase.
            Cada carta incluye problemas matemáticos curados para niños de 8-12 años.
          </p>
        </div>
      </main>
    </div>
  );
} 