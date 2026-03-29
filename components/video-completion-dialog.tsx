"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, X } from "lucide-react"

type VideoCompletionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  nextVideoId?: string
  nextVideoTitle?: string
}

export function VideoCompletionDialog({ open, onOpenChange, nextVideoId, nextVideoTitle }: VideoCompletionDialogProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!open) {
      setCountdown(10)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onOpenChange(false)
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, onOpenChange])

  const handleNextVideo = () => {
    if (nextVideoId) {
      router.push(`/watch/${nextVideoId}`)
    }
    onOpenChange(false)
  }

  const handleGoHome = () => {
    router.push("/")
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Video Completed!</DialogTitle>
          <DialogDescription>
            {nextVideoId
              ? "What would you like to do next?"
              : "You've finished this playlist. What would you like to do next?"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {nextVideoId && nextVideoTitle && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Next video:</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{nextVideoTitle}</p>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            This dialog will close automatically in {countdown} seconds
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {nextVideoId && (
            <Button onClick={handleNextVideo} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Watch Next Video
            </Button>
          )}
          <Button onClick={handleGoHome} variant="outline" className="w-full bg-transparent">
            <Home className="h-4 w-4 mr-2" />
            Go to Home Feed
          </Button>
          <Button onClick={handleClose} variant="ghost" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
