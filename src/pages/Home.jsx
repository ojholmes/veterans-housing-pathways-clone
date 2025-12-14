import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold">Connecting Veterans to Housing & Resources</h1>
        <p className="mt-2 max-w-2xl">A searchable directory, interactive map, and resource hub to help veterans find housing support services.</p>
        <div className="mt-4">
          <Link to="/resources" className="inline-block bg-white text-sky-700 px-4 py-2 rounded">Explore Resources</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Find Housing</h3>
          <p className="text-sm text-gray-600 mt-2">Search for veterans housing programs by location and eligibility.</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Support Services</h3>
          <p className="text-sm text-gray-600 mt-2">Find case management, legal help, and employment services.</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Interactive Map</h3>
          <p className="text-sm text-gray-600 mt-2">Visualize providers on a map and filter by service type.</p>
        </div>
      </section>
    </div>
  );
}
