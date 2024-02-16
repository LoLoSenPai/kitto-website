import "./globals.css";
import Head from 'next/head';
import { Inter } from "next/font/google";
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kitto",
  description: "Looking for a cute cat pfp",
  image: "https://pbs.twimg.com/profile_images/1755725702005927937/ohQkTn50_400x400.jpg",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>Kitto</title>
        <meta name="description" content="Looking for a cute cat pfp" />
        <meta property="og:title" content="Kitto" />
        <meta property="og:description" content="Looking for a cute cat pfp" />
        <meta property="og:image" content="https://pbs.twimg.com/profile_images/1755725702005927937/ohQkTn50_400x400.jpg" />
      </Head>
      <body className={inter.className}>
        <Theme>
          <Navbar />
          {children}
          <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar={false} closeOnClick={true} pauseOnHover={true} draggable={true} />
        </Theme>
      </body>
    </html >
  );
}
