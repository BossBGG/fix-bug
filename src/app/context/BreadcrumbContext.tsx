'use client'
import { createContext, useContext, useState } from 'react';

type BreadcrumbContextType = {
  breadcrumb: React.ReactNode;
  setBreadcrumb: (breadcrumb: React.ReactNode) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumb: null,
  setBreadcrumb: () => {},
});

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [breadcrumb, setBreadcrumb] = useState<React.ReactNode>(null);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);
