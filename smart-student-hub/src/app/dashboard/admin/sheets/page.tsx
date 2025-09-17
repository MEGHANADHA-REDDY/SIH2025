'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, ExternalLink, Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface Sheet {
  id: number;
  student_id: number;
  student_number: string;
  student_name: string;
  department: string;
  year_of_study: number;
  share_token: string;
  created_at: string;
  updated_at: string;
  summary: {
    total_entries: number;
    approved_count: number;
    rejected_count: number;
    latest_entry: string | null;
  };
}

interface Statistics {
  overview: {
    total_sheets: number;
    total_entries: number;
    approved_entries: number;
    rejected_entries: number;
    approval_rate: number;
  };
  department_stats: Array<{
    department: string;
    sheets_count: number;
    entries_count: number;
    approved_count: number;
  }>;
}

export default function AdminSheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (!['admin', 'super_admin'].includes(user.role)) {
        router.push('/dashboard');
        return;
      }
      
      fetchData(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      // Fetch all sheets
      const sheetsResponse = await fetch('http://localhost:5000/api/sheets/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch statistics
      const statsResponse = await fetch('http://localhost:5000/api/sheets/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (sheetsResponse.ok && statsResponse.ok) {
        const sheetsData = await sheetsResponse.json();
        const statsData = await statsResponse.json();
        
        setSheets(sheetsData.data.sheets);
        setStatistics(statsData.data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Error loading data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student sheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Activity Sheets</h1>
          <p className="text-lg text-gray-600">
            Manage and monitor all student activity sheets
          </p>
        </div>

        {/* Statistics Overview */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="text-3xl text-blue-500 mr-4">📊</div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {statistics.overview.total_sheets}
                  </div>
                  <div className="text-sm text-gray-500">Total Sheets</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="text-3xl text-green-500 mr-4">✅</div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {statistics.overview.approved_entries}
                  </div>
                  <div className="text-sm text-gray-500">Approved Activities</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="text-3xl text-red-500 mr-4">❌</div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {statistics.overview.rejected_entries}
                  </div>
                  <div className="text-sm text-gray-500">Rejected Activities</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="text-3xl text-purple-500 mr-4">📈</div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(statistics.overview.approval_rate)}%
                  </div>
                  <div className="text-sm text-gray-500">Approval Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Statistics */}
        {statistics && statistics.department_stats.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Department Statistics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statistics.department_stats.map((dept) => (
                  <div key={dept.department} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{dept.department}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Sheets: {dept.sheets_count}</div>
                      <div>Total Activities: {dept.entries_count}</div>
                      <div>Approved: {dept.approved_count}</div>
                      <div>Success Rate: {dept.entries_count > 0 ? Math.round((dept.approved_count / dept.entries_count) * 100) : 0}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Student Sheets Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Student Sheets</h2>
          </div>
          
          {sheets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No student sheets found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sheets.map((sheet) => (
                    <tr key={sheet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {sheet.student_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {sheet.student_number} • Year {sheet.year_of_study}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sheet.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {sheet.summary.total_entries}
                          </span>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-green-600">
                              {sheet.summary.approved_count}
                            </span>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-red-600">
                              {sheet.summary.rejected_count}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sheet.summary.total_entries > 0 
                            ? Math.round((sheet.summary.approved_count / sheet.summary.total_entries) * 100)
                            : 0}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sheet.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={`/sheet/${sheet.share_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                          <a
                            href={`/sheet/${sheet.share_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Share
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
