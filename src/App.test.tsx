import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

describe('TimeRhymer timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('counts down after starting and resets to original duration', () => {
    render(<App />)

    expect(screen.getByText('25:00')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('24:59')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('25:00')).toBeTruthy()
  })

  it('finishes a custom timer and increments completed sessions', () => {
    render(<App />)

    const [minutesInput, secondsInput] = screen.getAllByRole('textbox')
    fireEvent.change(minutesInput, { target: { value: '0' } })
    fireEvent.change(secondsInput, { target: { value: '03' } })
    fireEvent.click(screen.getByRole('button', { name: 'Set custom timer' }))

    expect(screen.getByText('00:03')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => {
      vi.advanceTimersByTime(3200)
    })

    expect(screen.getByText('00:00')).toBeTruthy()
    expect(screen.getByText(/Sessions today: 1/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  })
})
