'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { PageKbData } from '@/lib/ui-kb/loader';

interface PageKbContextValue {
  data: PageKbData | null;
  loading: boolean;
  error: string | null;
}

const PageKbContext = createContext<PageKbContextValue>({
  data: null,
  loading: false,
  error: null,
});

export function PageKbProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [data, setData] = useState<PageKbData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadKb = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ui-kb/page?path=${encodeURIComponent(pathname)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 404) {
            if (isActive) setData(null);
            return;
          }
          throw new Error(`KB load failed: ${response.status}`);
        }

        const payload = (await response.json()) as PageKbData;
        if (isActive) setData(payload);
      } catch (err) {
        if (!isActive) return;
        if ((err as Error).name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'KB load failed');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadKb();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [pathname]);

  return (
    <PageKbContext.Provider value={{ data, loading, error }}>
      {children}
    </PageKbContext.Provider>
  );
}

export function usePageKb() {
  return useContext(PageKbContext);
}
