import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, FileText, Image as ImageIcon, Eye, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { PDFViewer } from './PDFViewer';

interface File {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  created_at: string;
}
type FileListProps = {
  fileUploaded: boolean,
  isdarkMode: boolean
  };

export const FileList: React.FC<FileListProps> = ({ fileUploaded , isdarkMode }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    fetchFiles();
    
    const channel = supabase
      .channel('files')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => {
        fetchFiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fileUploaded]);

  const fetchFiles = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch files';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Failed to download file: ' + error.message);
    }
  };

  const viewPDF = async (path: string, fileName: string) => {
    try {
      const { data: { publicUrl }} = await supabase.storage
        .from('files')
        .getPublicUrl(path);

      if (error) throw error;
      setSelectedPDF({ url: publicUrl, name: fileName });
    } catch (error: any) {
      toast.error('Failed to view PDF: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-500">
        <AlertCircle className="w-12 h-12 mb-2" />
        <p className="text-lg font-medium">Error loading files</p>
        <p className="text-sm text-gray-600 mt-2">{error}</p>
        <button 
          onClick={fetchFiles}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto ">
      <h2 className= {`text-xl font-semibold mb-4 ${isdarkMode&&"text-white"}`} >Shared Files</h2>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className= {`divide-y divide-gray-200 ${isdarkMode&&"bg-slate-600"}`}  >
          {files.map((file) => (
            <div key={file.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-6 h-6 text-blue-500" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-500" />
                )}
                <div>
                  <h3 className={`text-sm font-medium text-gray-900 ${isdarkMode&&"text-slate-300"}`}>{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {file.type === 'application/pdf' && (
                  <button
                    onClick={() => viewPDF(file.path, file.name)}
                    className="flex items-center space-x-2 text-sm text-blue-500 hover:text-blue-700"
                  >
                    <Eye className= {`w-4 h-4 ${isdarkMode&&"text-slate-300"} `} />
                    <span className={`${isdarkMode?"text-slate-300":"text-slate-600"}`}>View</span>
                  </button>
                )}
                <button
                  onClick={() => downloadFile(file.path, file.name)}
                  className="flex items-center space-x-2 text-sm text-blue-500 hover:text-blue-700"
                >
                  <Download className= {`w-4 h-4 ${isdarkMode?"text-slate-300":"text-slate-600"} `} />
                  <span className={`${isdarkMode?"text-slate-300":"text-slate-600"} `}>Download</span>
                </button>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No files have been shared yet
            </div>
          )}
        </div>
      </div>

      {selectedPDF && (
        <PDFViewer
          url={selectedPDF.url}
          fileName={selectedPDF.name}
          onClose={() => setSelectedPDF(null)}
        />
      )}
    </div>
  );
}