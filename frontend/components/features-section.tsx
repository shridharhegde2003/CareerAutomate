"use client"

import { Card } from "@/components/ui/card"
import { useState } from "react"

const features = [
  {
    title: "Resume Updater",
    description:
      "Keep your resume up-to-date with the latest industry trends and keywords, ensuring it stands out to recruiters.",
    color: "from-amber-300 to-amber-100",
    darkColor: "dark:from-amber-900 dark:to-amber-800",
    image: "/resume-document-professional.jpg",
  },
  {
    title: "Auto Job Apply",
    description:
      "Automate your job applications with AI-powered matching, saving you time and increasing your chances of landing interviews.",
    color: "from-teal-400 to-teal-600",
    darkColor: "dark:from-teal-900 dark:to-teal-800",
    image: "/robot-artificial-intelligence-automation.jpg",
  },
  {
    title: "GitHub-Driven Projects",
    description:
      "Showcase your skills and projects directly from your GitHub profile, providing tangible evidence of your expertise.",
    color: "from-yellow-300 to-yellow-100",
    darkColor: "dark:from-yellow-900 dark:to-yellow-800",
    image: "/code-github-developer-projects.jpg",
  },
]

export function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/80 to-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40 dark:opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-40 dark:opacity-20" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl opacity-30 dark:opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Everything you need to supercharge your career
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Our platform provides a suite of tools designed for modern professionals.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group cursor-pointer perspective"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card className="relative overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                  <img
                    src={feature.image || "/placeholder.svg"}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500 ease-out"
                  />

                  {/* Overlay effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Feature background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} ${feature.darkColor} opacity-0 transition-opacity duration-500 group-hover:opacity-20`}
                />

                {/* Content */}
                <div className="relative p-6 sm:p-8 h-auto bg-background">
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground group-hover:translate-y-1 transition-transform duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Animated underline indicator */}
                  <div
                    className={`mt-4 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ${
                      hoveredIndex === index ? "w-24" : "w-12"
                    }`}
                  />
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-0 h-0 group-hover:w-24 group-hover:h-24 transition-all duration-500 border-l-24 border-b-24 border-l-transparent border-b-blue-500/20" />
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
