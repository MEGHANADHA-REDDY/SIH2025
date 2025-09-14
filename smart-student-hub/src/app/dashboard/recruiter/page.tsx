'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Star,
  Award,
  Building,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'

interface Student {
  id: number
  student_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  year_of_study: number
  cgpa: number
  attendance_percentage: number
  total_activities: number
  approved_activities: number
}

export default function RecruiterDashboard() {
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
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
      if (parsedUser.role !== 'recruiter') {
        router.push('/dashboard')
        return
      }
      setUser(parsedUser)
      fetchStudents(token)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router])

  const fetchStudents = async (token: string) => {
    try {
      // For demo purposes, we'll create mock data since we don't have recruiter API yet
      const mockStudents: Student[] = [
        {
          id: 1,
          student_id: 'STU001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@university.edu',
          department: 'Computer Science',
          year_of_study: 4,
          cgpa: 8.5,
          attendance_percentage: 95,
          total_activities: 12,
          approved_activities: 10
        },
        {
          id: 2,
          student_id: 'STU002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@university.edu',
          department: 'Computer Science',
          year_of_study: 3,
          cgpa: 9.2,
          attendance_percentage: 98,
          total_activities: 15,
          approved_activities: 14
        },
        {
          id: 3,
          student_id: 'STU003',
          first_name: 'Mike',
          last_name: 'Johnson',
          email: 'mike.johnson@university.edu',
          department: 'Electronics',
          year_of_study: 4,
          cgpa: 7.8,
          attendance_percentage: 92,
          total_activities: 8,
          approved_activities: 7
        },
        {
          id: 4,
          student_id: 'STU004',
          first_name: 'Sarah',
          last_name: 'Wilson',
          email: 'sarah.wilson@university.edu',
          department: 'Mechanical',
          year_of_study: 3,
          cgpa: 8.9,
          attendance_percentage: 96,
          total_activities: 11,
          approved_activities: 9
        }
      ]
      
      setStudents(mockStudents)
      setFilteredStudents(mockStudents)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    let filtered = students

    if (term) {
      filtered = filtered.filter(student => 
        student.first_name.toLowerCase().includes(term.toLowerCase()) ||
        student.last_name.toLowerCase().includes(term.toLowerCase()) ||
        student.student_id.toLowerCase().includes(term.toLowerCase()) ||
        student.department.toLowerCase().includes(term.toLowerCase())
      )
    }

    if (selectedDepartment) {
      filtered = filtered.filter(student => student.department === selectedDepartment)
    }

    if (selectedYear) {
      filtered = filtered.filter(student => student.year_of_study.toString() === selectedYear)
    }

    setFilteredStudents(filtered)
  }

  const handleFilter = (department: string, year: string) => {
    setSelectedDepartment(department)
    setSelectedYear(year)
    handleSearch(searchTerm)
  }

  const getDepartments = () => {
    return [...new Set(students.map(student => student.department))]
  }

  const getYears = () => {
    return [...new Set(students.map(student => student.year_of_study))].sort()
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
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                  Recruiter
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
              Recruiter Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Discover talented students and their achievements
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Students
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name, ID, or department..."
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => handleFilter(e.target.value, selectedYear)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Departments</option>
                  {getDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => handleFilter(selectedDepartment, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Years</option>
                  {getYears().map(year => (
                    <option key={year} value={year}>{year} Year</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <button
                      onClick={() => router.push(`/profile/${student.id}`)}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {student.first_name} {student.last_name}
                    </button>
                    <p className="text-sm text-gray-500">ID: {student.student_id}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{student.cgpa}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {student.department}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {student.year_of_study} Year
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    {student.approved_activities} approved activities
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {student.attendance_percentage}% attendance
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                      <Eye className="h-4 w-4" />
                      <span>View Profile</span>
                    </button>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm">
                      <Download className="h-4 w-4" />
                      <span>Download CV</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
