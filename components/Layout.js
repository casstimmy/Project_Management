// components/Layout.js
import { Inter } from "next/font/google";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function Layout({ children }) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <Nav>
        {children}
        </Nav>
    </div>
  );
}
