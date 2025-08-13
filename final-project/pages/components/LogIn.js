import { useRouter } from 'next/router';
import { useState, useEffect } from "react";
import Image from 'next/image';

export default function LogInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("prevPath", document.referrer ? new URL(document.referrer).pathname : "/");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Save user info to localStorage
        localStorage.setItem("elkexpedition_user", JSON.stringify(data.user));
        // Redirect to previous page or bookings if referrer is bookings
        const prevPath = sessionStorage.getItem("prevPath");
        if (prevPath && prevPath !== "/components/LogIn") {
          router.push(prevPath);
        } else {
          router.push("/components/HuntBookings");
        }
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch (err) {
      setLoginError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, phone, province }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! You can now log in.");
        // Reset form and switch to login
        setUsername("");
        setEmail("");
        setPassword("");
        setPhone("");
        setProvince("");
        setShowSignUp(false);
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Network error. Please try again later.");
    }
  };

  const BookingClickHandler = (e) => {
    e.preventDefault();
    router.push('/');
  }

  return (
    <div>
      <div className="flex justify-center items-center min-h-screen bg-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('/background5.png')" }}>
        <div className="flex items-center justify-center min-h-screen">
          {!showSignUp ? (
            <form
              onSubmit={handleLogin}
              className="bg-gray-900 border-2 border-gray-700 rounded-2xl w-[400px] h-[600px] flex flex-col justify-center px-8 shadow-lg">
              <div className="flex justify-center mb-6">
                  <Image src="/elkexpeditionlogo.png" alt="Elk Expedition Logo" className="website-logo cursor-pointer" onClick={BookingClickHandler} width={100} height={100}/>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-center text-cream hunterra text-gray-400">
                Login
              </h2>

              {loginError && (
                <div className="bg-red-700 text-white text-center rounded-md py-2 px-4 mb-4">
                  {loginError}
                </div>
              )}

              <label className="hunterra mb-2 text-cream text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream"
                required
              />

              <label className="hunterra mb-2 text-cream text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream"
                required
              />

              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-white py-2 rounded-md font-semibold"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
              <div className='flex justify-center mt-5 flex-col text-center'>
                  <a className='link-hover text-[13.5px] text-blue-500 cursor-pointer m-2' onClick={() => setShowSignUp(true)}>Don't have an Account? Sign-up for Free!</a>
                  <a className='link-hover text-[11.5px] text-blue-200 cursor-pointer'>Forgot Password? Click Here!</a>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleSignUp}
              className="bg-gray-900 border-2 border-gray-700 rounded-2xl w-[400px] h-[700px] flex flex-col justify-center px-8 shadow-lg">
              <div className="flex justify-center mb-6">
                  <Image src="/elkexpeditionlogo.png" alt="Elk Expedition Logo" className="website-logo cursor-pointer" onClick={BookingClickHandler} width={100} height={100}/>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-center text-cream hunterra text-gray-400">
                Sign Up
              </h2>

              <label className="hunterra mb-2 text-cream text-sm">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream"
                required
              />

              <label className="hunterra mb-2 text-cream text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream"
                required
              />

              <label className="hunterra mb-2 text-cream text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream"
                required
              />

              <label className="hunterra mb-2 text-cream text-sm">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream"
              />

              <label className="hunterra mb-2 text-cream text-sm">Province</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="p-2 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-cream"
              />

              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-white py-2 rounded-md font-semibold mb-2"
              >
                Sign Up
              </button>
              <div className='flex justify-center mt-2 flex-col text-center'>
                  <a className='link-hover text-[13.5px] text-blue-500 cursor-pointer m-2' onClick={() => setShowSignUp(false)}>Already have an account? Log in</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}