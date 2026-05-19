/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  Copy, 
  FileText, 
  Loader2, 
  Sparkles, 
  Languages, 
  AlertCircle,
  Clock,
  LayoutDashboard,
  Settings,
  Info,
  Lightbulb,
  CheckCircle2,
  Mic,
  Upload,
  FileAudio
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputText }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '發生錯誤，請稍後再試。');
      }

      setResult(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '語音轉錄失敗。');
      }

      setInputText((prev) => (prev ? prev + '\n\n' + data.text : data.text));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTranscribing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">AI 會議助理</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Intelligence Meeting Minutes & Translation</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-4">
            <span className="text-xs font-semibold text-slate-400">系統狀態</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span> Gemini Pro 1.5 運作中
            </span>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        
        {/* Left Panel: Input */}
        <section className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              會議逐字稿 / 語音上傳
            </h2>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAudioUpload} 
                accept="audio/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isTranscribing}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  isTranscribing 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                )}
              >
                {isTranscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
                {isTranscribing ? "正在轉錄音檔..." : "上傳音檔轉文字"}
              </button>
              <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Markdown 支援</span>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
            {isTranscribing && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-emerald-600 gap-3">
                <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100 shadow-inner">
                  <FileAudio className="w-8 h-8 animate-pulse" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest animate-bounce">AI 正在轉錄您的語音內容...</p>
              </div>
            )}
            <textarea 
              className="flex-1 p-6 text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-0 placeholder-slate-300 font-mono text-sm"
              placeholder="在此貼上會議逐字稿，或點按上方按鈕上傳音檔..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400">字數統計: {inputText.length} 字</span>
              <button 
                onClick={handleGenerate}
                disabled={isLoading || !inputText.trim() || isTranscribing}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all transform active:scale-95",
                  (isLoading || !inputText.trim() || isTranscribing)
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4" />
                )}
                生成總結與翻譯
              </button>
            </div>
          </div>
        </section>

        {/* Right Panel: Output */}
        <section className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              AI 生成結果
            </h2>
            <div className="flex gap-2">
              {result && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {copied ? (
                    <>
                      <ClipboardCheck className="w-4 h-4" />
                      已複製
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      一鍵複製
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar prose prose-slate max-w-none">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-slate-400 gap-4"
                  >
                    <div className="relative">
                      <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                      <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-indigo-300 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold animate-pulse text-slate-600">正在精煉您的會議重點...</p>
                  </motion.div>
                )}

                {!isLoading && !result && !error && (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-slate-300 gap-6 py-20"
                  >
                    <div className="bg-slate-50 p-6 rounded-full">
                      <Clock className="w-12 h-12 text-slate-200" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-400">尚未生成內容</p>
                      <p className="text-sm">在左側貼上文字並點擊生成按鈕</p>
                    </div>
                  </motion.div>
                )}

                {result && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="markdown-body"
                    ref={resultRef}
                  >
                    <ReactMarkdown>{result}</ReactMarkdown>
                    
                    <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-slate-100">
                      <span className="px-2 py-1 bg-slate-100 text-[10px] rounded text-slate-500 font-mono uppercase tracking-wider">#Meeting_Minutes</span>
                      <span className="px-2 py-1 bg-slate-100 text-[10px] rounded text-slate-500 font-mono uppercase tracking-wider">#AI_Generated</span>
                      <span className="px-2 py-1 bg-slate-100 text-[10px] rounded text-slate-500 font-mono uppercase tracking-wider">#Summary</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-slate-100 border-t border-slate-200 px-8 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.6)] animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">系統指令狀態: 已載入精簡繁中模式</span>
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <span className="text-[10px] text-slate-400 font-medium">系統核心: v3.1.0-Flash</span>
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">© {new Date().getFullYear()} AI Meeting Minutes Tool</p>
      </footer>
    </div>
  );
}

