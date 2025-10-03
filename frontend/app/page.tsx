"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Component as EtheralShadow } from "../components/ui/etheral-shadow";
import { HoverButton } from "../components/ui/hover-button";
import { ensureAuthDev, getTopics } from "../lib/api";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showActions, setShowActions] = useState(false);
  const [topics, setTopics] = useState<Array<{ id: number; title: string; slug: string; description?: string; icon?: string }>>([]);
  // Фолбэк-список тем на случай недоступности бэкенда
  const fallbackTopics: Array<{ id: number; title: string; slug: string; description?: string; icon?: string }> = [
    { id: 1, title: "Отработка возражений", slug: "objections", description: "Активный спринт и архив материалов", icon: "window.svg" },
    { id: 2, title: "Закрытие сделки", slug: "closing", description: "Сценарии и практики коммуникации", icon: "next.svg" },
    { id: 3, title: "После встречи", slug: "postmeet", description: "Стандарты и шаблоны", icon: "file.svg" },
    { id: 4, title: "Выявление потребностей", slug: "needs", description: "Сбор информации и понимание задач клиента", icon: "globe.svg" },
  ];

  // Дефолтные иконки «как было», если с бэкенда иконка не задана
  const defaultIconsBySlug: Record<string, string> = {
    objections: "objections.svg",
    closing: "closing.svg",
    postmeet: "postmeet.svg",
    needs: "needs.svg",
  };

  useEffect(() => {
    const shouldOpen = searchParams.get("actions") === "1";
    setShowActions(!!shouldOpen);
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        await ensureAuthDev();
        const ts = await getTopics();
        setTopics(ts || []);
      } catch (e) {
        // ignore auth/network errors silently on landing
      }
    })();
  }, []);
  const displayTopics = (topics && topics.length > 0) ? topics : fallbackTopics;
  return (
    <div className="font-sans relative min-h-screen">
      {/* Фон EtheralShadow */}
      <div className="absolute inset-0">
        <EtheralShadow 
          color="rgba(128, 128, 128, 1)"
          noise={{ opacity: 1, scale: 1.2 }}
          sizing="fill"
        />
      </div>

      {/* Контент по центру */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center px-6 w-[520px] max-w-[92vw] mx-auto">
          <Link href="/admin" aria-label="Админ панель" className="group inline-block">
            <h1 className="relative leading-tight text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] cursor-pointer transition-colors group-hover:text-fuchsia-300">
              Продажник из тиндера
            </h1>
          </Link>
          <div className="mx-auto mt-2 h-[2px] w-28 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 opacity-70" />
          {!showActions && (
            <div className="mt-6 pointer-events-auto">
              <HoverButton onClick={() => { setShowActions(true); router.push("/?actions=1"); }}>
                Начать
              </HoverButton>
            </div>
          )}
          {showActions && (
          <div className="mt-8 space-y-4 pointer-events-auto">
            {displayTopics.map((t) => (
              <Link key={t.id} href={`/lessons/${t.slug}`} aria-label={t.title} className="group block w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-purple-400/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
                  {(() => {
                    const iconToUse = t.icon || defaultIconsBySlug[t.slug];
                    if (iconToUse) {
                      return <Image src={`/${iconToUse}`} alt="" width={20} height={20} className="h-5 w-5" />;
                    }
                    return (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="6" />
                        <line x1="16.5" y1="16.5" x2="21" y2="21" />
                      </svg>
                    );
                  })()}
                </span>
                <span className="flex-1">
                  <span className="block text-base md:text-lg font-semibold text-white">{t.title}</span>
                  {t.description && <span className="block text-sm text-white/70">{t.description}</span>}
                </span>
              </Link>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
