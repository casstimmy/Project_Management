import Layout from "@/components/layout/PageLayout";

export default function HomePage() {
  return (
    <Layout>
      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Lists</h2>
        <table className="min-w-full text-left text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Color</th>
              <th className="py-2">Progress</th>
              <th className="py-2">Start</th>
              <th className="py-2">End</th>
              <th className="py-2">Priority</th>
              <th className="py-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {["List", "Hetch"].map((list) => (
              <tr key={list} className="border-b hover:bg-gray-50 transition">
                <td className="py-2">{list}</td>
                <td className="py-2">-</td>
                <td className="py-2 flex items-center gap-2">
                  <div className="bg-gray-200 w-24 h-2 rounded">
                    <div className="bg-blue-500 h-2 rounded w-0" />
                  </div>
                  0/0
                </td>
                <td className="py-2">-</td>
                <td className="py-2">-</td>
                <td className="py-2">-</td>
                <td className="py-2">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6 h-60 flex items-center justify-center text-gray-500">
          Resources – Drop files here to attach
        </div>
        <div className="bg-white rounded shadow p-6 h-60 flex items-center justify-center text-gray-500">
          Workload by Status – No Results
        </div>
      </div>
    </Layout>
  );
}
