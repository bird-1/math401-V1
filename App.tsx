
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import { FileData, AnalysisResult } from './types';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: FileData[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const runAnalysis = async () => {
    if (files.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const gemini = new GeminiService();
      const result = await gemini.analyzeQuestions(files);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '分析过程中发生错误，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Upload & Control */}
          <div className="lg:col-span-4 space-y-6">
            <FileUpload 
              onFilesAdded={handleFilesAdded} 
              files={files} 
              onRemoveFile={handleRemoveFile}
              isLoading={isAnalyzing}
            />

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-semibold text-slate-800 mb-3">分析控制台</h3>
               <button 
                onClick={runAnalysis}
                disabled={files.length === 0 || isAnalyzing}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
                  ${files.length === 0 || isAnalyzing 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95'}`}
              >
                {isAnalyzing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    正在深度分析中...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wand-magic-sparkles"></i>
                    生成知识点遗漏报告
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-3">
                基于谷歌 Gemini 3 Pro 旗舰级模型驱动
              </p>
            </div>

            <div className="bg-blue-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
               <div className="relative z-10">
                 <h4 className="font-bold mb-2">专业版提示</h4>
                 <p className="text-xs text-blue-200 leading-relaxed mb-4">
                   苏教版数学大纲对“解决问题的策略”和“混合运算”有较高要求，系统会自动对比这两大板块的题型深度。
                 </p>
                 <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="bg-blue-800 px-2 py-1 rounded">2024秋季最新大纲</span>
                    <span className="bg-blue-800 px-2 py-1 rounded">苏教版同步</span>
                 </div>
               </div>
               <i className="fas fa-award absolute -right-4 -bottom-4 text-7xl text-blue-800/50"></i>
            </div>
          </div>

          {/* Right Side: Results & Feedback */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                <i className="fas fa-circle-exclamation"></i>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {!isAnalyzing && !analysisResult && !error && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-file-invoice text-slate-300 text-3xl"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-700 mb-2">等待数据输入</h2>
                <p className="text-slate-400 max-w-sm">请在左侧上传 PDF 练习卷或题目图片，点击“生成报告”开始智能分析。</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 relative mb-8">
                   <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fas fa-brain text-blue-600 text-2xl animate-pulse"></i>
                   </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">正在进行多维度分析</h2>
                <div className="space-y-3 w-full max-w-xs">
                   <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                      <span>题目OCR识别中</span>
                      <span>已完成</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-full"></div>
                   </div>
                   <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                      <span>知识点对齐中</span>
                      <span className="text-blue-600 animate-pulse">进行中...</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-2/3 animate-[progress_2s_ease-in-out_infinite]"></div>
                   </div>
                </div>
                <p className="text-slate-400 mt-8 text-sm italic">AI正在根据苏教版大纲对比每一个二级考点，请耐心等待...</p>
              </div>
            )}

            {analysisResult && <AnalysisDashboard result={analysisResult} />}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2024 苏教版小学数学教研数字化系统 - 专业版</p>
          <div className="flex justify-center gap-6 mt-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1"><i className="fas fa-shield-halved"></i> 隐私保护</span>
            <span className="flex items-center gap-1"><i className="fas fa-server"></i> 加密传输</span>
            <span className="flex items-center gap-1"><i className="fas fa-certificate"></i> 大纲实时同步</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
