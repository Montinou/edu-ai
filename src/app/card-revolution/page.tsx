import React from 'react';
import RevolutionaryCardDemo from '@/components/cards/RevolutionaryCardDemo';

export default function CardRevolutionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <RevolutionaryCardDemo />
    </main>
  );
}

export const metadata = {
  title: 'Revolución de Cartas Dinámicas - EduCard AI',
  description: 'Sistema revolucionario donde las cartas generan problemas personalizados usando IA en tiempo real',
}; 