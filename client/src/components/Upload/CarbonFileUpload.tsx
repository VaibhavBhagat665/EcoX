/**
 * Carbon File Upload Component
 * Allows users to upload bills, receipts, and meter readings for ML analysis
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnail?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  mlResults?: {
    success: boolean;
    ocr_text?: string;
    parsed_data?: {
      kwh: number;
      amount: number;
      confidence: number;
    };
    carbon_analysis?: {
      co2_kg: number;
      recommendations: any[];
    };
  };
}

export function CarbonFileUpload() {
  const { isAuthenticated, user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    return <FileText className="w-6 h-6 text-green-500" />;
  };

  const uploadFile = async (file: File): Promise<void> => {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };

    setFiles(prev => [...prev, uploadedFile]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 30, 90) }
            : f
        ));
      }, 300);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('firebaseIdToken')}`
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update file with results
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'processing',
              progress: 100,
              url: result.file?.url,
              thumbnail: result.file?.thumbnail
            }
          : f
      ));

      // Simulate ML processing
      setTimeout(() => {
        // Mock ML results for demo
        const mockMLResults = {
          success: true,
          ocr_text: 'ELECTRIC COMPANY\nAccount: 123456789\nUsage: ' + (Math.random() * 500 + 200).toFixed(0) + ' kWh\nAmount Due: $' + (Math.random() * 100 + 50).toFixed(2),
          parsed_data: {
            kwh: Math.random() * 500 + 200,
            amount: Math.random() * 100 + 50,
            confidence: 0.85 + Math.random() * 0.1
          },
          carbon_analysis: {
            co2_kg: (Math.random() * 500 + 200) * 0.416,
            recommendations: [
              {
                title: 'LED Lighting Upgrade',
                potential_savings: '15% energy reduction'
              }
            ]
          }
        };

        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status: 'completed',
                mlResults: mockMLResults
              }
            : f
        ));
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      uploadFile(file);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(uploadFile);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to upload files for carbon calculation.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-green-500" />
            <span>Upload for Carbon Analysis</span>
          </CardTitle>
          <CardDescription>
            Upload utility bills, receipts, or meter readings for AI-powered carbon footprint calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-green-500' : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </h3>
            <p className="text-gray-600 mb-4">
              Supported: Images (JPG, PNG), PDFs, CSV files • Max 10MB per file
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">📄 Bills & Receipts</Badge>
              <Badge variant="outline">📊 Energy Reports</Badge>
              <Badge variant="outline">📸 Meter Readings</Badge>
              <Badge variant="outline">📈 Usage Data</Badge>
            </div>
          </div>
          
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*,.pdf,.csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Files</CardTitle>
            <CardDescription>
              {files.filter(f => f.status === 'completed').length} of {files.length} files processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                        
                        {/* Progress Bar */}
                        {(file.status === 'uploading' || file.status === 'processing') && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-2">
                              <Progress value={file.progress} className="flex-1" />
                              <span className="text-xs text-gray-500">
                                {file.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ML Results */}
                        {file.status === 'completed' && file.mlResults && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-800">Analysis Complete</span>
                            </div>
                            
                            {file.mlResults.parsed_data && (
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Energy Usage:</span>
                                  <div className="font-semibold">{file.mlResults.parsed_data.kwh.toFixed(0)} kWh</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Amount:</span>
                                  <div className="font-semibold">${file.mlResults.parsed_data.amount.toFixed(2)}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Confidence:</span>
                                  <div className="font-semibold">{(file.mlResults.parsed_data.confidence * 100).toFixed(0)}%</div>
                                </div>
                              </div>
                            )}

                            {file.mlResults.carbon_analysis && (
                              <div className="mt-2 pt-2 border-t border-green-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Carbon Footprint:</span>
                                  <span className="font-semibold text-green-800">
                                    {file.mlResults.carbon_analysis.co2_kg.toFixed(1)} kg CO₂
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {file.status === 'error' && (
                          <div className="mt-2 flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Upload failed</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {file.status === 'processing' && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      
                      {file.status === 'completed' && file.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CarbonFileUpload;
