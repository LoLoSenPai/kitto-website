import "./globals.css";
import { Inter } from "next/font/google";
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../components/Navbar";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kitto",
  description: "Looking for a cute cat pfp",
  metadataBase: new URL('https://solkitto.com'),
  openGraph: {
    image: "https://pbs.twimg.com/profile_images/1755725702005927937/ohQkTn50_400x400.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Theme>
          <Navbar />
          {children}
          <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar={false} closeOnClick={true} pauseOnHover={true} draggable={true} />
          <Analytics />
        </Theme>
      </body>
    </html >
  );
}
