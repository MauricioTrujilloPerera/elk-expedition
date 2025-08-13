import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import Navbar from "./Navbar";
import Image from 'next/image';
import MainHomepageInfo from "./HomeInfo";
// import FeaturedPage from "./Featured";
import UserBadge from "./UserBadge";

// Helper: generate placeholder hunts
function getPlaceholderHunts(count) {
  const animals = ["Elk", "Moose", "Whitetail Deer", "Black Bear", "Bighorn Sheep", "Duck", "Goose", "Wolf", "Caribou", "Cougar"];
  const locations = ["Alberta", "British Columbia", "Saskatchewan", "Manitoba", "Ontario", "Quebec", "Yukon", "Nunavut", "Newfoundland", "Nova Scotia"];
  const users = ["hunterjoe", "wildsarah", "elkpro", "mooseman", "canadaduck", "bearmaster", "sheepguide", "arcticwolf", "caribouking", "cougarqueen"];
  const tags = [["archery", "trophy"], ["guided"], ["family", "youth"], ["all-inclusive"], ["remote"], ["adventure"], ["classic"], ["premium"], ["budget"], ["exclusive"]];
  const today = new Date();
  return Array.from({ length: count }, (_, i) => ({
    _id: `placeholder-${i}`,
    hunt_animalType: animals[i % animals.length],
    hunt_location: locations[i % locations.length],
    hunt_date: new Date(today.getTime() + (i+1)*86400000).toISOString(),
    hunt_price: 200 + i * 50,
    hunt_displayImages: "https://source.unsplash.com/400x200/?hunting,animal," + animals[i % animals.length],
    maxGroupSize: 1 + (i % 5),
    hunt_tags: tags[i % tags.length],
    user: users[i % users.length],
  }));
}

// Helper: get days ago string
function getDaysAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  let diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff < 0) diff = 0;
  if (diff === 0) return "Posted today";
  if (diff === 1) return "Posted 1 day ago";
  return `Posted ${diff} days ago`;
}

async function fetchUsernamesForHunts(hunts) {
  const results = await Promise.all(hunts.map(async (hunt) => {
    if (hunt.userId && !hunt._id?.startsWith("placeholder")) {
      try {
        const res = await fetch(`http://localhost:8000/auth/user/${hunt.userId}`);
        if (res.ok) {
          const data = await res.json();
          return { ...hunt, user: data.user?.username || "Unknown" };
        }
      } catch {}
    }
    return hunt;
  }));
  return results;
}

export default function HomePage() {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [username, setUsername] = useState("");
    const [recentHunts, setRecentHunts] = useState([]);
    const [huntsLoading, setHuntsLoading] = useState(false);
    const [huntsError, setHuntsError] = useState("");

    // Helper to update username from localStorage
    const updateUsername = () => {
        const storedUser = localStorage.getItem("elkexpedition_user");
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setUsername(userObj.username || "");
            } catch {
                setUsername("");
            }
        } else {
            setUsername("");
        }
    };

    useEffect(() => {
        updateUsername();
        const timer = setTimeout(() => { 
            setVisible(true);
        }, 100)
        // Listen for storage changes (e.g., logout in another tab)
        window.addEventListener("storage", updateUsername);
        // Listen for route changes (e.g., after logout)
        const handleRouteChange = () => updateUsername();
        router.events?.on("routeChangeComplete", handleRouteChange);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("storage", updateUsername);
            router.events?.off("routeChangeComplete", handleRouteChange);
        };
    }, [router]);
    
    useEffect(() => {
        setHuntsLoading(true);
        fetch("http://localhost:8000/products/all")
            .then(res => res.json())
            .then(async data => {
                let hunts = Array.isArray(data) ? data.reverse().slice(0, 10) : [];
                if (hunts.length < 10) {
                  hunts = hunts.concat(getPlaceholderHunts(10 - hunts.length));
                }
                // Fetch usernames for real hunts
                const huntsWithUsernames = await fetchUsernamesForHunts(hunts);
                setRecentHunts(huntsWithUsernames);
                setHuntsLoading(false);
            })
            .catch(() => { setHuntsError("Failed to load recent hunts."); setHuntsLoading(false); });
    }, []);
    
    const BookingClickHandler = (event) => {
        event.preventDefault();
        router.push('/components/HuntBookings');
    }
    
    return (
        <>
        <div>
            <UserBadge />
            <div className="flex justify-center">
                <div className="m-3 p-3 w-[1500px] h-[1000px] bg-cover bg-center rounded-x;" style={{ backgroundImage: "url('/gray-mountains.png')" }}>
                    <Navbar />
                    <div className={`website-logo flex justify-center flex-col transition-opacity duration-[3500ms] ${visible ? "opacity-100" : "opacity-0"}`} >
                        <div className="flex justify-center">
                            <Image src="/elkexpeditionlogo.png" alt="Elk Expedition Logo" className="website-logo" width={200} height={200}/>
                        </div>
                        <div className="flex flex-col text-center">
                            <p className="hunterra text-[5lvh] md:text-[10lvh]">Elk Expedition</p>
                            <p className="hunterra text-[2.5lvh] md:text-[5lvh] text-orange-400">Book your Hunt Today</p>
                        </div>
                    </div>
                    <div className="flex justify-center m-5">
                        <button 
                            className="hunter-button bg-gray-600 p-2 text-2xl hunterra rounded-xl cursor-pointer"
                            onClick={BookingClickHandler}
                        >Book Hunt
                        </button>
                    </div>
                </div>
            </div>
            {/* Extra Home Info */}
            <div>
                <div className="flex justify-center p-2 m-2">
                    <p className='hunterra text-2xl flex-col'>How it Works?</p>
                </div>
                <MainHomepageInfo />
            </div>

            {/* Recent Hunts */}
            <div>
                <div className="flex justify-center p-2 m-2">
                    <p className='hunterra text-2xl flex-col'>Recently Added Hunts</p>
                </div>
                {huntsLoading && <div className="text-cream text-center">Loading...</div>}
                {huntsError && <div className="bg-red-700 text-white text-center rounded-md py-2 px-4 mb-4 w-full text-sm">{huntsError}</div>}
                <div className="overflow-x-auto w-full">
                  <div className="flex gap-6 w-fit min-w-full pb-4 px-2" style={{scrollbarWidth: 'thin'}}>
                    {recentHunts.map(hunt => (
                      <div key={hunt._id} className="bg-gray-900 border-2 border-amber-400 rounded-2xl shadow-lg p-5 w-[320px] flex-shrink-0 flex flex-col items-center">
                        {hunt.hunt_displayImages && (
                          <img src={hunt.hunt_displayImages} alt="Hunt" className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-700" />
                        )}
                        <div className="text-lg text-amber-400 font-bold hunterra mb-1">{hunt.hunt_animalType} Hunt</div>
                        <div className="text-cream text-sm mb-1">Location: <span className="text-white">{hunt.hunt_location}</span></div>
                        <div className="text-cream text-sm mb-1">Date: <span className="text-white">{hunt.hunt_date ? new Date(hunt.hunt_date).toLocaleDateString() : "-"}</span></div>
                        <div className="text-cream text-sm mb-1">Price: <span className="text-white">${hunt.hunt_price}</span></div>
                        {hunt.maxGroupSize && <div className="text-cream text-sm mb-1">Max Group Size: <span className="text-white">{hunt.maxGroupSize}</span></div>}
                        {hunt.hunt_tags && hunt.hunt_tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {hunt.hunt_tags.map((tag, i) => (
                              <span key={i} className="bg-amber-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-col items-center w-full mt-2">
                          <span className="text-xs text-gray-500">
                            by {hunt.user ? hunt.user : hunt._id?.startsWith('placeholder') ? hunt.user : 'Unknown'}
                          </span>
                          <span className="text-xs text-amber-400 font-semibold mt-1">{getDaysAgo(hunt.hunt_date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
            {/* Basic Information Section */}
            <div className="flex justify-center mt-10 mb-8">
              <div className="bg-gray-900 border-2 border-amber-400 rounded-2xl shadow-xl p-8 max-w-2xl w-full flex flex-col items-center">
                <h2 className="text-2xl font-bold text-amber-400 hunterra mb-4 tracking-tight">About Elk Expedition</h2>
                <div className="w-full flex flex-col gap-6 text-cream text-lg">
                  <section>
                    <h3 className="text-xl font-bold text-orange-400 mb-2">Our Goal</h3>
                    <p>
                      Elk Expedition was created to make it easy for hunters to find, book, and host unforgettable hunting adventures across Canada. We believe in building a trusted community where everyone can share their passion for the outdoors, connect with like-minded people, and experience the thrill of the hunt in a safe and organized way.
                    </p>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold text-orange-400 mb-2">My Story</h3>
                    <p>
                      Hi, I’m Mauricio, the founder of Elk Expedition. As a lifelong hunter and outdoor enthusiast, I saw how hard it was to discover quality hunts, meet reliable guides, or even just find a group to join. I built this platform to bring the hunting community together, make planning trips easier, and help everyone—from beginners to seasoned pros—enjoy the wild the way it’s meant to be.
                    </p>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold text-orange-400 mb-2">How It Works</h3>
                    <p>
                      Browse upcoming hunts, request to join, or host your own. Every hunt is reviewed by the community, and you can message hosts, manage your bookings, and get notified about new opportunities. When you book a hunt, a small 1% platform commission is included in the price—so if a hunt is $500, the host receives $495 and the platform receives $5. Whether you’re looking for your next big adventure or want to share your expertise, Elk Expedition is your home base for all things hunting.
                    </p>
                  </section>
                </div>
              </div>
            </div>
        </div>
        </>
    )
}