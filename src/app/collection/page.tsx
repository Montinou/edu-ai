'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { MobileNav } from '@/components/navigation/MobileNav';
import { CardCollection } from '@/components/cards/CardCollection';
import { CardModal } from '@/components/cards/CardModal';
import { DatabaseCard } from '@/components/cards/Card';

export default function CollectionPage() {
  const [selectedCard, setSelectedCard] = useState<DatabaseCard | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardSelect = (card: DatabaseCard) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="p-2 rounded-lg hover:bg-white/50 transition-colors touch-target">
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mi Colección EduCard
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-mobile py-6">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">🎴✨</div>
            <h2 className="text-2xl font-bold mb-2">Academia Mágica EduCard</h2>
            <p className="text-indigo-100">
              Descubre y colecciona cartas mágicas mientras aprendes matemáticas
            </p>
          </div>
        </div>

        {/* Card Collection Component */}
        <CardCollection 
          showSearch={true}
          showFilters={true}
          cardSize="medium"
          onCardClick={handleCardSelect}
          className="mb-8"
        />

        {/* Learning Tips */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            💡 Consejos de Aprendizaje
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-lg">🎯</span>
              <div>
                <div className="font-medium">Practica diariamente</div>
                <div>Dedica 10-15 minutos cada día para mejorar tus habilidades</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">⭐</span>
              <div>
                <div className="font-medium">Desbloquea nuevas cartas</div>
                <div>Resuelve problemas correctamente para ganar cartas más poderosas</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🧠</span>
              <div>
                <div className="font-medium">Entiende los conceptos</div>
                <div>No solo memorices, comprende por qué funcionan las operaciones</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🎮</span>
              <div>
                <div className="font-medium">Diviértete aprendiendo</div>
                <div>Las matemáticas son más fáciles cuando las disfrutas</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
} 