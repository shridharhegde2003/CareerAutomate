"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { ShaderAnimation } from "@/components/ui/shader-animation"

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [headingIndex, setHeadingIndex] = useState(0)
  const [showAnimation, setShowAnimation] = useState(true)

  const headings = [
    {
      title: "Your AI-Powered",
      highlighted: "CareerAutoMate",
      subtitle:
        "Unlock your full potential with our cutting-edge AI tools. From resume optimization to automated job applications and GitHub-driven project showcases, we've got you covered.",
    },
    {
      title: "Automate Your",
      highlighted: "Job Search",
      subtitle:
        "Let AI handle the repetitive work. Apply to jobs that match your skills, get AI-optimized resumes, and land interviews faster than ever before.",
    },
  ]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const animationCycle = () => {
      setShowAnimation(true)
      setTimeout(() => {
        setHeadingIndex((prev) => (prev + 1) % headings.length)
        setShowAnimation(false)
      }, 3000) // animation duration
    }

    animationCycle()
    const interval = setInterval(animationCycle, 8000) // 8 seconds total cycle
    return () => clearInterval(interval)
  }, [])

  const currentHeading = headings[headingIndex]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <ShaderAnimation />
        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-background/20 to-background/40 dark:from-blue-950/60 dark:via-background/40 dark:to-background/60" />

        {/* Animated blobs */}
        <div
          className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />

        <div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * -0.05}px, ${mousePosition.y * -0.05}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(79, 172, 254, .05) 25%, rgba(79, 172, 254, .05) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, .05) 75%, rgba(79, 172, 254, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(79, 172, 254, .05) 25%, rgba(79, 172, 254, .05) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, .05) 75%, rgba(79, 172, 254, .05) 76%, transparent 77%, transparent)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`transition-all duration-700 ${showAnimation ? "opacity-100 scale-100" : "opacity-50 scale-95"}`}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
            {currentHeading.title}
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {currentHeading.highlighted}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance max-w-3xl mx-auto leading-relaxed">
            {currentHeading.subtitle}
          </p>
        </div>

        {/* Buttons - static position */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Start Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 rounded-lg px-8 py-6 text-lg font-semibold hover:bg-secondary bg-transparent"
          >
            Log In
          </Button>
        </div>

        {/* Hero image - professional climbing stairs */}
        <div className="mt-16 relative h-64 sm:h-80 flex justify-center items-end">
          <img
            src="/professional-climbing-stairs.jpg"
            alt="Professional climbing career stairs"
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 hover:scale-110"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
