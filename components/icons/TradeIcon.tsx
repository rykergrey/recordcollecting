import React from 'react';

export const TradeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 5-3-3-3 3" />
      <path d="m12 2 0 13" />
      <path d="m9 19 3 3 3-3" />
      <path d="m12 22 0-13" />
  </svg>
);
