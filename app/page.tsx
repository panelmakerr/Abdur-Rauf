import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Hospital Recruitment</h1>
            <Link href="/admin/login" className="text-sm text-gray-600 hover:text-indigo-600">
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Join Our Healthcare Team</h2>
          <p className="text-xl text-gray-600">Explore current openings and apply today</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs?.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                  {job.department}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
              <Link
                href={`/apply/${job.id}`}
                className="inline-block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>

        {!jobs || jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No active positions at the moment. Check back soon!</p>
          </div>
        )}
      </main>

      <footer className="bg-white mt-20 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2026 Hospital Recruitment Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
