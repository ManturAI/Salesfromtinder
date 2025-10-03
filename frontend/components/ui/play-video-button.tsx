import React from "react";

type Props = {
  href: string;
};

export default function PlayVideoButton({ href }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:border-white/25 transition"
      aria-label="Смотреть обучающее видео"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      Смотреть видео
    </a>
  );
}