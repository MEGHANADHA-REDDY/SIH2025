'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Users, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Building,
  Award,
  Eye,
  AlertCircle,
  FileText,
  Calendar,
  Download,
  X,
  Check,
  MessageSquare
} from 'lucide-react'

interface Activity {
  id: number
  title: string
  description: string
  activity_type: string
  category: string
  organization: string
  start_date: string
  end_date: string
  certificate_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  student_id: string
  student_first_name: string
  student_last_name: string
  student_email: string
  student_number: string
  student_department: string
  student_year: string
  category_name: string
  points: number
}

interface DashboardData {
  profile: any
  statistics: {
    pendingActivities: number
    approvedActivities: number
    departmentStats: {
      total_students: string
      total_activities: string
      approved_activities: string
    }
  }
  recentActivities: Activity[]
}

export default function FacultyDashboard() {
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
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
      if (parsedUser.role !== 'faculty') {
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
      const response = await fetch('http://localhost:5000/api/faculty/dashboard', {
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

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setShowActivityModal(true)
    setApprovalAction(null)
    setRejectionReason('')
  }

  const handleApprovalSubmit = async () => {
    if (!selectedActivity || !approvalAction) return

    setIsProcessing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/activities/${selectedActivity.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: approvalAction,
          rejectionReason: approvalAction === 'reject' ? rejectionReason : undefined
        }),
      })

      if (response.ok) {
        // Refresh dashboard data
        const token = localStorage.getItem('token')
        if (token) fetchDashboardData(token)
        setShowActivityModal(false)
        setSelectedActivity(null)
      } else {
        console.error('Failed to process approval')
      }
    } catch (error) {
      console.error('Error processing approval:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Static leaderboard data (LeetCode score and Academic score)
  const staticLeaderboard = [
    { name: 'Megha S', roll: '22CS001', branch: 'CSE', leetcodeId: 'megha_s', leetcode: 1850, academic: 8.9, hrId: 'megha_s', hrScore: 1800, ccId: 'megha_s', ccRating: 1680, heId: 'megha_s', heScore: 1750 },
    { name: 'Arjun K', roll: '22CS014', branch: 'CSE', leetcodeId: 'arjunk', leetcode: 1720, academic: 9.2, hrId: 'arjunk', hrScore: 1600, ccId: 'arjunk', ccRating: 1550, heId: 'arjunk', heScore: 1620 },
    { name: 'Priya R', roll: '22IT009', branch: 'IT',  leetcodeId: 'priyar', leetcode: 1630, academic: 8.4, hrId: 'priyar', hrScore: 1400, ccId: 'priyar', ccRating: 1500, heId: 'priyar', heScore: 1450 },
    { name: 'Rahul V', roll: '22EC021', branch: 'ECE', leetcodeId: 'rahul_v', leetcode: 1580, academic: 9.0, hrId: 'rahul_v', hrScore: 1700, ccId: 'rahul_v', ccRating: 1600, heId: 'rahul_v', heScore: 1690 },
    { name: 'Sneha P', roll: '22ME017', branch: 'ME',  leetcodeId: 'snehap', leetcode: 1495, academic: 8.1, hrId: 'snehap', hrScore: 1300, ccId: 'snehap', ccRating: 1420, heId: 'snehap', heScore: 1380 },
  ]
  const [sortBy, setSortBy] = useState<'leetcode' | 'academic' | 'hackerrank' | 'codechef' | 'hackerearth'>('leetcode')

  const scoreLabel = (mode: typeof sortBy) => {
    switch (mode) {
      case 'leetcode': return 'LeetCode Score'
      case 'academic': return 'Academic Score'
      case 'hackerrank': return 'HackerRank Score'
      case 'codechef': return 'CodeChef Rating'
      case 'hackerearth': return 'HackerEarth Score'
      default: return 'Score'
    }
  }

  const getProfileId = (row: any, mode: typeof sortBy) => {
    if (mode === 'leetcode') return row.leetcodeId
    if (mode === 'hackerrank') return row.hrId
    if (mode === 'codechef') return row.ccId
    if (mode === 'hackerearth') return row.heId
    return undefined
  }

  const getScore = (row: any, mode: typeof sortBy) => {
    if (mode === 'leetcode') return row.leetcode
    if (mode === 'academic') return row.academic
    if (mode === 'hackerrank') return row.hrScore
    if (mode === 'codechef') return row.ccRating
    if (mode === 'hackerearth') return row.heScore
    return 0
  }

  const getProfileLink = (id: string | undefined, mode: typeof sortBy) => {
    if (!id) return '#'
    if (mode === 'leetcode') return `https://leetcode.com/${id}`
    if (mode === 'hackerrank') return `https://www.hackerrank.com/profile/${id}`
    if (mode === 'codechef') return `https://www.codechef.com/users/${id}`
    if (mode === 'hackerearth') return `https://www.hackerearth.com/@${id}`
    return '#'
  }

  const viewStudentProfile = (studentId: string) => {
    router.push(`/profile/${studentId}`)
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
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Faculty
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
              Faculty Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Review and approve student activities
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button 
              onClick={() => router.push('/dashboard/faculty/students')}
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">View All Students</h3>
                  <p className="text-blue-100">Browse complete student directory</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => router.push('/dashboard/faculty/accepted-reviews')}
              className="bg-yellow-600 text-white p-6 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Accepted Reviews</h3>
                  <p className="text-yellow-100">View approved activities</p>
                </div>
              </div>
            </button>

            <button className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Analytics</h3>
                  <p className="text-purple-100">View department stats</p>
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
                    {dashboardData?.statistics.departmentStats.total_students || 0}
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
                  <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.pendingActivities || 0}
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
                    {dashboardData?.statistics.approvedActivities || 0}
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
                  <p className="text-sm font-medium text-gray-500">Total Activities</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData?.statistics.departmentStats.total_activities || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activities Pending Review */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Activities Pending Review</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData?.recentActivities.length ? (
                <div className="space-y-4">
                  {dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Review
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                          
                          {/* Student Info */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {activity.student_first_name} {activity.student_last_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ID: {activity.student_number} • {activity.student_department} • Year {activity.student_year}
                                </p>
                              </div>
                              <button
                                onClick={() => viewStudentProfile(activity.student_id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                              >
                                <User className="h-4 w-4 mr-1" />
                                View Profile
                              </button>
                            </div>
                          </div>

                          {/* Activity Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-blue-600" />
                              {activity.organization}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-green-600" />
                              {new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-2 text-purple-600" />
                              {activity.category_name} ({activity.points} points)
                            </div>
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-orange-600" />
                              {activity.activity_type}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex space-x-3">
                          {activity.certificate_url && (
                            <a
                              href={`http://localhost:5000${activity.certificate_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View Certificate
                            </a>
                          )}
                          {activity.image_url && (
                            <a
                              href={`http://localhost:5000${activity.image_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View Image
                            </a>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleActivityClick(activity)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No activities pending review at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-gray-700"
                >
                  <option value="leetcode">LeetCode Score</option>
                  <option value="academic">Academic Score</option>
                  <option value="hackerrank">HackerRank Score</option>
                  <option value="codechef">CodeChef Rating</option>
                  <option value="hackerearth">HackerEarth Score</option>
                </select>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                    {(sortBy === 'leetcode' || sortBy === 'hackerrank' || sortBy === 'codechef' || sortBy === 'hackerearth') && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile ID</th>
                    )}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{scoreLabel(sortBy)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staticLeaderboard
                    .slice()
                    .sort((a, b) => sortBy === 'leetcode' ? b.leetcode - a.leetcode : b.academic - a.academic)
                    .map((row, idx) => (
                      <tr key={row.name} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{row.roll}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{row.branch}</td>
                        {(sortBy === 'leetcode' || sortBy === 'hackerrank' || sortBy === 'codechef' || sortBy === 'hackerearth') && (
                          <td className="px-4 py-2 text-sm text-blue-600 underline"><a href={getProfileLink(getProfileId(row, sortBy), sortBy)} target="_blank" rel="noreferrer">{getProfileId(row, sortBy)}</a></td>
                        )}
                        <td className="px-4 py-2 text-sm text-gray-700">{getScore(row, sortBy)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Activity Review Modal */}
      {showActivityModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedActivity.title}</h2>
                  <p className="text-blue-100">Activity Review & Approval</p>
                </div>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Student Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedActivity.student_first_name} {selectedActivity.student_last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium text-gray-900">{selectedActivity.student_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{selectedActivity.student_department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium text-gray-900">Year {selectedActivity.student_year}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => viewStudentProfile(selectedActivity.student_id)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Complete Student Profile
                  </button>
                </div>
              </div>

              {/* Activity Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-gray-900">{selectedActivity.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Organization</p>
                      <p className="text-gray-900">{selectedActivity.organization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Activity Type</p>
                      <p className="text-gray-900 capitalize">{selectedActivity.activity_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <p className="text-gray-900">{selectedActivity.category_name} ({selectedActivity.points} points)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Start Date</p>
                      <p className="text-gray-900">{new Date(selectedActivity.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">End Date</p>
                      <p className="text-gray-900">{new Date(selectedActivity.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate */}
                {selectedActivity.certificate_url && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Certificate</h3>
                    <a
                      href={`http://localhost:5000${selectedActivity.certificate_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </a>
                  </div>
                )}

                {/* Approval Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h3>
                  
                  <div className="space-y-4">
                    {/* Action Selection */}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setApprovalAction('approve')}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          approvalAction === 'approve'
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => setApprovalAction('reject')}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          approvalAction === 'reject'
                            ? 'bg-red-100 text-red-800 border-2 border-red-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </div>

                    {/* Rejection Reason */}
                    {approvalAction === 'reject' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Rejection *
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Please provide a reason for rejecting this activity..."
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprovalSubmit}
                  disabled={!approvalAction || (approvalAction === 'reject' && !rejectionReason.trim()) || isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `${approvalAction === 'approve' ? 'Approve' : 'Reject'} Activity`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
