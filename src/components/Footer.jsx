import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>© {new Date().getFullYear()} Veterans Housing Pathways — Example clone. Replace content with your own.</p>
      </div>
    </footer>
  );
}
