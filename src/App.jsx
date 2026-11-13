import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const TEST_DURATION = 60

const passages = [
  'Great things are done by a series of small things brought together. Focus on the next keystroke, find your rhythm, and let the words flow.',
  'The secret of getting ahead is getting started. A little progress each day adds up to remarkable results over time.',
  'Creativity is intelligence having fun. Take a breath, trust your hands, and enjoy the simple rhythm of turning thoughts into words.',
  'Make every keystroke count. Stay curious, keep a steady pace, and remember that accuracy is the foundation of real speed.',
]

function getWpm(correctCharacters, elapsedSeconds) {
  return Math.round((correctCharacters / 5 / Math.max(elapsedSeconds, 1)) * 60)
}

function Icon({ name, size = 20 }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.8,
  }

  const shapes = {
    bolt: <path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" />,
    timer: (
      <>
        <circle cx="12" cy="13" r="8.5" />
        <path d="M12 9v4l2.5 1.5M9 2h6m-3 0v2.5M18.5 6.5 20 5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9A7 7 0 0 1 17 6.5L20 12M4 12l3 5.5A7 7 0 0 0 18.5 15" />
      </>
    ),
    keyboard: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M6 9h.01M9 9h.01M12 9h.01M15 9h.01M18 9h.01M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01M8 15h8" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    trophy: (
      <>
        <path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 7H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    spark: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...common}
    >
      {shapes[name]}
    </svg>
  )
}

function App() {
  const [passageIndex, setPassageIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [status, setStatus] = useState('idle')
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION)
  const [bestWpm, setBestWpm] = useState(0)
  const inputRef = useRef(null)
  const typedRef = useRef('')
  const startedAtRef = useRef(null)
  const passage = passages[passageIndex]
  const passageRef = useRef(passage)

  const correctCharacters = useMemo(
    () =>
      [...typed].reduce(
        (total, character, index) =>
          total + (character === passage[index] ? 1 : 0),
        0,
      ),
    [passage, typed],
  )

  const elapsedSeconds =
    status === 'idle'
      ? 0
      : Math.max(0, Math.min(TEST_DURATION, TEST_DURATION - timeLeft))
  const wpm = getWpm(correctCharacters, elapsedSeconds)
  const accuracy =
    typed.length > 0
      ? Math.round((correctCharacters / typed.length) * 100)
      : 100
  const progress = Math.min((typed.length / passage.length) * 100, 100)

  useEffect(() => {
      passageRef.current = passage
  }, [passage])

  useEffect(() => {
    if (status !== 'running') return undefined

    const timerId = window.setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000
      const remaining = Math.max(0, TEST_DURATION - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        const currentPassage = passageRef.current
        const currentTyped = typedRef.current
        const correct = [...currentTyped].reduce(
          (total, character, index) =>
            total + (character === currentPassage[index] ? 1 : 0),
          0,
        )
        const finalWpm = getWpm(correct, elapsed)
        setBestWpm((currentBest) => Math.max(currentBest, finalWpm))
        setStatus('complete')
      }
    }, 100)

    return () => window.clearInterval(timerId)
  }, [status])

  function handleTyping(event) {
    if (status === 'complete') return

    const nextValue = event.target.value.replace(/\n/g, ' ').slice(0, passage.length)
    if (status === 'idle' && nextValue.length > 0) {
      startedAtRef.current = Date.now()
      setStatus('running')
    }
    typedRef.current = nextValue
    setTyped(nextValue)

    if (nextValue.length === passage.length) {
      const elapsed = (Date.now() - startedAtRef.current) / 1000
      setTimeLeft(Math.max(0, TEST_DURATION - elapsed))
      const correct = [...nextValue].reduce(
        (total, character, index) =>
          total + (character === passage[index] ? 1 : 0),
        0,
      )
      setBestWpm((currentBest) =>
        Math.max(currentBest, getWpm(correct, elapsed)),
      )
      setStatus('complete')
    }
  }

  function restartTest() {
    setPassageIndex((current) => {
      const offset = 1 + Math.floor(Math.random() * (passages.length - 1))
      return (current + offset) % passages.length
    })
    typedRef.current = ''
    setTyped('')
    setTimeLeft(TEST_DURATION)
    setStatus('idle')
    startedAtRef.current = null
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const characters = [...passage].map((character, index) => {
    let state = 'upcoming'
    if (index < typed.length) {
      state = typed[index] === character ? 'correct' : 'incorrect'
    } else if (index === typed.length && status !== 'complete') {
      state = 'current'
    }

    return (
      <span className={`character ${state}`} key={`${index}-${character}`}>
        {character}
      </span>
    )
  })

  return (
    <main className="app-shell">
      <div className="ambient ambient-purple" />
      <div className="ambient ambient-green" />
      <div className="ambient-grid" />

      <div className="page-wrap">
        <header className="topbar">
          <a className="brand" href="#home" aria-label="Type Rush home">
            <span className="brand-mark">
              <Icon name="bolt" size={21} />
            </span>
            <span className="brand-name">type<span>rush</span></span>
            <span className="brand-divider" />
            <span className="brand-tag">THE 60-SECOND SPRINT</span>
          </a>
          <a className="top-link" href="#how-to-play">
            How to play <Icon name="arrow" size={16} />
          </a>
        </header>

        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR DAILY DOSE OF FLOW</div>
            <h1>Find your <span>rhythm.</span><br />Own the words.</h1>
            <p>A little focus. A lot of momentum. See how fast your fingers can fly.</p>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span className="stamp-orbit" />
            <span className="stamp-core"><Icon name="bolt" size={29} /></span>
            <span className="stamp-caption">READY<br />WHEN YOU ARE</span>
          </div>
        </section>

        <section className="test-layout" id="practice" aria-label="Typing speed test">
          <div className="test-card glass-panel">
            <div className="card-topline">
              <div className="section-title">
                <span className="section-icon"><Icon name="keyboard" size={17} /></span>
                <span>THE TYPING SPRINT</span>
              </div>
              <span className={`status-pill ${status}`}>
                <span className="status-dot" />
                {status === 'running' ? 'IN THE ZONE' : status === 'complete' ? 'SPRINT COMPLETE' : 'READY'}
              </span>
            </div>

            <div className="metrics-row" aria-label="Live test statistics">
              <div className={`metric-card timer-metric ${timeLeft <= 10 && status === 'running' ? 'urgent' : ''}`}>
                <span className="metric-label"><Icon name="timer" size={15} /> TIME LEFT</span>
                <strong>{Math.ceil(timeLeft).toString().padStart(2, '0')}<small>s</small></strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">SPEED <span className="metric-unit">WPM</span></span>
                <strong>{wpm}<small className="metric-sub"> words / min</small></strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">ACCURACY</span>
                <strong>{accuracy}<small>%</small></strong>
              </div>
            </div>

            <div className="passage-heading">
              <span>TYPE THE PASSAGE</span>
              <span className="passage-hint"><Icon name="spark" size={14} /> Keep your flow</span>
            </div>

            <div className={`passage-box ${status === 'complete' ? 'finished' : ''}`} aria-label="Passage to type">
              <p>{characters}</p>
            </div>

            {status === 'complete' ? (
              <div className="result-panel" role="status" aria-live="polite">
                <span className="result-icon"><Icon name="trophy" size={20} /></span>
                <div className="result-copy">
                  <strong>{timeLeft <= 0 ? 'Time is up!' : 'Beautiful run!'}</strong>
                  <span>{correctCharacters} correct characters · {accuracy}% accuracy</span>
                </div>
                <button className="restart-button" type="button" onClick={restartTest}>
                  <Icon name="refresh" size={16} /> Try again
                </button>
              </div>
            ) : (
              <div className="typing-input-wrap">
                <textarea
                  aria-label="Type the passage here"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className="typing-input"
                  disabled={status === 'complete'}
                  onChange={handleTyping}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === 'Tab') event.preventDefault()
                  }}
                  placeholder="Click here and start typing..."
                  ref={inputRef}
                  rows={2}
                  spellCheck="false"
                  value={typed}
                />
                <span className="input-corner"><Icon name="bolt" size={15} /></span>
              </div>
            )}

            <div className="progress-track" aria-label={`${Math.round(progress)}% completed`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="card-footer">
              <span>THE TIMER STARTS ON YOUR FIRST KEYSTROKE</span>
              <button className="text-button" onClick={restartTest} type="button">
                <Icon name="refresh" size={14} /> New passage
              </button>
            </div>
          </div>

          <aside className="side-column">
            <div className="side-card best-card glass-panel">
              <div className="side-card-heading"><span className="side-icon green"><Icon name="trophy" size={17} /></span> PERSONAL BEST</div>
              <div className="best-score">{bestWpm}<span>WPM</span></div>
              <div className="best-caption">
                {bestWpm > 0 ? 'Your fastest sprint so far.' : 'Your first sprint starts a streak.'}
              </div>
              <div className="score-decoration"><span /><span /><span /><span /><span /><span /><span /></div>
            </div>

            <div className="side-card how-card glass-panel" id="how-to-play">
              <div className="side-card-heading"><span className="side-icon purple"><Icon name="spark" size={17} /></span> HOW TO PLAY</div>
              <ol className="steps-list">
                <li><span>01</span><p>Start typing to kick off your <b>60-second</b> sprint.</p></li>
                <li><span>02</span><p>Match the passage. Green means <b>nailed it</b>.</p></li>
                <li><span>03</span><p>Watch your speed and accuracy update <b>live</b>.</p></li>
              </ol>
              <div className="flow-note"><Icon name="bolt" size={15} /> Accuracy first. Speed follows.</div>
            </div>

            <div className="best-streak glass-panel">
              <span className="streak-orb"><Icon name="check" size={16} /></span>
              <div><strong>Small steps, big flow.</strong><span>One minute is all it takes.</span></div>
              <Icon name="arrow" size={17} />
            </div>
          </aside>
        </section>

        <footer className="bottom-bar">
          <span>MADE FOR YOUR MOMENTUM <span className="footer-spark">✳</span></span>
          <span className="footer-right">BREATHE IN <span /> TYPE ON</span>
        </footer>
      </div>
    </main>
  )
}

export default App
