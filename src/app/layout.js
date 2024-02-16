import "./globals.css";
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
