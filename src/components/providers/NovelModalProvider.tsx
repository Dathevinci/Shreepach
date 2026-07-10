"use client";

import { createContext, useContext, useState, useCallback, Suspense } from "react";
import QuickViewNovelModal from "@/components/ui/QuickViewNovelModal";

export interface NovelModalOptions {
  startTab?: "chapters" | "discussions";
}

interface NovelModalContextValue {
  openNovel: (novel: any, options?: NovelModalOptions) => void;
  closeNovel: () => void;
}

const NovelModalContext = createContext<NovelModalContextValue>({
  openNovel: () => {},
  closeNovel: () => {},
});

export const useNovelModal = () => useContext(NovelModalContext);

export default function NovelModalProvider({ children }: { children: React.ReactNode }) {
  const [novel, setNovel] = useState<any | null>(null);
  const [options, setOptions] = useState<NovelModalOptions | undefined>();

  const openNovel = useCallback((n: any, opts?: NovelModalOptions) => {
    setNovel(n);
    setOptions(opts);
  }, []);
  
  const closeNovel = useCallback(() => {
    setNovel(null);
    setOptions(undefined);
  }, []);

  return (
    <NovelModalContext.Provider value={{ openNovel, closeNovel }}>
      {children}
      {novel && (
        <QuickViewNovelModal
          key={novel.id}
          novel={novel}
          options={options}
          onClose={closeNovel}
        />
      )}
    </NovelModalContext.Provider>
  );
}
