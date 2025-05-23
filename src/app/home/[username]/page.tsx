'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ImageGlider from '@/components/ImageGlider';
import axios from 'axios';
const HomePage = ({ params }: any) => {
  const [username, setUsername] = useState<string | null>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToScan = () => {
    scanRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const name = localStorage.getItem("username");
    setUsername(name);
    console.log("Username from localStorage:", name);
  }, []);

  if (username === null) return <div>Loading...</div>;

  const handleLogout = async () => {
    try {
    // Send a request to logout API (optional, depends on your backend)
    await axios.get("/api/users/logout");
   
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
   
    // Redirect to home page after successful logout
    router.push('/home');
    } catch (error) {
    console.error("Logout failed", error);
    }
   };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 fixed top-0 left-0 right-0 z-50 bg-transparent shadow-none">

        {/* Logo */}
        <div className="text-xl font-bold">  </div>

        {/* Nav Items */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={scrollToScan}>
            Scan
          </Button>
          <Button variant="ghost" onClick={() => router.push(`/help/${username}`)}>Help</Button>

          {/* Circular Button with Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
            <Avatar className="cursor-pointer w-10 h-10">
              <AvatarImage src="/Images/Avatar.webp" alt="User Avatar" />
              {/* <AvatarFallback>A</AvatarFallback> */}
            </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-40 mt-2">
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start" onClick={() => router.push(`/myAccount/${username}`)}>
                  My Account
                </Button>
                <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      {/* Landing Section */}
      <section className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white pt-20">
        <ImageGlider />
        <h1 className="text-5xl font-bold text-gray-800 pb-12 flex items-center gap-3">
          Welcome to
          <Image 
            src="/Images/detectify.png" 
            alt="Detectify Logo" 
            width={250} 
            height={150} 
            className="inline-block object-contain mt-6" 
          />
        </h1>
        {/* <h1 className="text-5xl font-bold text-gray-800 pb-12">Welcome to <span className="text-blue-600">Scanner</span></h1> */}
      </section>

      {/* Scan Section */}
        <section ref={scanRef} className="p-10 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center">What do you want to do?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
            {
                title: 'Security',
                img: '/Images/security.png',
                desc: 'Get real-time alerts and messages for any object addition, removal, or repositioning detected through the camera feed—ensuring your space stays secure and monitored at all times.',
                location: `/scanSecurity/${username}`,
            },
            {
                title: 'Inventory Management',
                img: '/Images/inventoryManagement.png',
                desc: 'Instantly view the exact positions of objects within the camera’s view. Easily track and manage your inventory with precise visual mapping.',
                location: `/scanInventory/${username}`,
            },
            {
                title: 'Space Optimization',
                img: '/Images/spaceOptimization.png',
                desc: 'Analyze what space is occupied, what’s empty, and get smart suggestions on how to rearrange for maximum efficiency and better utilization.',
                location: `/scanSpace/${username}`,
            },
            ].map((feature, id) => (
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
                    <Button onClick={() => router.push(feature.location)}>Open</Button>
                    </div>
                </CardContent>
                </Card>
            </motion.div>
            ))}
        </div>
        </section>
        {/* Footer */}
        <div className="pt-8 pb-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Detectify App • {new Date().getFullYear()}</p>
        </div>
    </main>
  );
};

export default HomePage;
