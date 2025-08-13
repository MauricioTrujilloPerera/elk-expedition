import { useRouter } from 'next/router';
import { useRef, useEffect, useState } from 'react';

export default function MainHomepageInfo() {
    const router = useRouter();
    const sectionRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }
      return () => observer.disconnect();
    }, []);

    return (
        <div ref={sectionRef} className='flex justify-center p-2 m-2 gap-10'>

            {/* Card 1 */}
            <div className={`flex flex-col items-center border rounded-xl bg-gray-900 text-center p-3 w-64 border-none transition-all duration-700 ${visible ? 'fade-jump-in delay-1' : 'opacity-0 translate-y-10'}`}>
                <div className='flex items-center space-x-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <p className='font-bold text-2xl'>Step 1</p>
                </div>
                <p className='mt-2'>Find someone near you with the Hunt Finder</p>
            </div>

            {/* Card 2 */}
            <div className={`flex flex-col items-center border rounded-xl bg-gray-900 text-center p-3 w-64 border-none transition-all duration-700 ${visible ? 'fade-jump-in delay-2' : 'opacity-0 translate-y-10'}`}>
                <div className='flex items-center space-x-2'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                    <p className='font-bold text-2xl'>Step 2</p>
                </div>
                <p className='mt-2'>Exchange information & start chatting</p>
            </div>

            {/* Card 3 */}
            <div className={`flex flex-col items-center border rounded-xl bg-gray-900 text-center p-3 w-64 border-none transition-all duration-700 ${visible ? 'fade-jump-in delay-3' : 'opacity-0 translate-y-10'}`}>
                <div className='flex items-center space-x-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                    </svg>
                    <p className='font-bold text-2xl'>Step 3</p>
                </div>
                <p className='mt-2'>Setting a Hunt with the Website App, and enjoy the Trip</p>
            </div>

        </div>
    )
}