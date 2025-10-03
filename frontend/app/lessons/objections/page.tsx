"use client"
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Component as EtheralShadow } from "../../../components/ui/etheral-shadow";

function PageContent() {
  const router = useRouter();
  const VIDEO_URL = "https://www.figma.com/board/fFJuJYSS0B0UBylik2OKKD/%D0%92%D0%B8%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5?node-id=0-1&p=f&t=RjgSySUbpX8U82w1-0";
  const handleBack = () => router.push("/?actions=1");

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">
      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:border-white/25 transition"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Назад
      </button>

      <h1 className="text-2xl md:text-3xl font-bold">Возражения</h1>
      <p className="mt-2 text-sm text-white/70">Выберите подтему для просмотра видео</p>

      <div className="mt-8 space-y-3">
        <a
          href={VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group block w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="flex-1">
            <span className="block text-base md:text-lg font-semibold text-white">Основы</span>
            <span className="block text-sm text-white/70">Базовые принципы работы с возражениями</span>
          </span>
        </a>

        <a
          href={VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group block w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="flex-1">
            <span className="block text-base md:text-lg font-semibold text-white">Квалификация клиента</span>
            <span className="block text-sm text-white/70">Оценка соответствия клиента продукту</span>
          </span>
        </a>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="font-sans relative min-h-screen">
      <div className="absolute inset-0">
        <EtheralShadow color="rgba(128, 128, 128, 1)" noise={{ opacity: 1, scale: 1.2 }} sizing="fill" />
      </div>
      <Suspense fallback={<div className="relative z-10 mx-auto max-w-2xl px-4 py-10 text-white/70">Загрузка…</div>}>
        <PageContent />
      </Suspense>
    </div>
  );
}