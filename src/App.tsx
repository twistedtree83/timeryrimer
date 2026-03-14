import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import './App.css'

type TimerPreset = {
  label: string
  seconds: number
}

type Scene = {
  id: string
  name: string
  mood: string
}

const PRESETS: TimerPreset[] = [
  { label: 'Focus · 25m', seconds: 25 * 60 },
  { label: 'Short Break · 5m', seconds: 5 * 60 },
  { label: 'Long Break · 15m', seconds: 15 * 60 },
]

const SCENES: Scene[] = [
  { id: 'aurora', name: 'Aurora Bloom', mood: 'Cool colors and calm momentum.' },
  { id: 'ember', name: 'Ember Night', mood: 'Warm glow for deep concentration.' },
  { id: 'tide', name: 'Moon Tide', mood: 'Ocean-like drift with gentle contrast.' },
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
  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const [isImmersive, setIsImmersive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const selectedScene = useMemo(
    () => SCENES.find((scene) => scene.id === sceneId) ?? SCENES[0],
    [sceneId],
  )

  const playCompletionChime = useCallback(() => {
    const AudioContextClass = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) {
      return
    }

    const context = new AudioContextClass()
    const now = context.currentTime
    const notes = [523.25, 659.25, 783.99]

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const noteStart = now + index * 0.18

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0, noteStart)
      gain.gain.linearRampToValueAtTime(0.13, noteStart + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28)

      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(noteStart)
      oscillator.stop(noteStart + 0.3)
    })

    window.setTimeout(() => {
      void context.close()
    }, 1200)
  }, [])

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
    playCompletionChime()
  }, [isRunning, playCompletionChime, remainingSeconds])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    handleFullscreenChange()
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const progress = useMemo(() => {
    if (totalSeconds === 0) {
      return 0
    }

    return Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100)
  }, [remainingSeconds, totalSeconds])

  const activeRhyme = RHYMES[(remainingSeconds + sessionsCompleted) % RHYMES.length]

  const applyTimer = useCallback((seconds: number) => {
    setTotalSeconds(seconds)
    setRemainingSeconds(seconds)
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    applyTimer(totalSeconds)
  }, [applyTimer, totalSeconds])

  const toggleStartPause = useCallback(() => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds)
      setIsRunning(true)
      return
    }

    setIsRunning((value) => !value)
  }, [remainingSeconds, totalSeconds])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      return
    }

    await document.exitFullscreen()
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
      setCustomSeconds(String(seconds).padStart(2, '0'))
    }
  }

  useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return
      }

      const key = event.key.toLowerCase()
      if (event.code === 'Space') {
        event.preventDefault()
        toggleStartPause()
      } else if (key === 'r') {
        event.preventDefault()
        resetTimer()
      } else if (key === 'f') {
        event.preventDefault()
        setIsImmersive((value) => !value)
      }
    }

    window.addEventListener('keydown', handleHotkeys)
    return () => window.removeEventListener('keydown', handleHotkeys)
  }, [resetTimer, toggleStartPause])

  const orbitStyle = {
    '--progress-angle': `${Math.max(progress, 1) * 3.6}deg`,
  } as CSSProperties

  return (
    <main className={`app-shell scene-${selectedScene.id} ${isImmersive ? 'immersive' : ''}`}>
      <div className="mist-layer" aria-hidden="true" />
      <div className="mist-layer second" aria-hidden="true" />
      <section className={`timer-card ${isRunning ? 'running' : ''}`}>
        <header className="header-row">
          <div>
            <p className="eyebrow">TimeRhymer</p>
            <h1>{selectedScene.name}</h1>
            <p className="subtitle">{selectedScene.mood}</p>
          </div>
          <p className="meta top-meta">Sessions today: {sessionsCompleted}</p>
        </header>

        <p className="rhyme">{activeRhyme}</p>

        <div className="orbit" style={orbitStyle} aria-hidden="true">
          <div className="orbit-core" />
        </div>
        <p className="clock" aria-live="polite">
          {formatTime(remainingSeconds)}
        </p>

        <div className="progress-wrap" aria-hidden="true">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="meta">{progress}% complete</p>

        <div className="actions">
          <button type="button" onClick={toggleStartPause}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button type="button" className="secondary" onClick={resetTimer}>
            Reset
          </button>
          <button type="button" className="secondary" onClick={() => setIsImmersive((value) => !value)}>
            {isImmersive ? 'Exit immersive' : 'Immersive mode'}
          </button>
          <button type="button" className="secondary" onClick={toggleFullscreen}>
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
        </div>

        {!isImmersive && (
          <>
            <div className="scene-row" role="group" aria-label="Visual scenes">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  className={scene.id === selectedScene.id ? 'secondary active' : 'secondary'}
                  onClick={() => setSceneId(scene.id)}
                >
                  {scene.name}
                </button>
              ))}
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
          </>
        )}

        <p className="meta shortcuts">
          Shortcuts: <strong>Space</strong> start/pause · <strong>R</strong> reset · <strong>F</strong> immersive
        </p>
      </section>
    </main>
  )
}

export default App
