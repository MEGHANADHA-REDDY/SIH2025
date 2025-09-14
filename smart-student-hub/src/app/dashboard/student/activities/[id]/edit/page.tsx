'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, User, LogOut, ArrowLeft, Upload, AlertCircle, CheckCircle, Calendar, Building, FileText } from 'lucide-react'
import Link from 'next/link'

interface ActivityCategory {
  id: number;
  name: string;
  description: string;
  points: number;
  is_active: boolean;
}

interface ActivityDetails {
  id: number
  title: string
  description: string
  activity_type: string
  category: string
  start_date: string
  end_date: string
  organization: string
  certificate_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  category_name: string
}

export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [user, setUser] = useState<any>(null)
  const [activity, setActivity] = useState<ActivityDetails | null>(null)
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityType: '',
    category: '',
    startDate: '',
    endDate: '',
    organization: '',
    certificate: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
      fetchActivityCategories(token)
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

      if (!response.ok) {
        throw new Error('Failed to fetch activity details')
      }

      const data = await response.json()
      setActivity(data.data)
      
      // Pre-fill form with existing data
      setFormData({
        title: data.data.title,
        description: data.data.description,
        activityType: data.data.activity_type,
        category: data.data.category,
        startDate: data.data.start_date,
        endDate: data.data.end_date,
        organization: data.data.organization,
        certificate: null, // Don't pre-fill file
      })

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching activity details:', error)
      setError('Failed to load activity details')
      setIsLoading(false)
    }
  }

  const fetchActivityCategories = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/students/activity-categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch activity categories')
      }

      const data = await response.json()
      setActivityCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching activity categories:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, JPEG, or PNG file')
        return
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError('File size must be less than 5MB')
        return
      }

      setFormData(prev => ({
        ...prev,
        certificate: file
      }))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const formDataToSend = new FormData()

      // Append all form fields
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('activityType', formData.activityType)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('startDate', formData.startDate)
      formDataToSend.append('endDate', formData.endDate)
      formDataToSend.append('organization', formData.organization)

      // Only append certificate if a new one is selected
      if (formData.certificate) {
        formDataToSend.append('certificate', formData.certificate)
      }

      const response = await fetch(`http://localhost:5000/api/activities/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update activity')
      }

      setSuccess('Activity updated successfully!')
      
      // Redirect back to activity details after a short delay
      setTimeout(() => {
        router.push(`/dashboard/student/activities/${resolvedParams.id}`)
      }, 2000)

    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Not Found</h2>
          <Link href="/dashboard/student/activities" className="text-blue-600 hover:text-blue-700">
            Back to Activities
          </Link>
        </div>
      </div>
    )
  }

  if (activity.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cannot Edit Activity</h2>
          <p className="text-gray-600 mb-4">
            Only pending activities can be edited. This activity is currently {activity.status}.
          </p>
          <Link 
            href={`/dashboard/student/activities/${resolvedParams.id}`} 
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Activity Details
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Smart Student Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {user?.first_name} {user?.last_name}
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
          <Link 
            href={`/dashboard/student/activities/${resolvedParams.id}`}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activity Details
          </Link>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Edit Activity</h1>
              <p className="text-gray-600 mt-2">Update your activity information</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm text-green-800">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Activity Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter activity title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your activity"
                />
              </div>

              {/* Activity Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="activityType" className="block text-sm font-medium text-gray-700">
                    Activity Type *
                  </label>
                  <select
                    id="activityType"
                    name="activityType"
                    required
                    value={formData.activityType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="internship">Internship</option>
                    <option value="project">Project</option>
                    <option value="certification">Certification</option>
                    <option value="competition">Competition</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="volunteer">Volunteer Work</option>
                    <option value="research">Research</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    {activityCategories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name} ({category.points} points)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                  Organization/Institution *
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  required
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter organization name"
                />
              </div>

              {/* Certificate Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate (Optional - Leave empty to keep current certificate)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="certificate"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a new certificate</span>
                        <input
                          id="certificate"
                          name="certificate"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
                    {formData.certificate && (
                      <p className="text-sm text-green-600">
                        Selected: {formData.certificate.name}
                      </p>
                    )}
                    {!formData.certificate && activity.certificate_url && (
                      <p className="text-sm text-gray-500">
                        Current certificate will be kept
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/dashboard/student/activities/${resolvedParams.id}`}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Activity'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
