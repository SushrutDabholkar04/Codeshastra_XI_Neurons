'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import Image from 'next/image';

const HomePage = () => {
  const scanRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const scrollToScan = () => {
    scanRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      title: 'Security',
      img: '/Images/security.png',
      desc: 'Get real-time alerts and messages for any object addition, removal, or repositioning detected through the camera feed—ensuring your space stays secure and monitored at all times.',
      api: 'http://localhost:5001/run-security',
    },
    {
      title: 'Inventory Management',
      img: '/Images/inventoryManagement.png',
      desc: 'Instantly view the exact positions of objects within the camera’s view. Easily track and manage your inventory with precise visual mapping.',
      api: 'http://localhost:5001/run-inventory',
    },
    {
      title: 'Space Optimization',
      img: '/Images/spaceOptimization.png',
      desc: 'Analyze what space is occupied, what’s empty, and get smart suggestions on how to rearrange for maximum efficiency and better utilization.',
      api: 'http://localhost:5001/run-space',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 fixed top-0 left-0 right-0 z-50 bg-transparent shadow-none">
        <div className="text-xl font-bold">Scanner</div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={scrollToScan}>
            Scan
          </Button>
          <Button variant="ghost" onClick={() => router.push('/help')}>
            Help
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer w-10 h-10 bg-gray-200" />
            </PopoverTrigger>
            <PopoverContent className="w-40 mt-2">
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start">
                  My Account
                </Button>
                <Button variant="ghost" className="justify-start">
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white pt-20">
        <h1 className="text-5xl font-bold text-gray-800">
          Welcome to <span className="text-blue-600">Scanner</span>
        </h1>
      </section>

      {/* Scan Feature Cards */}
      <section ref={scanRef} className="p-10 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center">What do you want to do?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, id) => (
            <motion.div
              key={id}
              className="rounded-2xl shadow-xl bg-white"
              whileHover={{ rotateY: 5, rotateX: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="overflow-hidden h-full flex flex-col">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="flex flex-col justify-between flex-1 p-4">
                  <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                  <p className="text-gray-700 mb-1 text-sm">{feature.desc}</p>
                  <div className="flex justify-center">
                    <Button
                      onClick={async () => {
                        try {
                          setLoadingFeed(true);
                          await fetch(feature.api);
                          setTimeout(() => {
                            setActiveFeature(feature.title);
                            setLoadingFeed(false);
                          }, 1000);
                        } catch (err) {
                          alert(`❌ Failed to start ${feature.title}: ` + err);
                          setLoadingFeed(false);
                        }
                      }}
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Video Feed */}
        {(activeFeature || loadingFeed) && (
          <div className="flex flex-col items-center mt-8">
            <h3 className="text-xl font-semibold mb-4">{activeFeature || 'Loading...'}</h3>
            {loadingFeed ? (
              <p className="text-gray-500">Preparing camera stream...</p>
            ) : (
              <img
                src={`http://localhost:5001/video_feed?${Date.now()}`} // cache busting
                alt={`${activeFeature} Feed`}
                className="rounded-xl border shadow-lg w-[640px] h-[480px]"
              />
            )}
            {!loadingFeed && (
              <Button
                variant="destructive"
                className="mt-4"
                onClick={async () => {
                  await fetch('http://localhost:5001/stop-stream');
                  setActiveFeature(null);
                }}
              >
                Stop Feed
              </Button>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
