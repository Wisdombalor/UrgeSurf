import { useState } from 'react'
import Sheet from '../components/Sheet'
import JumpGame from '../components/JumpGame'
import { DEFAULT_INTERESTS, DISTRACT_NEW } from '../lib/constants'

const WATCH_LINKS = [
  ['YouTube', 'Funny and calm videos', 'https://www.youtube.com/'],
  ['Calm music on YouTube', 'Lo-fi and nature sounds', 'https://www.youtube.com/results?search_query=calm+lofi+music'],
  ['TikTok', 'Short distracting clips', 'https://www.tiktok.com/'],
  ['Instagram', 'Reels and friends', 'https://www.instagram.com/'],
  ['X', 'Timeline and follows', 'https://x.com/'],
]

export default function DistractSheet({ interests, onStart }) {
  const base = interests.length ? interests : DEFAULT_INTERESTS
  const [sel, setSel] = useState([])

  function toggle(t) {
    setSel((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  return (
    <Sheet>
      <h1>What sounds good right now?</h1>
      <h2>Your interests</h2>
      <div>
        {base.map((t) => (
          <button key={t} className="chip" aria-pressed={sel.includes(t)} onClick={() => toggle(t)}>
            {t}
          </button>
        ))}
      </div>
      <h2>Or surprise me</h2>
      <div>
        {DISTRACT_NEW.map((t) => (
          <button key={t} className="chip" aria-pressed={sel.includes(t)} onClick={() => toggle(t)}>
            {t}
          </button>
        ))}
      </div>
      <h2>Watch and scroll</h2>
      <div className="card">
        {WATCH_LINKS.map(([label, sub, href]) => (
          <a
            key={label}
            className="card opt"
            style={{ display: 'block', textDecoration: 'none', marginBottom: 10 }}
            href={href}
            target="_blank"
            rel="noopener"
          >
            <b>{label} ↗</b>
            <span>{sub}</span>
          </a>
        ))}
        <p className="s">Opens in a new tab. Come back here when the urge eases.</p>
      </div>
      <h2>In-house game</h2>
      <div className="card">
        <b>Jump the blocks</b>
        <p className="s" style={{ marginTop: 4 }}>
          Like the offline browser game — tap Jump to clear the red obstacles.
        </p>
        <JumpGame />
      </div>
      <p className="s">Content is filtered to keep betting out of your feed.</p>
      <button className="cta" style={{ marginTop: 'auto' }} onClick={onStart}>
        Start
      </button>
    </Sheet>
  )
}
