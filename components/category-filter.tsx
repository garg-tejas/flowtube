"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    router.push(`/feed?${params.toString()}`)
  }

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    router.push(`/feed?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground font-medium">Filter:</span>
      <Button
        variant={!selectedCategory || selectedCategory === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => handleCategoryChange("all")}
        className="transition-colors"
      >
        All
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={selectedCategory === cat ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange(cat)}
          className="transition-colors"
        >
          {cat}
        </Button>
      ))}
      {selectedCategory && selectedCategory !== "all" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear
          <X className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  )
}
