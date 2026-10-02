import { useEffect, useRef, useState } from 'react'

const W = 320
const H = 140
const GROUND = H - 18
const PLAYER_X = 28
const PLAYER_S = 18
const GRAVITY = 0.7
const JUMP_V = -11.5

export default function JumpGame() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem('rc-jump-best') || 0)
    } catch {
      return 0
    }
  })
  const [running, setRunning] = useState(false)
  const [over, setOver] = useState(false)
  const state = useRef({ y: GROUND - PLAYER_S, vy: 0, obs: [], t: 0, speed: 3, score: 0 })

  function jump() {
    const s = state.current
    if (!running || over) return
    if (s.y >= GROUND - PLAYER_S - 0.5) s.vy = JUMP_V
  }

  function start() {
    state.current = { y: GROUND - PLAYER_S, vy: 0, obs: [{ x: W + 40, w: 14, h: 26 }], t: 0, speed: 3, score: 0 }
    setScore(0)
    setOver(false)
    setRunning(true)
  }

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    let raf = 0

    function frame() {
      const s = state.current
      ctx.clearRect(0, 0, W, H)

      // ground
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--line') || '#26394a'
      ctx.fillRect(0, GROUND, W, 2)

      if (running && !over) {
        s.t += 1
        s.speed = 3 + Math.min(4, s.score / 250)
        s.vy += GRAVITY
        s.y += s.vy
        if (s.y > GROUND - PLAYER_S) {
          s.y = GROUND - PLAYER_S
          s.vy = 0
        }
        // spawn obstacles
        const last = s.obs[s.obs.length - 1]
        if (!last || last.x < W - 140 - Math.random() * 80) {
          const h = 18 + Math.random() * 22
          s.obs.push({ x: W + 10, w: 12 + Math.random() * 8, h })
        }
        s.obs.forEach((o) => {
          o.x -= s.speed
        })
        s.obs = s.obs.filter((o) => o.x + o.w > -10)
        s.score += 1
        if (s.t % 10 === 0) setScore(s.score)

        // collision
        for (const o of s.obs) {
          const px1 = PLAYER_X
          const px2 = PLAYER_X + PLAYER_S
          const py1 = s.y
          const py2 = s.y + PLAYER_S
          const ox1 = o.x
          const ox2 = o.x + o.w
          const oy1 = GROUND - o.h
          const oy2 = GROUND
          if (px1 < ox2 - 2 && px2 > ox1 + 2 && py1 < oy2 - 2 && py2 > oy1 + 2) {
            setOver(true)
            setRunning(false)
            setBest((b) => {
              const nb = Math.max(b, s.score)
              try {
                localStorage.setItem('rc-jump-best', String(nb))
              } catch {
                // ignore
              }
              return nb
            })
            break
          }
        }
      }

      // player
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--acc') || '#6fd3c0'
      const st = state.current
      if (ctx.roundRect) {
        ctx.beginPath()
        ctx.roundRect(PLAYER_X, st.y, PLAYER_S, PLAYER_S, 5)
        ctx.fill()
      } else {
        ctx.fillRect(PLAYER_X, st.y, PLAYER_S, PLAYER_S)
      }

      // obstacles
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--urge') || '#ff6b57'
      st.obs.forEach((o) => {
        if (ctx.roundRect) {
          ctx.beginPath()
          ctx.roundRect(o.x, GROUND - o.h, o.w, o.h, 3)
          ctx.fill()
        } else {
          ctx.fillRect(o.x, GROUND - o.h, o.w, o.h)
        }
      })

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [running, over])

  useEffect(() => {
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="game-wrap">
      <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="s">
          Score: <b style={{ color: 'var(--tx)' }}>{score}</b> · Best: <b style={{ color: 'var(--tx)' }}>{best}</b>
        </p>
        {!running && !over ? (
          <button className="chip" aria-pressed="false" onClick={start}>
            Play
          </button>
        ) : null}
        {over ? (
          <button className="chip" aria-pressed="false" onClick={start}>
            Play again
          </button>
        ) : null}
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="game-canvas"
        onClick={jump}
        aria-label="Jump game. Press the Jump button to jump over obstacles."
      />
      {over ? (
        <p className="s" style={{ textAlign: 'center' }}>
          You hit an obstacle with {score} points. Tap Play again to retry.
        </p>
      ) : (
        <p className="s" style={{ textAlign: 'center' }}>
          {running ? 'Tap the game, press Space, or hit Jump.' : 'Press Play, then jump the red blocks.'}
        </p>
      )}
      <button className="cta" style={{ padding: 12 }} onClick={jump} disabled={!running}>
        Jump
      </button>
    </div>
  )
}
