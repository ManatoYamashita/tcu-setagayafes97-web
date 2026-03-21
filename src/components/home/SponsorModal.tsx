"use client";

import { Modal } from "@/components/ui/Modal";
import type { Information } from "@/types/informations";

interface SponsorModalProps {
  sponsor: Information | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 協賛企業詳細モーダル
 * ロゴ・企業名・説明文・Webサイトリンクを表示
 */
export function SponsorModal({ sponsor, isOpen, onClose }: SponsorModalProps) {
  if (!sponsor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={`${sponsor.title}の詳細`}>
      <div className="flex flex-col items-center gap-4 pt-4">
        {sponsor.image?.url && (
          <div className="flex h-24 items-center justify-center">
            <img
              src={sponsor.image.url}
              alt={sponsor.title}
              className="max-h-24 max-w-full object-contain"
            />
          </div>
        )}
        <h3 className="text-center text-lg font-bold text-gray-900">{sponsor.title}</h3>
        {sponsor.description && (
          <p className="text-center text-sm leading-relaxed text-gray-600">{sponsor.description}</p>
        )}
        {sponsor.url && (
          <a
            href={sponsor.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <span>Webサイトを見る</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </Modal>
  );
}
