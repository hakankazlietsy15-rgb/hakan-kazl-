
import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 'md' }) => {
  const [error, setError] = useState(false);

  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    xl: 'w-40 h-40'
  };

  // Eğer resim dosyası bulunamazsa gösterilecek şık SVG Yunus
  const FallbackIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white p-2">
      <path d="M22 11C22 11 18 5 12 5C6 5 2 11 2 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 5C14 5 15.5 3.5 15.5 2C15.5 2 18 3 20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M2 11C2 11 4 17 12 17C20 17 22 11 22 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 17C12 17 10 20 7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
    </svg>
  );

  return (
    <div className={`${sizes[size]} ${className} relative flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-[#00AEEF] to-[#0054A6] p-0.5 shadow-lg`}>
      <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
        {!error ? (
          <img 
            src="logo.png" 
            alt="Yunuslar" 
            className="w-full h-full object-contain p-1"
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#0054A6] to-[#00AEEF] flex items-center justify-center">
            <FallbackIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
