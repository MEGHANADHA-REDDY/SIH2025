'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Users, 
  Settings, 
  TrendingUp,
  Building,
  Award,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react'

interface DashboardData {
  statistics: {
    total_students: string
    total_faculty: string
    total_activities: string
    approved_activities: string
    pending_activities: string
    rejected_activities: string
    total_portfolios: string
  }
  departmentStats: Array<{
    department: string
    student_count: string
    activity_count: string
    approved_count: string
  }>
  recentActivities: Array<{
    id: number
    title: string
    status: string
    student_id: string
    student_first_name: string
    student_last_name: string
    created_at: string
  }>
  monthlyTrends: Array<{
    month: string
    activity_count: string
    approved_count: string
  }>
}

export default function AdminDashboard() {
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
      if (parsedUser.role !== 'admin') {
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
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
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
                <span className="text-sm text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  Admin
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
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage the Smart Student Hub platform
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <button className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Manage Users</h3>
                  <p className="text-blue-100">Students & Faculty</p>
                </div>
              </div>
            </button>

            <button className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Activity Categories</h3>
                  <p className="text-green-100">Manage categories</p>
                </div>
              </div>
            </button>

            <button className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Reports</h3>
                  <p className="text-purple-100">Generate reports</p>
                </div>
              </div>
            </button>

            <button className="bg-gray-600 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <p className="text-gray-100">System settings</p>
                </div>
              </div>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.total_students || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Faculty</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.total_faculty || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Activities</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.total_activities || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Portfolios</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.total_portfolios || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved Activities</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.approved_activities || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Activities</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.pending_activities || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rejected Activities</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.rejected_activities || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Statistics */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Department Statistics</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Activities
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData?.departmentStats.map((dept, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dept.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dept.student_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dept.activity_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dept.approved_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.recentActivities.length ? (
                <div className="space-y-4">
                  {dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>Student: {activity.student_first_name} {activity.student_last_name}</span>
                          <span>ID: {activity.student_id}</span>
                          <span>Date: {new Date(activity.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                  <p className="text-gray-500">Activities will appear here as students upload them</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
