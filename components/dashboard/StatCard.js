// components/dashboard/StatCard.js

export default function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl shadow-md p-4 text-white ${color}`}>
      <div className="text-sm uppercase font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
