import Link from 'next/link'
import { 
  BookOpen, 
  Award, 
  Users, 
  BarChart3, 
  Shield, 
  Download,
  CheckCircle,
  Upload,
  Eye,
  TrendingUp,
  GraduationCap,
  FileText,
  Clock,
  Star
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Smart Student Hub</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Centralized Student
            <span className="text-blue-600"> Achievement</span>
            <br />Management Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform scattered student records into a comprehensive digital portfolio. 
            Track achievements, validate accomplishments, and generate verified portfolios 
            for academic and career success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Building Your Portfolio
            </Link>
            <Link href="#how-it-works" className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Student achievements remain scattered across departments, lost in paper records, 
              and lack centralized verification. This hampers institutional efficiency and 
              limits student opportunities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <FileText className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scattered Records</h3>
              <p className="text-gray-600">Achievements spread across various departments and paper files</p>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Administrative Burden</h3>
              <p className="text-gray-600">Time-consuming audits and accreditation processes</p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <Eye className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Limited Visibility</h3>
              <p className="text-gray-600">Students can't showcase their complete profile effectively</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools to manage, track, and showcase student achievements
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Dynamic Dashboard</h3>
              </div>
              <p className="text-gray-600">Real-time updates on academic performance, attendance, and credit-based activities</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <Upload className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Activity Tracker</h3>
              </div>
              <p className="text-gray-600">Upload and validate participation in seminars, conferences, MOOCs, internships, and extracurriculars</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Faculty Approval</h3>
              </div>
              <p className="text-gray-600">Faculty and admin can approve uploaded records to maintain credibility and verification</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <Download className="h-8 w-8 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Digital Portfolio</h3>
              </div>
              <p className="text-gray-600">Auto-generated, downloadable, and shareable verified student portfolio in PDF or web link format</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Analytics & Reporting</h3>
              </div>
              <p className="text-gray-600">Generate reports for NAAC, AICTE, NIRF, or internal evaluations with comprehensive data insights</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-teal-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Integration Support</h3>
              </div>
              <p className="text-gray-600">Link with existing Learning Management Systems (LMS), ERP, or digital university platforms</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A simple 4-step process to build your comprehensive digital portfolio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up & Profile</h3>
              <p className="text-gray-600">Create your account and set up your student profile with basic information</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Activities</h3>
              <p className="text-gray-600">Upload certificates, achievements, and activity records with supporting documents</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Faculty Validation</h3>
              <p className="text-gray-600">Faculty members review and approve your uploaded records for verification</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Portfolio</h3>
              <p className="text-gray-600">Download your verified digital portfolio or share via web link for applications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Impact & Benefits</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Empowering students, faculty, and institutions with comprehensive achievement management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Students</h3>
              <ul className="text-blue-100 space-y-2">
                <li>• Verified holistic digital profile</li>
                <li>• Better placement opportunities</li>
                <li>• Streamlined scholarship applications</li>
                <li>• Career planning support</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Faculty</h3>
              <ul className="text-blue-100 space-y-2">
                <li>• Real-time student tracking</li>
                <li>• Simplified approval process</li>
                <li>• Enhanced mentoring capabilities</li>
                <li>• Reduced administrative workload</li>
              </ul>
            </div>
            
            <div className="text-center">
              <Award className="h-12 w-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Institutions</h3>
              <ul className="text-blue-100 space-y-2">
                <li>• Streamlined accreditation process</li>
                <li>• Data-driven decision making</li>
                <li>• Reduced paperwork and errors</li>
                <li>• Enhanced institutional reputation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Student Achievement Management?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join institutions already using Smart Student Hub to modernize their student record management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started Today
            </Link>
            <Link href="/demo" className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">Smart Student Hub</span>
              </div>
              <p className="text-gray-400">
                Centralized student achievement management platform for modern educational institutions.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Dynamic Dashboard</li>
                <li>Activity Tracker</li>
                <li>Faculty Approval</li>
                <li>Digital Portfolio</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>Training Resources</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@smartstudenthub.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: Education Tech Center</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Smart Student Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
