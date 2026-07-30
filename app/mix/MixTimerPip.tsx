"use client"

import { FaPlay, FaPause, FaStop, FaRedo, FaPlus, FaMinus } from "react-icons/fa"

type SessionType = "work" | "break" | null

interface MixTimerPipProps {
  timer: number
  initialTime: number
  sessionType: SessionType
  isOvertime: boolean
  isPaused: boolean
  activeColor: string
  formatTime: (seconds: number) => string
  onTogglePause: () => void
  onStop: () => void
  onRestart: () => void
  onAdjustTime: (deltaSeconds: number) => void
}

export default function MixTimerPip({
  timer,
  initialTime,
  sessionType,
  isOvertime,
  isPaused,
  activeColor,
  formatTime,
  onTogglePause,
  onStop,
  onRestart,
  onAdjustTime,
}: MixTimerPipProps) {
  const pipButtonStyle = {
    border: `2px solid ${activeColor}`,
    color: activeColor,
    background: "white",
    borderRadius: "999px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

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
      {(sessionType || isOvertime) && (
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
          {isOvertime ? "flow" : sessionType}
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
        {isOvertime && "+"}{formatTime(timer)}
      </div>
      {!isOvertime && (
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            onClick={() => onAdjustTime(-60)}
            disabled={timer < 60}
            title="-1 min"
            style={{ ...pipButtonStyle, padding: "0.35rem 0.5rem", opacity: timer < 60 ? 0.4 : 1 }}
          >
            <FaMinus size={10} style={{ marginRight: 2 }} />
            1m
          </button>
          <button
            onClick={() => onAdjustTime(60)}
            title="+1 min"
            style={{ ...pipButtonStyle, padding: "0.35rem 0.5rem" }}
          >
            <FaPlus size={10} style={{ marginRight: 2 }} />
            1m
          </button>
          <button
            onClick={() => onAdjustTime(300)}
            title="+5 min"
            style={{ ...pipButtonStyle, padding: "0.35rem 0.5rem" }}
          >
            <FaPlus size={10} style={{ marginRight: 2 }} />
            5m
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button onClick={onTogglePause} style={{ ...pipButtonStyle, padding: "0.6rem" }}>
          {isPaused ? <FaPlay size={16} /> : <FaPause size={16} />}
        </button>
        {!isOvertime && (
          <button
            onClick={onRestart}
            disabled={timer === initialTime}
            title="Restart"
            style={{ ...pipButtonStyle, padding: "0.6rem", opacity: timer === initialTime ? 0.4 : 1 }}
          >
            <FaRedo size={16} />
          </button>
        )}
        <button onClick={onStop} title={isOvertime ? "Wrap Up" : "Stop"} style={{ ...pipButtonStyle, padding: "0.6rem" }}>
          <FaStop size={16} />
        </button>
      </div>
    </div>
  )
}
