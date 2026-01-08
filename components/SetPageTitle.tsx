'use client';

import { useEffect } from 'react';
import { usePageTitle } from './PageTitle';

interface SetPageTitleProps {
  title: string;
  description: string;
}

export function SetPageTitle({ title, description }: SetPageTitleProps) {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(title, description);
  }, [title, description, setPageTitle]);

  return null;
}
