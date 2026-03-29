"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Focus, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee,
  X
} from "lucide-react"

type FocusModeProps = {
  onToggle: (enabled: boolean) => void
  isEnabled: boolean
}

// Pomodoro settings
const WORK_TIME = 25 * 60 // 25 minutes in seconds
const BREAK_TIME = 5 * 60 // 5 minutes in seconds

export function FocusMode({ onToggle, isEnabled }: FocusModeProps) {
  const [showTimer, setShowTimer] = useState(false)
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer finished
      if (isBreak) {
        // Break finished, start new work session
        setIsBreak(false)
        setTimeLeft(WORK_TIME)
        setIsRunning(false)
      } else {
        // Work session finished
        setSessionsCompleted((prev) => prev + 1)
        setIsBreak(true)
        setTimeLeft(BREAK_TIME)
        // Auto-start break
        setIsRunning(true)
        // Notification
        if (Notification.permission === "granted") {
          new Notification("Focus Session Complete!", {
            body: "Great work! Take a 5-minute break.",
          })
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, isBreak])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(WORK_TIME)
  }

  const requestNotificationPermission = useCallback(async () => {
    if (Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (showTimer) {
      requestNotificationPermission()
    }
  }, [showTimer, requestNotificationPermission])

  return (
    <>
      <Button
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle(!isEnabled)}
        className={isEnabled ? "bg-emerald-600 hover:bg-emerald-700" : ""}
      >
        <Focus className="h-4 w-4 mr-2" />
        Focus Mode
      </Button>

      <Dialog open={showTimer} onOpenChange={setShowTimer}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Timer className="h-4 w-4 mr-2" />
            Pomodoro
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isBreak ? (
                <>
                  <Coffee className="h-5 w-5 text-amber-500" />
                  Break Time
                </>
              ) : (
                <>
                  <Timer className="h-5 w-5 text-emerald-500" />
                  Focus Session
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isBreak 
                ? "Take a short break before your next session"
                : "Stay focused on your learning session"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-8 space-y-6">
            {/* Timer Display */}
            <div className={`text-6xl font-mono font-bold ${isBreak ? "text-amber-500" : "text-foreground"}`}>
              {formatTime(timeLeft)}
            </div>

            {/* Progress Ring */}
            <div className="relative w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isBreak ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{
                  width: `${isBreak 
                    ? ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100 
                    : ((WORK_TIME - timeLeft) / WORK_TIME) * 100}%`
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                onClick={toggleTimer}
                className={isBreak ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>

            {/* Sessions Counter */}
            <div className="text-sm text-muted-foreground">
              Sessions completed: <span className="font-bold text-foreground">{sessionsCompleted}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Focus Mode Overlay for minimal UI
export function FocusModeOverlay({ onExit }: { onExit: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={onExit}
        className="bg-background/80 backdrop-blur-sm"
      >
        <X className="h-4 w-4 mr-2" />
        Exit Focus Mode
      </Button>
    </div>
  )
}
