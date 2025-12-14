import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-sky-800 text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">Veterans Housing Pathways</Link>
        <nav className="space-x-4">
          <Link to="/resources" className="hover:underline">Resources</Link>
          <Link to="/map" className="hover:underline">Map</Link>
          <a href="#contact" className="hover:underline">Contact</a>
        </nav>
      </div>
    </header>
  );
}
