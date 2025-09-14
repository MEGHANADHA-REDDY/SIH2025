'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  LogOut, 
  ArrowLeft,
  Calendar,
  Building,
  FileText,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Edit
} from 'lucide-react'

interface ActivityDetails {
  id: number
  title: string
  description: string
  activity_type: string
  category: string
  start_date: string
  end_date: string
  organization: string
  status: 'pending' | 'approved' | 'rejected'
  certificate_url: string
  created_at: string
  updated_at: string
  approved_by_name?: string
  approved_by_last_name?: string
  approved_at?: string
  rejection_reason?: string
  category_name: string
}

export default function ActivityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [user, setUser] = useState<any>(null)
  const [activity, setActivity] = useState<ActivityDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'student') {
        router.push('/dashboard')
        return
      }
      setUser(parsedUser)
      fetchActivityDetails(token, resolvedParams.id)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router, resolvedParams.id])

  const fetchActivityDetails = async (token: string, activityId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/activities/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActivity(data.data)
      } else {
        setError('Failed to fetch activity details')
      }
    } catch (error) {
      console.error('Error fetching activity details:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/activities/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/dashboard/student')
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to delete activity')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5" />
      case 'pending':
        return <Clock className="h-5 w-5" />
      case 'rejected':
        return <XCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const canEdit = activity?.status === 'pending'
  const canDelete = activity?.status === 'pending'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Activity Not Found</h2>
          <p className="text-gray-600 mb-4">The requested activity could not be found</p>
          <button
            onClick={() => router.push('/dashboard/student')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Smart Student Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Student
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard/student')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Activity Details Card */}
          <div className="bg-white shadow rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusIcon(activity.status)}
                      <span className="ml-2 capitalize">{activity.status}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      Submitted on {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {canEdit && (
                    <button 
                      onClick={() => router.push(`/dashboard/student/activities/${resolvedParams.id}/edit`)}
                      className="flex items-center space-x-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center space-x-1 px-3 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              {activity.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{activity.description}</p>
                </div>
              )}

              {/* Activity Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Activity Type</p>
                      <p className="text-sm text-gray-900">{activity.activity_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="text-sm text-gray-900">{activity.category_name || activity.category}</p>
                    </div>
                  </div>

                  {activity.organization && (
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Organization</p>
                        <p className="text-sm text-gray-900">{activity.organization}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {activity.start_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Start Date</p>
                        <p className="text-sm text-gray-900">{new Date(activity.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  {activity.end_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">End Date</p>
                        <p className="text-sm text-gray-900">{new Date(activity.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">{new Date(activity.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate */}
              {activity.certificate_url && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Certificate/Supporting Document</h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Certificate Document</p>
                      <p className="text-xs text-gray-500">Click to view or download</p>
                    </div>
                    <a
                      href={`http://localhost:5000${activity.certificate_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>View</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Approval Information */}
              {activity.status === 'approved' && activity.approved_by_name && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Approval Information</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Approved by:</strong> {activity.approved_by_name} {activity.approved_by_last_name}
                    </p>
                    {activity.approved_at && (
                      <p className="text-sm text-green-800 mt-1">
                        <strong>Approved on:</strong> {new Date(activity.approved_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Information */}
              {activity.status === 'rejected' && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rejection Information</h3>
                  <div className="bg-red-50 p-4 rounded-lg">
                    {activity.approved_by_name && (
                      <p className="text-sm text-red-800 mb-2">
                        <strong>Reviewed by:</strong> {activity.approved_by_name} {activity.approved_by_last_name}
                      </p>
                    )}
                    {activity.rejection_reason && (
                      <p className="text-sm text-red-800">
                        <strong>Reason:</strong> {activity.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Activity</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{activity.title}"? This will permanently remove the activity and its associated certificate.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Activity'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
