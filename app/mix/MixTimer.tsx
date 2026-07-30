"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FaPlay, FaPause, FaStop, FaRedo, FaExternalLinkAlt, FaMinus, FaPlus } from "react-icons/fa"
import { TimerButton, timerPresets } from "./constants"

type SessionType = "work" | "break" | null

interface MixTimerProps {
  timer: number | null
  isPaused: boolean
  initialTime: number | null
  sessionType: SessionType
  activeColor: string
  isCustomTimerOpen: boolean
  setIsCustomTimerOpen: (value: boolean) => void
  setIsPaused: (value: boolean) => void
  setTimer: (value: number | null) => void
  setInitialTime: (value: number | null) => void
  setSessionType: (value: SessionType) => void
  setBreakDuration: (value: number | null) => void
  startTimer: (seconds: number, breakSeconds?: number | null) => void
  formatTime: (seconds: number) => string
  pipSupported: boolean
  pipActive: boolean
  onOpenPip: () => void
  onClosePip: () => void
}

export default function MixTimer({
  timer,
  isPaused,
  initialTime,
  sessionType,
  activeColor,
  isCustomTimerOpen,
  setIsCustomTimerOpen,
  setIsPaused,
  setTimer,
  setInitialTime,
  setSessionType,
  setBreakDuration,
  startTimer,
  formatTime,
  pipSupported,
  pipActive,
  onOpenPip,
  onClosePip,
}: MixTimerProps) {
  const [workH, setWorkH] = useState(0)
  const [workM, setWorkM] = useState(25)
  const [workS, setWorkS] = useState(0)
  const [breakH, setBreakH] = useState(0)
  const [breakM, setBreakM] = useState(0)
  const [breakS, setBreakS] = useState(0)

  const resetTimer = () => {
    setTimer(null)
    setInitialTime(null)
    setIsPaused(false)
    setSessionType(null)
    setBreakDuration(null)
  }

  const workTotalSeconds = workH * 3600 + workM * 60 + workS
  const breakTotalSeconds = breakH * 3600 + breakM * 60 + breakS

  const closeCustomTimer = () => setIsCustomTimerOpen(false)

  const submitCustomTimer = () => {
    if (workTotalSeconds <= 0) return
    startTimer(workTotalSeconds, breakTotalSeconds > 0 ? breakTotalSeconds : null)
  }

  useEffect(() => {
    if (!isCustomTimerOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCustomTimer()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isCustomTimerOpen])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] animate-in fade-in duration-500">
      {timer === null ? (
        <div className="flex flex-col items-center gap-8">

          {/* Pomodoro Section */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: activeColor }}>Pomodoro</span>
            <div className="flex flex-wrap justify-center gap-3">
              {timerPresets.filter(p => p.break).map((preset) => (
                <TimerButton
                  key={preset.label}
                  label={preset.label}
                  onClick={() => startTimer(preset.work * 60, preset.break ? preset.break * 60 : null)}
                  activeColor={activeColor}
                />
              ))}
            </div>
          </div>

          {/* Straight Timer Section */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: activeColor }}>Timer</span>
            <div className="flex flex-wrap justify-center gap-3">
              {timerPresets.filter(p => !p.break).map((preset) => (
                <TimerButton
                  key={preset.label}
                  label={preset.label}
                  onClick={() => startTimer(preset.work * 60, null)}
                  activeColor={activeColor}
                />
              ))}
              <TimerButton label="Custom" onClick={() => setIsCustomTimerOpen(true)} activeColor={activeColor} />
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center gap-8">
           {pipSupported && (
             <button
               onClick={pipActive ? onClosePip : onOpenPip}
               className="flex items-center gap-2 px-4 py-2 rounded-full border-2 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 bg-white/50 backdrop-blur-sm"
               style={{ borderColor: activeColor, color: activeColor }}
             >
               <FaExternalLinkAlt size={12} />
               <span>{pipActive ? "Bring Back" : "Pop Out"}</span>
             </button>
           )}
           {sessionType && (
            <div className="text-2xl font-bold uppercase tracking-widest mb-4 transition-colors duration-500" style={{ color: activeColor }}>
              {sessionType}
            </div>
           )}
           <div className="text-[12vw] font-black font-mono leading-none tracking-tighter transition-colors duration-500 select-none" style={{ color: activeColor }}>
             {formatTime(timer)}
           </div>
           {isPaused && timer === initialTime ? (
             <div className="flex flex-col items-center gap-4">
               <button
                 onClick={() => setIsPaused(false)}
                 className="px-12 py-6 rounded-full text-2xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3"
                 style={{ backgroundColor: activeColor }}
               >
                 <FaPlay size={24} />
                 <span>Start Now</span>
               </button>
               <button
                 onClick={resetTimer}
                 className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
                 style={{ color: activeColor }}
               >
                 Cancel
               </button>
             </div>
           ) : (
           <div className="flex items-center gap-6">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-6 rounded-full border-2 transition-all hover:scale-105 active:scale-95 bg-white/50 backdrop-blur-sm"
                style={{ borderColor: activeColor, color: activeColor }}
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <FaPlay size={32} /> : <FaPause size={32} />}
              </button>

              <button
                onClick={() => {
                  if (initialTime) {
                    setTimer(initialTime)
                    setIsPaused(true)
                  }
                }}
                className="p-6 rounded-full border-2 transition-all hover:scale-105 active:scale-95 bg-white/50 backdrop-blur-sm"
                style={{ borderColor: activeColor, color: activeColor }}
                title="Restart"
              >
                <FaRedo size={32} />
              </button>

              <button
                onClick={resetTimer}
                className="p-6 rounded-full border-2 transition-all hover:scale-105 active:scale-95 hover:bg-red-50 hover:border-red-500 hover:text-red-500 bg-white/50 backdrop-blur-sm"
                style={{ borderColor: activeColor, color: activeColor }}
                title="Stop"
              >
                <FaStop size={32} />
              </button>
           </div>
           )}
        </div>
      )}

      {/* Custom Timer Dialog */}
      {isCustomTimerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCustomTimer()
          }}
        >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm"
            >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submitCustomTimer()
                  }}
                >
                  <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: activeColor }}>Set Custom Timer</h3>

                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">Focus</span>
                  <div className="flex gap-2 mt-2 mb-5">
                    <TimeUnitField label="hr" value={workH} onChange={setWorkH} max={23} activeColor={activeColor} autoFocus />
                    <TimeUnitField label="min" value={workM} onChange={setWorkM} max={59} activeColor={activeColor} />
                    <TimeUnitField label="sec" value={workS} onChange={setWorkS} max={59} activeColor={activeColor} />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">Break (optional)</span>
                  <div className="flex gap-2 mt-2">
                    <TimeUnitField label="hr" value={breakH} onChange={setBreakH} max={23} activeColor={activeColor} />
                    <TimeUnitField label="min" value={breakM} onChange={setBreakM} max={59} activeColor={activeColor} />
                    <TimeUnitField label="sec" value={breakS} onChange={setBreakS} max={59} activeColor={activeColor} />
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <button
                        type="submit"
                        disabled={workTotalSeconds <= 0}
                        className="px-8 py-3 rounded-xl font-bold text-white transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: activeColor }}
                      >
                        Start
                    </button>
                    <button
                      type="button"
                      onClick={closeCustomTimer}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 w-full text-center transition-colors py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
            </motion.div>
        </div>
      )}
    </div>
  )
}

function TimeUnitField({
  label,
  value,
  onChange,
  max,
  activeColor,
  autoFocus,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  max: number
  activeColor: string
  autoFocus?: boolean
}) {
  const clamp = (n: number) => Math.min(max, Math.max(0, n))

  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full flex items-center rounded-xl border-2 border-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          className="px-2 py-3 text-gray-400 hover:text-gray-700 transition-colors"
          tabIndex={-1}
        >
          <FaMinus size={10} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={0}
          max={max}
          autoFocus={autoFocus}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10)
            onChange(Number.isNaN(parsed) ? 0 : clamp(parsed))
          }}
          onFocus={(e) => e.target.select()}
          className="w-full min-w-0 px-1 py-3 text-center text-lg font-bold text-gray-700 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ caretColor: activeColor }}
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          className="px-2 py-3 text-gray-400 hover:text-gray-700 transition-colors"
          tabIndex={-1}
        >
          <FaPlus size={10} />
        </button>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    </div>
  )
}
