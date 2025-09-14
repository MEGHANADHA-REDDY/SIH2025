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
  Download,
  Github,
  Linkedin,
  Globe,
  ArrowLeft,
  Star,
  BookOpen,
  Briefcase,
  FileText,
  Building,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

interface StudentPortfolio {
  // Student Info
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
  
  // Activities
  activities: Activity[]
  
  // Stats
  total_points: number
  total_activities: number
}

interface Activity {
  id: number
  title: string
  description: string
  activity_type: string
  category: string
  start_date: string
  end_date: string
  organization: string
  certificate_url: string
  status: string
  created_at: string
  approved_at: string
  approved_by_name?: string
  approved_by_last_name?: string
  category_name: string
  points: number
}

export default function PortfolioPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params)
  const [portfolio, setPortfolio] = useState<StudentPortfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchPortfolio()
  }, [resolvedParams.studentId])

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`http://localhost:5000/api/students/portfolio/${resolvedParams.studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio')
      }

      const data = await response.json()
      setPortfolio(data.data)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      setError('Failed to load portfolio')
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

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Portfolio could not be loaded'}</p>
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

  const techStackArray = portfolio.tech_stack ? portfolio.tech_stack.split(',').map(tech => tech.trim()) : []
  const skillsArray = portfolio.skills ? portfolio.skills.split(',').map(skill => skill.trim()) : []
  const interestsArray = portfolio.interests ? portfolio.interests.split(',').map(interest => interest.trim()) : []

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
            
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Student Portfolio</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Header */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mr-6">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {portfolio.first_name} {portfolio.last_name}
                </h1>
                <p className="text-blue-100 mb-1">Student ID: {portfolio.student_id}</p>
                <p className="text-blue-100">
                  {portfolio.department} • Year {portfolio.year_of_study}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{portfolio.total_points}</div>
              <div className="text-blue-100">Total Points</div>
              <div className="text-lg font-semibold mt-2">{portfolio.total_activities} Activities</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Personal Info & Resume */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-blue-600" />
                  <span className="text-sm">{portfolio.email}</span>
                </div>
                {portfolio.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-blue-600" />
                    <span className="text-sm">{portfolio.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Section */}
            {portfolio.resume_url && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  Resume
                </h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <a
                    href={`http://localhost:5000${portfolio.resume_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </a>
                  <p className="text-xs text-gray-500 mt-2">PDF Document</p>
                </div>
              </div>
            )}

            {/* Social Links */}
            {(portfolio.linkedin_url || portfolio.github_url || portfolio.portfolio_url) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-5 w-5 text-purple-600 mr-2" />
                  Online Presence
                </h3>
                <div className="space-y-3">
                  {portfolio.linkedin_url && (
                    <a
                      href={portfolio.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Linkedin className="h-4 w-4 mr-3" />
                      <span className="text-sm">LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}
                  {portfolio.github_url && (
                    <a
                      href={portfolio.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-900 hover:text-gray-700 transition-colors"
                    >
                      <Github className="h-4 w-4 mr-3" />
                      <span className="text-sm">GitHub Profile</span>
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )}
                  {portfolio.portfolio_url && (
                    <a
                      href={portfolio.portfolio_url}
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

            {/* Skills Summary */}
            {techStackArray.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Code className="h-5 w-5 text-green-600 mr-2" />
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techStackArray.slice(0, 6).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {techStackArray.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                      +{techStackArray.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - About & Activities */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About Section */}
            {portfolio.description && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  About Me
                </h3>
                <p className="text-gray-700 leading-relaxed">{portfolio.description}</p>
              </div>
            )}

            {/* Career Goals */}
            {portfolio.career_goals && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 text-orange-600 mr-2" />
                  Career Goals
                </h3>
                <p className="text-gray-700 leading-relaxed">{portfolio.career_goals}</p>
              </div>
            )}

            {/* Approved Activities */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                Approved Activities ({portfolio.activities.length})
              </h3>
              
              {portfolio.activities.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.activities.map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {activity.title}
                          </h4>
                          <p className="text-gray-600 mb-3">{activity.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-blue-600" />
                              {activity.organization}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-green-600" />
                              {new Date(activity.start_date).toLocaleDateString()} - {new Date(activity.end_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
                              {activity.category_name}
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-2 text-yellow-600" />
                              {activity.points} points
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="flex items-center text-green-600 mb-2">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Approved</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            by {activity.approved_by_name} {activity.approved_by_last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.approved_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {activity.certificate_url && (
                        <div className="border-t border-gray-100 pt-4">
                          <a
                            href={`http://localhost:5000${activity.certificate_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Certificate
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No Approved Activities</h4>
                  <p className="text-gray-400">Activities will appear here once approved by faculty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
