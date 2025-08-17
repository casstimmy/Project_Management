// components/project/BudgetVsActual.js
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function BudgetVsActual({ data }) {
  // Example data: [{ name: "Jan", budget: 4000, actual: 3800 }]
  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-semibold mb-3">Budget vs Actual</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="budget" fill="#8884d8" />
          <Bar dataKey="actual" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
