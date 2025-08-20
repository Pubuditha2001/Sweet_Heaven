import React from "react";
// import "../admin.css";

export default function AdminFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-center py-4 text-pink-600 text-sm w-full">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Sweet Heaven Admin</span>
        <span className="hidden sm:inline">All rights reserved.</span>
      </div>
    </footer>
  );
}
