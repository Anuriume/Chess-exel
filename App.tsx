
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { analyzeMove } from './services/geminiService';
import { GameState, AnalysisResult, Move } from './types';
import { PieceIcon, ExcelIcon } from './components/Icons';

const App: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<GameState>({
    fen: 'start',
    history: [],
    turn: 'w',
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    winner: null,
  });
  
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sheet1' | 'analysis'>('sheet1');

  // Sync game state after every move
  const updateGameState = useCallback(() => {
    setGameState({
      fen: game.fen(),
      history: game.history({ verbose: true }) as unknown as Move[],
      turn: game.turn(),
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isDraw: game.isDraw(),
      winner: game.isCheckmate() ? (game.turn() === 'w' ? 'b' : 'w') : (game.isDraw() ? 'draw' : null),
    });
  }, [game]);

  const handleSquareClick = (square: string) => {
    if (gameState.winner) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    if (selectedSquare) {
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q', // default to queen for simplicity
        });

        if (move) {
          setGame(new Chess(game.fen()));
          setSelectedSquare(null);
          updateGameState();
        } else {
          // If move is invalid but square has a piece of current color, select it instead
          const piece = game.get(square as any);
          if (piece && piece.color === game.turn()) {
            setSelectedSquare(square);
          } else {
            setSelectedSquare(null);
          }
        }
      } catch (e) {
        setSelectedSquare(null);
      }
    } else {
      const piece = game.get(square as any);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setActiveTab('analysis');
    const result = await analyzeMove(game.fen(), game.history());
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setAnalysis(null);
    setGameState({
      fen: 'start',
      history: [],
      turn: 'w',
      isCheck: false,
      isCheckmate: false,
      isDraw: false,
      winner: null,
    });
  };

  const undoMove = () => {
    game.undo();
    setGame(new Chess(game.fen()));
    updateGameState();
  };

  // Render helpers
  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rows = [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="flex flex-col h-screen bg-[#f3f3f3] overflow-hidden">
      {/* Excel Ribbon / Header */}
      <header className="bg-white border-b border-gray-300 shadow-sm z-10">
        <div className="flex items-center px-4 py-1 space-x-4">
          <div className="flex items-center space-x-2">
            <ExcelIcon />
            <h1 className="text-lg font-bold text-gray-700">ExcelChess Pro</h1>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span className="px-3 py-1 bg-green-50 text-green-700 font-semibold rounded cursor-default border border-green-200">File</span>
            <span className="px-3 py-1 hover:bg-gray-100 rounded cursor-pointer transition">Insert</span>
            <span className="px-3 py-1 hover:bg-gray-100 rounded cursor-pointer transition">Draw</span>
            <span className="px-3 py-1 hover:bg-gray-100 rounded cursor-pointer transition">Page Layout</span>
            <span className="px-3 py-1 hover:bg-gray-100 rounded cursor-pointer transition">Formulas</span>
          </div>
        </div>
        
        {/* Quick Access Toolbar */}
        <div className="flex items-center px-4 py-2 bg-[#f8f9fa] border-b border-gray-300 space-x-6">
          <div className="flex flex-col items-center group cursor-pointer" onClick={resetGame}>
             <div className="p-2 group-hover:bg-gray-200 rounded-md transition">
               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </div>
             <span className="text-[10px] text-gray-500 uppercase font-semibold">Reset</span>
          </div>
          <div className="flex flex-col items-center group cursor-pointer" onClick={undoMove}>
             <div className="p-2 group-hover:bg-gray-200 rounded-md transition">
               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" /></svg>
             </div>
             <span className="text-[10px] text-gray-500 uppercase font-semibold">Undo</span>
          </div>
          <div className="h-10 w-px bg-gray-300 mx-2" />
          <div className="flex flex-col items-center group cursor-pointer" onClick={handleAnalyze}>
             <div className={`p-2 group-hover:bg-green-100 rounded-md transition ${isAnalyzing ? 'animate-pulse bg-green-50' : ''}`}>
               <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
             </div>
             <span className="text-[10px] text-gray-500 uppercase font-semibold">Analyze (Gemini)</span>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-white border border-gray-300 px-4 py-1 rounded flex items-center space-x-2 w-1/2">
              <span className="text-green-700 italic font-bold">fx</span>
              <div className="h-4 w-px bg-gray-300" />
              <input 
                className="flex-grow outline-none text-sm font-mono text-gray-700 bg-transparent" 
                readOnly 
                value={selectedSquare ? `${selectedSquare.toUpperCase()} Piece: ${game.get(selectedSquare as any)?.type.toUpperCase() || 'EMPTY'}` : `STATUS: ${gameState.turn === 'w' ? 'WHITE' : 'BLACK'}'S TURN`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow flex overflow-hidden">
        {/* Left: Row Indicators */}
        <div className="w-10 bg-[#f8f9fa] border-r border-gray-300 flex flex-col pt-10">
          {rows.map(r => (
            <div key={r} className="h-[calc(min(10vh,80px))] flex items-center justify-center border-b border-gray-200 text-xs text-gray-500 font-mono">
              {r}
            </div>
          ))}
        </div>

        {/* Center: The Board as Cells */}
        <div className="flex-grow overflow-auto p-4 flex flex-col items-start bg-gray-50">
           {/* Column Indicators */}
           <div className="flex ml-10">
              {columns.map(c => (
                <div key={c} className="w-[calc(min(10vh,80px))] h-6 border-b border-r border-gray-300 flex items-center justify-center text-xs text-gray-500 font-mono bg-[#f8f9fa]">
                  {c.toUpperCase()}
                </div>
              ))}
           </div>

           <div className="flex flex-col relative border-2 border-gray-400">
             {rows.map((row, rowIndex) => (
               <div key={row} className="flex">
                 {columns.map((col, colIndex) => {
                   const square = `${col}${row}`;
                   const piece = game.get(square as any);
                   const isDark = (rowIndex + colIndex) % 2 === 1;
                   const isSelected = selectedSquare === square;
                   
                   return (
                     <div 
                       key={square}
                       onClick={() => handleSquareClick(square)}
                       className={`
                         w-[calc(min(10vh,80px))] h-[calc(min(10vh,80px))]
                         flex items-center justify-center cursor-pointer transition-all duration-75 relative
                         border border-gray-300/30
                         ${isDark ? 'bg-[#9cc48d]' : 'bg-[#e7f0e4]'}
                         ${isSelected ? 'ring-4 ring-blue-400 z-10' : ''}
                         hover:opacity-80
                       `}
                     >
                       {piece && <PieceIcon type={piece.type} color={piece.color} />}
                       <span className="absolute bottom-0 right-1 text-[8px] opacity-20 font-mono">{square}</span>
                     </div>
                   );
                 })}
               </div>
             ))}

             {/* Overlays for Game End */}
             {gameState.winner && (
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                 <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">
                      {gameState.winner === 'draw' ? 'Draw!' : `${gameState.winner === 'w' ? 'White' : 'Black'} Wins!`}
                    </h2>
                    <p className="text-gray-600 mb-6">Match concludes with {gameState.isCheckmate ? 'Checkmate' : 'Stalemate'}.</p>
                    <button onClick={resetGame} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-bold uppercase tracking-widest text-sm">
                      New Spreadsheet
                    </button>
                 </div>
               </div>
             )}
           </div>

           <div className="mt-8 bg-white border border-gray-300 p-4 rounded-md shadow-sm w-full max-w-2xl">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Cell History Log</h3>
              <div className="grid grid-cols-4 border-t border-l border-gray-300 text-xs font-mono">
                 <div className="bg-gray-100 p-1 border-r border-b border-gray-300 font-bold">Entry</div>
                 <div className="bg-gray-100 p-1 border-r border-b border-gray-300 font-bold">Player</div>
                 <div className="bg-gray-100 p-1 border-r border-b border-gray-300 font-bold">SAN</div>
                 <div className="bg-gray-100 p-1 border-r border-b border-gray-300 font-bold">Cell Range</div>
                 {gameState.history.length === 0 && (
                   <div className="col-span-4 p-4 text-center text-gray-400 italic">No entries detected in workbook.</div>
                 )}
                 {gameState.history.slice(-5).map((move, i) => (
                   <React.Fragment key={i}>
                      <div className="p-1 border-r border-b border-gray-200">{gameState.history.length - 4 + i}</div>
                      <div className="p-1 border-r border-b border-gray-200">{move.color === 'w' ? 'WHITE' : 'BLACK'}</div>
                      <div className="p-1 border-r border-b border-gray-200 font-bold text-green-700">{move.san}</div>
                      <div className="p-1 border-r border-b border-gray-200 uppercase">{move.from}:{move.to}</div>
                   </React.Fragment>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Panel: Analysis & Controls */}
        <aside className="w-80 border-l border-gray-300 bg-white flex flex-col">
           <div className="flex border-b border-gray-300 text-xs">
              <button 
                onClick={() => setActiveTab('sheet1')}
                className={`flex-1 py-3 font-bold transition ${activeTab === 'sheet1' ? 'bg-white text-green-700 border-t-2 border-t-green-600' : 'bg-gray-50 text-gray-500 border-t-2 border-t-transparent hover:bg-gray-100'}`}
              >
                SHEET1 (Game Data)
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-3 font-bold transition ${activeTab === 'analysis' ? 'bg-white text-green-700 border-t-2 border-t-green-600' : 'bg-gray-50 text-gray-500 border-t-2 border-t-transparent hover:bg-gray-100'}`}
              >
                SHEET2 (AI Insights)
              </button>
           </div>

           <div className="flex-grow p-4 overflow-y-auto">
             {activeTab === 'sheet1' ? (
               <div className="space-y-6">
                 <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Workbook Status</h4>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                          <span className="text-gray-500">Active Player:</span>
                          <span className={`font-bold ${gameState.turn === 'w' ? 'text-blue-600' : 'text-orange-600'}`}>
                            {gameState.turn === 'w' ? 'WHITE (P1)' : 'BLACK (P2)'}
                          </span>
                       </div>
                       <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                          <span className="text-gray-500">Check State:</span>
                          <span className={`font-bold ${gameState.isCheck ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
                            {gameState.isCheck ? 'TRUE' : 'FALSE'}
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Raw FEN String</p>
                    <p className="text-[11px] font-mono break-all text-gray-600 leading-tight">
                      {gameState.fen}
                    </p>
                 </div>

                 <button 
                   onClick={handleAnalyze}
                   disabled={isAnalyzing}
                   className="w-full py-3 bg-green-700 text-white rounded font-bold text-sm shadow-md hover:bg-green-800 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
                 >
                   {isAnalyzing ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       <span>Calculating Rows...</span>
                     </>
                   ) : (
                     <span>Calculate Smart Moves</span>
                   )}
                 </button>
               </div>
             ) : (
               <div className="space-y-4">
                  {analysis ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                       <div className="bg-green-50 border-l-4 border-green-600 p-4">
                          <h5 className="text-xs font-bold text-green-800 uppercase mb-1">Executive Summary</h5>
                          <p className="text-sm text-gray-700 italic">"{analysis.commentary}"</p>
                       </div>

                       <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white border border-gray-200 p-3 rounded">
                             <p className="text-[10px] text-gray-400 uppercase font-bold">Eval Score</p>
                             <p className="text-xl font-bold text-gray-800">{analysis.evaluation}</p>
                          </div>
                          <div className="bg-white border border-gray-200 p-3 rounded">
                             <p className="text-[10px] text-gray-400 uppercase font-bold">Best Move</p>
                             <p className="text-xl font-bold text-green-600">{analysis.bestMove}</p>
                          </div>
                       </div>

                       <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Projected Line</p>
                          <div className="space-y-1">
                             {analysis.suggestedLine.map((move, idx) => (
                               <div key={idx} className="flex items-center space-x-2 text-xs font-mono bg-gray-50 p-2 rounded">
                                  <span className="w-4 text-gray-400">{idx + 1}.</span>
                                  <span className="font-bold text-gray-700">{move}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                       <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       <p className="text-sm text-gray-500">No analysis loaded. Press "Calculate Smart Moves" to involve the Gemini engine.</p>
                    </div>
                  )}
               </div>
             )}
           </div>

           {/* Status Bar */}
           <div className="bg-[#f0f0f0] border-t border-gray-300 px-3 py-1 flex items-center justify-between text-[11px] text-gray-600">
              <div className="flex items-center space-x-4">
                 <span className="text-green-700 font-bold uppercase">Ready</span>
                 <span>Accessibility: Good</span>
              </div>
              <div className="flex items-center space-x-3">
                 <span>100%</span>
                 <div className="w-20 h-1 bg-gray-300 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-green-600" />
                 </div>
              </div>
           </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
