'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PageTitleContextType {
  title: string;
  description: string;
  setPageTitle: (title: string, description: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType>({
  title: 'Sales Governance Management',
  description: 'Enterprise-grade platform for managing compensation governance, approvals, and compliance',
  setPageTitle: () => {},
});

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Sales Governance Management');
  const [description, setDescription] = useState('Enterprise-grade platform for managing compensation governance, approvals, and compliance');

  const setPageTitle = (newTitle: string, newDescription: string) => {
    setTitle(newTitle);
    setDescription(newDescription);
  };

  return (
    <PageTitleContext.Provider value={{ title, description, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  return useContext(PageTitleContext);
}
