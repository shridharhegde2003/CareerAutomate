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
        const speed = 0.5

        const animate = () => {
          ctx.clearRect(0, 0, width, height)

          // Create moving wave pattern with shader-like effect
          ctx.save()
          ctx.globalAlpha = 0.15

          for (let i = 0; i < 5; i++) {
            ctx.beginPath()
            for (let x = 0; x < width; x += 10) {
              const y = height / 2 + Math.sin((x * 0.01 + t * speed + i * 0.5) % (Math.PI * 2)) * 80
              x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            }
            ctx.strokeStyle = `hsl(${(t * 2 + i * 60) % 360}, 100%, 50%)`
            ctx.lineWidth = 2
            ctx.stroke()
          }

          ctx.restore()

          t++
          if (t > 8) t = 0
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
