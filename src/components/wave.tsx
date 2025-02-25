import { timingMap } from "../hooks/useAnimation"
import { map } from "../math"

export interface WaveProps {
  progress: number
  angle?: number
  count?: number
  span?: number
  color?: string
  timing?: (n: number) => number
}

export function Wave({ angle = 0, count = 3, span = 0.5, color = "#fff1", progress, timing = timingMap.easeOut }: WaveProps) {
  const background = new Array(count).fill(0).map((_, index) => {
    const sliceProgress = (progress + index / count) % 1 // change wave progression curve here
    const start = timing(map(sliceProgress, 0, 1, -span, 1))
    const stop = timing(map(sliceProgress, 0, 1, 0, 1 + span))
    const mid = timing(map(sliceProgress, 0, 1, -span / 2, 1 + span / 2))
    return `linear-gradient(${angle}deg, #0000 ${start * 100}%, ${color} ${mid * 100}%, #0000 ${stop * 100}%)`
  }).join(",")
  return <div style={{ background }}></div>
}
