"use client"

import { useState, useEffect, useRef } from "react"
import { motion, Reorder } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { FaTree, FaWater, FaFire, FaMoon, FaPlay, FaWind, FaBook, FaStop, FaTimes, FaCheck, FaTrash, FaPause, FaRedo, FaMagic, FaChartBar, FaTag, FaBullseye, FaGripVertical, FaPlus, FaMinus, FaFlag, FaList, FaThLarge, FaSeedling, FaBolt, FaBrain } from "react-icons/fa"
import Navbar from "@/components/sections/header"
import Footer from "@/components/sections/footer"
import CustomCursor from "@/components/ui/customCursor";

const sounds = [
  { id: "fire", name: "Fireplace", icon: <FaFire size={24} />, color: "#FF6B35" },
  { id: "forest", name: "Forest", icon: <FaTree size={24} />, color: "#2D6A4F" },
  { id: "night", name: "Night", icon: <FaMoon size={24} />, color: "#1B263B" },
  { id: "rain", name: "Rain", icon: <FaWater size={24} />, color: "#0077B6" },
  { id: "whitenoise", name: "White Noise", icon: <FaWind size={24} />, color: "#6C757D" },
  { id: "library", name: "Library", icon: <FaBook size={24} />, color: "#8D6E63" },
]

const soundSources: Record<string, string> = {
  fire: "/sounds/fireplace.mp3",
  forest: "/sounds/new-forest.wav",
  night: "/sounds/new_wildlife.mp3",
  rain: "/sounds/new-rain.mp3",
  whitenoise: "/sounds/new-whitenoise.wav",
  library: "/sounds/library.mp3",
}

const TimerButton = ({ 
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

const TabButton = ({ 
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

export default function MixPage() {
  const [activeTab, setActiveTab] = useState<"timer" | "ambience" | "todo" | "analytics">("ambience")
  const [activeIds, setActiveIds] = useState<string[]>(["fire"])
  const [themeId, setThemeId] = useState<string>("fire")
  const [volumes, setVolumes] = useState<Record<string, number>>({ fire: 40 })
  const [timer, setTimer] = useState<number | null>(null)
  const [customMinutes, setCustomMinutes] = useState("")
  const [customBreakMinutes, setCustomBreakMinutes] = useState("")
  const [isCustomTimerOpen, setIsCustomTimerOpen] = useState(false)
  const [todos, setTodos] = useState<{ id: string; text: string; completed: boolean; pomoSessions: number; completedPomos: number; tags: string[]; priority: "low" | "medium" | "high"; deadline?: string }[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [newTodoPomos, setNewTodoPomos] = useState(1)
  const [newTodoTags, setNewTodoTags] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState<"low" | "medium" | "high">("medium")
  const [newTodoDeadline, setNewTodoDeadline] = useState("")
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
  const [analytics, setAnalytics] = useState<{
    history: { date: string; duration: number }[];
    streak: number;
    lastSessionDate: string | null;
    longestSession: number;
    soundUsage: Record<string, number>;
    completions: { date: string; priority: "low" | "medium" | "high" }[];
  }>({ history: [], streak: 0, lastSessionDate: null, longestSession: 0, soundUsage: {}, completions: [] })

  const activeSound = sounds.find((s) => s.id === themeId) || sounds[0]
  const activeColor = activeSound?.color || "#FF6B35"

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const fadeIntervals = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    if (timer === null || isPaused) return

    if (timer <= 0) {
      if (sessionType === "work" && breakDuration) {
        setTimer(breakDuration)
        setInitialTime(breakDuration)
        setBreakDuration(null)
        setSessionType("break")
        setDailySessions(prev => prev + 1)
      } else {
        if (sessionType === "work") {
           setDailySessions(prev => prev + 1)
           
           // Update Analytics
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

           const duration = initialTime || 0
           const newHistory = [...analytics.history, { date: now.toISOString(), duration }]
           const newLongest = Math.max(analytics.longestSession, duration)
           
           const newSoundUsage = { ...analytics.soundUsage }
           activeIds.forEach(id => {
               newSoundUsage[id] = (newSoundUsage[id] || 0) + duration
           })

           setAnalytics(prev => ({ ...prev, history: newHistory, streak: newStreak, lastSessionDate: now.toISOString(), longestSession: newLongest, soundUsage: newSoundUsage }))
        }
        setTimer(null)
        setInitialTime(null)
        setIsPaused(false)
        setSessionType(null)
      }
      return
    }

    const interval = setInterval(() => {
      setTimer((t) => (t !== null && t > 0 ? t - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [timer, isPaused, sessionType, breakDuration])

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
    setTodos([{ id: Date.now().toString(), text: newTodo, completed: false, pomoSessions: newTodoPomos, completedPomos: 0, tags, priority: newTodoPriority, deadline: newTodoDeadline || undefined }, ...todos])
    setNewTodo("")
    setNewTodoPomos(1)
    setNewTodoTags("")
    setNewTodoPriority("medium")
    setNewTodoDeadline("")
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
        let priority: "low" | "medium" | "high" = "medium";
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

        return { id: `${Date.now()}-${Math.random()}`, text: text.trim(), completed: false, pomoSessions, completedPomos: 0, tags, priority, deadline: undefined };
    });

    setTodos(prevTodos => [...newTodos, ...prevTodos]);
    setChaosText("");
    setIsChaosMode(false);
  };

  const startTimer = (seconds: number, breakSeconds?: number | null) => {
    setTimer(seconds)
    setInitialTime(seconds)
    setIsPaused(true)
    setIsCustomTimerOpen(false)
    setCustomMinutes("")
    setCustomBreakMinutes("")
    setSessionType("work")
    setBreakDuration(breakSeconds || null)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const timerPresets = [
    { work: 25, break: 5, label: "25 / 5" },
    { work: 50, break: 10, label: "50 / 10" },
    { work: 15, break: null, label: "15m" },
    { work: 30, break: null, label: "30m" },
  ]

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
                onClick={() => setActiveTab(tab as any)}
                activeColor={activeColor}
              />
            ))}
          </div>

          {/* Timer Tab */}
          {activeTab === "timer" && (
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
                         onClick={() => {
                           setTimer(null)
                           setInitialTime(null)
                           setIsPaused(false)
                           setSessionType(null)
                           setBreakDuration(null)
                         }}
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
                        onClick={() => {
                          setTimer(null)
                          setInitialTime(null)
                          setIsPaused(false)
                          setSessionType(null)
                          setBreakDuration(null)
                        }}
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
          )}

          {/* Ambience Tab (Sound Grid) */}
          {activeTab === "ambience" && (
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
              const isTheme = themeId === sound.id
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
          )}

          {/* To-Do List Tab */}
          {activeTab === "todo" && (
          <div className={`mx-auto animate-in fade-in duration-500 ${viewMode === 'grid' ? 'max-w-4xl' : 'max-w-2xl'}`}>
            {/* Daily Goal Progress */}
            <div className="mb-8 bg-white/40 backdrop-blur-md p-6 rounded-3xl border-2" style={{ borderColor: activeColor }}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 font-bold" style={{ color: activeColor }}>
                        <FaBullseye />
                        <span>Daily Goal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black" style={{ color: activeColor }}>{dailySessions}</span>
                        <span className="text-sm opacity-50 font-bold">/</span>
                        <input 
                            type="number" 
                            value={dailyGoal} 
                            onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 bg-transparent font-bold text-xl focus:outline-none text-right"
                            style={{ color: activeColor }}
                        />
                    </div>
                </div>
                <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: activeColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (dailySessions / dailyGoal) * 100)}%` }}
                    />
                </div>
            </div>

            <div className="flex justify-between items-end mb-8">
                <div className="flex items-baseline gap-4">
                    <h2 
                        className="text-3xl font-bold text-center transition-colors duration-500"
                        style={{ color: activeColor }}
                    >
                        Tasks
                    </h2>
                    {totalPomos > 0 && (
                        <span className="font-bold text-lg" style={{ color: activeColor }}>
                        {totalPomos} 🍅
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 relative z-30">
                    <button
                        onClick={() => setIsChaosMode(!isChaosMode)}
                        className={`p-3 rounded-lg transition-all bg-white/40 backdrop-blur-sm border-2 hover:bg-[#F6D2B5]/80 ${isChaosMode ? 'bg-white/80' : ''}`}
                        style={{ borderColor: activeColor, color: activeColor }}
                        title="Brain Dump"
                    >
                        <FaBrain size={14} />
                    </button>
                    <button
                        onClick={() => setOneThingView(true)}
                        className="p-3 rounded-lg transition-all bg-white/40 backdrop-blur-sm border-2 hover:bg-[#F6D2B5]/80"
                        style={{ borderColor: activeColor, color: activeColor }}
                        title="Focus on one task"
                    >
                        <FaBullseye size={14} />
                    </button>
                    <button
                        onClick={autoSortTasks}
                        className="p-3 rounded-lg transition-all bg-white/40 backdrop-blur-sm border-2 hover:bg-[#F6D2B5]/80"
                        style={{ borderColor: activeColor, color: activeColor }}
                        title="Auto-sort by heat map"
                    >
                        <FaChartBar size={14} />
                    </button>
                    <div className="flex gap-1 bg-white/40 backdrop-blur-sm p-1 rounded-xl border-2" style={{ borderColor: activeColor }}>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
                        style={{ color: viewMode === "list" ? activeColor : "#4A4A4A" }}
                    >
                        <FaList size={14} />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}
                        style={{ color: viewMode === "grid" ? activeColor : "#4A4A4A" }}
                    >
                        <FaThLarge size={14} />
                    </button>
                    </div>
                </div>
            </div>
            
            {isChaosMode ? (
              <div className="flex flex-col gap-4 mb-8 relative z-20 animate-in fade-in duration-300">
                <textarea
                  value={chaosText}
                  onChange={(e) => setChaosText(e.target.value)}
                  placeholder="Vent everything on your mind... then let the AI sort it out."
                  className="w-full h-40 px-6 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm focus:outline-none transition-all placeholder:text-gray-400 text-lg"
                  style={{
                    borderColor: chaosText ? activeColor : 'transparent',
                    color: '#4A4A4A',
                    resize: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleChaosCleanup}
                  className="w-full px-8 py-4 rounded-2xl font-bold text-white transition-transform active:scale-95 shadow-lg hover:opacity-90 cursor-pointer flex items-center justify-center gap-3"
                  style={{ backgroundColor: activeColor }}
                  disabled={!chaosText.trim()}
                >
                  <FaMagic />
                  <span>Clean Up</span>
                </button>
              </div>
            ) : (
              <form onSubmit={addTodo} className="flex flex-col gap-4 mb-8 relative z-20">
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 px-6 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm focus:outline-none transition-all placeholder:text-gray-400 text-lg"
                    style={{ 
                      borderColor: newTodo ? activeColor : 'transparent',
                      color: '#4A4A4A'
                    }}
                  />
                  <input
                    type="date"
                    value={newTodoDeadline}
                    onChange={(e) => setNewTodoDeadline(e.target.value)}
                    className="px-6 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm focus:outline-none transition-all text-gray-400"
                    style={{ 
                      borderColor: newTodoDeadline ? activeColor : 'transparent',
                    }}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center gap-2 px-6 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all">
                    <FaTag className="text-gray-400" />
                    <input 
                      type="text" 
                      value={newTodoTags}
                      onChange={(e) => setNewTodoTags(e.target.value)}
                      placeholder="Tags (comma separated)"
                      className="flex-1 bg-transparent focus:outline-none placeholder:text-gray-400 text-sm"
                      style={{ color: '#4A4A4A' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all">
                      <FaFlag className={newTodoPriority === 'high' ? 'text-red-500' : newTodoPriority === 'medium' ? 'text-yellow-500' : 'text-green-500'} />
                      <select
                        value={newTodoPriority}
                        onChange={(e) => setNewTodoPriority(e.target.value as any)}
                        className="bg-transparent focus:outline-none text-sm font-bold uppercase tracking-wider cursor-pointer"
                        style={{ color: '#4A4A4A' }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                  </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4">
                  <span className="text-2xl">🍅</span>
                  <input
                    type="number"
                    value={newTodoPomos}
                    onChange={(e) => setNewTodoPomos(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-12 bg-transparent focus:outline-none text-lg font-bold text-center"
                    style={{ color: '#4A4A4A' }}
                  />
                </div>
                <button 
                  type="submit"
                  className="px-8 py-4 rounded-2xl font-bold text-white transition-transform active:scale-95 shadow-lg hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: activeColor }}
                >
                  Add
                </button>
                </div>
              </form>
            )}

            {viewMode === "list" ? (
            <Reorder.Group axis="y" values={todos} onReorder={setTodos} className="space-y-3 relative z-20">
              {todos.map((todo) => (
                <Reorder.Item 
                  key={todo.id} 
                  value={todo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm group hover:bg-white/80 transition-colors"
                >
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0">
                    <FaGripVertical />
                  </div>
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer`}
                    style={{ 
                      borderColor: activeColor,
                      backgroundColor: todo.completed ? activeColor : 'transparent'
                    }}
                  >
                    {todo.completed && <FaCheck size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-lg transition-all ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {todo.text}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-600' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                        }`}>
                            {todo.priority}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {todo.deadline && (
                        <span className="text-xs font-bold text-gray-500">{formatDeadline(todo.deadline)}</span>
                      )}
                      {todo.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/50 font-bold uppercase tracking-wider">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex items-center gap-1 text-sm font-bold cursor-pointer hover:scale-110 transition-transform" 
                      style={{ color: activeColor }}
                      onClick={() => incrementPomo(todo.id)}
                    >
                      <span>{todo.completedPomos || 0}/{todo.pomoSessions}</span>
                      <span>🍅</span>
                    </div>
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); updatePomoEstimate(todo.id, todo.pomoSessions + 1) }} className="text-[10px] hover:text-gray-700 text-gray-400 p-0.5"><FaPlus /></button>
                        <button onClick={(e) => { e.stopPropagation(); updatePomoEstimate(todo.id, Math.max(1, todo.pomoSessions - 1)) }} className="text-[10px] hover:text-gray-700 text-gray-400 p-0.5"><FaMinus /></button>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-2 cursor-pointer"
                  >
                    <FaTrash size={16} />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                    {todos.map((todo) => (
                        <motion.div
                            layout
                            key={todo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col p-6 rounded-3xl bg-white/60 backdrop-blur-sm group hover:bg-white/80 transition-colors border-2 border-transparent hover:border-white/50"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleTodo(todo.id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer`}
                                        style={{
                                        borderColor: activeColor,
                                        backgroundColor: todo.completed ? activeColor : 'transparent'
                                        }}
                                    >
                                        {todo.completed && <FaCheck size={12} className="text-white" />}
                                    </button>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                        todo.priority === 'high' ? 'bg-red-100 text-red-600' :
                                        todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-green-100 text-green-600'
                                    }`}>
                                        {todo.priority}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteTodo(todo.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>

                            <div className="mb-4 flex-1">
                                <p className={`text-lg font-medium mb-2 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                    {todo.text}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {todo.deadline && (
                                    <span className="text-xs font-bold text-gray-500">{formatDeadline(todo.deadline)}</span>
                                  )}
                                  {todo.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/50 font-bold uppercase tracking-wider">{tag}</span>
                                  ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-black/5">
                                <div className="flex items-center gap-2">
                                    <div
                                    className="flex items-center gap-1 text-sm font-bold cursor-pointer hover:scale-110 transition-transform"
                                    style={{ color: activeColor }}
                                    onClick={() => incrementPomo(todo.id)}
                                    >
                                    <span>{todo.completedPomos || 0}/{todo.pomoSessions}</span>
                                    <span>🍅</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <button onClick={(e) => { e.stopPropagation(); updatePomoEstimate(todo.id, todo.pomoSessions + 1) }} className="text-[10px] hover:text-gray-700 text-gray-400 p-0.5"><FaPlus /></button>
                                        <button onClick={(e) => { e.stopPropagation(); updatePomoEstimate(todo.id, Math.max(1, todo.pomoSessions - 1)) }} className="text-[10px] hover:text-gray-700 text-gray-400 p-0.5"><FaMinus /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

              {todos.length === 0 && (
                <p className="text-center text-gray-400 italic mt-8">No tasks yet. Time to focus!</p>
              )}
          </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
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
          )}
          </>
          )}

     
       
        </div>
              <Footer/>
      </main>

    </>
  )
}