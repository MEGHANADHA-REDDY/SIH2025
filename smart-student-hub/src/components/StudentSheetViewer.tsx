'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Eye, TrendingUp, CheckCircle, XCircle, Calendar } from 'lucide-react';

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

interface StudentSheetViewerProps {
  studentId: string;
  token?: string;
  userRole?: string;
}

export default function StudentSheetViewer({ studentId, token, userRole }: StudentSheetViewerProps) {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId && token) {
      fetchSheetData();
    }
  }, [studentId, token]);

  const fetchSheetData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sheets/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSheetData(data.data);
        // Generate share URL if we have the sheet data
        if (data.data.sheet) {
          // We need to get the share token - let's make another API call or use a different approach
          fetchShareUrl();
        }
      } else {
        setError(data.message || 'Failed to load student sheet');
      }
    } catch (err) {
      setError('Error loading student sheet');
      console.error('Error fetching sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShareUrl = async () => {
    try {
      // For recruiters, we'll need to get the share token from the student's sheet
      // Since we have the sheet data, we can construct the share URL if we had the token
      // For now, let's provide a direct link to view the sheet
      setShareUrl(`${window.location.origin}/sheet/view-student/${studentId}`);
    } catch (err) {
      console.error('Error getting share URL:', err);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sheetData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-2">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Sheet Available</h3>
          <p className="text-gray-600 text-sm">
            {error || 'This student has not submitted any activities yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">📊 Activity Sheet</h3>
            <p className="text-blue-100 text-sm">
              {sheetData.sheet.student_name} • {sheetData.sheet.department} • Year {sheetData.sheet.year_of_study}
            </p>
          </div>
          {userRole === 'recruiter' && (
            <div className="text-right">
              <div className="text-2xl font-bold">
                {sheetData.summary.total_activities}
              </div>
              <div className="text-xs text-blue-100">Total Activities</div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
              <span className="text-2xl font-bold text-green-600">
                {sheetData.summary.approved_activities}
              </span>
            </div>
            <div className="text-xs text-gray-500">Approved</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <XCircle className="h-5 w-5 text-red-500 mr-1" />
              <span className="text-2xl font-bold text-red-600">
                {sheetData.summary.rejected_activities}
              </span>
            </div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-1" />
              <span className="text-2xl font-bold text-blue-600">
                {sheetData.summary.total_activities > 0 
                  ? Math.round((sheetData.summary.approved_activities / sheetData.summary.total_activities) * 100)
                  : 0}%
              </span>
            </div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Recent Activities</h4>
          {userRole === 'recruiter' && (
            <span className="text-sm text-gray-500">
              👁️ Recruiter View
            </span>
          )}
        </div>

        {sheetData.entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No activities recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sheetData.entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="text-sm font-medium text-gray-900">
                        {entry.course_name || 'Activity'}
                      </h5>
                      <span className={getStatusBadge(entry.status)}>
                        {entry.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Type:</span> {entry.activity_type || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {entry.category || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Faculty:</span> {entry.faculty_name || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {entry.entry_date}
                      </div>
                    </div>

                    {entry.project_url && (
                      <div className="mt-2">
                        <a 
                          href={entry.project_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Project
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sheetData.entries.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing 10 of {sheetData.entries.length} activities
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Last updated: {new Date(sheetData.sheet.updated_at).toLocaleDateString()}
          </span>
          {userRole === 'recruiter' && (
            <span className="text-blue-600">
              🎯 Talent Assessment View
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
