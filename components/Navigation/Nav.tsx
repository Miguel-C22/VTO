"use client";

import { MANAGER } from "@/constants/global";
import { signOutAction } from "@/app/actions";

const styleButton = `btn btn-outline hover:bg-white hover:text-black rounded-lg px-4 py-2 transition-colors duration-200`
const navContainer = `flex justify-between items-center px-6 py-2 bg-[#274c77] text-white`
const styleLinks = `text-white transition-all duration-200 px-4 py-2 hover:underline underline-offset-4 decoration-2`;
interface NavProps {
  usersRole: string | null;
  usersEmail: string;
}

function Nav({ usersRole, usersEmail }: NavProps) {
  return (
    <nav className={navContainer}>
      {/* Logo */}
        <a href={usersRole === MANAGER ? "/management" : "/associates"}>
          <img 
            src="/images/logo.png"
            alt="Logo" 
            className="h-16 w-auto"
          />
        </a>

      {/* Centered Links for Manager Role */}
      {usersRole === MANAGER && (
        <div className="flex flex-grow justify-left">
          <a
            href="/management/associates"
            className={styleLinks}
          >
            Associates
          </a>
          <a
            href="/management/history"
            className={styleLinks}
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
            className={styleButton}
          >
            Sign out
          </button>
        </form>
        <a
            href="/user-settings"
            className={styleButton}
          >
            Settings
        </a>
      </div>
    </nav>
  );
}


export default Nav;