import React from "react";

const SAMPLE_RESOURCES = [
  { id: 1, name: "Veteran Housing Program A", city: "Seattle, WA", phone: "(206) 555-0101", type: "Transitional Housing" },
  { id: 2, name: "Veteran Support Center", city: "Tacoma, WA", phone: "(253) 555-0202", type: "Case Management" },
  { id: 3, name: "Veteran Legal Aid", city: "Bellevue, WA", phone: "(425) 555-0303", type: "Legal Assistance" }
];

export default function Resources() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Resources</h2>
      <div className="space-y-4">
        {SAMPLE_RESOURCES.map(r => (
          <div key={r.id} className="p-4 border rounded flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-gray-600">{r.type} — {r.city}</p>
            </div>
            <div className="text-right">
              <a href={`tel:${r.phone}`} className="text-sky-700">{r.phone}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
