'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, User, Mail, Phone, Building, Calendar, LogOut, Edit } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
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
      setUser(parsedUser)
      fetchProfile(token)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router])

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
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
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
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
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </button>
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
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                  <Edit className="h-4 w-4" />
                  <span className="text-sm">Edit Profile</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-sm text-gray-900">
                          {profile?.first_name || user.firstName} {profile?.last_name || user.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    {profile?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900">{profile.phone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <p className="text-sm text-gray-900 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role-specific Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {user.role === 'student' ? 'Student Information' : 
                     user.role === 'faculty' ? 'Faculty Information' : 'Admin Information'}
                  </h2>
                  
                  <div className="space-y-3">
                    {user.role === 'student' && (
                      <>
                        {profile?.student_id && (
                          <div className="flex items-center space-x-3">
                            <Building className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Student ID</p>
                              <p className="text-sm text-gray-900">{profile.student_id}</p>
                            </div>
                          </div>
                        )}
                        {profile?.department && (
                          <div className="flex items-center space-x-3">
                            <Building className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Department</p>
                              <p className="text-sm text-gray-900">{profile.department}</p>
                            </div>
                          </div>
                        )}
                        {profile?.year_of_study && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Year of Study</p>
                              <p className="text-sm text-gray-900">{profile.year_of_study}</p>
                            </div>
                          </div>
                        )}
                        {profile?.cgpa && (
                          <div className="flex items-center space-x-3">
                            <GraduationCap className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">CGPA</p>
                              <p className="text-sm text-gray-900">{profile.cgpa}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {user.role === 'faculty' && (
                      <>
                        {profile?.employee_id && (
                          <div className="flex items-center space-x-3">
                            <Building className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Employee ID</p>
                              <p className="text-sm text-gray-900">{profile.employee_id}</p>
                            </div>
                          </div>
                        )}
                        {profile?.department && (
                          <div className="flex items-center space-x-3">
                            <Building className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Department</p>
                              <p className="text-sm text-gray-900">{profile.department}</p>
                            </div>
                          </div>
                        )}
                        {profile?.designation && (
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Designation</p>
                              <p className="text-sm text-gray-900">{profile.designation}</p>
                            </div>
                          </div>
                        )}
                        {profile?.specialization && (
                          <div className="flex items-center space-x-3">
                            <GraduationCap className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Specialization</p>
                              <p className="text-sm text-gray-900">{profile.specialization}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Account Status</h3>
                    <p className="text-sm text-gray-500">
                      {profile?.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    profile?.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
