
import React from 'react';
import { AnalysisResult, SyllabusTopic } from '../types';
import { SYLLABUS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  const chartData = SYLLABUS.map(unit => ({
    subject: unit.title,
    covered: result.coveredTopics.includes(unit.id) ? 100 : 0,
    fullMark: 100
  }));

  const getTopicTitle = (id: string) => SYLLABUS.find(t => t.id === id)?.title || id;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
             <svg className="w-24 h-24">
                <circle className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="44" cx="48" cy="48" />
                <circle className="text-blue-600" strokeWidth="6" strokeDasharray={276} strokeDashoffset={276 - (276 * result.overallScore / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="44" cx="48" cy="48" />
             </svg>
             <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-slate-800">{result.overallScore}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">资料覆盖度评分</h3>
          <p className="text-sm text-slate-500 mt-2">基于苏教版大纲标准的综合练习权重评估</p>
          <div className="mt-4 grid grid-cols-2 gap-4 w-full">
            <div className="bg-blue-50 p-3 rounded-xl">
              <p className="text-xs text-blue-600 font-medium">识别题目</p>
              <p className="text-xl font-bold text-blue-800">{result.questionCount}道</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <p className="text-xs text-green-600 font-medium">覆盖单元</p>
              <p className="text-xl font-bold text-green-800">{result.coveredTopics.length}/{SYLLABUS.length}</p>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-blue-500"></i>
            大纲知识点覆盖雷达图
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="已覆盖" dataKey="covered" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-md font-bold text-red-600 mb-4 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i>
            知识点遗漏清单
          </h3>
          <div className="space-y-4">
            {result.missingTopics.length > 0 ? (
              result.missingTopics.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-red-50 border-l-4 border-l-red-500 bg-red-50/30">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{getTopicTitle(item.topicId)}</h4>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed"><span className="font-medium">原因分析：</span>{item.reason}</p>
                  <div className="flex items-start gap-2 text-xs bg-white p-2 rounded border border-red-100">
                    <i className="fas fa-lightbulb text-yellow-500 mt-0.5"></i>
                    <p className="text-slate-700 italic">{item.suggestion}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                <p className="text-slate-500">太棒了！该套题完美覆盖了全册重点。</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-robot text-purple-500"></i>
            AI 专家点评
          </h3>
          <div className="prose prose-sm max-w-none">
             <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
               {result.aiCommentary}
             </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-bold text-slate-800 mb-3">复习优先级建议</h4>
            <div className="space-y-2">
              {SYLLABUS.map(topic => {
                const isMissing = result.missingTopics.some(m => m.topicId === topic.id);
                return (
                  <div key={topic.id} className="flex items-center justify-between text-xs p-2 rounded hover:bg-slate-50">
                    <span className="text-slate-700 font-medium">{topic.title}</span>
                    {isMissing ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">待补充</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-bold">已覆盖</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
