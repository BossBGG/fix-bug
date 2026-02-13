import React from 'react';

interface RequiredLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export const RequiredLabel: React.FC<RequiredLabelProps> = ({ children, required = false }) => {
  return (
    <>
      {children} {required && <span className="text-red-500">*</span>}
    </>
  );
};
