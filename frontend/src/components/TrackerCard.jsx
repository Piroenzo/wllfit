import { motion } from "framer-motion";

export default function TrackerCard({
  title,
  icon,
  color,
  description,
  value,
  goal,
  onIncrement,
  onDecrement,
}) {
  const percentage = Math.min((value / goal) * 100, 100);

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="relative w-32 h-32 mb-4"
      >
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="10"
            fill="none"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="54"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            className={`${color} stroke-current`}
            strokeDasharray="339.292"
            strokeDashoffset={339.292 - (percentage / 100) * 339.292}
            transition="stroke-dashoffset 0.4s ease"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-100">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-sm opacity-60">/ {goal}</span>
        </div>
      </motion.div>

      <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-1">
        {icon} {title}
      </h3>
      <p className="text-sm text-gray-400 mb-4 max-w-[200px]">{description}</p>

      <div className="flex gap-3">
        <button
          onClick={onDecrement}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white font-bold text-lg"
        >
          −
        </button>
        <button
          onClick={onIncrement}
          className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg text-gray-900 font-bold text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}
