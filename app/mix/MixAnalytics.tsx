"use client"

import { motion } from "framer-motion"
import { FaBolt, FaSeedling, FaTree } from "react-icons/fa"
import { AnalyticsData } from "./constants"

interface MixAnalyticsProps {
  activeColor: string
  analytics: AnalyticsData
  weeklyData: { day: string; duration: number }[]
  maxDailyDuration: number
  energyData: number[]
  maxEnergy: number
  durationToday: number
  focusLevel: number
}

export default function MixAnalytics({
  activeColor,
  analytics,
  weeklyData,
  maxDailyDuration,
  energyData,
  maxEnergy,
  durationToday,
  focusLevel,
}: MixAnalyticsProps) {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8">

      {/* Focus Streak Visual */}
      <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-white/50">
        <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black mb-2" style={{ color: activeColor }}>Focus Garden</h3>
            <p className="text-gray-600 mb-4">Your plant grows for every 25 minutes of focus today.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 text-sm font-bold" style={{ color: activeColor }}>
                <FaBolt />
                <span>{Math.round(durationToday / 60)} mins focused today</span>
            </div>
        </div>
        <div className="flex items-end gap-4 h-32">
            {[0, 1, 2, 3].map((stage) => (
                <div key={stage} className="flex flex-col items-center gap-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{
                            scale: focusLevel >= stage ? 1 : 0.5,
                            opacity: focusLevel >= stage ? 1 : 0.3,
                            filter: focusLevel >= stage ? 'grayscale(0%)' : 'grayscale(100%)'
                        }}
                        className="transition-all duration-500"
                        style={{ color: focusLevel >= stage ? activeColor : '#ccc' }}
                    >
                        {stage === 0 && <FaSeedling size={24} />}
                        {stage === 1 && <FaSeedling size={32} />}
                        {stage === 2 && <FaTree size={40} />}
                        {stage === 3 && <FaTree size={56} />}
                    </motion.div>
                    {focusLevel >= stage && (
                        <motion.div layoutId="active-stage" className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColor }} />
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl text-center">
          <div className="text-3xl font-black mb-2" style={{ color: activeColor }}>{analytics.streak}</div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-60">Day Streak</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl text-center">
          <div className="text-3xl font-black mb-2" style={{ color: activeColor }}>{Math.round(analytics.longestSession / 60)}m</div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-60">Longest Session</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl text-center">
          <div className="text-3xl font-black mb-2" style={{ color: activeColor }}>
            {analytics.history.length > 0
              ? Math.round(analytics.history.reduce((a, b) => a + b.duration, 0) / analytics.history.length / 60)
              : 0}m
          </div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-60">Avg Session</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl text-center">
          <div className="text-3xl font-black mb-2" style={{ color: activeColor }}>
            {Math.round(weeklyData[6].duration / 60)}m
          </div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-60">Today's Focus</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weekly Focus Chart */}
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-bold mb-8 text-center uppercase tracking-widest opacity-80" style={{ color: activeColor }}>Weekly Focus</h3>
            <div className="flex items-end justify-between h-48 gap-2">
            {weeklyData.map((data, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div
                    className="w-full rounded-t-xl transition-all duration-1000 ease-out"
                    style={{
                    height: `${(data.duration / maxDailyDuration) * 100}%`,
                    backgroundColor: activeColor,
                    opacity: 0.8
                    }}
                />
                <span className="text-[10px] font-bold opacity-50">{data.day}</span>
                </div>
            ))}
            </div>
        </div>

        {/* Energy Mapping Chart */}
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-bold mb-8 text-center uppercase tracking-widest opacity-80" style={{ color: activeColor }}>Peak Energy</h3>
            <div className="flex items-end justify-between h-48 gap-1">
            {energyData.map((count, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                <div
                    className="w-full rounded-t-sm transition-all duration-1000 ease-out hover:opacity-100"
                    style={{
                    height: `${(count / maxEnergy) * 100}%`,
                    backgroundColor: activeColor,
                    opacity: count > 0 ? 0.8 : 0.1
                    }}
                />
                {i % 6 === 0 && (
                    <span className="text-[10px] font-bold opacity-50 absolute -bottom-6">{i}h</span>
                )}
                </div>
            ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">High priority tasks completed by hour of day</p>
        </div>
      </div>
    </div>
  )
}
