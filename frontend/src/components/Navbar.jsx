import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      className="flex items-center justify-between px-8 py-4 backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <h1 className="text-2xl font-bold text-green-400 tracking-wide">
        WellFit <span className="text-gray-400">Tracker</span> 🏋️‍♂️
      </h1>
      <ul className="hidden md:flex gap-8 text-gray-300 font-medium">
        <li className="hover:text-green-400 transition cursor-pointer">Home</li>
        <li className="hover:text-green-400 transition cursor-pointer">
          Progress
        </li>
        <li className="hover:text-green-400 transition cursor-pointer">
          About
        </li>
      </ul>
    </motion.nav>
  );
}
