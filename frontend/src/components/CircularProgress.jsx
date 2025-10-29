import { motion } from "framer-motion";

export default function CircularProgress({
  value,
  goal,
  size = 120,
  color = "#22c55e",
}) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / goal, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size}>
        <circle
          stroke="#1f2937"
          fill="transparent"
          strokeWidth="10"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth="10"
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold">{Math.min(value, goal)}</span>
        <div className="text-xs text-gray-400">/ {goal}</div>
      </div>
    </div>
  );
}
