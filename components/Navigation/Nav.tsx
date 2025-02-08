"use client";
import { MANAGER } from "@/constants/global";
import { signOutAction } from "@/app/actions";

interface NavProps {
  usersRole: string;
  usersEmail: string;
}

function Nav({ usersRole, usersEmail }: NavProps) {
  return (
    <nav className="flex justify-between items-center px-6 py-2 bg-[#274c77] text-white">
      {/* Logo */}
      <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/V_%28logo_2010%29.svg" alt="Logo" className="h-16 w-auto" />

      {/* Centered Links for Manager Role */}
      {usersRole === MANAGER && (
        <div className="flex flex-grow justify-center gap-6">
          <a
            href="/management/associates"
            className="btn btn-ghost text-white transition-all duration-200 hover:bg-[#1e3a52] rounded-lg px-4 py-2"
          >
            Associates
          </a>
          <a
            href="/management/history"
            className="btn btn-ghost text-white transition-all duration-200 hover:bg-[#1e3a52] rounded-lg px-4 py-2"
          >
            History
          </a>
        </div>
      )}

      {/* User Info and Sign-out Button */}
      <div className="flex items-center gap-4">
        {usersEmail && <span className="text-sm">{usersEmail}</span>}
        <form action={signOutAction}>
          <button
            type="submit"
            className="btn btn-outline border-white text-white hover:bg-white hover:text-black rounded-lg px-4 py-2 transition-colors duration-200"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}


export default Nav;