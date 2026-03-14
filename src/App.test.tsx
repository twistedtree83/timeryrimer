import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('TimeRhymer timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('counts down after starting and resets to original duration', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    expect(screen.getByText('25:00')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Start' }))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('24:59')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('25:00')).toBeTruthy()
  })

  it('finishes a custom timer and increments completed sessions', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    const [minutesInput, secondsInput] = screen.getAllByRole('textbox')
    await user.clear(minutesInput)
    await user.type(minutesInput, '0')
    await user.clear(secondsInput)
    await user.type(secondsInput, '03')
    await user.click(screen.getByRole('button', { name: 'Set custom timer' }))

    expect(screen.getByText('00:03')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Start' }))
    act(() => {
      vi.advanceTimersByTime(3200)
    })

    expect(screen.getByText('00:00')).toBeTruthy()
    expect(screen.getByText(/Sessions today: 1/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  })
})
