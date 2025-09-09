'use client';

import { useState } from 'react';
import { blogService } from '@/services/blogService';
import { projectService } from '@/services/projectService';

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGetPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const posts = await blogService.getAllPosts(0, 5);
      setResult(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testGetProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const projects = await projectService.getProjects(0, 5);
      setResult(projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API 연동 테스트</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testGetPosts}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '로딩...' : '게시글 목록 가져오기'}
          </button>
          
          <button
            onClick={testGetProjects}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 ml-4"
          >
            {loading ? '로딩...' : '프로젝트 목록 가져오기'}
          </button>
          
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>에러:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API 응답 결과:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}