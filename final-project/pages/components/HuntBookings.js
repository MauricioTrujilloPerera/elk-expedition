import Navbar from "./Navbar";
import AnimalFilterTags, { ANIMALS } from "./AnimalFilterTags";
import { useEffect, useState } from "react";
import UserBadge from "./UserBadge";
import { useRouter } from 'next/router';

export default function BookingsPage() {
  const [username, setUsername] = useState("");
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedGroupSize, setSelectedGroupSize] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState("");
  const router = useRouter();
  const [hostError, setHostError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedHunt, setSelectedHunt] = useState(null);
  const [enrollStatus, setEnrollStatus] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrolledCounts, setEnrolledCounts] = useState({});
  const [requestStatus, setRequestStatus] = useState({});

  // Combine all filters into a single array of tag objects
  const filterTags = [
    ...selectedAnimals.map(a => ({ type: "animal", value: a })),
    selectedDate ? { type: "date", value: selectedDate } : null,
    selectedLocation ? { type: "location", value: selectedLocation } : null,
    selectedGroupSize ? { type: "group", value: selectedGroupSize } : null,
    selectedWeapon ? { type: "weapon", value: selectedWeapon } : null,
  ].filter(Boolean);

  // Remove tag handler
  const handleRemoveTag = (tag) => {
    if (tag.type === "animal") setSelectedAnimals(selectedAnimals.filter(a => a !== tag.value));
    if (tag.type === "date") setSelectedDate("");
    if (tag.type === "location") setSelectedLocation("");
    if (tag.type === "group") setSelectedGroupSize("");
    if (tag.type === "weapon") setSelectedWeapon("");
  };

  useEffect(() => {
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
    updateUsername();
    window.addEventListener("storage", updateUsername);
    return () => window.removeEventListener("storage", updateUsername);
  }, []);

  // After searchResults are set, fetch enrolled counts for each hunt
  useEffect(() => {
    if (searchResults.length > 0) {
      searchResults.forEach(hunt => {
        fetch(`http://localhost:8000/auth/enrolled-count/${hunt._id}`)
          .then(res => res.json())
          .then(data => {
            setEnrolledCounts(prev => ({ ...prev, [hunt._id]: data.count || 0 }));
          });
      });
    }
  }, [searchResults]);

  // Helper to get current user id
  const getCurrentUserId = () => {
    try {
      const storedUser = localStorage.getItem("elkexpedition_user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        return userObj.id;
      }
    } catch {}
    return null;
  };
  const currentUserId = getCurrentUserId();

  return (
    <div className="m-4">
      <Navbar />
      <UserBadge />
      <div className="m-3 p2 flex justify-center text-2xl">
        <p className="hunterra">Find, Book and Post a Hunt</p>
      </div>
      <div className="flex justify-center">
        <div className="rounded-2xl bg-amber-400 w-[75%] h-[1lvh]"></div>
      </div>
      {/* Booking form below the title and underline */}
      <div className="flex justify-center mt-8">
        <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl max-w-2xl w-full flex flex-col px-8 py-8 shadow-lg gap-4 items-center">
          <form className="w-full flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream bg-gray-800"
            />
            <input
              type="text"
              placeholder="Location"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream bg-gray-800"
            />
            <select
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream bg-gray-800 appearance-none"
              value={selectedGroupSize}
              onChange={e => setSelectedGroupSize(e.target.value)}
            >
              <option value="">Group Size</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5+</option>
            </select>
            <select
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream bg-gray-800 appearance-none"
              value={selectedWeapon}
              onChange={e => setSelectedWeapon(e.target.value)}
            >
              <option value="">Weapon Type</option>
              <option value="rifle">Rifle</option>
              <option value="bow">Bow</option>
              <option value="crossbow">Crossbow</option>
              <option value="muzzleloader">Muzzleloader</option>
              <option value="shotgun">Shotgun</option>
              <option value="other">Other</option>
            </select>
            <select
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream bg-gray-800 appearance-none"
              value=""
              onChange={e => {
                const val = e.target.value;
                if (val && !selectedAnimals.includes(val)) {
                  setSelectedAnimals([...selectedAnimals, val]);
                }
              }}
            >
              <option value="">Select Animal</option>
              {ANIMALS.map(animal => (
                <option key={animal.value} value={animal.value}>{animal.label}</option>
              ))}
            </select>
            <AnimalFilterTags
              selected={filterTags.map(tag => tag.value)}
              onRemove={val => {
                const tag = filterTags.find(t => t.value === val);
                if (tag) handleRemoveTag(tag);
              }}
            />
            <button
              type="button"
              className="bg-amber-400 hover:bg-amber-500 text-white py-2 px-6 rounded-md font-semibold"
              onClick={async () => {
                setSearching(true);
                setSearchError("");
                try {
                  const res = await fetch("http://localhost:8000/products/all");
                  const hunts = await res.json();
                  // Filter hunts by selected criteria
                  const filtered = hunts.filter(hunt => {
                    if (selectedDate && new Date(hunt.hunt_date).toISOString().slice(0,10) !== selectedDate) return false;
                    if (selectedLocation && !hunt.hunt_location.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
                    if (selectedAnimals.length > 0 && !selectedAnimals.includes(hunt.hunt_animalType)) return false;
                    if (selectedGroupSize && String(hunt.maxGroupSize) !== String(selectedGroupSize) && selectedGroupSize !== "5+") return false;
                    if (selectedWeapon && (!hunt.hunt_tags || !hunt.hunt_tags.some(tag => tag.toLowerCase().includes(selectedWeapon.toLowerCase())))) return false;
                    return true;
                  });
                  setSearchResults(filtered);
                } catch {
                  setSearchError("Failed to search hunts.");
                } finally {
                  setSearching(false);
                }
              }}
            >
              {searching ? "Searching..." : "Search for Hunts Near Me"}
            </button>
          </form>
          {/* Magnifying glass SVG with figure-8 animation */}
          <div className="flex justify-center mt-4 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-amber-400 animate-figure8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          {/* Search Results */}
          <div className="w-full mt-8">
            {searchError && <div className="bg-red-700 text-white text-center rounded-md py-2 px-4 mb-4 w-full text-sm">{searchError}</div>}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map(hunt => (
                  <div
                    key={hunt._id}
                    className="bg-gray-800 rounded-2xl p-5 flex flex-col border-2 border-amber-400 shadow-lg relative group transition-transform hover:scale-[1.025] mt-8 cursor-pointer"
                    onClick={() => setSelectedHunt(hunt)}
                  >
                    {hunt.hunt_displayImages && (
                      <img src={hunt.hunt_displayImages} alt="Hunt" className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-700" />
                    )}
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg text-amber-400 font-bold hunterra">{hunt.hunt_animalType} Hunt</span>
                        <span className="text-gray-400 text-xs">{hunt.hunt_date ? new Date(hunt.hunt_date).toLocaleDateString() : "-"}</span>
                      </div>
                      <span className="text-cream text-sm">Location: <span className="text-white">{hunt.hunt_location}</span></span>
                      <span className="text-cream text-sm">Price (per day): <span className="text-white">${hunt.hunt_price}</span></span>
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
                    {/* Enrolled count display */}
                    {(() => {
                      const enrolled = Number(enrolledCounts[hunt._id] || 0);
                      const max = Number(hunt.maxGroupSize || 0);
                      const isFull = hunt.maxGroupSize && enrolled >= max;
                      return (
                        <>
                          <div className="mt-1 text-sm text-orange-400 font-semibold">
                            Enrolled: <span className="text-white">{enrolled}</span>
                            {hunt.maxGroupSize && (
                              <span className="text-white"> / {max}</span>
                            )}
                          </div>
                          {isFull && (
                            <div className="mt-1 text-sm font-bold text-red-500">Full / Unavailable</div>
                          )}
                        </>
                      );
                    })()}
                    {/* Book Now button */}
                    {(() => {
                      const enrolled = Number(enrolledCounts[hunt._id] || 0);
                      const max = Number(hunt.maxGroupSize || 0);
                      const isFull = hunt.maxGroupSize && enrolled >= max;
                      return (
                        <button
                          onClick={async () => {
                            if (!username) {
                              setHostError('You must be logged in to book a hunt.');
                              return;
                            }
                            setHostError("");
                            setRequestStatus(prev => ({ ...prev, [hunt._id]: 'loading' }));
                            try {
                              const res = await fetch('http://localhost:8000/auth/enroll-hunt', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: username, huntId: hunt._id })
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setRequestStatus(prev => ({ ...prev, [hunt._id]: 'pending' }));
                              } else {
                                setRequestStatus(prev => ({ ...prev, [hunt._id]: data.message || 'error' }));
                              }
                            } catch {
                              setRequestStatus(prev => ({ ...prev, [hunt._id]: 'error' }));
                            }
                          }}
                          disabled={
                            !username ||
                            isFull ||
                            requestStatus[hunt._id] === 'pending' ||
                            requestStatus[hunt._id] === 'loading' ||
                            (currentUserId && hunt.userId === currentUserId)
                          }
                          className={
                            hunt.userId === currentUserId ? '' :
                            requestStatus[hunt._id] === 'pending' ? 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed' :
                            requestStatus[hunt._id] === 'loading' ? 'bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed' :
                            'bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
                          }
                        >
                          {hunt.userId === currentUserId ? 'You are the host' : requestStatus[hunt._id] === 'pending' ? 'Request Sent' : requestStatus[hunt._id] === 'loading' ? 'Sending...' : 'Book Now'}
                        </button>
                      );
                    })()}
                    {/* Show error or info message if needed */}
                    {hunt.userId === currentUserId && (
                      <div className="mt-1 text-xs text-red-400 font-semibold">You cannot enroll in your own hunt.</div>
                    )}
                    {requestStatus[hunt._id] && requestStatus[hunt._id] !== 'pending' && requestStatus[hunt._id] !== 'loading' && requestStatus[hunt._id] !== undefined && requestStatus[hunt._id] !== null && requestStatus[hunt._id] !== '' && requestStatus[hunt._id] !== 'Book Now' && (
                      <div className={`mt-1 text-xs font-semibold ${requestStatus[hunt._id] === 'Request Sent' ? 'text-green-500' : 'text-red-400'}`}>{requestStatus[hunt._id]}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {searchResults.length === 0 && !searching && (
              <div className="text-gray-400 text-center">No hunts found. Try adjusting your filters.</div>
            )}
          </div>
          
          {/* Hunt Details Modal */}
          {selectedHunt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-gray-900 border-2 border-amber-400 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
                <button
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow"
                  onClick={() => setSelectedHunt(null)}
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
                <div className="text-cream text-sm mb-2">Price (per day): <span className="text-white">${selectedHunt.hunt_price}</span></div>
                {selectedHunt.hunt_price && (
                  <div className="text-sm text-gray-400 mb-2">
                    Platform fee (1%): <span className="text-orange-400 font-bold">${(Number(selectedHunt.hunt_price) * 0.01).toFixed(2)}</span><br/>
                    Host receives: <span className="text-green-400 font-bold">${(Number(selectedHunt.hunt_price) * 0.99).toFixed(2)}</span>
                  </div>
                )}
                {selectedHunt.maxGroupSize && <div className="text-cream text-sm mb-2">Max Group Size: <span className="text-white">{selectedHunt.maxGroupSize}</span></div>}
                {selectedHunt.hunt_duration && <div className="text-cream text-sm mb-2">Duration: <span className="text-white">{selectedHunt.hunt_duration} days</span></div>}
                {selectedHunt.hunt_packageType && <div className="text-cream text-sm mb-2">Package: <span className="text-white">{selectedHunt.hunt_packageType}</span></div>}
                {selectedHunt.phone && <div className="text-cream text-sm mb-2">Contact: <span className="text-white">{selectedHunt.phone}</span></div>}
                {selectedHunt.description && <div className="text-cream text-sm mb-2">Description: <span className="text-white">{selectedHunt.description}</span></div>}
                {selectedHunt.hunt_tags && selectedHunt.hunt_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedHunt.hunt_tags.map((tag, i) => (
                      <span key={i} className="bg-amber-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex w-full justify-between mt-6">
                  <button
                    className="bg-gray-700 text-cream px-4 py-2 rounded-md font-semibold hover:bg-gray-800 transition"
                    onClick={() => setSelectedHunt(null)}
                  >
                    Back
                  </button>
                  <button
                    className={
                      enrollStatus === 'Request Sent' ? 'bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed' :
                      enrolling ? 'bg-amber-400 hover:bg-amber-500 text-white px-6 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed' :
                      'bg-amber-400 hover:bg-amber-500 text-white px-6 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
                    }
                    disabled={
                      enrolling ||
                      (selectedHunt.maxGroupSize && Number(enrolledCounts[selectedHunt._id] || 0) >= Number(selectedHunt.maxGroupSize)) ||
                      (currentUserId && selectedHunt.userId === currentUserId) ||
                      enrollStatus === 'Request Sent'
                    }
                    onClick={async () => {
                      setEnrollStatus("");
                      setEnrolling(true);
                      try {
                        const storedUser = localStorage.getItem("elkexpedition_user");
                        const userObj = storedUser ? JSON.parse(storedUser) : null;
                        if (!userObj?.id) {
                          setEnrollStatus("You must be logged in to request enrollment.");
                          setEnrolling(false);
                          return;
                        }
                        const res = await fetch("http://localhost:8000/auth/enroll-hunt", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId: userObj.id, huntId: selectedHunt._id }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setEnrollStatus("Request Sent");
                        } else {
                          setEnrollStatus(data.message || "Failed to send request.");
                        }
                      } catch {
                        setEnrollStatus("Server error. Please try again later.");
                      } finally {
                        setEnrolling(false);
                      }
                    }}
                  >
                    {enrolling ? "Sending..." : enrollStatus === 'Request Sent' ? 'Request Sent' : 'Request to Join'}
                  </button>
                </div>
                {enrollStatus && (
                  <div className={`mt-4 text-center rounded-md py-2 px-4 w-full max-w-md ${enrollStatus === 'Request Sent' ? 'bg-green-700 text-white' : enrollStatus.includes('success') ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
                    {enrollStatus}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* add/post a hunt option */}
      <div>
        <div className="m-3 p2 flex justify-center text-2xl">
          <p className="hunterra">Host Your Own Hunt?</p>
        </div>
        <div className="flex justify-center">
          <div className="rounded-2xl bg-amber-400 w-[75%] h-[1lvh]"></div>
        </div>
        <div className="flex justify-center m-5">
          <div className="flex flex-col items-center w-full">
            <button
              className="hunter-button bg-gray-600 p-2 text-2xl hunterra rounded-xl cursor-pointer"
              onClick={() => {
                if (!username) {
                  setHostError('You must be logged in to host a hunt.');
                  return;
                }
                setHostError("");
                router.push('/components/HostHunt');
              }}
            >
              Host Hunt
            </button>
            {hostError && (
              <div className="bg-red-700 text-white text-center rounded-md py-2 px-4 mt-4 w-full max-w-md">
                {hostError}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center">
            <div className="text-gray-500">(Must be Logged in to Host a Hunt)</div>
        </div>
      </div>
    </div>
  );
}