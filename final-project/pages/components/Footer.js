import { useState } from "react";

export default function FooterPage() {
  const [showTerms, setShowTerms] = useState(false);
    return (
      <footer className="bg-black text-white py-6">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col items-center text-center gap-2">
          <p className="text-lg font-bold tracking-wider">ElkExpedition™</p>
          <p className="text-sm text-gray-400">
            Adventure Awaits. Book Your Hunt Today.
          </p>
          <button className="text-sm text-blue-400 underline hover:text-blue-300 mb-2" onClick={() => setShowTerms(true)}>
            Terms & Conditions
          </button>
          <p className="text-sm text-gray-400">
            &copy; 2025 ElkExpedition™. All Rights Reserved.
          </p>
          <p className="text-sm text-gray-400">Built by Mauricio 🦌</p>
          {showTerms && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
              <div className="bg-gray-900 border-2 border-amber-400 rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative animate-fade-in">
                <button className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow" onClick={() => setShowTerms(false)} title="Close">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-amber-400 mb-4 hunterra">Terms & Conditions</h2>
                <div className="text-cream text-left text-base flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                  <section>
                    <h3 className="text-lg font-bold text-orange-400 mb-1">Platform Commission</h3>
                    <p>
                      Elk Expedition charges a 1% commission on all successful hunt bookings. This fee is included in the total price shown to users. For example, if a hunt is listed at $500, the host will receive $495 and the platform will receive $5 as a service fee.
                    </p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-orange-400 mb-1">User Responsibilities</h3>
                    <p>
                      All users are expected to provide accurate information, respect other members, and comply with local laws and regulations regarding hunting and outdoor activities. Elk Expedition is not responsible for the conduct of users or the outcome of hunts.
                    </p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-orange-400 mb-1">Booking & Payment</h3>
                    <p>
                      By booking a hunt, you agree to pay the full listed price, which includes the platform commission. Payments are processed securely, and hosts will receive their portion (99% of the listed price) after the booking is confirmed.
                    </p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-orange-400 mb-1">Cancellations & Refunds</h3>
                    <p>
                      Cancellation and refund policies are determined by the host. Please review the specific terms for each hunt before booking. Elk Expedition may assist in dispute resolution but does not guarantee refunds.
                    </p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-orange-400 mb-1">Community Standards</h3>
                    <p>
                      We strive to maintain a safe, respectful, and welcoming community. Any abuse, harassment, or illegal activity may result in account suspension or removal from the platform.
                    </p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-orange-400 mb-1">Contact</h3>
                    <p>
                      For questions or support, please contact us at <span className="text-blue-400">support@elkexpedition.com</span>.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    );
  }
  