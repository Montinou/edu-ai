'use client';

import { Suspense } from 'react';
import BattleField2D from '@/components/game/BattleField2D';

export default function Battle2DPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Cargando Campo de Batalla</h2>
            <p className="text-blue-200">Preparando la experiencia de combate...</p>
          </div>
        </div>
      }>
        <BattleField2D />
      </Suspense>
    </main>
  );
} 