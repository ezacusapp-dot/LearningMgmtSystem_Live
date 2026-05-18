'use client';

import React from 'react';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-[#0f1117] p-8">
      {/* Main Layout - Two Columns */}
      <div className="max-w-[1400px] mx-auto">
        
        {/* Row 1: Welcome Header and Stats */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Welcome back, Alex!</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">AS</span>
              <span className="text-sm text-gray-400">AlexSmith</span>
              <span className="text-sm text-gray-400">Student</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Continue your learning journey</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Keep Going! You're doing great!</div>
            <div className="text-sm text-gray-300 mt-1">You've completed 8 courses this month.</div>
            <div className="text-xs text-green-500 mt-1">Just 2 more to reach your goal!</div>
            <button className="mt-2 px-4 py-1.5 bg-[#3b6d11] text-[#c0dd97] text-sm rounded-lg border border-[#639922]">
              Continue Learning
            </button>
            <div className="text-xs text-gray-500 mt-1">+2 this week</div>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-4">
            <div className="text-xs text-gray-500">Courses Enrolled</div>
            <div className="text-2xl font-bold text-white mt-1">12</div>
            <div className="text-xs text-gray-500 mt-2">+2 this week</div>
          </div>
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-4">
            <div className="text-xs text-gray-500">Rank</div>
            <div className="text-2xl font-bold text-white mt-1">#142</div>
            <div className="text-xs text-blue-400 mt-2">Top 15%</div>
          </div>
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-4">
            <div className="text-xs text-gray-500">Tests Completed</div>
            <div className="text-2xl font-bold text-white mt-1">24</div>
            <div className="text-xs text-gray-400 mt-2">92% avg</div>
          </div>
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-4">
            <div className="text-xs text-gray-500">Certificates</div>
            <div className="text-2xl font-bold text-white mt-1">8</div>
            <div className="text-xs text-green-500 mt-2">2 new</div>
          </div>
        </div>

        {/* Row 2: Continue Learning Section with two cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Continue Learning</h2>
          <div className="grid grid-cols-2 gap-5">
            {/* React.js Card */}
            <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-5">
              <h3 className="font-semibold text-white mb-1">React.js Masterclass</h3>
              <p className="text-xs text-gray-500 mb-3">Chapter 13: Advanced Hooks</p>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>65%</span>
                <span>12 of 18 lessons completed</span>
              </div>
              <div className="bg-[#2d3448] rounded-full h-1.5">
                <div className="w-[65%] bg-[#3b6d11] rounded-full h-1.5"></div>
              </div>
            </div>

            {/* Python Card */}
            <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-5">
              <h3 className="font-semibold text-white mb-1">Python for Data Science</h3>
              <p className="text-xs text-gray-500 mb-3">Chapter 9: Data Visualization</p>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>38%</span>
                <span>8 of 21 lessons completed</span>
              </div>
              <div className="bg-[#2d3448] rounded-full h-1.5">
                <div className="w-[38%] bg-[#3b6d11] rounded-full h-1.5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Performance Trend & Upcoming Exam */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          {/* Performance Trend */}
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-400">Performance Trend</h3>
              <span className="text-green-500 text-sm">📈 +15% this month</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Web Dev', width: '75%' },
                { name: 'Data Science', width: '60%' },
                { name: 'AI/ML', width: '45%' },
                { name: 'Mobile', width: '30%' }
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{item.name}</span>
                    <span className="text-gray-500">{item.width}</span>
                  </div>
                  <div className="bg-[#2d3448] rounded-full h-1.5">
                    <div className={`bg-[#3b6d11] rounded-full h-1.5`} style={{ width: item.width }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Exam */}
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Upcoming Exam</h3>
            <div className="text-white font-semibold mb-1">React Final Assessment</div>
            <div className="text-xs text-gray-500 mb-3">Scheduled for Mar 15, 2026</div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Time Remaining</span>
                <span className="text-sm font-semibold text-blue-400">16 days</span>
              </div>
              <button className="px-4 py-1.5 bg-[#3b6d11] text-[#c0dd97] text-xs rounded-lg border border-[#639922] hover:bg-[#27500a] transition">
                Prepare Now
              </button>
            </div>
          </div>
        </div>

        {/* Row 4: Course Distribution & Skills Assessment */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          {/* Course Distribution */}
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Course Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Web Dev', color: 'bg-blue-500' },
                { name: 'AI/ML', color: 'bg-purple-500' },
                { name: 'Mobile', color: 'bg-green-500' },
                { name: 'Data Science', color: 'bg-orange-500' }
              ].map((category) => (
                <span key={category.name} className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                  {category.name}
                </span>
              ))}
            </div>
          </div>

          {/* Skills Assessment */}
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Skills Assessment</h3>
            <div className="flex flex-wrap gap-2">
              {['Node.js', 'Python', 'TypeScript', 'JavaScript', 'React', 'Java', 'C++', 'C#'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Row 5: Quick Actions */}
        <div className="mb-8">
          <div className="bg-[#1a2030] border border-[#2d3448] rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
            <div className="flex gap-3">
              <button className="px-4 py-1.5 bg-[#3b6d11] text-[#c0dd97] text-sm rounded-lg border border-[#639922] hover:bg-[#27500a] transition">
                Take Mock Test
              </button>
              <button className="px-4 py-1.5 border border-[#2d3448] text-gray-400 text-sm rounded-lg hover:bg-[#1e2230] hover:text-white transition">
                View Certificates
              </button>
              <button className="px-4 py-1.5 border border-[#2d3448] text-gray-400 text-sm rounded-lg hover:bg-[#1e2230] hover:text-white transition">
                Check Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Row 6: Student Panel Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Student Panel</h2>
            <button className="px-3 py-1 text-xs text-gray-400 border border-[#2d3448] rounded-lg hover:bg-[#1e2230]">
              View All
            </button>
          </div>
          
          <div className="bg-[#161b27] border border-[#2d3448] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#1a2030] border-b border-[#2d3448]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2537]">
                {[
                  { name: 'Alex Smith',   course: 'React.js Masterclass',    progress: 65, status: 'Active',    grade: 'A'  },
                  { name: 'Jordan Lee',   course: 'Python for Data Science',  progress: 38, status: 'Active',    grade: 'B+' },
                  { name: 'Taylor Chen',  course: 'Advanced Hooks',           progress: 82, status: 'Completed', grade: 'A-' },
                  { name: 'Casey Kim',    course: 'Data Visualization',       progress: 45, status: 'Active',    grade: 'B'  },
                ].map((student, idx) => (
                  <tr key={idx} className="hover:bg-[#1c2235] transition">
                    <td className="px-4 py-3 text-white font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-gray-300">{student.course}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#2d3448] rounded-full h-1.5 w-24">
                          <div className="bg-[#3b6d11] rounded-full h-1.5" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-400">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        student.status === 'Active'
                          ? 'bg-green-900/40 text-green-400 border border-green-800'
                          : 'bg-blue-900/40 text-blue-400 border border-blue-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">{student.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}