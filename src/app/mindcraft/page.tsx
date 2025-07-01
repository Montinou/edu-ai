'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Custom components
import MindcraftButton from '@/components/ui/MindcraftButton';
import StatCounter from '@/components/ui/StatCounter';
import FeatureCard from '@/components/ui/FeatureCard';
import UniversalCard from '@/components/cards/UniversalCard';

// Features data
const features = [
  {
    icon: '🧮',
    title: 'Matemáticas Gamificadas',
    description: 'Sistema de cartas RPG donde resolver problemas matemáticos se convierte en batallas épicas. Cada acierto desbloquea poder y progreso real.'
  },
  {
    icon: '🤖',
    title: 'Alfabetización en IA',
    description: 'Aprenden a crear prompts efectivos, entender cómo funciona la IA y desarrollar pensamiento crítico sobre la tecnología.'
  },
  {
    icon: '📚',
    title: 'Aventuras Narrativas',
    description: 'RPG literario personalizado donde cada decisión enseña elementos narrativos, comprensión lectora y escritura creativa.'
  },
  {
    icon: '🎨',
    title: 'Creatividad Potenciada',
    description: 'Herramientas de IA para crear cuentos únicos y diseñar personajes, desarrollando la imaginación y habilidades artísticas.'
  },
  {
    icon: '📊',
    title: 'Progreso Medible',
    description: 'Analytics en tiempo real que muestran el desarrollo de habilidades matemáticas, lógicas y de pensamiento crítico.'
  },
  {
    icon: '🛡️',
    title: 'Seguro y Confiable',
    description: 'Contenido curado por educadores, privacidad total de datos y experiencia diseñada específicamente para niños.'
  }
];

// Cartas de demostración para la landing
const LANDING_CARDS = [
  {
    id: 'card-1', name: 'Dragón Algebraico', rarity: 'epic', attack_power: 8,
    category: 'algebra', difficulty_level: 7,
    image_url: '/images/cards/card-images/math-default.svg',
    description: 'Domina ecuaciones y conquista problemas algebraicos con este poderoso aliado.'
  },
  {
    id: 'card-2', name: 'Geomago Supremo', rarity: 'legendary', attack_power: 10,
    category: 'geometry', difficulty_level: 8,
    image_url: '/images/cards/card-images/patron-dragon.svg',
    description: 'Conjura figuras geométricas y resuelve acertijos espaciales con precisión mágica.'
  },
  {
    id: 'card-3', name: 'Calculadora Viviente', rarity: 'rare', attack_power: 6,
    category: 'arithmetic', difficulty_level: 5,
    image_url: '/images/cards/card-images/multiplicacion-magica.svg',
    description: 'Procesa números a velocidad sobrenatural y resuelve operaciones básicas en segundos.'
  }
];

export default function MindcraftLanding() {
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState('');

  // Animation controls
  const featuresControls = useAnimation();
  const demoControls = useAnimation();
  const waitlistControls = useAnimation();

  // Intersection observers
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 });
  const [demoRef, demoInView] = useInView({ threshold: 0.1 });
  const [waitlistRef, waitlistInView] = useInView({ threshold: 0.1 });

  // Handle loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle animation when sections come into view
  useEffect(() => {
    if (featuresInView) {
      featuresControls.start('visible');
    }
    if (demoInView) {
      demoControls.start('visible');
    }
    if (waitlistInView) {
      waitlistControls.start('visible');
    }
  }, [featuresInView, demoInView, waitlistInView, featuresControls, demoControls, waitlistControls]);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission - would connect to API in production
    alert(`¡Gracias por unirte a la lista de espera con ${email}! Te contactaremos pronto con actualizaciones exclusivas.`);
    setEmail('');
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 animate-gradient-shift">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/10 backdrop-blur-xl border-b border-white/10' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/mindcraft" className="flex items-center gap-3 text-2xl font-extrabold text-white">
            <span className="text-3xl animate-pulse">🧠</span>
            MindCraft AI
          </Link>
          <MindcraftButton href="#waitlist" type="glass">
            Acceso Temprano
          </MindcraftButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-2 rounded-full text-sm font-medium mb-8"
          >
            🚀 Revolución Educativa con IA
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
          >
            Construyendo Mentes<br />Brillantes
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
          >
            La primera plataforma educativa que enseña a niños de 8-12 años a dominar 
            la IA mientras aprenden matemáticas, lógica y creatividad a través de aventuras interactivas.
          </motion.p>
          
          <MindcraftButton href="#waitlist" delay={0.6} className="text-lg px-8 py-4 mb-16">
            <span>🎯</span>
            Únete a la Lista de Espera
          </MindcraftButton>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-10 md:gap-20"
          >
            <StatCounter end={500} label="Padres Interesados" suffix="+" delay={0} />
            <StatCounter end={15} label="Educadores Consultores" suffix="+" delay={200} />
            <StatCounter end={4} label="Módulos Únicos" delay={400} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        className="py-24 px-6 bg-white"
        ref={featuresRef}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              ¿Por qué MindCraft AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Combinamos gamificación auténtica con IA educativa para crear una experiencia de aprendizaje 
              que prepara a tu hijo para el futuro digital.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section 
        id="demo" 
        className="py-24 px-6 bg-gray-50"
        ref={demoRef}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Ve MindCraft AI en Acción
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Imagina a tu hijo resolviendo ecuaciones para derrotar dragones, creando 
                historias con IA como copiloto, y diseñando personajes que cobran vida 
                en sus aventuras. Todo mientras desarrolla las habilidades más importantes del siglo XXI.
              </p>
              <MindcraftButton href="#waitlist" type="secondary">
                <span>🎮</span>
                Reservar Demo Exclusiva
              </MindcraftButton>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Cartas Educativas Interactivas</h3>
                <p className="text-gray-600">Cada carta enseña un concepto específico a través del juego</p>
              </div>

              {/* Cartas superpuestas y rotadas */}
              <div className="relative w-[400px] h-[340px] mx-auto">
                {LANDING_CARDS.map((card, index) => {
                  // Ángulos y solapamiento
                  const angle = (index - 1) * 15; // -15, 0, +15
                  const leftOffset = index * 80;   // 0px, 80px, 160px
                  const zIndices = [1, 3, 2];        // center al frente
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: `${leftOffset}px`,
                        transform: `rotate(${angle}deg)`,
                        zIndex: zIndices[index]
                      }}
                      whileHover={{ scale: 1.05, zIndex: 4 }}
                    >
                      <UniversalCard
                        id={card.id}
                        name={card.name}
                        rarity={card.rarity}
                        attack_power={card.attack_power}
                        category={card.category}
                        difficulty_level={card.difficulty_level}
                        image_url={card.image_url}
                        description={card.description}
                        size="small"
                        showPlayButton={true}
                        onPlayClick={() => alert(`¡Jugando carta de ${card.category}!`)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section 
        id="waitlist" 
        className="py-24 px-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 relative"
        ref={waitlistRef}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Únete a la Revolución Educativa
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Sé de los primeros en acceder a MindCraft AI. Los fundadores obtienen 
            acceso gratuito de por vida y moldean el futuro de la plataforma.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 bg-white/95 backdrop-blur-md px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="bg-white/20 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/30 hover:-translate-y-1 transition-all"
            >
              Reservar Mi Lugar 🚀
            </button>
          </form>
          
          <p className="text-white/80 text-sm">
            ✨ Únete a 500+ padres visionarios que ya están en lista de espera
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 text-2xl font-extrabold mb-4">
              <span>🧠</span>
              MindCraft AI
            </div>
            <p className="text-gray-400 max-w-md text-center mb-10">
              Preparando a la próxima generación para un futuro impulsado por la inteligencia artificial.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Características</a>
              <a href="#waitlist" className="text-gray-400 hover:text-white transition-colors">Lista de Espera</a>
              <a href="mailto:hola@mindcraft-ai.com" className="text-gray-400 hover:text-white transition-colors">Contacto</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-10 text-center">
            <p className="text-gray-500">
              &copy; 2025 MindCraft AI. Construyendo mentes brillantes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 