'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
  Code,
  Briefcase,
  Heart,
  Target,
  Linkedin,
  Github,
  Globe,
  FileText,
  ArrowRight
} from 'lucide-react'

interface StudentProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  student_id: string
  department?: string
  year_of_study?: string
  description?: string
  tech_stack?: string
  skills?: string
  interests?: string
  career_goals?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_url?: string
}

export default function CompleteProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    description: '',
    techStack: '',
    skills: '',
    interests: '',
    careerGoals: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resume: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Get current user data
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
        return
      }
    } else {
      router.push('/login')
      return
    }
  }, [router])

  useEffect(() => {
    if (currentUser) {
      fetchStudentProfile()
    }
  }, [currentUser])

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/students/profile/${currentUser?.studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
        
        // Pre-fill form with existing data
        setFormData({
          firstName: data.data.first_name || '',
          lastName: data.data.last_name || '',
          phone: data.data.phone || '',
          description: data.data.description || '',
          techStack: data.data.tech_stack || '',
          skills: data.data.skills || '',
          interests: data.data.interests || '',
          careerGoals: data.data.career_goals || '',
          linkedinUrl: data.data.linkedin_url || '',
          githubUrl: data.data.github_url || '',
          portfolioUrl: data.data.portfolio_url || '',
          resume: null,
        })
      } else {
        setError('Failed to fetch profile data')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to fetch profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      resume: file
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const formDataToSend = new FormData()
      
      // Add form fields
      formDataToSend.append('firstName', formData.firstName)
      formDataToSend.append('lastName', formData.lastName)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('techStack', formData.techStack)
      formDataToSend.append('skills', formData.skills)
      formDataToSend.append('interests', formData.interests)
      formDataToSend.append('careerGoals', formData.careerGoals)
      formDataToSend.append('linkedinUrl', formData.linkedinUrl)
      formDataToSend.append('githubUrl', formData.githubUrl)
      formDataToSend.append('portfolioUrl', formData.portfolioUrl)
      
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume)
      }

      const response = await fetch(`http://localhost:5000/api/students/profile/${currentUser?.studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      })

      if (response.ok) {
        setSuccess('Profile completed successfully! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard/student')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Welcome to Smart Student Hub! Please complete your profile to access all features and start your journey.
          </p>
        </div>

        {/* Profile Completion Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Error/Success Messages */}
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

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* About Me */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">About Me</h2>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Personal Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write a brief description about yourself, your background, and what makes you unique..."
                required
              />
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Code className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Technical Skills</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack & Programming Languages *
                </label>
                <textarea
                  id="techStack"
                  name="techStack"
                  rows={3}
                  value={formData.techStack}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., JavaScript, Python, React, Node.js, MySQL, AWS... (comma-separated)"
                  required
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Skills & Tools *
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  rows={3}
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Git, Docker, Figma, Data Analysis, Project Management... (comma-separated)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Personal Interests & Career Goals */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Interests & Goals</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                  Interests & Hobbies *
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  rows={3}
                  value={formData.interests}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What are you passionate about outside of academics? (comma-separated)"
                  required
                />
              </div>

              <div>
                <label htmlFor="careerGoals" className="block text-sm font-medium text-gray-700 mb-2">
                  Career Goals *
                </label>
                <textarea
                  id="careerGoals"
                  name="careerGoals"
                  rows={3}
                  value={formData.careerGoals}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What are your career aspirations and goals?"
                  required
                />
              </div>
            </div>
          </div>

          {/* Online Presence */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <Globe className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Online Presence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                    LinkedIn Profile
                  </div>
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Github className="h-4 w-4 mr-2 text-gray-800" />
                    GitHub Profile
                  </div>
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-purple-600" />
                    Portfolio Website
                  </div>
                </label>
                <input
                  type="url"
                  id="portfolioUrl"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Resume</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume (Optional)
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-200 ${
                formData.resume 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}>
                <div className="space-y-1 text-center">
                  {formData.resume ? (
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="resume"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>{formData.resume ? 'Change file' : 'Upload a file'}</span>
                      <input
                        id="resume"
                        name="resume"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX up to 5MB
                  </p>
                  {formData.resume && (
                    <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-center">
                        <FileText className="h-4 w-4 text-green-600 mr-2" />
                        <p className="text-sm text-green-700 font-medium">
                          Selected: {formData.resume.name}
                        </p>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Size: {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing Profile...
                </>
              ) : (
                <>
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
