import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="fixed left-0 right-0 flex items-center justify-between w-full p-4 max-w-[1200px] mx-auto">
      <div className="logo">
        <Image src="/logo-kitto.png" alt="Kitto" width={120} height={(120 * 290) / 395} />
      </div>
      <div>
        <Image src="/images/top-bar.png" alt="Top Bar" width={200} height={80} />
      </div>
      <div className="flex items-center space-x-4">
        <div className="icon-container">
          <img src="/images/discord-icon.png" alt="Discord" width={40} height={40} />
          <img src="/images/discord-icon-hover.png" alt="Discord Hover" className="icon-hover" />
        </div>
        <div className="icon-container">
          <img src="/images/x-icon.png" alt="Twitter" width={40} height={40} />
          <img src="/images/x-icon-hover.png" alt="Twitter Hover" className="icon-hover" />
        </div>
        <div className="icon-container">
          <img src="/images/atlas-icon.png" alt="Atlas3" width={40} height={40} />
          <img src="/images/atlas-icon-hover.png" alt="Atlas3 Hover" className="icon-hover" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
