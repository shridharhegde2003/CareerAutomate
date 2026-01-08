"use client"

export function ShaderAnimation() {
  return (
    <canvas
      className="absolute inset-0 w-full h-full"
      ref={(canvas) => {
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const width = (canvas.width = window.innerWidth)
        const height = (canvas.height = window.innerHeight)

        let t = 0
        const speed = 0.4

        // Wave configurations for rhythmic effect
        const waves = [
          { amplitude: 60, frequency: 0.006, phase: 0, yOffset: -80, color: 220 },      // Top wave - slower, smaller
          { amplitude: 80, frequency: 0.008, phase: Math.PI / 3, yOffset: 0, color: 260 },   // Middle wave - medium
          { amplitude: 70, frequency: 0.01, phase: Math.PI * 2 / 3, yOffset: 80, color: 300 }, // Bottom wave - faster
        ]

        const animate = () => {
          ctx.clearRect(0, 0, width, height)

          ctx.save()
          ctx.globalAlpha = 0.12

          waves.forEach((wave, i) => {
            ctx.beginPath()

            // Each wave has different phase offset to create rhythmic movement
            const rhythmicPhase = Math.sin(t * 0.02 + i * (Math.PI * 2 / 3)) * 0.5

            for (let x = 0; x < width; x += 8) {
              const waveY = height / 2 + wave.yOffset +
                Math.sin((x * wave.frequency + t * speed * (1 + i * 0.1) + wave.phase + rhythmicPhase) % (Math.PI * 2)) *
                wave.amplitude * (1 + Math.sin(t * 0.03 + i) * 0.2) // Breathing amplitude

              x === 0 ? ctx.moveTo(x, waveY) : ctx.lineTo(x, waveY)
            }

            // Color shifts slightly for each wave
            const hue = (wave.color + t * 0.2) % 360
            ctx.strokeStyle = `hsl(${hue}, 70%, 55%)`
            ctx.lineWidth = 2.5
            ctx.stroke()
          })

          ctx.restore()

          t += 0.15
          requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
      }}
    />
  )
}
