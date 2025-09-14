'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  User, 
  ArrowLeft, 
  Building, 
  Calendar, 
  Award,
  FileText,
  Download,
  Eye,
  Search,
  Filter
} from 'lucide-react'

interface ApprovedActivity {
  id: number
  title: string
  description: string
  activity_type: string
  organization: string
  start_date: string
  end_date: string
  certificate_url: string
  status: string
  approved_at: string
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

export default function AcceptedReviewsPage() {
  const [activities, setActivities] = useState<ApprovedActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ApprovedActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchApprovedActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, searchTerm, selectedCategory])

  const fetchApprovedActivities = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/faculty/approved-activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(data.data || [])
      } else {
        console.error('Failed to fetch approved activities')
      }
    } catch (error) {
      console.error('Error fetching approved activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.student_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.student_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.organization.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(activity => activity.category_name === selectedCategory)
    }

    setFilteredActivities(filtered)
  }

  const viewStudentProfile = (studentId: string) => {
    router.push(`/profile/${studentId}`)
  }

  const getCategories = () => {
    return [...new Set(activities.map(activity => activity.category_name))].filter(Boolean)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/faculty')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                  Accepted Reviews
                </h1>
                <p className="text-gray-600">Activities you have approved</p>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <p className="text-green-800 font-medium">{filteredActivities.length} Approved Activities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search activities or students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {activity.points} points
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-blue-600" />
                        {activity.organization}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        {new Date(activity.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-purple-600" />
                        {activity.category_name}
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-orange-600" />
                        {activity.activity_type}
                      </div>
                    </div>

                    {/* Approval Info */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Approved on {new Date(activity.approved_at).toLocaleDateString()} at {new Date(activity.approved_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
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
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewStudentProfile(activity.student_id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Student
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No approved activities found</h3>
            <p className="text-gray-500">
              {activities.length === 0 
                ? "You haven't approved any activities yet" 
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
