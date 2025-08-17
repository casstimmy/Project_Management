// components/project/WeeklyReport.js
export default function WeeklyReport({ reports = [] }) {
  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-semibold mb-3">Weekly Progress Report</h2>
      <div className="space-y-4">
        {reports.map((report, i) => (
          <div key={i} className="border p-3 rounded-lg">
            <h3 className="font-semibold">Week {report.week}</h3>
            <p className="text-sm text-gray-600">{report.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
