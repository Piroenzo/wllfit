import { motion } from "framer-motion";
import { useState } from "react";
import api from "../api";

export default function EditGoalsModal({ currentGoals, onClose, onSave }) {
  const [goals, setGoals] = useState(currentGoals);

  const handleChange = (key, value) => {
    setGoals({ ...goals, [key]: parseInt(value) || 0 });
  };

  const handleSave = async () => {
    try {
      await api.updateGoals(goals);
      onSave(goals);
      onClose();
    } catch (err) {
      console.error("Error updating goals:", err);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 p-8 rounded-2xl w-80 text-white shadow-2xl"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-2xl font-semibold mb-6 text-green-400 text-center">
          Edit Your Goals 🎯
        </h3>

        {["water", "sleep", "workout"].map((key) => (
          <div key={key} className="mb-4">
            <label className="block mb-1 capitalize text-gray-300">{key}</label>
            <input
              type="number"
              min="1"
              value={goals[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-center"
            />
          </div>
        ))}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-500 hover:bg-green-400 text-gray-900 font-semibold py-2 rounded-lg"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
