import React from "react";

interface SignatureTypeProps {
  children: React.ReactNode;
  active: boolean
}

const SignatureTypeLayout: React.FC<SignatureTypeProps> = ({children, active}: SignatureTypeProps) => {
  return (
    <div className="w-full md:w-1/2 px-2 text-center">
      <div className={`border-1 rounded-[12px] font-semibold mb-3 md:mb-0 px-2 py-4 ${active ? 'border-[#671FAB] accent-[#671FAB]' : 'border-[#E0E0E0]'}`}>
        {children}
      </div>
    </div>
  )
}

export default SignatureTypeLayout;
