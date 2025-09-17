'use client';

import { useState, useEffect } from 'react';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';

interface StudentSheetCardProps {
  token?: string; // JWT token for authenticated requests
}

export default function StudentSheetCard({ token }: StudentSheetCardProps) {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchShareUrl();
  }, []);

  const fetchShareUrl = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sheets/share-url', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setShareUrl(data.data.web_url);
      }
    } catch (error) {
      console.error('Error fetching share URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const regenerateToken = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sheets/regenerate-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setShareUrl(data.data.share_url.replace(':5000/api/sheets/shared/', ':3000/sheet/'));
      }
    } catch (error) {
      console.error('Error regenerating token:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📊 My Activity Sheet</h3>
        <button
          onClick={regenerateToken}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Generate New Share Link"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Share this link with anyone to show your approved activities and achievements.
      </p>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
        />
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {copied ? (
            <>✓ Copied</>
          ) : (
            <>
              <Copy className="h-4 w-4 inline mr-1" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="flex gap-2">
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Preview Sheet
        </a>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> This link is read-only and safe to share. Others can view your activities but cannot edit them.
        </p>
      </div>
    </div>
  );
}
