'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Code, 
  Award, 
  Target, 
  Heart,
  ExternalLink,
  Download,
  Github,
  Linkedin,
  Globe,
  ArrowLeft,
  Star,
  BookOpen,
  Briefcase,
  FileText,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import StudentSheetViewer from '../../../components/StudentSheetViewer'

interface StudentProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  student_id: string
  department: string
  year_of_study: string
  description?: string
  tech_stack?: string
  skills?: string
  interests?: string
  career_goals?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_url?: string
  created_at: string
  total_activities: number
  approved_activities: number
  total_points: number
}

export default function StudentProfilePage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const canEdit = currentUser && currentUser.studentId && currentUser.studentId.toString() === resolvedParams.studentId

  useEffect(() => {
    // Get current user data
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    
    fetchStudentProfile()
  }, [resolvedParams.studentId])

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`http://localhost:5000/api/students/profile/${resolvedParams.studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to fetch student profile: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      setProfile(data.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load student profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Student profile could not be loaded'}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const techStackArray = profile.tech_stack ? profile.tech_stack.split(',').map(tech => tech.trim()) : []
  const skillsArray = profile.skills ? profile.skills.split(',').map(skill => skill.trim()) : []
  const interestsArray = profile.interests ? profile.interests.split(',').map(interest => interest.trim()) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            
            {canEdit && (
              <button
                onClick={() => router.push(`/profile/${resolvedParams.studentId}/edit`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Personal Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 px-6 py-8 text-white">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-bold mb-1">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <p className="text-blue-100 mb-2">Student ID: {profile.student_id}</p>
                  <div className="flex items-center justify-center space-x-1 text-sm">
                    <GraduationCap className="h-4 w-4" />
                    <span>{profile.department}</span>
                    <span>•</span>
                    <span>Year {profile.year_of_study}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-blue-600" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-blue-600" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-blue-600" />
                    <span className="text-sm">
                      Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(profile.linkedin_url || profile.github_url || profile.portfolio_url) && (
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect</h3>
                  <div className="space-y-3">
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Linkedin className="h-4 w-4 mr-3" />
                        <span className="text-sm">LinkedIn Profile</span>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-900 hover:text-gray-700 transition-colors"
                      >
                        <Github className="h-4 w-4 mr-3" />
                        <span className="text-sm">GitHub Profile</span>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                    {profile.portfolio_url && (
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <Globe className="h-4 w-4 mr-3" />
                        <span className="text-sm">Portfolio Website</span>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Download */}
              {profile.resume_url && (
                <div className="p-6">
                  <a
                    href={`http://localhost:5000${profile.resume_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{profile.total_activities}</h3>
                <p className="text-gray-600 text-sm">Total Activities</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{profile.approved_activities}</h3>
                <p className="text-gray-600 text-sm">Approved</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{profile.total_points}</h3>
                <p className="text-gray-600 text-sm">Total Points</p>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">About Me</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {profile.description || "This student hasn't added a personal description yet."}
              </p>
            </div>

            {/* Technical Skills */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Code className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Technical Skills</h2>
              </div>
              {techStackArray.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {techStackArray.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-medium hover:from-blue-200 hover:to-blue-300 transition-all cursor-pointer transform hover:scale-105"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No technical skills added yet.</p>
              )}
            </div>

            {/* Additional Skills */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Additional Skills</h2>
              </div>
              {skillsArray.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillsArray.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-medium hover:from-purple-200 hover:to-purple-300 transition-all cursor-pointer transform hover:scale-105"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No additional skills added yet.</p>
              )}
            </div>

            {/* Interests & Career Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interests */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                    <Heart className="h-4 w-4 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Interests</h3>
                </div>
                {interestsArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {interestsArray.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 rounded-full text-sm font-medium hover:from-pink-200 hover:to-pink-300 transition-all cursor-pointer transform hover:scale-105"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No interests added yet.</p>
                )}
              </div>

              {/* Career Goals */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Career Goals</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {profile.career_goals || "No career goals specified yet."}
                </p>
              </div>
            </div>

            {/* Student Activity Sheet - For Recruiters and Faculty */}
            {currentUser && ['recruiter', 'faculty', 'admin', 'super_admin'].includes(currentUser.role) && (
              <div className="mb-6">
                <StudentSheetViewer 
                  studentId={profile.id.toString()} 
                  token={localStorage.getItem('token') || undefined}
                  userRole={currentUser.role}
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <Star className="h-3 w-3 text-indigo-600" />
                </div>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link
                  href={`/dashboard/student/activities`}
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all transform hover:scale-105 group"
                >
                  <BookOpen className="h-5 w-5 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-blue-800">View Activities</span>
                </Link>
                <Link
                  href={`/portfolio/${profile.id}`}
                  className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-105 group"
                >
                  <FileText className="h-5 w-5 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-green-800">View Portfolio</span>
                </Link>
                <button
                  onClick={() => window.location.href = `mailto:${profile.email}`}
                  className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all transform hover:scale-105 group"
                >
                  <Mail className="h-5 w-5 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-purple-800">Send Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
