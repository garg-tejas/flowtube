"use client"

import { useState, useEffect, memo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Save, FileText, FileDown, ChevronDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { jsPDF } from "jspdf"

type NotesEditorProps = {
  videoId?: string
  playlistId?: string
  userId: string
}

function NotesEditorComponent({ videoId, playlistId, userId }: NotesEditorProps) {
  const [content, setContent] = useState("")
  const [noteId, setNoteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const supabase = createClient()

  // Load existing note
  useEffect(() => {
    loadNote()
  }, [videoId, playlistId])

  const loadNote = async () => {
    let query = supabase.from("notes").select("*").eq("user_id", userId)

    if (videoId) {
      query = query.eq("video_id", videoId).is("playlist_id", null)
    } else if (playlistId) {
      query = query.eq("playlist_id", playlistId).is("video_id", null)
    }

    const { data } = await query.maybeSingle()

    if (data) {
      setContent(data.content)
      setNoteId(data.id)
      setLastSaved(new Date(data.updated_at))
    }
  }

  const saveNote = async () => {
    setIsSaving(true)

    try {
      if (noteId) {
        // Update existing note
        await supabase
          .from("notes")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", noteId)
      } else {
        // Create new note
        const { data } = await supabase
          .from("notes")
          .insert({
            user_id: userId,
            video_id: videoId || null,
            playlist_id: playlistId || null,
            content,
          })
          .select()
          .single()

        if (data) {
          setNoteId(data.id)
        }
      }

      setLastSaved(new Date())
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `notes-${videoId || playlistId}-${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let yPosition = margin

    // Title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Notes", margin, yPosition)
    yPosition += 10

    // Date
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(128)
    doc.text(`Exported on ${new Date().toLocaleDateString()}`, margin, yPosition)
    yPosition += 15
    doc.setTextColor(0)

    // Parse and render content
    const lines = content.split("\n")

    for (const line of lines) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }

      // Handle different markdown elements
      if (line.startsWith("# ")) {
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        const text = line.substring(2)
        const splitText = doc.splitTextToSize(text, maxWidth)
        doc.text(splitText, margin, yPosition)
        yPosition += splitText.length * 8 + 4
      } else if (line.startsWith("## ")) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        const text = line.substring(3)
        const splitText = doc.splitTextToSize(text, maxWidth)
        doc.text(splitText, margin, yPosition)
        yPosition += splitText.length * 7 + 3
      } else if (line.startsWith("### ")) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        const text = line.substring(4)
        const splitText = doc.splitTextToSize(text, maxWidth)
        doc.text(splitText, margin, yPosition)
        yPosition += splitText.length * 6 + 2
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        const text = `• ${line.substring(2)}`
        const splitText = doc.splitTextToSize(text, maxWidth - 5)
        doc.text(splitText, margin + 5, yPosition)
        yPosition += splitText.length * 5 + 2
      } else if (line.match(/^\d+\.\s/)) {
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        const splitText = doc.splitTextToSize(line, maxWidth - 5)
        doc.text(splitText, margin + 5, yPosition)
        yPosition += splitText.length * 5 + 2
      } else if (line.startsWith("> ")) {
        doc.setFontSize(11)
        doc.setFont("helvetica", "italic")
        doc.setTextColor(100)
        const text = line.substring(2)
        const splitText = doc.splitTextToSize(text, maxWidth - 10)
        // Draw quote line
        doc.setDrawColor(200)
        doc.setLineWidth(0.5)
        doc.line(margin, yPosition - 3, margin, yPosition + splitText.length * 5)
        doc.text(splitText, margin + 8, yPosition)
        yPosition += splitText.length * 5 + 4
        doc.setTextColor(0)
      } else if (line.trim() === "") {
        yPosition += 4
      } else {
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        // Handle bold and italic in text
        let text = line
          .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold markers
          .replace(/\*(.+?)\*/g, "$1")     // Remove italic markers
          .replace(/_(.+?)_/g, "$1")       // Remove underscore italic
        const splitText = doc.splitTextToSize(text, maxWidth)
        doc.text(splitText, margin, yPosition)
        yPosition += splitText.length * 5 + 2
      }
    }

    doc.save(`notes-${videoId || playlistId}-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notes</CardTitle>
          <div className="flex items-center gap-2">
            {lastSaved && <span className="text-xs text-muted-foreground">Saved {lastSaved.toLocaleTimeString()}</span>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={!content}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={downloadMarkdown}>
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={saveNote} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notes here... Markdown is supported!"
              className="min-h-[300px] font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Supports Markdown formatting: **bold**, *italic*, # headings, - lists, etc.
            </p>
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <div className="min-h-[300px] p-4 border rounded-md bg-muted/50">
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 text-foreground" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 text-foreground" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-2 text-foreground" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-lg font-bold mb-2 text-foreground" {...props} />,
                    h5: ({ node, ...props }) => <h5 className="text-base font-bold mb-1 text-foreground" {...props} />,
                    h6: ({ node, ...props }) => <h6 className="text-sm font-bold mb-1 text-foreground" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-foreground" {...props} />,
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside mb-4 text-foreground" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside mb-4 text-foreground" {...props} />
                    ),
                    li: ({ node, ...props }) => <li className="mb-1 text-foreground" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-foreground" {...props} />,
                    code: ({ node, ...props }) => (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground" {...props} />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre className="bg-muted p-4 rounded mb-4 overflow-x-auto text-foreground" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic mb-4 text-foreground" {...props} />
                    ),
                    a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">No content to preview</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export const NotesEditor = memo(NotesEditorComponent)
