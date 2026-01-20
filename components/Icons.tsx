
import React from 'react';

export const PieceIcon = ({ type, color }: { type: string, color: 'w' | 'b' }) => {
  const mapping: Record<string, string> = {
    'wp': '♙', 'wr': '♖', 'wn': '♘', 'wb': '♗', 'wq': '♕', 'wk': '♔',
    'bp': '♟', 'br': '♜', 'bn': '♞', 'bb': '♝', 'bq': '♛', 'bk': '♚'
  };
  return <span className={`text-4xl select-none ${color === 'w' ? 'text-gray-800' : 'text-black'}`}>{mapping[color + type]}</span>;
};

export const ExcelIcon = () => (
  <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16.2,2H7.8C6.81,2,6,2.81,6,3.8v16.4C6,21.19,6.81,22,7.8,22h8.4c0.99,0,1.8-0.81,1.8-1.8V3.8C18,2.81,17.19,2,16.2,2z M15.5,19h-7 c-0.28,0-0.5-0.22-0.5-0.5v-13c0-0.28,0.22-0.5,0.5-0.5h7c0.28,0,0.5,0.22,0.5,0.5v13C16,18.78,15.78,19,15.5,19z M13,7h-2v2h2V7z M13,11 h-2v2h2V11z M13,15h-2v2h2V15z M10,7H8v2h2V7z M10,11H8v2h2V11z M10,15H8v2h2V15z" />
  </svg>
);
