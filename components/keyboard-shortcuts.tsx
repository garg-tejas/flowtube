"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const shortcuts = [
  { keys: ["Space"], description: "Play / Pause video" },
  { keys: ["←"], description: "Rewind 5 seconds" },
  { keys: ["→"], description: "Forward 5 seconds" },
  { keys: ["N"], description: "Next video in playlist" },
  { keys: ["P"], description: "Previous video in playlist" },
  { keys: ["M"], description: "Mute / Unmute" },
  { keys: ["F"], description: "Toggle fullscreen" },
  { keys: ["0-9"], description: "Seek to 0-90% of video" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["Esc"], description: "Close dialogs / Exit fullscreen" },
]

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault()
        setIsOpen(true)
      }

      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-1 text-xs font-semibold bg-muted rounded border border-border"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd> anytime to show this dialog
        </p>
      </DialogContent>
    </Dialog>
  )
}
