
import React, { useRef } from 'react';
import { FileData } from '../types';

interface FileUploadProps {
  onFilesAdded: (files: FileData[]) => void;
  files: FileData[];
  onRemoveFile: (id: string) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded, files, onRemoveFile, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // FIX: Explicitly cast the files array to File[] to ensure the 'file' object has name, type, and Blob properties
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length === 0) return;

    const newFiles: FileData[] = await Promise.all(
      selectedFiles.map(file => new Promise<FileData>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            base64: event.target?.result as string,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      }))
    );

    onFilesAdded(newFiles);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">添加练习资料</h2>
        <p className="text-sm text-slate-500">支持添加多个PDF文件或题目图片（JPG/PNG）进行综合分析</p>
      </div>

      <div 
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 
          ${isLoading ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          accept="application/pdf,image/*" 
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <i className={`fas fa-cloud-upload-alt text-4xl mb-3 ${isLoading ? 'text-slate-300' : 'text-blue-500'}`}></i>
          <p className="text-slate-700 font-medium">点击或拖拽文件至此</p>
          <p className="text-xs text-slate-400 mt-2">推荐上传清晰的题目扫描件或电子版PDF</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">待分析文件 ({files.length})</h3>
          {files.map(file => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
              <div className="flex items-center gap-3 overflow-hidden">
                <i className={`${file.type.includes('pdf') ? 'far fa-file-pdf text-red-500' : 'far fa-file-image text-blue-500'} text-lg`}></i>
                <span className="text-sm text-slate-700 truncate font-medium">{file.name}</span>
              </div>
              <button 
                onClick={() => onRemoveFile(file.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                disabled={isLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
