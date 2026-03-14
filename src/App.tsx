import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type TimerPreset = {
  label: string
  seconds: number
}

const PRESETS: TimerPreset[] = [
  { label: 'Focus · 25m', seconds: 25 * 60 },
  { label: 'Short Break · 5m', seconds: 5 * 60 },
  { label: 'Long Break · 15m', seconds: 15 * 60 },
]

const RHYMES = [
  'Clock in hand, you make the plan.',
  'Steady pace wins every race.',
  'One small tick, one giant trick.',
  'Calm and bright, you work just right.',
  'Less scroll, more goal.',
  'Minute by minute, you stay in it.',
]

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

function App() {
  const [totalSeconds, setTotalSeconds] = useState(PRESETS[0].seconds)
  const [remainingSeconds, setRemainingSeconds] = useState(PRESETS[0].seconds)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [customMinutes, setCustomMinutes] = useState('10')
  const [customSeconds, setCustomSeconds] = useState('00')

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const tick = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1))
    }, 1000)

    return () => window.clearInterval(tick)
  }, [isRunning])

  useEffect(() => {
    if (remainingSeconds !== 0 || !isRunning) {
      return
    }

    setIsRunning(false)
    setSessionsCompleted((value) => value + 1)
  }, [isRunning, remainingSeconds])

  const progress = useMemo(() => {
    if (totalSeconds === 0) {
      return 0
    }

    return Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100)
  }, [remainingSeconds, totalSeconds])

  const activeRhyme = RHYMES[remainingSeconds % RHYMES.length]

  const applyTimer = (seconds: number) => {
    setTotalSeconds(seconds)
    setRemainingSeconds(seconds)
    setIsRunning(false)
  }

  const handleCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const minutes = Number.parseInt(customMinutes, 10)
    const seconds = Number.parseInt(customSeconds, 10)

    if (
      Number.isNaN(minutes) ||
      Number.isNaN(seconds) ||
      minutes < 0 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return
    }

    const total = minutes * 60 + seconds
    if (total > 0) {
      applyTimer(total)
    }
  }

  return (
    <main className="app-shell">
      <section className="timer-card">
        <p className="eyebrow">TimeRhymer</p>
        <h1>Make every minute count</h1>
        <p className="subtitle">{activeRhyme}</p>

        <p className="clock" aria-live="polite">
          {formatTime(remainingSeconds)}
        </p>

        <div className="progress-wrap" aria-hidden="true">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="meta">{progress}% complete</p>

        <div className="actions">
          <button type="button" onClick={() => setIsRunning((value) => !value)}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button type="button" className="secondary" onClick={() => applyTimer(totalSeconds)}>
            Reset
          </button>
        </div>

        <div className="preset-row" role="group" aria-label="Timer presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="secondary"
              onClick={() => applyTimer(preset.seconds)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <form className="custom-time" onSubmit={handleCustomSubmit}>
          <label>
            Minutes
            <input
              value={customMinutes}
              onChange={(event) => setCustomMinutes(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <label>
            Seconds
            <input
              value={customSeconds}
              onChange={(event) => setCustomSeconds(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <button type="submit" className="secondary">
            Set custom timer
          </button>
        </form>

        <p className="meta">
          Sessions completed today: <strong>{sessionsCompleted}</strong>
        </p>
      </section>
    </main>
  )
}

export default App
