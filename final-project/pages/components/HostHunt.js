import Navbar from "./Navbar";
import UserBadge from "./UserBadge";
import { useState } from "react";
import { ANIMALS } from "./AnimalFilterTags";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";

// Helper to get today in yyyy-mm-dd format
function getTodayStr() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const steps = [
  { key: "phone", label: "What is your contact phone number?", type: "tel", placeholder: "Phone (optional)", required: false },
  { key: "hunt_animalType", label: "What animal is this hunt for?", type: "text", placeholder: "e.g. Elk", required: true },
  { key: "hunt_location", label: "Where will the hunt take place?", type: "text", placeholder: "Location", required: true },
  { key: "hunt_date", label: "What is the date of the hunt?", type: "date", placeholder: "Date", required: true },
  { key: "hunt_price", label: "What is the price for this hunt? (CAD)", type: "number", placeholder: "Price", required: true },
  { key: "description", label: "Describe your hunt in detail", type: "textarea", placeholder: "Description", required: true },
  { key: "hunt_displayImages", label: "Add a display image URL (optional)", type: "text", placeholder: "Image URL", required: false },
  { key: "hunt_duration", label: "How many days is the hunt?", type: "number", placeholder: "Duration (days)", required: false },
  { key: "hunt_tags", label: "Add tags for your hunt (comma separated)", type: "text", placeholder: "e.g. archery, trophy, guided", required: false },
  { key: "maxGroupSize", label: "What is the maximum group size?", type: "number", placeholder: "Max group size", required: false },
  { key: "hunt_packageType", label: "What is the package type? (optional)", type: "text", placeholder: "e.g. All-inclusive", required: false },
];

const PACKAGE_OPTIONS = [
  "BYOG (bring your own gear)",
  "BYOT (bring your own tent)",
  "FOOD INCLUDED",
  "FOOD NOT INCLUDED",
  "LODGE INCLUDED",
  "LODGE NOT INCLUDED",
  "GUIDED",
  "UNGUIDED",
  "TRANSPORTATION INCLUDED",
  "TRANSPORTATION NOT INCLUDED"
];

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"
];

export default function HostHuntPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animating, setAnimating] = useState(false);
  const [input, setInput] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [dateError, setDateError] = useState("");

  const current = steps[step];
  const progress = ((step) / steps.length) * 100;

  const handleNext = () => {
    if (current.required && !input) return;
    setAnimating(true);
    setTimeout(() => {
      setAnswers({ ...answers, [current.key]: input });
      setInput("");
      setStep(step + 1);
      setAnimating(false);
    }, 350);
  };

  const handleBack = () => {
    if (step === 0) return;
    setInput(answers[steps[step - 1].key] || "");
    setStep(step - 1);
  };

  // On step change, prefill input if answer exists
  React.useEffect(() => {
    setInput(answers[steps[step]?.key] || "");
  }, [step]);

  // Submit hunt to backend
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitStatus("");
    // Frontend validation for required fields
    const requiredFields = steps.filter(s => s.required).map(s => s.key);
    for (const key of requiredFields) {
      if (!answers[key]) {
        setSubmitStatus(`Missing required field: ${key.replace(/_/g, ' ')}`);
        setSubmitting(false);
        return;
      }
    }
    // Date validation (should not be in the past)
    if (answers.hunt_date && answers.hunt_date < getTodayStr()) {
      setSubmitStatus("Date cannot be in the past.");
      setSubmitting(false);
      return;
    }
    try {
      const storedUser = localStorage.getItem("elkexpedition_user");
      const userObj = storedUser ? JSON.parse(storedUser) : null;
      if (!userObj?.id) {
        setSubmitStatus("You must be logged in to post a hunt.");
        setSubmitting(false);
        return;
      }
      const payload = { ...answers, userId: userObj.id };
      const res = await fetch("http://localhost:8000/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitStatus("Hunt posted successfully!");
        setTimeout(() => router.push("/components/Profile?tab=myhunts"), 1200);
      } else {
        let backendMsg = "";
        try {
          const data = await res.json();
          backendMsg = data.message || "";
        } catch {}
        setSubmitStatus(backendMsg ? `Backend error: ${backendMsg}` : `Backend error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setSubmitStatus(`Network or server error: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('/background5.png')" }}>
      <Navbar />
      <UserBadge />
      <div className="flex flex-col items-center justify-center mt-12">
        <h1 className="text-3xl font-bold mb-4 text-amber-400 hunterra">Host a Hunt</h1>
        {/* Floating clickable logo above progress bar */}
        <div className="flex justify-center mb-4">
          <Image
            src="/elkexpeditionlogo.png"
            alt="Elk Expedition Logo"
            className="website-logo cursor-pointer"
            width={100}
            height={100}
            onClick={() => window.location.href = "/"}
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
        </div>
        <div className="w-full max-w-xl">
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-800 rounded-full mb-8 overflow-hidden">
            <div
              className="bg-amber-400 h-3 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Animated Step Card */}
          <div className={`relative bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-lg p-8 min-h-[180px] flex flex-col items-center transition-all duration-300 ${animating ? 'opacity-0 translate-x-12' : 'opacity-100 translate-x-0'}`}>
            {step < steps.length ? (
              <>
                <div className="text-cream text-xl mb-6 text-center">{current.label}</div>
                {current.key === "hunt_animalType" ? (
                  <select
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg mb-4 appearance-none"
                    autoFocus
                  >
                    <option value="">Select Animal</option>
                    {ANIMALS.map(animal => (
                      <option key={animal.value} value={animal.value}>{animal.label}</option>
                    ))}
                  </select>
                ) : current.key === "hunt_packageType" ? (
                  <div className="w-full">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(input) && input.map((pkg, i) => (
                        <span key={i} className="bg-amber-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          {pkg}
                          <button type="button" className="ml-1 text-red-600 hover:text-red-800 font-bold" onClick={() => setInput(input.filter((p, idx) => idx !== i))}>&times;</button>
                        </span>
                      ))}
                    </div>
                    <select
                      value=""
                      onChange={e => {
                        const val = e.target.value;
                        if (val && (!Array.isArray(input) || !input.includes(val))) {
                          setInput(Array.isArray(input) ? [...input, val] : [val]);
                        }
                      }}
                      className="w-full p-3 rounded-md bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg mb-4 appearance-none"
                    >
                      <option value="">Select Package Option</option>
                      {PACKAGE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ) : current.key === "hunt_location" ? (
                  <select
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg mb-4 appearance-none"
                    autoFocus
                  >
                    <option value="">Select Province/Territory</option>
                    {PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                ) : current.type === "textarea" ? (
                  <textarea
                    placeholder={current.placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg mb-4 min-h-[100px]"
                    autoFocus
                  />
                ) : (
                  <input
                    type={current.type}
                    placeholder={current.placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-800 text-cream border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg mb-4"
                    autoFocus
                  />
                )}
                <div className="flex w-full justify-between mt-2">
                  <button
                    className="bg-gray-700 text-cream px-4 py-2 rounded-md font-semibold hover:bg-gray-800 transition"
                    onClick={handleBack}
                    disabled={step === 0}
                  >
                    Back
                  </button>
                  <button
                    className={`bg-amber-400 hover:bg-amber-500 text-white px-6 py-2 rounded-md font-semibold transition ${current.required && !input ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleNext}
                    disabled={current.required && !input}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-2xl text-amber-400 font-bold mb-4">All Done!</div>
                <div className="bg-gray-800 rounded-xl p-6 w-full text-cream text-left flex flex-col gap-2 shadow-lg">
                  <h3 className="text-xl font-bold text-amber-400 mb-2">Hunt Summary</h3>
                  {answers.hunt_displayImages && (
                    <img src={answers.hunt_displayImages} alt="Hunt" className="w-full h-40 object-cover rounded-xl mb-2 border border-gray-700" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span><span className="font-semibold">Animal:</span> <span className="text-white">{answers.hunt_animalType}</span></span>
                    <span><span className="font-semibold">Location:</span> <span className="text-white">{answers.hunt_location}</span></span>
                    <span><span className="font-semibold">Date:</span> <span className="text-white">{answers.hunt_date}</span></span>
                    <span><span className="font-semibold">Price:</span> <span className="text-white">${answers.hunt_price}</span></span>
                    {answers.maxGroupSize && <span><span className="font-semibold">Max Group Size:</span> <span className="text-white">{answers.maxGroupSize}</span></span>}
                    {answers.hunt_duration && <span><span className="font-semibold">Duration:</span> <span className="text-white">{answers.hunt_duration} days</span></span>}
                    {answers.hunt_packageType && Array.isArray(answers.hunt_packageType) && answers.hunt_packageType.length > 0 && (
                      <span className="flex flex-wrap gap-2 mt-2">
                        {answers.hunt_packageType.map((pkg, i) => (
                          <span key={i} className="bg-amber-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">{pkg}</span>
                        ))}
                      </span>
                    )}
                    {answers.phone && <span><span className="font-semibold">Contact:</span> <span className="text-white">{answers.phone}</span></span>}
                    {answers.description && <span><span className="font-semibold">Description:</span> <span className="text-white">{answers.description}</span></span>}
                    {answers.hunt_tags && (
                      <span className="flex flex-wrap gap-2 mt-2">
                        {String(answers.hunt_tags).split(",").map((tag, i) => (
                          <span key={i} className="bg-amber-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">{tag.trim()}</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="mt-6 bg-amber-400 hover:bg-amber-500 text-white py-2 px-8 rounded-md font-semibold text-lg transition disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Posting..." : "Submit Hunt"}
                </button>
                {submitStatus && (
                  <div className={`mt-4 text-center rounded-md py-2 px-4 w-full max-w-md ${submitStatus.includes("success") ? "bg-green-700 text-white" : "bg-red-700 text-white"}`}>
                    {submitStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 