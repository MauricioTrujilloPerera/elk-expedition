import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function FeaturedPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("elkexpedition_user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    }
  }, []);

  const handleBook = (e) => {
    e.preventDefault();
    // Placeholder: booking logic here
    alert("Booking successful! (placeholder)");
  };

  const handleLoginPrompt = (e) => {
    e.preventDefault();
    alert("Please log in to book a hunt!");
    router.push("/components/LogIn");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-950 min-h-screen">
      {/* Card 1 */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition duration-300">
        <div>
          <h2 className="text-xl font-bold mb-2 text-white">John Doe</h2>
          <div className="flex items-center text-yellow-500 mb-2">
            <span className="mr-1">★★★★★</span>
            <span className="link-hover cursor-pointer text-sm text-white">(24 reviews)</span>
          </div>
          <p className="text-gray-300 mb-1">
            <strong>Price:</strong> $350/day
          </p>
          <p className="text-gray-300">
            <strong>Location:</strong> Alberta, Canada
          </p>
        </div>
        <button
          className="mt-4 bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={user ? handleBook : handleLoginPrompt}
          disabled={!user}
        >
          Book Now
        </button>
      </div>

      {/* Card 2 */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition duration-300">
        <div>
          <h2 className="text-xl font-bold mb-2 text-white">Sarah Thompson</h2>
          <div className="flex items-center text-yellow-500 mb-2">
            <span className="mr-1">★★★★☆</span>
            <span className="link-hover cursor-pointer text-sm text-white">(15 reviews)</span>
          </div>
          <p className="text-gray-300 mb-1">
            <strong>Price:</strong> $400/day
          </p>
          <p className="text-gray-300">
            <strong>Location:</strong> British Columbia, Canada
          </p>
        </div>
        <button className="mt-4 bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-orange-700 transition">
          Book Now
        </button>
      </div>

      {/* Card 3 */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition duration-300">
        <div>
          <h2 className="text-xl font-bold mb-2 text-white">Mike Williams</h2>
          <div className="flex items-center text-yellow-500 mb-2">
            <span className="mr-1">★★★★★</span>
            <span className="link-hover cursor-pointer text-sm text-white">(32 reviews)</span>
          </div>
          <p className="text-gray-300 mb-1">
            <strong>Price:</strong> $375/day
          </p>
          <p className="text-gray-300">
            <strong>Location:</strong> Montana, USA
          </p>
        </div>
        <button className="mt-4 bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-orange-700 transition">
          Book Now
        </button>
      </div>

      {/* Card 4 */}
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition duration-300">
        <div>
          <h2 className="text-xl font-bold mb-2 text-white">Emily Carter</h2>
          <div className="flex items-center text-yellow-500 mb-2">
            <span className="mr-1">★★★★☆</span>
            <span className="link-hover cursor-pointer text-sm text-white">(18 reviews)</span>
          </div>
          <p className="text-gray-300 mb-1">
            <strong>Price:</strong> $450/day
          </p>
          <p className="text-gray-300">
            <strong>Location:</strong> Colorado, USA
          </p>
        </div>
        <button className="mt-4 bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-orange-700 transition">
          Book Now
        </button>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition duration-300">
        <button className="mt-4 text-white cursor-pointer font-semibold py-2 rounded-xl">
        Load More...
        </button>
      </div>
    </div>
  );
}