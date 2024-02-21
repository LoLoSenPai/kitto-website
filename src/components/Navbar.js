'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      setShowNavbar(window.scrollY < lastScrollY);
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'} fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full p-4 max-w-[1400px] mx-auto`}>
      <Link href="/">
        <div className="inline-flex items-center justify-center w-16 h-16 md:h-20 md:w-32 active:scale-95">
          <img
            src="/logo-kitto.png"
            alt="Logo Kitto"
            className="transition-transform duration-150 ease-in-out"
            width={395}
            height={290}
          />
        </div>
      </Link>
      <Link href="/wallet-checker">
        <div className="w-21 md:w-[180px] text-center bg-white/50 rounded-xl p-2 active:bg-white/70 active:scale-95 transition duration-150 ease-in-out">
          <span className="text-lg font-bold">Airdrop Checker</span>
        </div>
      </Link>
      <div className="items-center md:flex md:space-x-4 md:flex-row">
        <div className="icon-container">
          <a href="https://discord.gg/XtVTM3nNRa" target="_blank" rel="noopener noreferrer">
            <img src="/images/discord-icon.png" alt="Discord" width={40} height={40} />
            <img src="/images/discord-icon-hover.png" alt="Discord Hover" className="icon-hover" />
          </a>
        </div>
        <div className="icon-container">
          <a href="https://twitter.com/solkitto" target="_blank" rel="noopener noreferrer">
            <img src="/images/x-icon.png" alt="Twitter" width={40} height={40} />
            <img src="/images/x-icon-hover.png" alt="Twitter Hover" className="icon-hover" />
          </a>
        </div>
        {/* <div className="icon-container">
          <a href="https://atlas3.io/project/kitto-or-free-mint" target="_blank" rel="noopener noreferrer">
            <img src="/images/atlas-icon.png" alt="Atlas3" width={40} height={40} />
            <img src="/images/atlas-icon-hover.png" alt="Atlas3 Hover" className="icon-hover" />
          </a>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
