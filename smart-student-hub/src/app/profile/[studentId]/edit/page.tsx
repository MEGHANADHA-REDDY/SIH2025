'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  ArrowLeft,
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
  FileText
} from 'lucide-react'

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
}

export default function EditProfilePage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params)
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
    // Get current user data and check permissions
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        
        // Check if user can edit this profile
        if (!user.studentId || user.studentId.toString() !== resolvedParams.studentId) {
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
        return
      }
    } else {
      router.push('/login')
      return
    }
    
    fetchStudentProfile()
  }, [resolvedParams.studentId, router])

  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/students/profile/${resolvedParams.studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch student profile')
      }

      const data = await response.json()
      const profileData = data.data
      setProfile(profileData)
      
      // Pre-fill form with existing data
      setFormData({
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        phone: profileData.phone || '',
        description: profileData.description || '',
        techStack: profileData.tech_stack || '',
        skills: profileData.skills || '',
        interests: profileData.interests || '',
        careerGoals: profileData.career_goals || '',
        linkedinUrl: profileData.linkedin_url || '',
        githubUrl: profileData.github_url || '',
        portfolioUrl: profileData.portfolio_url || '',
        resume: null,
      })
      
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile data')
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
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document for your resume')
        return
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError('Resume file size must be less than 5MB')
        return
      }

      setFormData(prev => ({
        ...prev,
        resume: file
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
      const submitData = new FormData()
      
      // Append all form fields
      submitData.append('firstName', formData.firstName)
      submitData.append('lastName', formData.lastName)
      submitData.append('phone', formData.phone)
      submitData.append('description', formData.description)
      submitData.append('techStack', formData.techStack)
      submitData.append('skills', formData.skills)
      submitData.append('interests', formData.interests)
      submitData.append('careerGoals', formData.careerGoals)
      submitData.append('linkedinUrl', formData.linkedinUrl)
      submitData.append('githubUrl', formData.githubUrl)
      submitData.append('portfolioUrl', formData.portfolioUrl)
      
      // Only append resume if a new one is selected
      if (formData.resume) {
        submitData.append('resume', formData.resume)
      }

      const response = await fetch(`http://localhost:5000/api/students/profile/${resolvedParams.studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      setSuccess('Profile updated successfully!')
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        router.push(`/profile/${resolvedParams.studentId}`)
      }, 2000)

    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/profile/${resolvedParams.studentId}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </button>
            
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                Personal Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write a brief description about yourself, your background, and what makes you unique..."
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
                  Tech Stack & Programming Languages
                </label>
                <textarea
                  id="techStack"
                  name="techStack"
                  rows={3}
                  value={formData.techStack}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., JavaScript, Python, React, Node.js, MySQL, AWS... (comma-separated)"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Skills & Tools
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  rows={3}
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Git, Docker, Figma, Data Analysis, Project Management... (comma-separated)"
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
                  Interests & Hobbies
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  rows={3}
                  value={formData.interests}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What are you passionate about outside of academics? (comma-separated)"
                />
              </div>

              <div>
                <label htmlFor="careerGoals" className="block text-sm font-medium text-gray-700 mb-2">
                  Career Goals
                </label>
                <textarea
                  id="careerGoals"
                  name="careerGoals"
                  rows={3}
                  value={formData.careerGoals}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What are your career aspirations and goals?"
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
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                Upload New Resume (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="resume"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a new resume</span>
                      <input
                        id="resume"
                        name="resume"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                  {formData.resume && (
                    <p className="text-sm text-green-600 font-medium">
                      Selected: {formData.resume.name}
                    </p>
                  )}
                  {!formData.resume && profile.resume_url && (
                    <p className="text-sm text-gray-500">
                      Current resume will be kept if no new file is uploaded
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/profile/${resolvedParams.studentId}`)}
              className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Profile...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
