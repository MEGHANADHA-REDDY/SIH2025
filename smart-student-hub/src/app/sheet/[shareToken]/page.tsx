'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface SheetEntry {
  id: number;
  student_name: string;
  project_url: string;
  course_name: string;
  status: string;
  faculty_name: string;
  certificate_id: string;
  validation_score: string;
  entry_date: string;
  activity_type: string;
  category: string;
  created_at: string;
}

interface SheetData {
  sheet: {
    id: number;
    student_number: string;
    student_name: string;
    department: string;
    year_of_study: number;
    created_at: string;
    updated_at: string;
  };
  entries: SheetEntry[];
  summary: {
    total_activities: number;
    approved_activities: number;
    rejected_activities: number;
    latest_activity: string | null;
  };
}

export default function SharedSheetPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/sheets/shared/${shareToken}`);
        const data = await response.json();

        if (data.success) {
          setSheetData(data.data);
        } else {
          setError(data.message || 'Failed to load sheet');
        }
      } catch (err) {
        setError('Error loading sheet data');
        console.error('Error fetching sheet:', err);
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchSheetData();
    }
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student activity sheet...</p>
        </div>
      </div>
    );
  }

  if (error || !sheetData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sheet Not Found</h1>
          <p className="text-gray-600">{error || 'The requested sheet could not be found.'}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status.toLowerCase()) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {sheetData.sheet.student_name}'s Activity Sheet
              </h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                <span>📚 {sheetData.sheet.department}</span>
                <span>🎓 Year {sheetData.sheet.year_of_study}</span>
                <span>🆔 {sheetData.sheet.student_number}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {sheetData.summary.total_activities}
              </div>
              <div className="text-sm text-gray-500">Total Activities</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl text-green-500 mr-4">✅</div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sheetData.summary.approved_activities}
                </div>
                <div className="text-sm text-gray-500">Approved</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl text-red-500 mr-4">❌</div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {sheetData.summary.rejected_activities}
                </div>
                <div className="text-sm text-gray-500">Rejected</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="text-3xl text-blue-500 mr-4">📊</div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sheetData.summary.total_activities > 0 
                    ? Math.round((sheetData.summary.approved_activities / sheetData.summary.total_activities) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Activity History</h2>
          </div>
          
          {sheetData.entries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No activities recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sheetData.entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.course_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {entry.certificate_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{entry.activity_type || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{entry.category || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(entry.status)}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.faculty_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.entry_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.project_url ? (
                          <a 
                            href={entry.project_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Project
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a read-only view of the student's activity sheet.</p>
          <p className="mt-1">
            Last updated: {new Date(sheetData.sheet.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
