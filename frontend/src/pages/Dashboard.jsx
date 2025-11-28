import React, { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,

} from "recharts";
import { motion } from "framer-motion";
import { useUserContext } from "../context/UserContext";

// Neon / moodstory palette
const COLORS = ["#671fc6ff", "#c18affff",  "#EC4899", "#22D3EE", "#F97316", "#22C55E"];

const Dashboard = () => {
  const { userId } = useUserContext();
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    if (!userId) return;

    const fetchStories = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/get-user-stats/${userId}`
        );
        const data = await response.json();

        if (data.success) {
          setStories(data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStories();
  }, [userId]);

  // 📅 Filter by date range
  useEffect(() => {
    if (!stories.length) return;

    const now = new Date();
    const ranges = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      "7d": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      "1m": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "1y": new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    };

    const filtered = stories.filter((story) => {
      const createdAt = new Date(story.created_at);
      return createdAt >= ranges[range];
    });

    setFilteredStories(filtered);
  }, [stories, range]);

  // 🧠 Prepare data for charts
  const moodCount = filteredStories.reduce((acc, story) => {
    acc[story.mood] = (acc[story.mood] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(moodCount).map(([mood, count]) => ({
    name: mood,
    value: count,
  }));

  const MOOD_ORDER = [
    "Depressed",
    "Sad",
    "Disgust",
    "Neutral",
    "Calm",
    "Happy",
    "Exited",
  ];


  const MOOD_MAP = MOOD_ORDER.reduce((acc, mood, index) => {
    acc[mood.toLowerCase()] = index;
    return acc;
  }, {});


  const getMoodScore = (moodRaw) => {
    if (!moodRaw) return 3;

    const mood = moodRaw.toLowerCase().trim();

    return MOOD_MAP[mood] ?? 3;
  };


  const lineData = filteredStories.map((story) => ({
    date: story.created_at.split(" ")[0],
    mood: story.mood,
    moodScore: getMoodScore(story.mood),
  }));

  // Count mood uplifts (negative → positive order)
  let upliftCount = 0;

  for (let i = 1; i < lineData.length; i++) {
    if (lineData[i].moodScore > lineData[i - 1].moodScore) {
      upliftCount++;
    }
  }




  // 🧾 Stats summary
  const totalStories = filteredStories.length;
  const mostCommonMood =
    Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050316] via-[#090019] to-[#14002b] text-slate-100 px-6 py-24">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.45)]">
            Mood Analytics Dashboard
          </h1>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center gap-3 mb-10">
          {["today", "7d", "1m", "1y"].map((r) => (
            <button
              key={r}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border backdrop-blur-md ${range === r
                  ? "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white border-fuchsia-400 shadow-[0_0_20px_rgba(168,85,247,0.7)]"
                  : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-fuchsia-400/60"
                }`}
              onClick={() => setRange(r)}
            >
              {r === "7d"
                ? "Last 7 Days"
                : r === "1m"
                  ? "Last Month"
                  : r === "1y"
                    ? "Last Year"
                    : "Today"}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div
            className="relative overflow-hidden bg-white/5 border border-fuchsia-500/40 rounded-2xl p-5 text-center backdrop-blur-xl"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/15 via-transparent to-indigo-500/20 pointer-events-none" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70 mb-1">
                Mood Uplifts
              </p>
              <h2 className="text-3xl font-extrabold text-white">
                {upliftCount}
              </h2>
            </div>
          </motion.div>


          <motion.div
            className="relative overflow-hidden bg-white/5 border border-purple-500/40 rounded-2xl p-5 text-center backdrop-blur-xl "
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-fuchsia-500/10 pointer-events-none" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70 mb-1">
                Most frequent emotion
              </p>
              <h2 className="text-3xl font-extrabold text-white">
                {mostCommonMood.charAt(0).toUpperCase() + mostCommonMood.slice(1).toLowerCase()}
              </h2>
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden bg-white/5 border border-indigo-500/40 rounded-2xl p-5 text-center backdrop-blur-xl "
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-transparent to-fuchsia-500/15 pointer-events-none" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70 mb-1">
                Total stories created
              </p>
              <h2 className="text-3xl font-extrabold text-white">
                {stories.length}
              </h2>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <motion.div
            className="relative overflow-hidden bg-white/5 border border-purple-500/40 rounded-2xl p-6 backdrop-blur-xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/15 via-transparent to-indigo-500/20 pointer-events-none" />
            <div className="relative">
              <h3 className="text-lg font-semibold mb-4 text-slate-50">
                Mood Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={70} 
                    dataKey="value"
                    label={({ name }) =>
                      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
                    }

                    labelLine={false}
                    stroke="none"           // 👈 removes borders between slices
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>


                  <Tooltip
                    formatter={(value, name, props) => {
                      const mood = props?.payload?.name;
                      return [`${value} stories`, mood];
                    }}
                    contentStyle={{
                      backgroundColor: "#050316",
                      border: "1px solid #A855F7",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      color: "#F9FAFB",
                    }}
                    itemStyle={{ color: "#E5E7EB" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Line Chart */}
          <motion.div
            className="relative overflow-hidden bg-white/5 border border-indigo-500/40 rounded-2xl p-6 backdrop-blur-xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-transparent to-fuchsia-500/15 pointer-events-none" />

            <div className="relative">
              <h3 className="text-lg font-semibold mb-4 text-slate-50">
                Mood Over Time
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={lineData}>

                  {/* gradient fill */}
                  <defs>
                    <linearGradient id="moodArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#A855F7" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#312552" opacity={0.6} />

                  {/* X-axis → Dates */}
                  <XAxis
                    dataKey="date"
                    stroke="#E5E7EB"
                    tick={{ fill: "#E5E7EB", fontSize: 12, dy: 15 }} 
                  />

                  {/* Y-axis → ordered moods */}
                  <YAxis
                    domain={[0, MOOD_ORDER.length - 1]}
                    ticks={MOOD_ORDER.map((_, i) => i)}
                    tickFormatter={(val) => MOOD_ORDER[val]}
                    stroke="#E5E7EB"
                    tick={{ fill: "#E5E7EB", fontSize: 12 }}
                  />

                  {/* Tooltip formatting */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#050316",
                      border: "1px solid #6366F1",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      color: "#F9FAFB",
                    }}
                    formatter={(value, name) => {
                      if (name === "moodScore") return [MOOD_ORDER[value], "Mood"];
                      return [value, name];
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="moodScore"
                    stroke="#A855F7"
                    strokeWidth={2.5}
                    fill="url(#moodArea)"
                  />

                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
