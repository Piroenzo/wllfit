// 1️⃣ Importaciones
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Target, User, LogOut } from "lucide-react";
import TrackerCard from "../components/TrackerCard";
import ProgressChart from "../components/ProgressChart";
import EditGoalsModal from "../components/EditGoalsModal";
import api from "../api";

// 2️⃣ Componente principal
export default function Dashboard({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [habits, setHabits] = useState({
    water: [],
    sleep: [],
    workout: [],
  });

  const [goals, setGoals] = useState({ water: 8, sleep: 7, workout: 1 });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
    loadGoals();
  }, []);

  async function loadData(date) {
    try {
      setLoading(true);
      const res = await api.getWeekly(date);
      setWeekStart(res.weekStart);
      setHabits(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weekly data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadGoals() {
    try {
      const res = await api.getGoals();
      setGoals((prev) => ({ ...prev, ...res }));
    } catch (err) {
      console.error("Failed to load goals:", err);
    }
  }

  async function handleUpdate(type, op) {
    try {
      await api.updateHabit(type, op);
      const updated = await api.getWeekly();
      setHabits(updated.data);
    } catch (err) {
      console.error(err);
      setError("Failed to update habit.");
    }
  }

  const changeWeek = (direction) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + (direction === "next" ? 7 : -7));
    loadData(d.toISOString().slice(0, 10));
  };

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 bg-[#0b0d10]">
        Loading weekly progress...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-400 bg-[#0b0d10]">
        {error}
      </div>
    );

  return (
    <motion.main
      className="p-4 sm:p-8 space-y-12 min-h-screen flex flex-col justify-between bg-[#0b0d10] text-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div>
        {/* 🔝 Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-green-400">
            Week of {weekStart}
          </h2>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg shadow-md font-semibold"
          >
            Logout
          </button>
        </div>

        {/* 🗓️ Selector de semanas */}
        <div className="flex justify-between items-center">
          <h3 className="text-base text-gray-400">Navigate between weeks:</h3>
          <div className="flex gap-2">
            <button
              onClick={() => changeWeek("prev")}
              className="bg-[#14181d] hover:bg-[#1b2026] px-3 py-1 rounded text-sm border border-gray-700"
            >
              ← Prev
            </button>
            <button
              onClick={() => changeWeek("next")}
              className="bg-[#14181d] hover:bg-[#1b2026] px-3 py-1 rounded text-sm border border-gray-700"
            >
              Next →
            </button>
          </div>
        </div>

        {/* 🎯 Botón editar metas */}
        <div className="flex justify-end mb-4 mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-400 text-gray-900 px-4 py-2 rounded-lg shadow-md font-semibold"
          >
            🎯 Edit Goals
          </button>
        </div>

        {/* 🧱 Tarjetas de hábitos con margen inferior */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-[#14181d] rounded-2xl p-6 shadow-xl border border-gray-800 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] mb-8"
          >
            <TrackerCard
              title="Water Intake"
              icon="💧"
              color="bg-blue-500"
              description="Track your daily water intake to stay hydrated."
              value={habits.water[todayIndex]?.value || 0}
              goal={goals.water}
              onIncrement={() => handleUpdate("water", "inc")}
              onDecrement={() => handleUpdate("water", "dec")}
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-[#14181d] rounded-2xl p-6 shadow-xl border border-gray-800 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] mb-8"
          >
            <TrackerCard
              title="Sleep Hours"
              icon="💤"
              color="bg-purple-500"
              description="Log your sleep hours and improve your rest quality."
              value={habits.sleep[todayIndex]?.value || 0}
              goal={goals.sleep}
              onIncrement={() => handleUpdate("sleep", "inc")}
              onDecrement={() => handleUpdate("sleep", "dec")}
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-[#14181d] rounded-2xl p-6 shadow-xl border border-gray-800 hover:shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] mb-8"
          >
            <TrackerCard
              title="Workout"
              icon="🏋️‍♂️"
              color="bg-green-500"
              description="Record your exercise sessions and stay active."
              value={habits.workout[todayIndex]?.value || 0}
              goal={goals.workout}
              onIncrement={() => handleUpdate("workout", "inc")}
              onDecrement={() => handleUpdate("workout", "dec")}
            />
          </motion.div>
        </section>

        {/* 📊 Gráficos semanales */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <ProgressChart
            title="Water Intake (Week)"
            data={habits.water}
            color="#3b82f6"
          />
          <ProgressChart
            title="Sleep Hours (Week)"
            data={habits.sleep}
            color="#8b5cf6"
          />
          <ProgressChart
            title="Workout (Week)"
            data={habits.workout}
            color="#22c55e"
          />
        </motion.section>

        {showModal && (
          <EditGoalsModal
            currentGoals={goals}
            onClose={() => setShowModal(false)}
            onSave={(newGoals) => setGoals(newGoals)}
          />
        )}
      </div>

      {/* 🌈 Footer */}
      <footer className="mt-12 bg-gradient-to-r from-green-600 via-cyan-600 to-blue-600 py-6 rounded-2xl shadow-lg text-gray-100 font-medium">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-3"
        >
          <nav className="flex gap-8 text-sm font-semibold">
            <a href="#" className="flex items-center gap-1 hover:opacity-80">
              <Home size={16} /> Dashboard
            </a>
            <a
              href="#goals"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <Target size={16} /> Goals
            </a>
            <a
              href="#profile"
              className="flex items-center gap-1 hover:opacity-80"
            >
              <User size={16} /> Profile
            </a>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>

          <div className="text-center mt-2">
            <p className="text-lg font-semibold drop-shadow">
              🌿 WellFit — Balance your body, track your life 💧
            </p>
            <p className="text-sm opacity-70">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold">Enzo Piro</span>. All rights
              reserved.
            </p>
          </div>
        </motion.div>
      </footer>
    </motion.main>
  );
}
