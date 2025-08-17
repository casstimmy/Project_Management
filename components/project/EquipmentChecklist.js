// components/project/EquipmentChecklist.js
import { useState } from "react";

export default function EquipmentChecklist({ equipment = [] }) {
  const [list, setList] = useState(equipment);

  const toggleCheck = (index) => {
    const updated = [...list];
    updated[index].checked = !updated[index].checked;
    setList(updated);
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-semibold mb-3">Equipment Checklist</h2>
      <ul className="space-y-2">
        {list.map((item, i) => (
          <li key={i} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleCheck(i)}
              className="w-4 h-4"
            />
            <span className={item.checked ? "line-through text-gray-400" : ""}>
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
