import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("elkexpedition_user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setLoggedIn(true);
          setUsername(userObj.username || "");
        } catch {
          setLoggedIn(false);
          setUsername("");
        }
      } else {
        setLoggedIn(false);
        setUsername("");
      }
    }
  }, [typeof window !== "undefined" && window.location.pathname]);

  // Close search bar on outside click or Escape
  useEffect(() => {
    if (!showSearch) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowSearch(false);
    };
    const handleClick = (e) => {
      if (e.target.closest(".modern-search-bar") || e.target.closest(".search-icon")) return;
      setShowSearch(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [showSearch]);

  const LogInClickHandler = (e) => {
    e.preventDefault();
    router.push("/components/LogIn");
  };

  const handleLogout = () => {
    localStorage.removeItem("elkexpedition_user");
    setLoggedIn(false);
    setUsername("");
    window.location.href = "/"; // Full reload to home, avoids reload loop
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    router.push("/components/Profile");
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    router.push("/");
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    setShowSearch((s) => !s);
  };

  return (
    <>
      <div className="flex col-2 justify-between">
        <div className="flex justify-start space-x-6 px-4 pl-6">
          {/* Profile */}
          <div>
            
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="navitem size-6 text-gray-100 cursor-pointer"
            onClick={handleProfileClick}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>

          {/* Home */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="navitem size-6 text-gray-100 cursor-pointer"
            onClick={handleHomeClick}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>

          {/* Search */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="navitem size-6 text-gray-100 cursor-pointer search-icon"
            onClick={handleSearchClick}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
        {/* Log-In & Sign-up or Logout Button */}
        <div className="flex space-x-4 m-2">
          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="hunter-button bg-red-600 p-2 text-[12px] hunterra rounded-xl cursor-pointer"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={LogInClickHandler}
              className="hunter-button bg-gray-600 p-2 text-[10px] hunterra rounded-xl cursor-pointer"
            >
              Login / SignUp
            </button>
          )}
        </div>
      </div>
      {/* Modern Apple-like Search Bar Dropdown */}
      {showSearch && (
        <div className="modern-search-bar fixed left-0 right-0 top-16 z-50 flex justify-center fade-in-search">
          <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-3 w-full max-w-lg mx-auto" style={{boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)'}}>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-lg text-gray-900 dark:text-gray-100 placeholder-gray-400"
              placeholder="Search... (coming soon)"
              autoFocus
            />
          </div>
        </div>
      )}
      <style jsx global>{`
        .fade-in-search {
          opacity: 0;
          animation: fadeInSearch 0.3s ease forwards;
        }
        @keyframes fadeInSearch {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
