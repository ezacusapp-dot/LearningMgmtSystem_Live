"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
   Bar as RechartsBar,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ================= TYPES ================= */

interface CardProps {
  title: string;
  value: string;
}

interface BarProps {
  label: string;
  value: number;
}

interface PerformerProps {
  rank: string;
  name: string;
  tests: string;
  level: string;
}

/* ================= MAIN COMPONENT ================= */

export default function SchoolDashboard() {

  /* ---------- Line Chart Data ---------- */
  const studentData = [
    { month: "Jan", active: 220, completed: 45 },
    { month: "Feb", active: 230, completed: 52 },
    { month: "Mar", active: 240, completed: 58 },
    { month: "Apr", active: 245, completed: 65 },
  ];

  /* ---------- Pie Chart Data ---------- */
  const resultData = [
    { name: "Passed", value: 80, color: "#d4e157" },
    { name: "Failed", value: 12, color: "#ef5350" },
    { name: "Pending", value: 5, color: "#ba68c8" },
  ];

  return (
   <div className="h-[calc(100vh-80px)] overflow-y-auto pr-2 bg-[#0f1117] text-white">

      {/* ================= TITLE ================= */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard Overview</h1>
        <p className="opacity-70">
          Monitor your school's performance and student progress
        </p>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <Card title="Total Students" value="247" />
        <Card title="Active Learners" value="240" />
        <Card title="Course Completion" value="82%" />
        <Card title="Pass Rate" value="87%" />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-[#161b27] rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">
            Monthly Active Students
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studentData}>
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="active"
                stroke="#ff6ec7"
                strokeWidth={3}
                dot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="completed"
                stroke="#d4e157"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-pink-400">● Active</span>
            <span className="text-lime-400">● Completed</span>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#161b27] rounded-2xl p-6 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">
            Exam Results
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resultData}
                dataKey="value"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {resultData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= COURSE TREND ================= */}
  <div className="bg-[#161b27] rounded-2xl p-6 mb-10">
  <h2 className="text-2xl font-bold mb-6">
    Course Completion Trend
  </h2>

  {/* IMPORTANT FIX */}
  <div className=" w-full h-[300px] min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[
          { course: "Python", completion: 85 },
          { course: "React", completion: 78 },
          { course: "Data Science", completion: 92 },
          { course: "DevOps", completion: 70 },
          { course: "TypeScript", completion: 88 },
        ]}
      >
        <XAxis dataKey="course" />
        <YAxis />
        <Tooltip />
        <RechartsBar dataKey="completion" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
      {/* ================= BOTTOM SECTION ================= */}
      <div className="grid grid-cols-2 gap-6">

        {/* At Risk Students */}
        <div className="bg-[#161b27] rounded-2xl p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">
              ⚠️ At-Risk Students
            </h2>

            <span className="bg-red-500/30 text-red-400 px-4 py-1 rounded-full text-sm">
              3 students
            </span>
          </div>

          <div className="bg-[#161b27] p-5 rounded-xl">
            <h3 className="font-bold text-lg">Arjun Verma</h3>
            <p className="opacity-70">Python</p>

            <div className="flex gap-10 mt-4">
              <p>Progress <b>35%</b></p>
              <p>Attendance <b>62%</b></p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-[#161b27] rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            🏆 Top Performers
          </h2>

          <Performer
            rank="1"
            name="Diya Sharma"
            tests="30 tests completed"
            level="Platinum"
          />

          <Performer
            rank="2"
            name="Rahul Mehta"
            tests="28 tests completed"
            level="Gold"
          />
        </div>
      </div>

    </div>
  );
}

/* ================= CARD ================= */

function Card({ title, value }: CardProps) {
  return (
    <div className="bg-[#161b27] p-6 rounded-2xl shadow-lg">
      <h3 className="text-3xl font-bold">{value}</h3>
      <p className="opacity-70">{title}</p>
    </div>
  );
}

/* ================= BAR ================= */

function Bar({ label, value }: BarProps) {
  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="bg-pink-500 rounded-t-xl w-full transition-all"
        style={{ height: `${value}%` }}
      />
      <p className="mt-2 text-sm">{label}</p>
    </div>
  );
}

/* ================= PERFORMER ================= */

function Performer({
  rank,
  name,
  tests,
  level,
}: PerformerProps) {
  return (
    <div className="bg-[#161b27] rounded-xl p-5 mb-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center font-bold">
          {rank}
        </div>

        <div>
          <p className="font-semibold">{name}</p>
          <p className="opacity-70 text-sm">{tests}</p>
        </div>
      </div>

      <span className="bg-purple-700 px-4 py-1 rounded-full text-sm">
        {level}
      </span>
    </div>
  );
}