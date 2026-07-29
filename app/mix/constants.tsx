import { useState } from "react"
import { FaTree, FaWater, FaFire, FaMoon, FaWind, FaBook } from "react-icons/fa"

export type Priority = "low" | "medium" | "high"

export type Todo = {
  id: string
  text: string
  completed: boolean
  pomoSessions: number
  completedPomos: number
  tags: string[]
  priority: Priority
  deadline?: string
}

export type AnalyticsData = {
  history: { date: string; duration: number }[]
  streak: number
  lastSessionDate: string | null
  longestSession: number
  soundUsage: Record<string, number>
  completions: { date: string; priority: Priority }[]
}

export const sounds = [
  { id: "fire", name: "Fireplace", icon: <FaFire size={24} />, color: "#FF6B35" },
  { id: "forest", name: "Forest", icon: <FaTree size={24} />, color: "#2D6A4F" },
  { id: "night", name: "Night", icon: <FaMoon size={24} />, color: "#1B263B" },
  { id: "rain", name: "Rain", icon: <FaWater size={24} />, color: "#0077B6" },
  { id: "whitenoise", name: "White Noise", icon: <FaWind size={24} />, color: "#6C757D" },
  { id: "library", name: "Library", icon: <FaBook size={24} />, color: "#8D6E63" },
]

export const soundSources: Record<string, string> = {
  fire: "/sounds/fireplace.mp3",
  forest: "/sounds/new-forest.wav",
  night: "/sounds/new_wildlife.mp3",
  rain: "/sounds/new-rain.mp3",
  whitenoise: "/sounds/new-whitenoise.wav",
  library: "/sounds/library.mp3",
}

export const timerPresets = [
  { work: 25, break: 5, label: "25 / 5" },
  { work: 50, break: 10, label: "50 / 10" },
  { work: 15, break: null, label: "15m" },
  { work: 30, break: null, label: "30m" },
]

export const TimerButton = ({
  label,
  onClick,
  activeColor
}: {
  label: string,
  onClick: () => void,
  activeColor: string
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-4 py-2 rounded-full border transition-colors text-xs font-bold cursor-pointer"
      style={{
        borderColor: activeColor,
        color: isHovered ? "white" : activeColor,
        backgroundColor: isHovered ? activeColor : "transparent"
      }}
    >
      {label}
    </button>
  )
}

export const TabButton = ({
  label,
  isActive,
  onClick,
  activeColor
}: {
  label: string,
  isActive: boolean,
  onClick: () => void,
  activeColor: string
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
        isActive ? "shadow-lg scale-105" : ""
      }`}
      style={{
        backgroundColor: isActive || isHovered ? activeColor : "transparent",
        color: isActive || isHovered ? "white" : activeColor,
        borderColor: activeColor,
        borderWidth: "2px"
      }}
    >
      {label}
    </button>
  )
}
