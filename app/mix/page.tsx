"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { FaCheck } from "react-icons/fa"
import Navbar from "@/components/sections/header"
import Footer from "@/components/sections/footer"
import CustomCursor from "@/components/ui/customCursor";
import { sounds, soundSources, TabButton, Todo, AnalyticsData, Priority, Difficulty, difficultyPresets } from "./constants"
import MixTimer from "./MixTimer"
import MixAmbience from "./MixAmbience"
import MixTodos from "./MixTodos"
import MixAnalytics from "./MixAnalytics"
import MixTimerPip from "./MixTimerPip"

type Tab = "timer" | "ambience" | "todo" | "analytics"

export default function MixPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ambience")
  const [pipWindow, setPipWindow] = useState<Window | null>(null)
  const [pipSupported, setPipSupported] = useState(false)
  const [activeIds, setActiveIds] = useState<string[]>(["fire"])
  const [themeId, setThemeId] = useState<string>("fire")
  const [volumes, setVolumes] = useState<Record<string, number>>({ fire: 40 })
  const [timer, setTimer] = useState<number | null>(null)
  const [isCustomTimerOpen, setIsCustomTimerOpen] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [newTodoPomos, setNewTodoPomos] = useState(1)
  const [newTodoTags, setNewTodoTags] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>("medium")
  const [newTodoDeadline, setNewTodoDeadline] = useState("")
  const [newTodoDifficulty, setNewTodoDifficulty] = useState<Difficulty>("easy")
  const [oneThingView, setOneThingView] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [isChaosMode, setIsChaosMode] = useState(false)
  const [chaosText, setChaosText] = useState("")
  const [dailyGoal, setDailyGoal] = useState(8)
  const [isPaused, setIsPaused] = useState(false)
  const [initialTime, setInitialTime] = useState<number | null>(null)
  const [isTodosLoaded, setIsTodosLoaded] = useState(false)
  const [isMixLoaded, setIsMixLoaded] = useState(false)
  const [sessionType, setSessionType] = useState<"work" | "break" | null>(null)
  const [breakDuration, setBreakDuration] = useState<number | null>(null)
  const [dailySessions, setDailySessions] = useState(0)
  const [analytics, setAnalytics] = useState<AnalyticsData>({ history: [], streak: 0, lastSessionDate: null, longestSession: 0, soundUsage: {}, completions: [] })

  // Auto-sequence: queued task ids waiting to auto-load once the current one finishes
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [focusQueue, setFocusQueue] = useState<string[]>([])

  // Overtime / flow tracking
  const [isOvertime, setIsOvertime] = useState(false)
  const [overtimeSeconds, setOvertimeSeconds] = useState(0)
  const [awaitingBreakChoice, setAwaitingBreakChoice] = useState(false)
  const breakChoiceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const workDurationRef = useRef(0)

  const activeSound = sounds.find((s) => s.id === themeId) || sounds[0]
  const activeColor = activeSound?.color || "#FF6B35"

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const fadeIntervals = useRef<Record<string, NodeJS.Timeout>>({})

  const recordWorkSession = (duration: number) => {
    const now = new Date()
    const todayStr = now.toDateString()
    const lastSession = analytics.lastSessionDate ? new Date(analytics.lastSessionDate) : null
    const lastSessionStr = lastSession ? lastSession.toDateString() : null

    let newStreak = analytics.streak
    if (lastSessionStr !== todayStr) {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        if (lastSessionStr === yesterday.toDateString()) {
            newStreak++
        } else {
            newStreak = 1
        }
    } else if (newStreak === 0) {
        newStreak = 1
    }

    const newHistory = [...analytics.history, { date: now.toISOString(), duration }]
    const newLongest = Math.max(analytics.longestSession, duration)

    const newSoundUsage = { ...analytics.soundUsage }
    activeIds.forEach(id => {
        newSoundUsage[id] = (newSoundUsage[id] || 0) + duration
    })

    setAnalytics(prev => ({ ...prev, history: newHistory, streak: newStreak, lastSessionDate: now.toISOString(), longestSession: newLongest, soundUsage: newSoundUsage }))
  }

  const startTaskTimer = (todo: Todo) => {
    const preset = difficultyPresets[todo.difficulty || "easy"]
    const workSeconds = preset.work * 60
    const breakSeconds = preset.break * 60
    workDurationRef.current = workSeconds
    setTimer(workSeconds)
    setInitialTime(workSeconds)
    setIsPaused(false)
    setIsCustomTimerOpen(false)
    setSessionType("work")
    setBreakDuration(breakSeconds)
    setCurrentTaskId(todo.id)
    setIsOvertime(false)
    setOvertimeSeconds(0)
    setAwaitingBreakChoice(false)
  }

  const startQueue = () => {
    const incomplete = todos.filter(t => !t.completed)
    if (incomplete.length === 0) return
    const [first, ...rest] = incomplete
    setFocusQueue(rest.map(t => t.id))
    startTaskTimer(first)
  }

  const advanceQueueOrEnd = () => {
    const nextId = focusQueue[0]
    const nextTodo = nextId ? todos.find(t => t.id === nextId) : undefined
    if (nextTodo) {
      setFocusQueue(prev => prev.slice(1))
      startTaskTimer(nextTodo)
      return
    }
    setTimer(null)
    setInitialTime(null)
    setIsPaused(false)
    setSessionType(null)
    setBreakDuration(null)
    setCurrentTaskId(null)
    setFocusQueue([])
    setIsOvertime(false)
    setOvertimeSeconds(0)
  }

  const resolveBreakChoice = (choice: "break" | "flow") => {
    if (breakChoiceTimeoutRef.current) {
      clearTimeout(breakChoiceTimeoutRef.current)
      breakChoiceTimeoutRef.current = null
    }
    setAwaitingBreakChoice(false)
    if (choice === "break" && breakDuration) {
      setTimer(breakDuration)
      setInitialTime(breakDuration)
      setBreakDuration(null)
      setSessionType("break")
    } else {
      setIsOvertime(true)
      setOvertimeSeconds(0)
      setBreakDuration(null)
    }
  }

  const wrapUpFlow = () => {
    recordWorkSession(workDurationRef.current + overtimeSeconds)
    advanceQueueOrEnd()
  }

  const endSession = () => {
    if (breakChoiceTimeoutRef.current) {
      clearTimeout(breakChoiceTimeoutRef.current)
      breakChoiceTimeoutRef.current = null
    }
    setTimer(null)
    setInitialTime(null)
    setIsPaused(false)
    setSessionType(null)
    setBreakDuration(null)
    setCurrentTaskId(null)
    setFocusQueue([])
    setIsOvertime(false)
    setOvertimeSeconds(0)
    setAwaitingBreakChoice(false)
  }

  useEffect(() => {
    if (timer === null || isPaused || awaitingBreakChoice || isOvertime) return

    if (timer <= 0) {
      if (sessionType === "work") {
        setDailySessions(prev => prev + 1)
        if (currentTaskId) {
          setTodos(prev => prev.map(t => t.id === currentTaskId ? { ...t, completedPomos: (t.completedPomos || 0) + 1 } : t))
        }

        if (breakDuration) {
          setAwaitingBreakChoice(true)
          breakChoiceTimeoutRef.current = setTimeout(() => resolveBreakChoice("break"), 12000)
        } else {
          recordWorkSession(workDurationRef.current)
          advanceQueueOrEnd()
        }
      } else if (sessionType === "break") {
        recordWorkSession(workDurationRef.current)
        advanceQueueOrEnd()
      }
      return
    }

    const interval = setInterval(() => {
      setTimer((t) => (t !== null && t > 0 ? t - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [timer, isPaused, sessionType, breakDuration, awaitingBreakChoice, isOvertime, currentTaskId])

  useEffect(() => {
    if (!isOvertime || isPaused) return
    const interval = setInterval(() => setOvertimeSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isOvertime, isPaused])

  useEffect(() => {
    return () => {
      if (breakChoiceTimeoutRef.current) clearTimeout(breakChoiceTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const savedTodos = localStorage.getItem("renew-todos")
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos)
        const migratedTodos = parsedTodos.map((todo: any) => ({
          ...todo,
          pomoSessions: todo.pomoSessions || 1,
          completedPomos: todo.completedPomos || 0,
          tags: todo.tags || [],
          priority: todo.priority || "medium",
          deadline: todo.deadline,
          difficulty: todo.difficulty || "easy",
        }))
        setTodos(migratedTodos)
      } catch (e) {
        console.error("Failed to parse todos", e)
      }
    }
    setIsTodosLoaded(true)
  }, [])

  useEffect(() => {
    if (isTodosLoaded) {
      localStorage.setItem("renew-todos", JSON.stringify(todos))
    }
  }, [todos, isTodosLoaded])

  useEffect(() => {
    const savedActiveIds = localStorage.getItem("renew-active-ids")
    if (savedActiveIds) {
        try { setActiveIds(JSON.parse(savedActiveIds)) } catch (e) { console.error(e) }
    }

    const savedThemeId = localStorage.getItem("renew-theme-id")
    if (savedThemeId) setThemeId(savedThemeId)

    const savedVolumes = localStorage.getItem("renew-volumes")
    if (savedVolumes) {
        try { setVolumes(JSON.parse(savedVolumes)) } catch (e) { console.error(e) }
    }

    const savedViewMode = localStorage.getItem("renew-view-mode")
    if (savedViewMode) setViewMode(savedViewMode as "list" | "grid")

    setIsMixLoaded(true)
  }, [])

  useEffect(() => {
    if (isMixLoaded) {
      localStorage.setItem("renew-active-ids", JSON.stringify(activeIds))
      localStorage.setItem("renew-theme-id", themeId)
      localStorage.setItem("renew-volumes", JSON.stringify(volumes))
      localStorage.setItem("renew-view-mode", viewMode)
    }
  }, [activeIds, themeId, volumes, viewMode, isMixLoaded])

  useEffect(() => {
    if (isMixLoaded) {
        Object.keys(soundSources).forEach(id => {
            const audio = audioRefs.current[id]
            if (audio) audio.volume = (volumes[id] ?? 0) / 100
        })
        activeIds.forEach(id => {
            const audio = audioRefs.current[id]
            if (audio && audio.paused) audio.play().catch(e => console.log("Autoplay prevented", e))
        })
    }
  }, [isMixLoaded])

  useEffect(() => {
    const savedSessions = localStorage.getItem("renew-daily-sessions")
    if (savedSessions) setDailySessions(parseInt(savedSessions))
  }, [])

  useEffect(() => {
    localStorage.setItem("renew-daily-sessions", dailySessions.toString())
  }, [dailySessions])

  useEffect(() => {
    const savedGoal = localStorage.getItem("renew-daily-goal")
    if (savedGoal) setDailyGoal(parseInt(savedGoal))
  }, [])

  useEffect(() => {
    localStorage.setItem("renew-daily-goal", dailyGoal.toString())
  }, [dailyGoal])

  useEffect(() => {
    const savedAnalytics = localStorage.getItem("renew-analytics")
    if (savedAnalytics) {
      try {
        const parsed = JSON.parse(savedAnalytics)
        setAnalytics({
            ...parsed,
            completions: parsed.completions || []
        })
      } catch (e) { console.error(e) }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("renew-analytics", JSON.stringify(analytics))
  }, [analytics])

  useEffect(() => {
    setPipSupported(typeof window !== "undefined" && "documentPictureInPicture" in window)
  }, [])

  useEffect(() => {
    if (timer === null && pipWindow) {
      pipWindow.close()
      setPipWindow(null)
    }
  }, [timer])

  useEffect(() => {
  Object.keys(soundSources).forEach((id) => {
    const audio = new Audio(soundSources[id])
    audio.loop = true
    audio.volume = (volumes[id] ?? 0) / 100
    audioRefs.current[id] = audio
  })

  return () => {
    Object.values(audioRefs.current).forEach((audio) => {
      audio?.pause()
    })
  }
}, [])

 const handleVolumeChange = (id: string, value: number[]) => {
  const vol = value[0]

  setVolumes((prev) => ({ ...prev, [id]: vol }))

  const audio = audioRefs.current[id]
  if (audio) audio.volume = vol / 100
}

const toggleSound = (id: string) => {
  const audio = audioRefs.current[id]
  if (!audio) return

  // Clear any existing fade interval for this sound
  if (fadeIntervals.current[id]) clearInterval(fadeIntervals.current[id])

  const targetVol = (volumes[id] ?? 0) / 100

  if (activeIds.includes(id)) {
    // Deactivate (Fade Out)
    setActiveIds(activeIds.filter((i) => i !== id))

    let vol = audio.volume
    fadeIntervals.current[id] = setInterval(() => {
      vol = Math.max(0, vol - 0.05)
      audio.volume = vol
      if (vol <= 0) {
        audio.pause()
        clearInterval(fadeIntervals.current[id])
      }
    }, 50)
  } else {
    // Activate (Fade In)
    setActiveIds([...activeIds, id])
    audio.volume = 0
    audio.play()

    let vol = 0
    fadeIntervals.current[id] = setInterval(() => {
      vol = Math.min(targetVol, vol + 0.05)
      audio.volume = vol
      if (vol >= targetVol) {
        clearInterval(fadeIntervals.current[id])
      }
    }, 50)
  }

  setThemeId(id)
}

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    const tags = newTodoTags.split(",").map(t => t.trim()).filter(t => t)
    setTodos([{ id: Date.now().toString(), text: newTodo, completed: false, pomoSessions: newTodoPomos, completedPomos: 0, tags, priority: newTodoPriority, deadline: newTodoDeadline || undefined, difficulty: newTodoDifficulty }, ...todos])
    setNewTodo("")
    setNewTodoPomos(1)
    setNewTodoTags("")
    setNewTodoPriority("medium")
    setNewTodoDeadline("")
    setNewTodoDifficulty("easy")
  }

  const toggleTodo = (id: string) => {
    if (oneThingView) {
        const currentTask = todos.find(t => !t.completed)
        if (currentTask && currentTask.id === id) {
            setOneThingView(false)
        }
    }

    // Analytics: Track completion
    const todo = todos.find(t => t.id === id)
    if (todo && !todo.completed) {
        setAnalytics(prev => ({
            ...prev,
            completions: [...(prev.completions || []), { date: new Date().toISOString(), priority: todo.priority }]
        }))
    }
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id))
  }

  const incrementPomo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completedPomos: (t.completedPomos || 0) + 1 } : t)))
    setDailySessions(prev => prev + 1)
  }

  const updatePomoEstimate = (id: string, newEstimate: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, pomoSessions: newEstimate } : t)))
  }

  const autoSortTasks = () => {
    const getDeadlineScore = (deadline?: string): number => {
      if (!deadline) return 0;
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare dates only
      const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

      if (daysUntil < 0) return 10; // Overdue
      if (daysUntil === 0) return 5; // Due today
      if (daysUntil === 1) return 3; // Due tomorrow
      return 1 / daysUntil;
    };

    const calculateHeat = (todo: typeof todos[0]) => {
      if (todo.completed) return -Infinity;
      const priorityMap = { high: 3, medium: 2, low: 1 };
      const priorityScore = priorityMap[todo.priority] * 2;
      const pomoScore = todo.pomoSessions * 0.5;
      const deadlineScore = getDeadlineScore(todo.deadline);
      return priorityScore + pomoScore + deadlineScore;
    };

    const sortedTodos = [...todos].sort((a, b) => calculateHeat(b) - calculateHeat(a));
    setTodos(sortedTodos);
  };

  const handleChaosCleanup = () => {
    if (!chaosText.trim()) return;

    // This is a simplified simulation of an AI model processing the text.
    // A real implementation would involve an API call to a language model.
    const lines = chaosText.split('\n').filter(line => line.trim() !== '');
    const newTodos = lines.map(line => {
        let text = line;
        let priority: Priority = "medium";
        let pomoSessions = 1;
        let tags: string[] = [];

        // Simple priority detection
        if (/\b(urgent|important|asap|!)\b/i.test(text)) {
            priority = "high";
        } else if (/\b(later|sometime)\b/i.test(text)) {
            priority = "low";
        }

        // Simple Pomodoro detection (e.g., "for 3 pomos", " (2p)")
        const pomoMatch = text.match(/(?:for |\(|)(\d+)\s?(?:pomo|pomos|p)\b/i);
        if (pomoMatch && pomoMatch[1]) {
            pomoSessions = parseInt(pomoMatch[1], 10) || 1;
            text = text.replace(pomoMatch[0], '').trim(); // Clean up the text
        }

        // Simple tag detection (e.g., "#work", "#personal")
        const tagMatches = text.match(/#(\w+)/g);
        if (tagMatches) {
            tags = tagMatches.map(tag => tag.substring(1));
            text = text.replace(/#(\w+)/g, '').trim(); // Clean up the text
        }

        return { id: `${Date.now()}-${Math.random()}`, text: text.trim(), completed: false, pomoSessions, completedPomos: 0, tags, priority, deadline: undefined, difficulty: "easy" as Difficulty };
    });

    setTodos(prevTodos => [...newTodos, ...prevTodos]);
    setChaosText("");
    setIsChaosMode(false);
  };

  const startTimer = (seconds: number, breakSeconds?: number | null) => {
    workDurationRef.current = seconds
    setTimer(seconds)
    setInitialTime(seconds)
    setIsPaused(true)
    setIsCustomTimerOpen(false)
    setSessionType("work")
    setBreakDuration(breakSeconds || null)
    setCurrentTaskId(null)
    setFocusQueue([])
    setIsOvertime(false)
    setOvertimeSeconds(0)
    setAwaitingBreakChoice(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const openPip = async () => {
    if (!pipSupported || pipWindow || timer === null) return
    try {
      const pipWin = await (window as any).documentPictureInPicture.requestWindow({ width: 280, height: 220 })
      pipWin.document.title = "Foci Timer"
      pipWin.document.body.style.margin = "0"
      pipWin.addEventListener("pagehide", () => setPipWindow(null))
      setPipWindow(pipWin)
    } catch (e) {
      console.error("Failed to open Picture-in-Picture window", e)
    }
  }

  const closePip = () => {
    pipWindow?.close()
    setPipWindow(null)
  }

  const handleTabChange = (tab: Tab) => {
    if (tab !== "timer" && timer !== null && !pipWindow) {
      openPip()
    } else if (tab === "timer" && pipWindow) {
      closePip()
    }
    setActiveTab(tab)
  }

  const applyRecommendation = () => {
    const hour = new Date().getHours()
    const todayStr = new Date().toDateString()
    const durationToday = analytics.history
        .filter(h => new Date(h.date).toDateString() === todayStr)
        .reduce((acc, curr) => acc + curr.duration, 0)

    let favoriteSound = "forest"
    let maxUsage = 0
    Object.entries(analytics.soundUsage).forEach(([id, usage]) => {
        if (usage > maxUsage) {
            maxUsage = usage
            favoriteSound = id
        }
    })

    let recId = "forest"
    if (hour >= 5 && hour < 12) recId = "forest"
    else if (hour >= 12 && hour < 17) recId = "library"
    else if (hour >= 17 && hour < 22) recId = "fire"
    else recId = "night"

    if (durationToday > 7200) { // > 2 hours
        recId = "rain"
    } else if (maxUsage > 3600 && Math.random() > 0.4) {
        // If favorite sound used > 1 hour total, bias towards it
        recId = favoriteSound
    }

    if (!activeIds.includes(recId)) {
        toggleSound(recId)
    }
    setThemeId(recId)
  }

  const totalPomos = todos
    .filter((todo) => !todo.completed)
    .reduce((sum, todo) => sum + todo.pomoSessions, 0)

  const currentTask = todos.find(todo => !todo.completed)

  const currentQueueTask = currentTaskId ? todos.find(t => t.id === currentTaskId) : undefined
  const nextQueueTask = focusQueue.length > 0 ? todos.find(t => t.id === focusQueue[0]) : undefined

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"

    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
  }

  // Analytics Calculations
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const weeklyData = last7Days.map(day => {
    const dayStr = day.toDateString()
    const duration = analytics.history
      .filter(h => new Date(h.date).toDateString() === dayStr)
      .reduce((acc, curr) => acc + curr.duration, 0)
    return { day: day.toLocaleDateString('en-US', { weekday: 'short' }), duration }
  })
  const maxDailyDuration = Math.max(...weeklyData.map(d => d.duration), 1)

  // Energy Mapping Calculation
  const energyData = Array(24).fill(0);
  (analytics.completions || []).filter(c => c.priority === 'high').forEach(c => {
      const hour = new Date(c.date).getHours();
      energyData[hour]++;
  });
  const maxEnergy = Math.max(...energyData, 1);

  // Focus Streak Visual Calculation
  const todayStr = new Date().toDateString();
  const durationToday = analytics.history
      .filter(h => new Date(h.date).toDateString() === todayStr)
      .reduce((acc, curr) => acc + curr.duration, 0);
  const focusLevel = Math.floor(durationToday / (25 * 60)); // 25 mins in seconds

  return (
    <>
      <Navbar />
        <CustomCursor />
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#F9F8F0]">
        {/* Top Left Blob */}
        <motion.div
            animate={{
              scale: [1, 1.1, 0.9, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, -30, 0],
              y: [0, 30, -20, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[25vh] h-[25vh] rounded-full blur-[120px] transition-colors duration-1000"
            style={{ backgroundColor: activeColor }}
        />
        {/* Top Right Blob */}
        <motion.div
            animate={{
              scale: [1, 1.2, 0.9, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -40, 20, 0],
              y: [0, 50, 10, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -top-[10%] -right-[10%] w-[35vh] h-[35vh] rounded-full blur-[120px] transition-colors duration-1000"
            style={{ backgroundColor: activeColor }}
        />
        {/* Granular Noise Overlay */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}></div>
      </div>

      <main className="relative z-10 min-h-screen pt-32">
        <div className="max-w-6xl mx-auto mb-45">
          {oneThingView && currentTask ? (
            <div className="text-center flex flex-col items-center justify-center min-h-[40vh]">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[8vw] leading-tight font-black tracking-tighter mb-8 transition-colors duration-500"
                    style={{ color: activeColor }}
                >
                    {currentTask.text}
                </motion.h1>
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => toggleTodo(currentTask.id)}
                    className="flex items-center gap-3 px-8 py-4 rounded-full border-2 text-xl font-bold transition-all hover:scale-105 active:scale-95"
                    style={{
                        borderColor: activeColor,
                        color: activeColor,
                    }}
                >
                    <FaCheck />
                    <span>Done</span>
                </motion.button>
            </div>
          ) : (
          <>
          {/* Section Header */}
          <header className="mb-12">
            <h1
              className="text-[10vw] leading-[0.85] font-black tracking-tighter uppercase mb-16 transition-colors duration-500 text-center font-serif"
              style={{ color: activeColor }}
            >
              Let's focus.
            </h1>
             <h1
              className="text-2xl leading-[0.85] font-black tracking-tighter mb-8 transition-colors duration-500 text-center"
              style={{ color: activeColor }}
             >
              Create your mix and get into the most comfortable zone you can.
            </h1>
            {dailySessions > 0 && (
              <div className="text-center font-bold uppercase tracking-widest text-sm opacity-60 mt-4" style={{ color: activeColor }}>
                Sessions Completed Today: {dailySessions}
              </div>
            )}
          </header>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-12">
            {["timer", "ambience", "todo", "analytics"].map((tab) => (
              <TabButton
                key={tab}
                label={tab === "todo" ? "Plan" : tab}
                isActive={activeTab === tab}
                onClick={() => handleTabChange(tab as Tab)}
                activeColor={activeColor}
              />
            ))}
          </div>

          {activeTab === "timer" && (
            <MixTimer
              timer={timer}
              isPaused={isPaused}
              initialTime={initialTime}
              sessionType={sessionType}
              activeColor={activeColor}
              isCustomTimerOpen={isCustomTimerOpen}
              setIsCustomTimerOpen={setIsCustomTimerOpen}
              setIsPaused={setIsPaused}
              setTimer={setTimer}
              startTimer={startTimer}
              onEndSession={endSession}
              formatTime={formatTime}
              pipSupported={pipSupported}
              pipActive={pipWindow !== null}
              onOpenPip={openPip}
              onClosePip={closePip}
              currentTaskText={currentQueueTask?.text}
              nextTaskText={nextQueueTask?.text}
              isOvertime={isOvertime}
              overtimeSeconds={overtimeSeconds}
              awaitingBreakChoice={awaitingBreakChoice}
              onResolveBreakChoice={resolveBreakChoice}
              onWrapUpFlow={wrapUpFlow}
            />
          )}

          {activeTab === "ambience" && (
            <MixAmbience
              activeIds={activeIds}
              themeId={themeId}
              volumes={volumes}
              activeColor={activeColor}
              toggleSound={toggleSound}
              handleVolumeChange={handleVolumeChange}
              applyRecommendation={applyRecommendation}
            />
          )}

          {activeTab === "todo" && (
            <MixTodos
              todos={todos}
              setTodos={setTodos}
              newTodo={newTodo}
              setNewTodo={setNewTodo}
              newTodoPomos={newTodoPomos}
              setNewTodoPomos={setNewTodoPomos}
              newTodoTags={newTodoTags}
              setNewTodoTags={setNewTodoTags}
              newTodoPriority={newTodoPriority}
              setNewTodoPriority={setNewTodoPriority}
              newTodoDeadline={newTodoDeadline}
              setNewTodoDeadline={setNewTodoDeadline}
              newTodoDifficulty={newTodoDifficulty}
              setNewTodoDifficulty={setNewTodoDifficulty}
              viewMode={viewMode}
              setViewMode={setViewMode}
              isChaosMode={isChaosMode}
              setIsChaosMode={setIsChaosMode}
              chaosText={chaosText}
              setChaosText={setChaosText}
              dailyGoal={dailyGoal}
              setDailyGoal={setDailyGoal}
              dailySessions={dailySessions}
              activeColor={activeColor}
              totalPomos={totalPomos}
              setOneThingView={setOneThingView}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              incrementPomo={incrementPomo}
              updatePomoEstimate={updatePomoEstimate}
              autoSortTasks={autoSortTasks}
              handleChaosCleanup={handleChaosCleanup}
              formatDeadline={formatDeadline}
              onStartQueue={() => { startQueue(); handleTabChange("timer") }}
              isFocusActive={timer !== null}
            />
          )}

          {activeTab === "analytics" && (
            <MixAnalytics
              activeColor={activeColor}
              analytics={analytics}
              weeklyData={weeklyData}
              maxDailyDuration={maxDailyDuration}
              energyData={energyData}
              maxEnergy={maxEnergy}
              durationToday={durationToday}
              focusLevel={focusLevel}
            />
          )}
          </>
          )}

        </div>
              <Footer/>
      </main>

      {pipWindow && timer !== null && createPortal(
        <MixTimerPip
          timer={isOvertime ? overtimeSeconds : timer}
          initialTime={initialTime ?? timer}
          sessionType={sessionType}
          isOvertime={isOvertime}
          isPaused={isPaused}
          activeColor={activeColor}
          formatTime={formatTime}
          onTogglePause={() => setIsPaused(!isPaused)}
          onStop={isOvertime ? wrapUpFlow : endSession}
          onRestart={() => {
            if (initialTime !== null && !isOvertime) {
              setTimer(initialTime)
              setIsPaused(true)
            }
          }}
          onAdjustTime={(delta) => {
            setTimer((t) => (t !== null ? Math.max(0, t + delta) : t))
          }}
        />,
        pipWindow.document.body
      )}
    </>
  )
}
