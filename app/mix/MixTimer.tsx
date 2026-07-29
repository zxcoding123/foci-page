"use client"

import { motion } from "framer-motion"
import { FaPlay, FaPause, FaStop, FaRedo, FaExternalLinkAlt } from "react-icons/fa"
import { TimerButton, timerPresets } from "./constants"

type SessionType = "work" | "break" | null

interface MixTimerProps {
  timer: number | null
  isPaused: boolean
  initialTime: number | null
  sessionType: SessionType
  activeColor: string
  isCustomTimerOpen: boolean
  customMinutes: string
  customBreakMinutes: string
  setCustomMinutes: (value: string) => void
  setCustomBreakMinutes: (value: string) => void
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
  customMinutes,
  customBreakMinutes,
  setCustomMinutes,
  setCustomBreakMinutes,
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
  const resetTimer = () => {
    setTimer(null)
    setInitialTime(null)
    setIsPaused(false)
    setSessionType(null)
    setBreakDuration(null)
  }

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm"
            >
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: activeColor }}>Set Custom Timer</h3>
                <div className="flex gap-3">
                    <input
                      type="number"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      placeholder="Work (mins)"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none text-lg font-bold text-gray-700"
                      style={{ caretColor: activeColor }}
                      autoFocus
                    />
                    <input
                      type="number"
                      value={customBreakMinutes}
                      onChange={(e) => setCustomBreakMinutes(e.target.value)}
                      placeholder="Break (mins)"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:outline-none text-lg font-bold text-gray-700"
                      style={{ caretColor: activeColor }}
                    />
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                      onClick={() => {
                          if (customMinutes) {
                              startTimer(
                                parseInt(customMinutes) * 60,
                                customBreakMinutes ? parseInt(customBreakMinutes) * 60 : null
                              )
                          }
                      }}
                      className="px-8 py-3 rounded-xl font-bold text-white transition-transform active:scale-95"
                      style={{ backgroundColor: activeColor }}
                    >
                      Start
                  </button>
                  <button
                  onClick={() => setIsCustomTimerOpen(false)}
                  className="text-sm font-medium text-gray-400 hover:text-gray-600 w-full text-center transition-colors py-2"
                >
                  Cancel
                </button>
                </div>
            </motion.div>
        </div>
      )}
    </div>
  )
}
