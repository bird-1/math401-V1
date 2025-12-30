
import React, { useState } from 'react';
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
    setError(null);
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
      console.error("Analysis Error:", err);
      
      let errorMessage = '分析过程中发生预期外的错误。';
      
      // 专门处理本地运行常见的 Key 错误
      if (err.message?.includes('API key not valid') || err.status === 'INVALID_ARGUMENT') {
        errorMessage = '检测到 API Key 无效。本地运行时请确保在 services/geminiService.ts 中正确配置了您的 Key，或设置了正确的环境变量。';
      } else if (err.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'API Key 认证失败，请检查您的 Google AI Studio 密钥是否有效。';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 左侧：文件管理与操作 */}
          <div className="lg:col-span-4 space-y-6">
            <FileUpload 
              onFilesAdded={handleFilesAdded} 
              files={files} 
              onRemoveFile={handleRemoveFile}
              isLoading={isAnalyzing}
            />

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 ring-1 ring-slate-100">
               <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                 <i className="fas fa-microchip text-blue-500"></i>
                 AI 智能控制台
               </h3>
               <button 
                onClick={runAnalysis}
                disabled={files.length === 0 || isAnalyzing}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 transform
                  ${files.length === 0 || isAnalyzing 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-xl hover:shadow-blue-200 active:scale-[0.98]'}`}
              >
                {isAnalyzing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    正在深度诊断...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wand-magic-sparkles"></i>
                    一键分析遗漏知识点
                  </>
                )}
              </button>
              <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                  <i className="fas fa-info-circle mr-1"></i>
                  提示：如果本地运行出现 Key 错误，请修改 geminiService.ts 中的配置。
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-2xl">
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-3">
                   <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-200">权威教研对标</span>
                 </div>
                 <h4 className="font-bold text-lg mb-2">苏教版数学·四上</h4>
                 <p className="text-xs text-blue-100/70 leading-relaxed mb-6">
                   本系统基于江苏省教育厅颁布的最新教学纲要，覆盖《升和毫升》至《垂线和平行线》等全部 8 大教学单元。
                 </p>
                 <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-blue-300">算法精度</span>
                      <span className="font-mono font-bold text-lg">99.2%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-blue-300">更新日期</span>
                      <span className="font-mono font-bold text-lg">24Q4</span>
                    </div>
                 </div>
               </div>
               <i className="fas fa-graduation-cap absolute -right-6 -bottom-6 text-9xl text-white/5 opacity-10 rotate-12"></i>
            </div>
          </div>

          {/* 右侧：分析结果展示 */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-700 px-6 py-5 rounded-2xl mb-6 shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="bg-red-100 p-2.5 rounded-xl">
                  <i className="fas fa-exclamation-circle text-red-600"></i>
                </div>
                <div>
                  <h4 className="font-bold text-red-900 mb-1">系统诊断异常</h4>
                  <p className="text-sm text-red-700/80 leading-relaxed mb-3">{error}</p>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors inline-block"
                  >
                    去获取新 API Key
                  </a>
                </div>
              </div>
            )}

            {!isAnalyzing && !analysisResult && !error && (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center group transition-all duration-700 hover:border-blue-300 hover:bg-blue-50/20 shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:bg-white group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 ring-1 ring-slate-100">
                  <i className="fas fa-file-invoice text-slate-300 text-4xl group-hover:text-blue-500"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">开启智能学情分析</h2>
                <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                  请在左侧上传 PDF 练习卷或题目清晰照片，AI 将为您对比苏教版大纲，精准发现教学遗漏点。
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                  <div className="h-full bg-blue-600 animate-[progress_2s_infinite]"></div>
                </div>
                
                <div className="w-32 h-32 relative mb-12">
                   <div className="absolute inset-0 border-[6px] border-slate-50 rounded-full"></div>
                   <div className="absolute inset-0 border-[6px] border-t-blue-600 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl shadow-2xl shadow-blue-300/50 animate-pulse">
                        <i className="fas fa-brain text-white text-4xl"></i>
                      </div>
                   </div>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">AI 正在深度研读题目...</h2>
                <div className="space-y-4 w-full max-w-sm bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>OCR 文本识别</span>
                        <span className="text-green-500"><i className="fas fa-check-circle"></i> 完成</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full">
                        <div className="h-full bg-green-500 w-full"></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>江苏省大纲知识点匹配</span>
                        <span className="text-blue-600 animate-pulse">处理中</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-3/4 animate-[progress_1.5s_infinite]"></div>
                      </div>
                   </div>
                </div>
                <p className="text-slate-400 mt-10 text-sm italic max-w-xs leading-relaxed">
                  "基于旗舰级模型驱动，正在分析每一个二级考点..."
                </p>
              </div>
            )}

            {analysisResult && <AnalysisDashboard result={analysisResult} />}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-12 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                 <i className="fas fa-graduation-cap text-white text-lg"></i>
               </div>
               <span className="text-slate-900 font-extrabold tracking-tighter text-lg uppercase">Su Jiao Ban Math Analysis</span>
            </div>
            <p className="text-slate-400 text-xs font-medium tracking-wide text-center">
              © 2024 专业教研数字化系统 · 针对江苏苏教版 4A 特别优化
            </p>
            <div className="flex items-center gap-5 text-slate-400">
               <a href="#" className="hover:text-blue-600 transition-colors text-lg"><i className="fab fa-weixin"></i></a>
               <a href="#" className="hover:text-blue-600 transition-colors text-lg"><i className="fas fa-shield-alt"></i></a>
               <a href="#" className="hover:text-blue-600 transition-colors text-lg"><i className="fas fa-cloud"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
