import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MindCraft AI - Construyendo Mentes Brillantes",
  description: "La primera plataforma educativa que enseña a niños de 8-12 años a usar IA mientras aprenden matemáticas y creatividad. Únete a la revolución educativa.",
  openGraph: {
    title: "MindCraft AI - El Futuro de la Educación",
    description: "Plataforma educativa revolucionaria con IA para niños de 8-12 años. Matemáticas, lógica y creatividad en aventuras interactivas.",
    url: "https://mindcraft-ai.vercel.app/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindCraft AI - El Futuro de la Educación",
    description: "Plataforma educativa revolucionaria con IA para niños de 8-12 años.",
  },
};

export default function MindcraftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 