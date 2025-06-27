"use client"

import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "lucide-react"
import { useEffect, useState } from "react"

export function DarkModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-12 h-7 rounded-full bg-muted transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring/50"
    >
      <div
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-background shadow-md transform transition-transform duration-300 ${
          isDark ? "translate-x-5" : ""
        }`}
      />

      <MoonIcon
        className={`absolute left-1 top-1 h-4 w-4 text-foreground transition-opacity duration-300 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      />
      <SunIcon
        className={`absolute right-1 top-1 h-4 w-4 text-foreground transition-opacity duration-300 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      />
    </button>
  )
}
