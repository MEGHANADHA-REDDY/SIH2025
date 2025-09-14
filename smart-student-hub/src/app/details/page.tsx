'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, User, FileText, Code, Upload, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

export default function StudentDetailsPage() {
  const [studentData, setStudentData] = useState<any>(null)
  const [formData, setFormData] = useState({
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user came from registration
    const newStudentData = localStorage.getItem('newStudentData')
    if (!newStudentData) {
      // If no registration data, redirect to login
      router.push('/login')
      return
    }

    try {
      const parsedData = JSON.parse(newStudentData)
      setStudentData(parsedData)
    } catch (error) {
      console.error('Error parsing student data:', error)
      router.push('/login')
    }
  }, [router])

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

  const validateForm = () => {
    if (!formData.description.trim()) {
      setError('Please provide a description about yourself')
      return false
    }

    if (!formData.techStack.trim()) {
      setError('Please list your technical skills/stack')
      return false
    }

    if (!formData.resume) {
      setError('Please upload your resume')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('email', studentData.email)
      submitData.append('description', formData.description)
      submitData.append('techStack', formData.techStack)
      submitData.append('skills', formData.skills)
      submitData.append('interests', formData.interests)
      submitData.append('careerGoals', formData.careerGoals)
      submitData.append('linkedinUrl', formData.linkedinUrl)
      submitData.append('githubUrl', formData.githubUrl)
      submitData.append('portfolioUrl', formData.portfolioUrl)
      
      if (formData.resume) {
        submitData.append('resume', formData.resume)
      }

      const response = await fetch('http://localhost:5000/api/students/complete-profile', {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profile completed successfully! Redirecting to login...')
        // Clear the temporary student data
        localStorage.removeItem('newStudentData')
        
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.message || 'Failed to complete profile')
      }
    } catch (error) {
      console.error('Profile completion error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Welcome, {studentData.firstName}! Let's build your professional profile
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              Registration Complete
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className="flex items-center text-blue-600 font-medium">
              <User className="h-4 w-4 mr-1" />
              Profile Details
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
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

            {/* About You Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  About You
                </h2>
                <p className="text-sm text-gray-600 mt-1">Tell us about yourself and your aspirations</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write a brief description about yourself, your background, and what makes you unique..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="What are you passionate about outside of academics?"
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

            {/* Technical Skills Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Code className="h-5 w-5 mr-2 text-blue-600" />
                  Technical Profile
                </h2>
                <p className="text-sm text-gray-600 mt-1">Showcase your technical skills and expertise</p>
              </div>

              <div>
                <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack & Programming Languages *
                </label>
                <textarea
                  id="techStack"
                  name="techStack"
                  required
                  rows={3}
                  value={formData.techStack}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., JavaScript, Python, React, Node.js, MySQL, AWS..."
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
                  placeholder="e.g., Git, Docker, Figma, Data Analysis, Project Management..."
                />
              </div>
            </div>

            {/* Online Presence Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Online Presence
                </h2>
                <p className="text-sm text-gray-600 mt-1">Share your professional profiles and portfolio</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
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
                    GitHub Profile
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
                    Portfolio Website
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

            {/* Resume Upload Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Resume Upload
                </h2>
                <p className="text-sm text-gray-600 mt-1">Upload your latest resume (PDF or Word format)</p>
              </div>

              <div>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="resume"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload your resume</span>
                        <input
                          id="resume"
                          name="resume"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          required
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
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Completing Profile...
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
