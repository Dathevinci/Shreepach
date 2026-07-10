"use client";

import { useNovelModal } from "@/components/providers/NovelModalProvider";

export default function NovelModalTrigger({
  novel,
  className,
  children,
}: {
  novel: any;
  className?: string;
  children: React.ReactNode;
}) {
  const { openNovel } = useNovelModal();
  return (
    <button type="button" onClick={() => openNovel(novel)} className={className}>
      {children}
    </button>
  );
}
