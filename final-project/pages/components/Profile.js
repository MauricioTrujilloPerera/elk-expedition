import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

const SIDEBAR_OPTIONS = [
  { key: "profile", label: "Profile" },
  { key: "edit", label: "Edit Profile" },
  { key: "password", label: "Change Password" },
  { key: "messages", label: "Messages" },
  { key: "friends", label: "Friends" },
  { key: "notifications", label: "Notifications" },
  { key: "privacy", label: "Privacy" },
  { key: "activity", label: "Activity" },
  { key: "myhunts", label: "My Hunts" },
  { key: "help", label: "Help" },
  { key: "logout", label: "Log Out" },
];

// Mock friends data
const MOCK_FRIENDS = [
  { id: 1, username: "hunterjoe", profilePic: "/elkexpeditionlogo.png", online: true, province: "Alberta" },
  { id: 2, username: "wildsarah", profilePic: "/elkexpeditionlogo.png", online: false, province: "Ontario" },
  { id: 3, username: "mooseman", profilePic: "/elkexpeditionlogo.png", online: true, province: "Quebec" },
  { id: 4, username: "canadaduck", profilePic: "/elkexpeditionlogo.png", online: false, province: "Manitoba" },
  { id: 5, username: "bearmaster", profilePic: "/elkexpeditionlogo.png", online: true, province: "British Columbia" },
];

// Mock data for messages
const MOCK_CONVERSATIONS = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "See you at the hunt!",
    time: "2:15 PM",
    messages: [
      { fromMe: false, text: "Hey! Ready for the trip?", time: "2:10 PM" },
      { fromMe: true, text: "Absolutely! Can't wait.", time: "2:12 PM" },
      { fromMe: false, text: "See you at the hunt!", time: "2:15 PM" },
    ],
  },
  {
    id: "2",
    name: "Sarah Thompson",
    lastMessage: "Thanks for the info!",
    time: "Yesterday",
    messages: [
      { fromMe: true, text: "Let me know if you have any questions.", time: "Yesterday" },
      { fromMe: false, text: "Thanks for the info!", time: "Yesterday" },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  // Edit form state
  const [editData, setEditData] = useState({ username: "", email: "", phone: "", province: "" });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState(true);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [myHunts, setMyHunts] = useState([]);
  const [huntsLoading, setHuntsLoading] = useState(false);
  const [huntsError, setHuntsError] = useState("");
  const [selectedHunt, setSelectedHunt] = useState(null);
  const [huntUser, setHuntUser] = useState(null);
  const [huntUserLoading, setHuntUserLoading] = useState(false);
  const [huntUserError, setHuntUserError] = useState("");
  const [enrolledHunts, setEnrolledHunts] = useState([]);
  const [enrolledHuntsLoading, setEnrolledHuntsLoading] = useState(false);
  const [enrolledHuntsError, setEnrolledHuntsError] = useState("");
  const [enrolledUsers, setEnrolledUsers] = useState({});
  // Messaging state (for Messages tab)
  const [selectedConvId, setSelectedConvId] = useState(MOCK_CONVERSATIONS[0].id);
  const [showNew, setShowNew] = useState(false);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [responding, setResponding] = useState({});
  const [huntInfoMap, setHuntInfoMap] = useState({});
  const [requesterInfoMap, setRequesterInfoMap] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState({});
  // Live user search
  useEffect(() => {
    if (activeTab === "friends" && userSearch.length > 0) {
      setUserSearchLoading(true);
      const currentUserId = user?.id || user?._id || "";
      fetch(`http://localhost:8000/auth/user-search?q=${encodeURIComponent(userSearch)}&currentUserId=${encodeURIComponent(currentUserId)}`)
        .then(res => res.json())
        .then(data => {
          setUserSearchResults(data.users || []);
          setUserSearchLoading(false);
        });
    } else {
      setUserSearchResults([]);
    }
  }, [userSearch, activeTab]);

  // Fetch user info for modal
  const fetchHuntUser = async (userId) => {
    setHuntUser(null);
    setHuntUserLoading(true);
    setHuntUserError("");
    try {
      const res = await fetch(`http://localhost:8000/auth/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setHuntUser(data.user || null);
      } else {
        setHuntUserError("Failed to load user info.");
      }
    } catch {
      setHuntUserError("Failed to load user info.");
    } finally {
      setHuntUserLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("elkexpedition_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setEditData({
          username: parsed.username || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          province: parsed.province || "",
        });
        setProfilePicPreview(parsed.profilePic || null);
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === "myhunts" && user?.id) {
      setHuntsLoading(true);
      setHuntsError("");
      fetch(`http://localhost:8000/products/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setMyHunts(Array.isArray(data) ? data : []);
          setHuntsLoading(false);
        })
        .catch(() => {
          setHuntsError("Failed to load your hunts.");
          setHuntsLoading(false);
        });
    }
  }, [activeTab, user]);

  // Fetch enrolled users for each hunt in myHunts
  useEffect(() => {
    if (activeTab === "myhunts" && myHunts.length > 0) {
      myHunts.forEach(hunt => {
        fetch(`http://localhost:8000/auth/enrolled-users/${hunt._id}`)
          .then(res => res.json())
          .then(data => {
            setEnrolledUsers(prev => ({ ...prev, [hunt._id]: data.users || [] }));
          });
      });
    }
  }, [activeTab, myHunts]);

  // Fetch enrolled hunts for activity tab
  useEffect(() => {
    if (activeTab === "activity" && user?.id) {
      setEnrolledHuntsLoading(true);
      setEnrolledHuntsError("");
      fetch(`http://localhost:8000/auth/user/${user.id}`)
        .then(res => res.json())
        .then(async data => {
          const ids = data.user?.enrolledHunts || [];
          if (ids.length === 0) { setEnrolledHunts([]); setEnrolledHuntsLoading(false); return; }
          // Fetch all hunt details in parallel
          const hunts = await Promise.all(ids.map(id => fetch(`http://localhost:8000/products/all`).then(res => res.json()).then(all => all.find(h => h._id === id))));
          setEnrolledHunts(hunts.filter(Boolean));
          setEnrolledHuntsLoading(false);
        })
        .catch(() => { setEnrolledHuntsError("Failed to load enrolled hunts."); setEnrolledHuntsLoading(false); });
    }
  }, [activeTab, user]);

  // Fetch enrollment requests for host (current user)
  useEffect(() => {
    if (activeTab === "activity" && user?.id) {
      fetch(`http://localhost:8000/auth/enrollment-requests/${user.id}`)
        .then(res => res.json())
        .then(data => setEnrollmentRequests(data.requests || []));
    }
  }, [activeTab, user]);

  // Fetch hunt and requester info for each pending request
  useEffect(() => {
    if (activeTab === "activity" && enrollmentRequests.length > 0) {
      enrollmentRequests.forEach(req => {
        // Fetch hunt info if not already fetched
        if (req.status === 'pending' && !huntInfoMap[req.huntId]) {
          fetch(`http://localhost:8000/products/all`)
            .then(res => res.json())
            .then(all => {
              const hunt = all.find(h => h._id === req.huntId);
              if (hunt) setHuntInfoMap(prev => ({ ...prev, [req.huntId]: hunt }));
            });
        }
        // Fetch requester info if not already fetched
        if (req.status === 'pending' && !requesterInfoMap[req.requesterId]) {
          fetch(`http://localhost:8000/auth/user/${req.requesterId}`)
            .then(res => res.json())
            .then(data => {
              if (data.user) setRequesterInfoMap(prev => ({ ...prev, [req.requesterId]: data.user }));
            });
        }
      });
    }
  }, [activeTab, enrollmentRequests]);

  // Handle mock profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setProfilePicPreview(null);
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Mock save handler
  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSuccess("");
    setEditError("");
    setIsSaving(true);
    setShowCheckmark(false);
    try {
      const response = await fetch("http://localhost:8000/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          ...editData,
          profilePic: profilePicPreview || "",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("elkexpedition_user", JSON.stringify(data.user));
        setProfilePicPreview(data.user.profilePic || null);
        // Simulate progress and check mark
        setTimeout(() => {
          setIsSaving(false);
          setShowCheckmark(true);
          setEditSuccess("Profile updated successfully!");
          setTimeout(() => {
            setShowCheckmark(false);
            setEditSuccess("");
            setActiveTab("profile");
            router.push("/");
          }, 1500);
        }, 3000);
      } else {
        setIsSaving(false);
        setEditError(data.message || "Update failed");
      }
    } catch (err) {
      setIsSaving(false);
      setEditError("Network error. Please try again later.");
    }
  };

  // Change password mock handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    setPwLoading(true);
    const form = e.target;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      setPwLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          currentPassword,
          newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPwSuccess("Password changed successfully!");
        form.reset();
      } else {
        setPwError(data.message || "Password change failed");
      }
    } catch (err) {
      setPwError("Network error. Please try again later.");
    } finally {
      setPwLoading(false);
    }
  };

  // Log out handler
  const handleLogout = () => {
    localStorage.removeItem("elkexpedition_user");
    router.push("/");
    window.location.reload();
  };

  // Theme toggle
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Notifications toggle
  const handleNotificationsToggle = () => {
    setNotifications((n) => !n);
  };

  // Delete hunt handler
  const handleDeleteHunt = async (huntId) => {
    if (!window.confirm("Are you sure you want to delete this hunt?")) return;
    try {
      const res = await fetch(`http://localhost:8000/products/delete/${huntId}`, { method: "DELETE" });
      if (res.ok) {
        setMyHunts(myHunts.filter(h => h._id !== huntId));
      }
    } catch {}
  };

  // Sidebar content rendering
  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <div className="mb-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden mb-3 border-2 border-amber-400">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-semibold text-amber-400 hunterra mb-1 tracking-tight flex items-center gap-2">{user?.username} {user?.isAdmin && <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold ml-2">Admin</span>}</h3>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              {user?.createdAt && (
                <p className="text-gray-500 text-xs mt-1">Account created: {new Date(user.createdAt).toLocaleDateString()}</p>
              )}
            </div>
            <div className="w-full flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                <span className="font-medium text-orange-400 text-sm">Phone</span>
                <span className="text-cream text-sm">{user?.phone || <span className="text-gray-500">(not set)</span>}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                <span className="font-medium text-orange-400 text-sm">Province</span>
                <span className="text-cream text-sm">{user?.province || <span className="text-gray-500">(not set)</span>}</span>
              </div>
            </div>
          </div>
        );
      case "edit":
        return (
          <form onSubmit={handleEditSave} className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            {isSaving && (
              <div className="w-full flex flex-col items-center mb-4">
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden mb-2">
                  <div className="bg-amber-400 h-3 animate-pulse" style={{ width: '100%', animation: 'progressBar 3s linear' }} />
                </div>
                <span className="text-cream text-sm">Saving changes...</span>
                <style>{`@keyframes progressBar { from { width: 0; } to { width: 100%; } }`}</style>
              </div>
            )}
            {showCheckmark && (
              <div className="flex flex-col items-center mb-4">
                <div className="bg-green-600 rounded-full p-4 flex items-center justify-center animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="white" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-green-400 font-bold mt-2 text-sm">Profile updated!</span>
              </div>
            )}
            {editSuccess && !isSaving && !showCheckmark && (
              <div className="bg-green-700 text-white text-center rounded-md py-2 px-4 mb-4 w-full text-sm">
                {editSuccess}
              </div>
            )}
            {editError && (
              <div className="bg-red-700 text-white text-center rounded-md py-2 px-4 mb-4 w-full text-sm">
                {editError}
              </div>
            )}
            <div className="mb-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden mb-3 border-2 border-amber-400 relative">
                {profilePicPreview ? (
                  <img src={profilePicPreview} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
                <label className="absolute bottom-0 right-0 bg-amber-400 text-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-amber-500 transition" title="Upload profile picture">
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5M16 3.5V5m0 0a2 2 0 0 1 2 2v2.5M8 3.5V5m0 0a2 2 0 0 0-2 2v2.5" />
                  </svg>
                </label>
              </div>
            </div>
            <div className="w-full flex flex-col gap-4 mt-2">
              <div>
                <label className="block text-cream font-medium mb-1 text-sm">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded-lg bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-cream font-medium mb-1 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded-lg bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-cream font-medium mb-1 text-sm">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded-lg bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-cream font-medium mb-1 text-sm">Province</label>
                <input
                  type="text"
                  name="province"
                  value={editData.province}
                  onChange={handleEditChange}
                  className="w-full p-2 rounded-lg bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-8 bg-amber-400 hover:bg-amber-500 text-white py-2 px-10 rounded-md font-semibold text-base"
            >
              Save Changes
            </button>
          </form>
        );
      case "password":
        return (
          <form onSubmit={handlePasswordChange} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 tracking-tight">Change Password</h3>
            {pwSuccess && <div className="bg-green-700 text-white text-center rounded-md py-2 px-4 mb-4 w-full text-sm">{pwSuccess}</div>}
            {pwError && <div className="bg-red-700 text-white text-center rounded-md py-2 px-4 mb-4 w-full text-sm">{pwError}</div>}
            <input name="currentPassword" type="password" placeholder="Current Password" className="w-full p-2 mb-3 rounded-lg bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" required />
            <input name="newPassword" type="password" placeholder="New Password" className="w-full p-2 mb-3 rounded-lg bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" required />
            <input name="confirmPassword" type="password" placeholder="Confirm New Password" className="w-full p-2 mb-4 rounded-lg bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" required />
            <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-white py-2 px-8 rounded-md font-semibold text-base" disabled={pwLoading}>{pwLoading ? "Changing..." : "Change Password"}</button>
          </form>
        );
      case "messages":
        // Modern iMessage-like messaging UI
        const selectedConv = MOCK_CONVERSATIONS.find(c => c.id === selectedConvId);
        return (
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex h-[calc(100vh-4rem)] min-h-[500px] w-full overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <span className="text-lg font-bold text-amber-400">Messages</span>
                <button className="bg-amber-400 hover:bg-amber-500 text-white rounded-full px-3 py-1 font-bold shadow text-sm" onClick={() => setShowNew(true)}>New</button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {MOCK_CONVERSATIONS.map(conv => (
                  <div
                    key={conv.id}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-700 flex flex-col ${selectedConvId === conv.id ? "bg-gray-700" : "hover:bg-gray-700/60"}`}
                    onClick={() => setSelectedConvId(conv.id)}
                  >
                    <span className="font-semibold text-cream">{conv.name}</span>
                    <span className="text-gray-400 text-xs truncate">{conv.lastMessage}</span>
                    <span className="text-gray-500 text-xs self-end">{conv.time}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-900">
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                {selectedConv?.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm md:text-base ${msg.fromMe ? "self-end bg-amber-400 text-gray-900 rounded-br-sm" : "self-start bg-gray-700 text-cream rounded-bl-sm"}`}
                  >
                    {msg.text}
                    <span className="block text-xs text-gray-400 mt-1 text-right">{msg.time}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 p-4 border-t border-gray-800">
                <input
                  type="text"
                  className="flex-1 bg-gray-700 text-cream rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="iMessage..."
                  disabled
                />
                <button className="bg-amber-400 hover:bg-amber-500 text-white rounded-full px-4 py-2 font-bold shadow" disabled>
                  Send
                </button>
              </div>
            </div>
            {/* New Message Modal (placeholder) */}
            {showNew && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-gray-900 border-2 border-amber-400 rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in flex flex-col items-center">
                  <button className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow" onClick={() => setShowNew(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-amber-400 mb-4">New Message</h2>
                  <input
                    type="text"
                    className="w-full bg-gray-700 text-cream rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
                    placeholder="Search for a user... (mock)"
                    disabled
                  />
                  <div className="text-gray-400">User search and real chat coming soon!</div>
                </div>
              </div>
            )}
          </div>
        );
      case "friends":
        return (
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h3 className="text-xl font-semibold text-amber-400 hunterra mb-4 tracking-tight">Friends</h3>
            <div className="w-full flex flex-col gap-4 mb-6">
              <input
                type="text"
                className="w-full p-3 rounded-md bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg mb-2"
                placeholder="Search for users..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              {userSearchLoading && <div className="text-cream">Searching...</div>}
              {userSearchResults.length > 0 && (
                <div className="flex flex-col gap-2 bg-gray-800 rounded-xl p-4 border border-gray-700 shadow">
                  {userSearchResults.map(u => (
                    <div key={u._id} className="flex items-center gap-4">
                      <div className="relative">
                        {u.profilePic ? (
                          <img src={u.profilePic} alt={u.username} className="w-10 h-10 rounded-full object-cover border-2 border-amber-400" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-cream text-lg">{u.username}</div>
                        <div className="text-gray-400 text-sm">{u.email}</div>
                      </div>
                      <button
                        className="bg-amber-400 hover:bg-amber-500 text-white rounded-full px-4 py-2 font-bold shadow text-sm"
                        disabled={friendRequestStatus[u._id] === 'sent'}
                        onClick={() => {
                          setFriendRequestStatus(prev => ({ ...prev, [u._id]: 'loading' }));
                          setTimeout(() => {
                            setFriendRequestStatus(prev => ({ ...prev, [u._id]: 'sent' }));
                          }, 1000); // mock async
                        }}
                      >
                        {friendRequestStatus[u._id] === 'sent' ? 'Request Sent' : friendRequestStatus[u._id] === 'loading' ? 'Sending...' : 'Add Friend'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>s
            {/* (Optional) Show your current friends below */}
            <div className="w-full flex flex-col gap-4 mt-4">
              {MOCK_FRIENDS.map(friend => (
                <div key={friend.id} className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 border border-gray-700 shadow">
                  <div className="relative">
                    <img src={friend.profilePic} alt={friend.username} className="w-14 h-14 rounded-full object-cover border-2 border-amber-400" />
                    {friend.online && <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-cream text-lg">{friend.username}</div>
                    <div className="text-gray-400 text-sm">Province: {friend.province}</div>
                  </div>
                  <button className="bg-amber-400 hover:bg-amber-500 text-white rounded-full px-4 py-2 font-bold shadow text-sm" disabled>
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 tracking-tight">Notifications</h3>
            <div className="flex items-center gap-4">
              <span className="text-cream text-sm">Enable Notifications</span>
              <input type="checkbox" checked={notifications} onChange={handleNotificationsToggle} className="accent-amber-400 w-5 h-5" />
            </div>
            <p className="text-gray-400 text-xs mt-4">(Notifications toggle is a demo only)</p>
          </div>
        );
      case "privacy":
        return (
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 tracking-tight">Privacy</h3>
            <p className="text-cream text-sm mb-2">Manage your privacy settings:</p>
            <ul className="text-gray-400 text-xs list-disc pl-5 mb-4">
              <li>Download your data (coming soon)</li>
              <li>Delete your account (coming soon)</li>
              <li>Profile visibility (coming soon)</li>
            </ul>
            <p className="text-gray-500 text-xs">(Privacy controls are demo only)</p>
          </div>
        );
      case "activity":
        return (
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h3 className="text-xl font-semibold text-amber-400 hunterra mb-4 tracking-tight">Activity</h3>
            {/* Enrollment Requests Section */}
            <div className="w-full mb-8">
              <h4 className="text-lg text-amber-400 font-bold mb-2">Pending Enrollment Requests</h4>
              {enrollmentRequests.length === 0 && <div className="text-gray-400">No pending requests.</div>}
              <div className="flex flex-col gap-4 w-full">
                {enrollmentRequests.filter(r => r.status === 'pending').map((req, i) => {
                  const hunt = huntInfoMap[req.huntId];
                  const requester = requesterInfoMap[req.requesterId];
                  return (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 flex flex-col border-2 border-amber-400 shadow-lg relative">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-amber-400 font-bold">Hunt:</span>
                        {hunt ? (
                          <span className="text-white">{hunt.hunt_animalType} in {hunt.hunt_location} on {hunt.hunt_date ? new Date(hunt.hunt_date).toLocaleDateString() : '-'}</span>
                        ) : (
                          <span className="text-gray-400">Loading...</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-orange-400 font-semibold">Requester:</span>
                        {requester ? (
                          <span className="flex items-center gap-2">
                            {requester.profilePic && <img src={requester.profilePic} alt={requester.username} className="w-6 h-6 rounded-full" />}
                            <span className="text-white">{requester.username} <span className="text-xs text-gray-400">({requester.email})</span></span>
                          </span>
                        ) : (
                          <span className="text-gray-400">Loading...</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded font-bold"
                          disabled={responding[`${req.huntId}_${req.requesterId}`]}
                          onClick={async () => {
                            setResponding(prev => ({ ...prev, [`${req.huntId}_${req.requesterId}`]: true }));
                            await fetch(`http://localhost:8000/auth/enrollment-requests/${user.id}/respond`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ huntId: req.huntId, requesterId: req.requesterId, action: 'accept' })
                            });
                            setEnrollmentRequests(prev => prev.map(r => r.huntId === req.huntId && r.requesterId === req.requesterId ? { ...r, status: 'accepted' } : r));
                            setResponding(prev => ({ ...prev, [`${req.huntId}_${req.requesterId}`]: false }));
                          }}
                        >Accept</button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded font-bold"
                          disabled={responding[`${req.huntId}_${req.requesterId}`]}
                          onClick={async () => {
                            setResponding(prev => ({ ...prev, [`${req.huntId}_${req.requesterId}`]: true }));
                            await fetch(`http://localhost:8000/auth/enrollment-requests/${user.id}/respond`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ huntId: req.huntId, requesterId: req.requesterId, action: 'deny' })
                            });
                            setEnrollmentRequests(prev => prev.map(r => r.huntId === req.huntId && r.requesterId === req.requesterId ? { ...r, status: 'denied' } : r));
                            setResponding(prev => ({ ...prev, [`${req.huntId}_${req.requesterId}`]: false }));
                          }}
                        >Deny</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Enrolled & Upcoming Hunts Section (existing) */}
            <div className="w-full">
              <h4 className="text-lg text-amber-400 font-bold mb-2">Enrolled & Upcoming Hunts</h4>
              {enrolledHuntsLoading && <div className="text-cream">Loading...</div>}
              {enrolledHuntsError && <div className="bg-red-700 text-white text-center rounded-md py-2 px-4 mb-4 w-full text-sm">{enrolledHuntsError}</div>}
              {!enrolledHuntsLoading && !enrolledHuntsError && enrolledHunts.length === 0 && <div className="text-gray-400">No enrolled hunts found.</div>}
              <div className="flex flex-col gap-4 w-full">
                {enrolledHunts.map(hunt => {
                  const daysUntil = hunt.hunt_date ? Math.ceil((new Date(hunt.hunt_date) - new Date()) / (1000*60*60*24)) : null;
                  return (
                    <div key={hunt._id} className="bg-gray-800 rounded-xl p-4 flex flex-col border-2 border-amber-400 shadow-lg relative">
                      {hunt.hunt_displayImages && (
                        <img src={hunt.hunt_displayImages} alt="Hunt" className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-700" />
                      )}
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg text-amber-400 font-bold hunterra">{hunt.hunt_animalType} Hunt</span>
                          <span className="text-gray-400 text-xs">{hunt.hunt_date ? new Date(hunt.hunt_date).toLocaleDateString() : "-"}</span>
                        </div>
                        <span className="text-cream text-sm">Location: <span className="text-white">{hunt.hunt_location}</span></span>
                        <span className="text-cream text-sm">Price: <span className="text-white">${hunt.hunt_price}</span></span>
                        {hunt.maxGroupSize && <span className="text-cream text-sm">Max Group Size: <span className="text-white">{hunt.maxGroupSize}</span></span>}
                        {hunt.hunt_duration && <span className="text-cream text-sm">Duration: <span className="text-white">{hunt.hunt_duration} days</span></span>}
                        {hunt.hunt_packageType && <span className="text-cream text-sm">Package: <span className="text-white">{hunt.hunt_packageType}</span></span>}
                        {hunt.phone && <span className="text-cream text-sm">Contact: <span className="text-white">{hunt.phone}</span></span>}
                        {hunt.description && <span className="text-cream text-sm">Description: <span className="text-white">{hunt.description}</span></span>}
                      </div>
                      {hunt.hunt_tags && hunt.hunt_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {hunt.hunt_tags.map((tag, i) => (
                            <span key={i} className="bg-amber-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">{tag}</span>
                          ))}
                        </div>
                      )}
                      {daysUntil !== null && daysUntil >= 0 && (
                        <div className="mt-2 bg-amber-400 text-gray-900 rounded-full px-4 py-1 text-center font-bold text-sm shadow">
                          {daysUntil === 0 ? "Hunt is today!" : `${daysUntil} day${daysUntil === 1 ? "" : "s"} until hunt`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case "myhunts":
        return (
          <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-4 flex flex-col items-center mt-4">
            <h3 className="text-2xl font-semibold text-amber-400 hunterra mb-6 tracking-tight">My Active Hunts</h3>
            {huntsLoading && <div className="text-cream">Loading...</div>}
            {huntsError && <div className="bg-red-700 text-white text-center rounded-md py-2 px-4 mb-4 w-full text-sm">{huntsError}</div>}
            {!huntsLoading && !huntsError && myHunts.length === 0 && <div className="text-gray-400">No active hunts found.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {myHunts.map(hunt => (
                <div
                  key={hunt._id}
                  className="bg-gray-800 rounded-2xl p-5 flex flex-col border-2 border-amber-400 shadow-lg relative group transition-transform hover:scale-[1.025] mt-8 cursor-pointer"
                  onClick={() => {
                    setSelectedHunt(hunt);
                    fetchHuntUser(hunt.userId);
                  }}
                >
                  <button
                    className="absolute -top-5 -right-5 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow z-10"
                    title="Delete Hunt"
                    onClick={e => { e.stopPropagation(); handleDeleteHunt(hunt._id); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {hunt.hunt_displayImages && (
                    <img src={hunt.hunt_displayImages} alt="Hunt" className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-700" />
                  )}
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-amber-400 font-bold hunterra">{hunt.hunt_animalType} Hunt</span>
                      <span className="text-gray-400 text-xs">{hunt.hunt_date ? new Date(hunt.hunt_date).toLocaleDateString() : "-"}</span>
                    </div>
                    <span className="text-cream text-sm">Location: <span className="text-white">{hunt.hunt_location}</span></span>
                    <span className="text-cream text-sm">Price: <span className="text-white">${hunt.hunt_price}</span></span>
                    {hunt.maxGroupSize && <span className="text-cream text-sm">Max Group Size: <span className="text-white">{hunt.maxGroupSize}</span></span>}
                    {hunt.hunt_duration && <span className="text-cream text-sm">Duration: <span className="text-white">{hunt.hunt_duration} days</span></span>}
                    {hunt.hunt_packageType && <span className="text-cream text-sm">Package: <span className="text-white">{hunt.hunt_packageType}</span></span>}
                    {hunt.phone && <span className="text-cream text-sm">Contact: <span className="text-white">{hunt.phone}</span></span>}
                  </div>
                  {hunt.hunt_tags && hunt.hunt_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {hunt.hunt_tags.map((tag, i) => (
                        <span key={i} className="bg-amber-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Enrolled users display */}
                  {enrolledUsers[hunt._id] && enrolledUsers[hunt._id].length > 0 && (
                    <div className="mt-2">
                      <span className="font-semibold text-orange-400">Enrolled Users:</span>
                      <ul className="ml-2">
                        {enrolledUsers[hunt._id].map(user => (
                          <li key={user._id} className="flex items-center gap-2">
                            {user.profilePic && (
                              <img src={user.profilePic} alt={user.username} className="w-6 h-6 rounded-full" />
                            )}
                            <span className="text-white">{user.username} <span className="text-xs text-gray-400">({user.email})</span></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case "help":
        return (
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-amber-400 mb-4 tracking-tight">Help & Support</h3>
            <p className="text-cream text-sm mb-2">Need help? Check our FAQ or contact support.</p>
            <ul className="text-gray-400 text-xs list-disc pl-5 mb-4">
              <li>FAQ (coming soon)</li>
              <li>Contact support (coming soon)</li>
            </ul>
            <p className="text-gray-500 text-xs">(Help & support are demo only)</p>
          </div>
        );
      case "logout":
        handleLogout();
        return null;
      default:
        return null;
    }
  };

  {/* --------------------- || PROFILE BOXES AND SECTIONS || --------------------- */}
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r-2 border-gray-800 flex flex-col items-center py-12 px-2">
        <Image src="/elkexpeditionlogo.png" alt="Elk Expedition Logo" width={50} height={50} className="mb-8" />
        <h2 className="text-2xl font-bold mb-8 text-cream hunterra text-gray-200 tracking-tight">Account</h2>
        <nav className="flex flex-col gap-2 w-full">
          {SIDEBAR_OPTIONS.map(opt => (
            <button
              key={opt.key}
              className={`w-full h-10 text-center px-4 rounded-lg font-medium text-sm flex items-center justify-center ${
                opt.key === "logout" 
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800" 
                  : activeTab === opt.key 
                    ? "bg-gradient-to-r from-yellow-300 to-amber-600 text-white" 
                    : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 hover:from-blue-500/30 hover:to-purple-500/30 hover:text-white"
              }`}
              onClick={() => setActiveTab(opt.key)}
            >
              <span className="relative z-10 font-medium tracking-wide">{opt.label}</span>
            </button>
          ))}
        </nav>
        <button
          className="mt-12 bg-amber-400 hover:bg-amber-500 text-white py-2 px-6 rounded-md font-semibold w-full text-base"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        {renderContent()}
          {/* Hunt Details Modal */}
          {selectedHunt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-gray-900 border-2 border-amber-400 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
                <button
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow"
                  onClick={() => { setSelectedHunt(null); setHuntUser(null); }}
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-amber-400 mb-4 hunterra">{selectedHunt.hunt_animalType} Hunt</h2>
                {selectedHunt.hunt_displayImages && (
                  <img src={selectedHunt.hunt_displayImages} alt="Hunt" className="w-full h-48 object-cover rounded-xl mb-4 border border-gray-700" />
                )}
                <div className="text-cream text-sm mb-2">Location: <span className="text-white">{selectedHunt.hunt_location}</span></div>
                <div className="text-cream text-sm mb-2">Date: <span className="text-white">{selectedHunt.hunt_date ? new Date(selectedHunt.hunt_date).toLocaleDateString() : "-"}</span></div>
                <div className="text-cream text-sm mb-2">Price: <span className="text-white">${selectedHunt.hunt_price}</span></div>
                {selectedHunt.maxGroupSize && <div className="text-cream text-sm mb-2">Max Group Size: <span className="text-white">{selectedHunt.maxGroupSize}</span></div>}
                {selectedHunt.hunt_duration && <div className="text-cream text-sm mb-2">Duration: <span className="text-white">{selectedHunt.hunt_duration} days</span></div>}
                {selectedHunt.hunt_packageType && <div className="text-cream text-sm mb-2">Package: <span className="text-white">{selectedHunt.hunt_packageType}</span></div>}
                {selectedHunt.phone && <div className="text-cream text-sm mb-2">Contact: <span className="text-white">{selectedHunt.phone}</span></div>}
                {selectedHunt.hunt_tags && selectedHunt.hunt_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedHunt.hunt_tags.map((tag, i) => (
                      <span key={i} className="bg-amber-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="text-cream text-sm mb-2">Posted: <span className="text-white">{selectedHunt.createdAt ? new Date(selectedHunt.createdAt).toLocaleString() : "-"}</span></div>
                <div className="text-cream text-sm mb-2">Posted by: <span className="text-white">{huntUserLoading ? "Loading..." : huntUserError ? "Unknown" : huntUser?.username || "Unknown"}</span></div>
                <div className="text-cream text-xs mt-2">Hunt ID: <span className="text-gray-500">{selectedHunt._id}</span></div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
} 