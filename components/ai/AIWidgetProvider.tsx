'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AIWidgetState {
  opsChiefOpen: boolean;
  askDockOpen: boolean;
  appChatbotOpen: boolean;
}

interface AIWidgetContextValue {
  state: AIWidgetState;
  toggleOpsChief: () => void;
  toggleAskDock: () => void;
  toggleAppChatbot: () => void;
  closeAll: () => void;
}

const AIWidgetContext = createContext<AIWidgetContextValue | undefined>(undefined);

export function AIWidgetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AIWidgetState>({
    opsChiefOpen: false,
    askDockOpen: false,
    appChatbotOpen: false,
  });

  const toggleOpsChief = () => {
    setState(s => ({ ...s, opsChiefOpen: !s.opsChiefOpen }));
  };

  const toggleAskDock = () => {
    setState(s => ({ ...s, askDockOpen: !s.askDockOpen }));
  };

  const toggleAppChatbot = () => {
    setState(s => ({ ...s, appChatbotOpen: !s.appChatbotOpen }));
  };

  const closeAll = () => {
    setState({
      opsChiefOpen: false,
      askDockOpen: false,
      appChatbotOpen: false,
    });
  };

  return (
    <AIWidgetContext.Provider
      value={{
        state,
        toggleOpsChief,
        toggleAskDock,
        toggleAppChatbot,
        closeAll,
      }}
    >
      {children}
    </AIWidgetContext.Provider>
  );
}

export function useAIWidgets() {
  const context = useContext(AIWidgetContext);
  if (!context) {
    throw new Error('useAIWidgets must be used within AIWidgetProvider');
  }
  return context;
}
