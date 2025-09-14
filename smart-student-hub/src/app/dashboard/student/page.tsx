'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Plus, 
  Upload, 
  Award, 
  TrendingUp, 
  Eye,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase
} from 'lucide-react'

interface Activity {
  id: number
  title: string
  description: string
  activity_type: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  approved_by_name?: string
  rejection_reason?: string
}

interface JobApplication {
  id: number
  job_title: string
  company: string
  status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  applied_at: string
}

interface DashboardData {
  profile: any
  activities: {
    byStatus: Array<{ status: string; count: string }>
    recent: Activity[]
  }
  portfolio: any
  jobApplications: JobApplication[]
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      fetchDashboardData(token)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/students/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Check if profile is complete
        if (data.profileComplete === false) {
          // Redirect to profile completion page
          router.push('/profile/complete')
          return
        }
        
        setDashboardData(data.data)
      } else {
        console.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
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
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
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
                <button
                  onClick={() => router.push(`/profile/${user.studentId || user.id}`)}
                  className="text-sm text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {user.firstName} {user.lastName}
                </button>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-lg text-gray-600">
              Track your achievements and build your digital portfolio
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button 
              onClick={() => router.push('/dashboard/student/add-activity')}
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Add Activity</h3>
                  <p className="text-blue-100">Upload new achievement</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => router.push('/jobs')}
              className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Briefcase className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Job Opportunities</h3>
                  <p className="text-orange-100">Browse & apply for jobs</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => router.push(`/portfolio/${user.studentId}`)}
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">View Portfolio</h3>
                  <p className="text-green-100">See your achievements</p>
                </div>
              </div>
            </button>

            <button className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Statistics</h3>
                  <p className="text-purple-100">View your progress</p>
                </div>
              </div>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Activities</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.activities.byStatus.reduce((total, item) => total + parseInt(item.count), 0) || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.activities.byStatus.find(item => item.status === 'approved')?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.activities.byStatus.find(item => item.status === 'pending')?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Portfolio</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.portfolio ? '1' : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <button 
                  onClick={() => router.push('/dashboard/student/activities')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.activities.recent.length ? (
                <div className="space-y-4">
                  {dashboardData.activities.recent.map((activity) => (
                    <div 
                      key={activity.id} 
                      onClick={() => router.push(`/dashboard/student/activities/${activity.id}`)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {getStatusIcon(activity.status)}
                            <span className="ml-1 capitalize">{activity.status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{activity.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {activity.category}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                          {activity.approved_by_name && (
                            <span>Approved by {activity.approved_by_name}</span>
                          )}
                        </div>
                        {activity.rejection_reason && (
                          <p className="text-xs text-red-600 mt-1">Reason: {activity.rejection_reason}</p>
                        )}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                  <p className="text-gray-500 mb-4">Start building your portfolio by adding your first achievement</p>
                  <button 
                    onClick={() => router.push('/dashboard/student/add-activity')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Activity
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Job Applications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-orange-600" />
                  Recent Job Applications
                </h2>
                <button 
                  onClick={() => router.push('/jobs')}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  View All Jobs
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.jobApplications && dashboardData.jobApplications.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.jobApplications.slice(0, 3).map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{application.job_title}</h3>
                        <p className="text-sm text-gray-500">{application.company}</p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                            application.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            Applied {new Date(application.applied_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Briefcase className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications yet</h3>
                  <p className="text-gray-500 mb-4">Start exploring job opportunities and apply for positions</p>
                  <button 
                    onClick={() => router.push('/jobs')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                  >
                    Browse Jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
