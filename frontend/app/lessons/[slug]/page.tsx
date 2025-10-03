"use client"
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Component as EtheralShadow } from "../../../components/ui/etheral-shadow";
import { getTopicBySlug, getLessons } from "../../../lib/api";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<{ id: number; title: string; slug: string; description?: string } | null>(null);
  const [lessons, setLessons] = useState<Array<{ id: number; title: string; description?: string; icon?: string; slug: string }>>([]);
  const slug = params?.slug as string;

  useEffect(() => {
    (async () => {
      try {
        const t = await getTopicBySlug(slug);
        setTopic(t);
        const ls = await getLessons({ topicSlug: slug });
        setLessons(ls);
      } catch (e) {
        console.error('Failed to load topic/lessons', e);
      }
    })();
  }, [slug]);

  const handleBack = () => router.push("/?actions=1");

  return (
    <div className="font-sans relative min-h-screen">
      <div className="absolute inset-0">
        <EtheralShadow color="rgba(128, 128, 128, 1)" noise={{ opacity: 1, scale: 1.2 }} sizing="fill" />
      </div>
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

        <h1 className="text-2xl md:text-3xl font-bold">{topic?.title ?? 'Материалы'}</h1>
        {topic?.description && (<p className="mt-2 text-sm text-white/70">{topic.description}</p>)}

        <div className="mt-8 space-y-4">
          {lessons.map((item) => (
            <div key={item.id} className="group w-full text-left flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-4 shadow-sm hover:border-white/20 hover:bg-white/10 transition">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/5 text-white/90 group-hover:text-fuchsia-300 transition-colors">
                {item.icon ? (
                  <Image src={`/${item.icon}`} alt="" width={20} height={20} className="h-5 w-5" />
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="8" y1="9" x2="16" y2="9" />
                  </svg>
                )}
              </span>
              <span className="flex-1">
                <span className="block text-base md:text-lg font-semibold text-white">{item.title}</span>
                {item.description && (<span className="block text-sm text-white/70">{item.description}</span>)}
              </span>
            </div>
          ))}
          {lessons.length === 0 && (
            <div className="text-white/70 text-sm">Пока тут пусто. Добавьте материалы в админке.</div>
          )}
        </div>
      </div>
    </div>
  );
}