"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Gauge } from "lucide-react"

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const STORAGE_KEY = "flowtube_playback_speed"

type PlaybackSpeedProps = {
  onSpeedChange: (speed: number) => void
}

export function PlaybackSpeed({ onSpeedChange }: PlaybackSpeedProps) {
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    const savedSpeed = localStorage.getItem(STORAGE_KEY)
    if (savedSpeed) {
      const parsedSpeed = parseFloat(savedSpeed)
      if (SPEED_OPTIONS.includes(parsedSpeed)) {
        setSpeed(parsedSpeed)
        onSpeedChange(parsedSpeed)
      }
    }
  }, [])

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
    localStorage.setItem(STORAGE_KEY, newSpeed.toString())
    onSpeedChange(newSpeed)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Gauge className="h-4 w-4" />
          {speed}x
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SPEED_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => handleSpeedChange(option)}
            className={speed === option ? "bg-accent" : ""}
          >
            {option}x {option === 1 && "(Normal)"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
