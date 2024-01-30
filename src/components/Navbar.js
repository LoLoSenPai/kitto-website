import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="fixed left-0 right-0 flex items-center justify-between w-full p-4 max-w-[1400px] mx-auto">
      <Link href='/' className="logo">
        <Image src="/logo-kitto.png" alt="Kitto" width={120} height={(120 * 290) / 395} />
      </Link>
      <div className="hidden sm:block">
        <Image src="/images/top-bar.png" alt="Top Bar" width={200} height={80} />
      </div>
      <Link href="/wallet-checker" className="relative hidden sm:block prev-button">
        <Image src="/images/top-bar.png" alt="Top Bar" width={200} height={80} />
        <span className="absolute text-lg top-1 left-10">Wallet Checker</span>
      </Link>
      <div className="flex items-center space-x-4">
        <div className="icon-container">
          <a href="https://discord.gg/XtVTM3nNRa" target="_blank" rel="noopener noreferrer">
            <img src="/images/discord-icon.png" alt="Discord" width={40} height={40} />
            <img src="/images/discord-icon-hover.png" alt="Discord Hover" className="icon-hover" />
          </a>
        </div>
        <div className="icon-container">
          <a href="https://twitter.com/KittoOnNft" target="_blank" rel="noopener noreferrer">
            <img src="/images/x-icon.png" alt="Twitter" width={40} height={40} />
            <img src="/images/x-icon-hover.png" alt="Twitter Hover" className="icon-hover" />
          </a>
        </div>
        <div className="icon-container">
          <a href="https://atlas3.io/project/kitto-or-free-mint" target="_blank" rel="noopener noreferrer">
            <img src="/images/atlas-icon.png" alt="Atlas3" width={40} height={40} />
            <img src="/images/atlas-icon-hover.png" alt="Atlas3 Hover" className="icon-hover" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
