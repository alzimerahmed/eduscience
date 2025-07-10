import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthModalView = 'login' | 'register';

interface AuthModalContextType {
  isOpen: boolean;
  view: AuthModalView;
  openModal: (view?: AuthModalView, redirectTo?: string) => void;
  closeModal: () => void;
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthModalView>('login');
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const openModal = (viewParam: AuthModalView = 'login', redirectTo: string | null = null) => {
    setView(viewParam);
    setRedirectPath(redirectTo);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setRedirectPath(null);
  };

  return (
    <AuthModalContext.Provider
      value={{ isOpen, view, openModal, closeModal, redirectPath, setRedirectPath }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = (): AuthModalContextType => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
