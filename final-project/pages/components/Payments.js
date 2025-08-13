import Image from 'next/image';

export default function PaymentsPage() {
    let amount = 0.0;
    amount += 2.59;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-600 via-blue-900 to-purple-900 flex items-center justify-center p-4">
            {/* Outer wrapper for image + payment form */}
            <div className="flex flex-col md:flex-row items-center md:items-stretch bg-white/70 shadow-lg backdrop-blur-sm rounded-2xl overflow-hidden">
                
                {/* Card Image - hidden on small screens */}
                <div className="hidden md:block">
                    <Image
                        src="/cardPlaceholderImage.jpg"
                        alt="Credit Card"
                        width={415}       // width in pixels
                        height={470}      // height in pixels
                        className="object-cover h-full w-full"
                        priority
                    />
                </div>

                {/* Payment Form */}
                <div className="flex flex-col p-8 w-full max-w-md">
                    
                    {/* Header */}
                    <div className="text-2xl font-semibold text-gray-700">
                        Choose your Payment Method and Check out
                    </div>
                    <div className="my-4 border-t border-black/50"></div>

                    {/* Form Fields */}
                    <form className="flex flex-col gap-2">
                        <label className="text-gray-700 text-md font-medium">
                            Name on Card
                        </label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="text-gray-700 border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />

                        <label className="text-gray-700 text-md font-medium">
                            Card Number
                        </label>
                        <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="text-gray-700 border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />

                        <label className="text-gray-700 text-md font-medium">
                            Card Expiry Date
                        </label>
                        <input
                            type="text"
                            placeholder="01/25"
                            className="text-gray-700 border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />

                        <label className="text-gray-700 text-md font-medium">
                            Security Code/CVV
                        </label>
                        <input
                            type="password"
                            placeholder="1234"
                            className="text-gray-700 border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                    </form>

                    <div className="my-4 border-t border-black/50"></div>

                    {/* Place Order Button */}
                    <button className="bg-green-700 text-white rounded-md p-3 hover:bg-green-800 cursor-pointer">
                        Place Order for ${amount.toFixed(2)}
                    </button>

                    {/* Back to Home */}
                    <p className="text-gray-700 cursor-pointer mt-3 hover:underline">
                        Back to Home
                    </p>
                </div>
            </div>
        </div>
    );
}