"use client"

import { motion } from "framer-motion"
import { FaPlay, FaMagic } from "react-icons/fa"
import { Slider } from "@/components/ui/slider"
import { sounds } from "./constants"

interface MixAmbienceProps {
  activeIds: string[]
  themeId: string
  volumes: Record<string, number>
  activeColor: string
  toggleSound: (id: string) => void
  handleVolumeChange: (id: string, value: number[]) => void
  applyRecommendation: () => void
}

export default function MixAmbience({
  activeIds,
  volumes,
  activeColor,
  toggleSound,
  handleVolumeChange,
  applyRecommendation,
}: MixAmbienceProps) {
  return (
    <>
      <div className="flex justify-center mb-8">
        <button
          onClick={applyRecommendation}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/50 backdrop-blur-sm border-2 font-bold uppercase tracking-wider text-sm transition-all hover:scale-105 active:scale-95"
          style={{ borderColor: activeColor, color: activeColor }}
        >
          <FaMagic />
          <span>AI Recommendation</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {sounds.map((sound) => {
          const isActive = activeIds.includes(sound.id)
          const volume = volumes[sound.id] ?? 0

          return (
            <motion.div
              key={sound.id}
              onClick={() => toggleSound(sound.id)}
              className={`
                relative min-h-[220px] p-8 cursor-pointer
                rounded-[2.5rem] border-2 transition-all duration-500
                ${isActive ? "shadow-lg" : "hover:shadow-md"}
              `}
              style={{
                backgroundColor: isActive ? sound.color : "rgba(255,255,255,0.5)",
                borderColor: isActive ? sound.color : "transparent",
                color: isActive ? "white" : "#4A4A4A"
              }}
            >
              {/* Top: Label and Icon */}
              <div className="flex justify-between items-start">
                <span className="text-3xl font-bold tracking-tight">{sound.name}</span>
                <div>
                  {sound.icon}
                </div>
              </div>

              {/* Bottom: Playback Controls (Visible only when active) */}
              <div className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <motion.div
                  initial={false}
                  animate={{ y: isActive ? 0 : 10 }}
                  className="absolute bottom-8 left-8 right-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2.5 shadow-sm">
                      <FaPlay size={12} />
                    </div>
                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider opacity-80">
                        <span>Volume</span>
                        <span>{volume}%</span>
                      </div>
                      <Slider
                        value={[volume]}
                        max={100}
                        onValueChange={(val) => {
                          handleVolumeChange(sound.id, val)
                        }}
                        className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_.relative]:bg-white/30 [&_.absolute]:bg-white"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
