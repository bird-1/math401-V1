
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">苏教版数学·四年级上</h1>
              <p className="text-xs text-slate-500">知识点遗漏深度分析系统</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition">首页</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition">大纲标准</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition">使用说明</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
