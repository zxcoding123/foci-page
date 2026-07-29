"use client"

import { FaPlay, FaPause, FaStop } from "react-icons/fa"

type SessionType = "work" | "break" | null

interface MixTimerPipProps {
  timer: number
  sessionType: SessionType
  isPaused: boolean
  activeColor: string
  formatTime: (seconds: number) => string
  onTogglePause: () => void
  onStop: () => void
}

export default function MixTimerPip({
  timer,
  sessionType,
  isPaused,
  activeColor,
  formatTime,
  onTogglePause,
  onStop,
}: MixTimerPipProps) {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        gap: "0.75rem",
        background: "#F9F8F0",
        boxSizing: "border-box",
      }}
    >
      {sessionType && (
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: activeColor,
            opacity: 0.7,
          }}
        >
          {sessionType}
        </div>
      )}
      <div
        style={{
          fontSize: "3rem",
          fontWeight: 900,
          fontFamily: "monospace",
          color: activeColor,
          lineHeight: 1,
        }}
      >
        {formatTime(timer)}
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={onTogglePause}
          style={{
            border: `2px solid ${activeColor}`,
            color: activeColor,
            background: "white",
            borderRadius: "999px",
            padding: "0.6rem",
            cursor: "pointer",
            display: "flex",
          }}
        >
          {isPaused ? <FaPlay size={16} /> : <FaPause size={16} />}
        </button>
        <button
          onClick={onStop}
          style={{
            border: `2px solid ${activeColor}`,
            color: activeColor,
            background: "white",
            borderRadius: "999px",
            padding: "0.6rem",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <FaStop size={16} />
        </button>
      </div>
    </div>
  )
}
