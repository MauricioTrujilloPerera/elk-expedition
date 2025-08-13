import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function UserBadge() {
  const [username, setUsername] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [showHuntNotif, setShowHuntNotif] = useState(false);
  const [soonestHuntDate, setSoonestHuntDate] = useState(null);
  const [userNotifications, setUserNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");
  const router = useRouter();

  // Check for enrolled hunts within 7 days
  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem("elkexpedition_user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setUsername(userObj.username || "");
          setUser(userObj);
        } catch {
          setUsername("");
          setUser(null);
        }
      } else {
        setUsername("");
        setUser(null);
      }
    };
    updateUser();
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  // Fetch enrolled hunts and check for soon hunt
  useEffect(() => {
    if (!user?.id) return;
    // Only show notification if not dismissed for this login
    const notifDismissed = localStorage.getItem("elkexpedition_hunt_notif_dismissed");
    if (notifDismissed === user.id) return;
    fetch(`http://localhost:8000/auth/user/${user.id}`)
      .then(res => res.json())
      .then(async data => {
        const ids = data.user?.enrolledHunts || [];
        if (ids.length === 0) return;
        // Fetch all hunt details in parallel
        const hunts = await Promise.all(ids.map(id => fetch(`http://localhost:8000/products/all`).then(res => res.json()).then(all => all.find(h => h._id === id))));
        const now = new Date();
        let soonest = null;
        for (const hunt of hunts) {
          if (!hunt?.hunt_date) continue;
          const huntDate = new Date(hunt.hunt_date);
          const diff = (huntDate - now) / (1000 * 60 * 60 * 24);
          if (diff >= 0 && diff <= 7) {
            if (!soonest || huntDate < soonest) soonest = huntDate;
          }
        }
        if (soonest) {
          setSoonestHuntDate(soonest);
          setShowHuntNotif(true);
        }
      });
  }, [user?.id]);

  // Fetch notifications on login
  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:8000/auth/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const notifs = data.user?.notifications || [];
          setUserNotifications(notifs);
          // Only show if there are unread notifications and not dismissed this login
          const unread = notifs.find(n => !n.read);
          if (unread && !sessionStorage.getItem("elkexpedition_notif_shown")) {
            setShowNotif(true);
            setNotifMsg(unread.message);
          }
        });
    }
  }, [user?.id]);

  if (!username) return null;

  const profilePic = user?.profilePic;

  // Handler for notification click
  const handleNotifClick = (e) => {
    e.stopPropagation();
    setShowHuntNotif(false);
    if (user?.id) {
      localStorage.setItem("elkexpedition_hunt_notif_dismissed", user.id);
    }
    // Go to Profile page, open 'activity' tab
    router.push({
      pathname: "/components/Profile",
      query: { tab: "activity" },
    });
  };

  // Handler for notification click
  const handleUserNotifClick = async (e) => {
    e.stopPropagation();
    setShowNotif(false);
    sessionStorage.setItem("elkexpedition_notif_shown", "1");
    // Mark all as read in backend
    if (user?.id) {
      await fetch(`http://localhost:8000/auth/user/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markNotificationsRead: true })
      });
    }
  };

  return (
    <>
      {/* Notification badge above user badge */}
      {showHuntNotif && (
        <div
          className="fixed z-[101] right-6 bottom-24 flex items-center gap-2 bg-amber-400 text-gray-900 px-4 py-2 rounded-full shadow-lg font-semibold cursor-pointer animate-bounce border-2 border-amber-500"
          onClick={handleNotifClick}
          style={{ minWidth: 220 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-2.25A2.25 2.25 0 0 0 11.25 16.5h-3A2.25 2.25 0 0 1 6 14.25v-5.586a2.25 2.25 0 0 1 .659-1.591l5.25-5.25a2.25 2.25 0 0 1 3.182 0l5.25 5.25A2.25 2.25 0 0 1 21 8.664V14.25A2.25 2.25 0 0 1 18.75 16.5h-3A2.25 2.25 0 0 0 13.5 18.75V21" />
          </svg>
          You have a hunt coming up soon!
        </div>
      )}
      {/* User notification badge above user badge */}
      {showNotif && notifMsg && (
        <div
          className="fixed z-[101] right-6 bottom-32 flex items-center gap-2 bg-green-400 text-gray-900 px-4 py-2 rounded-full shadow-lg font-semibold cursor-pointer animate-bounce border-2 border-green-500"
          onClick={handleUserNotifClick}
          style={{ minWidth: 220 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-2.25A2.25 2.25 0 0 0 11.25 16.5h-3A2.25 2.25 0 0 1 6 14.25v-5.586a2.25 2.25 0 0 1 .659-1.591l5.25-5.25a2.25 2.25 0 0 1 3.182 0l5.25 5.25A2.25 2.25 0 0 1 21 8.664V14.25A2.25 2.25 0 0 1 18.75 16.5h-3A2.25 2.25 0 0 0 13.5 18.75V21" />
          </svg>
          {notifMsg}
        </div>
      )}
      <div
        className="fixed z-[100] flex items-center bg-gray-900 border-2 border-amber-400 rounded-2xl shadow-xl px-5 py-3 gap-4 backdrop-blur-md cursor-pointer bottom-6 right-6 min-w-[220px] hover:scale-105 transition-all duration-500"
        onClick={() => setShowMenu((v) => !v)}
        title="Profile Menu"
      >
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-amber-400">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="object-cover w-full h-full" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-cream hunterra tracking-tight flex items-center gap-2">{username} {user?.isAdmin && <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold ml-2">Admin</span>}</h3>
        </div>
        {/* Menu dropdown */}
        {showMenu && (
          <div className="absolute bottom-20 right-0 bg-gray-900 border-2 border-amber-400 rounded-xl shadow-xl py-2 px-4 min-w-[180px] flex flex-col gap-2 animate-fade-in z-[101]">
            <button
              className="text-left text-cream hover:text-amber-400 font-medium py-1 px-2 rounded transition"
              onClick={e => {
                e.stopPropagation();
                setShowMenu(false);
                router.push("/components/Profile");
              }}
            >
              View Profile
            </button>
            <button
              className="text-left text-cream hover:text-amber-400 font-medium py-1 px-2 rounded transition"
              onClick={e => {
                e.stopPropagation();
                setShowMenu(false);
                router.push("/");
              }}
            >
              Go Home
            </button>
            <button
              className="text-left text-red-400 hover:text-red-600 font-medium py-1 px-2 rounded transition"
              onClick={e => {
                e.stopPropagation();
                setShowMenu(false);
                localStorage.removeItem("elkexpedition_user");
                window.location.reload();
              }}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
      {/* Click outside to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-[99]" onClick={() => setShowMenu(false)} />
      )}
    </>
  );
} 