'use client'

import Link from 'next/link'
import { Shield, ArrowLeft, Users } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Registration Disabled
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Account creation is restricted to administrators only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Access Restricted
              </h3>
              <p className="text-xs text-yellow-700">
                Public registration has been disabled for security purposes. 
                Only administrators can create new accounts.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Need Access?
                </h3>
                <p className="text-xs text-blue-700 mb-3">
                  Contact your system administrator to request account creation.
                </p>
                <div className="text-xs text-blue-600 space-y-1">
                  <div>• Students: Contact your academic advisor</div>
                  <div>• Faculty: Contact the IT department</div>
                  <div>• Staff: Contact HR department</div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}