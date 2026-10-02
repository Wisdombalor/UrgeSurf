import { useState } from 'react'
import Sheet from '../components/Sheet'
import { DEFAULT_INTERESTS } from '../lib/constants'

// Every interest maps to a concrete, immediately-doable distraction.
// Physical actions keep hands busy; links open in a new tab.
const SUGGESTIONS = {
  Football: [
    {
      title: 'Watch a 10-minute highlight reel',
      detail: 'Full match replays pull you in for hours — highlights give the same hit in 10 minutes. Set the urge aside until the video ends.',
      cta: 'Open football highlights',
      href: 'https://www.youtube.com/results?search_query=football+highlights',
    },
  ],
  Music: [
    {
      title: 'Put on a lo-fi playlist for 15 minutes',
      detail: 'Calm, lyric-free music lowers a racing heart rate. Lie back, close your eyes, and just listen until the craving wave passes.',
      cta: 'Open lo-fi playlist',
      href: 'https://www.youtube.com/results?search_query=calm+lofi+music',
    },
  ],
  Comedy: [
    {
      title: 'Watch one stand-up set',
      detail: 'Laughter breaks the tension an urge builds in your chest. One set only — then check how the craving feels.',
      cta: 'Open stand-up clips',
      href: 'https://www.youtube.com/results?search_query=stand+up+comedy+full+set',
    },
  ],
  Cooking: [
    {
      title: 'Cook something in 15 minutes',
      detail: 'Chop, stir, taste. Cooking occupies your hands, nose and mind at once — there is no room left for the urge. Use whatever is already in the kitchen.',
    },
  ],
  Fitness: [
    {
      title: 'Move for 5 minutes right now',
      detail: 'Walk around the block, do 20 pushups, or splash cold water on your face. Physical effort burns off the same restless energy gambling promises.',
    },
  ],
  Gaming: [
    {
      title: 'Play one offline puzzle round',
      detail: 'Something with no betting, no loot boxes, no stakes — a crossword, sudoku, or a level of a game you already own. One round, then reassess.',
    },
  ],
  Tech: [
    {
      title: 'Watch a gadget explainer',
      detail: 'A 10-minute review or “how it works” video scratches the novelty itch without risking a dollar.',
      cta: 'Open tech explainers',
      href: 'https://www.youtube.com/results?search_query=tech+explainer+documentary',
    },
  ],
  Art: [
    {
      title: 'Draw the urge, then destroy it',
      detail: 'Grab paper and sketch what the craving feels like — scribbles count. Then tear it up or scribble over it. Externalising it weakens it.',
    },
  ],
  Documentaries: [
    {
      title: 'Start a nature documentary',
      detail: 'Slow, absorbing, and impossible to bet on. Give it 15 minutes — nature docs are urge kryptonite.',
      cta: 'Open nature documentaries',
      href: 'https://www.youtube.com/results?search_query=nature+documentary+full+episode',
    },
  ],
}

const WILD = [
  {
    title: 'Learn one tiny skill in 10 minutes',
    detail: 'A card trick, juggling three balls, a knot. Follow one tutorial and practice until you can do it once.',
    cta: 'Open beginner tutorials',
    href: 'https://www.youtube.com/results?search_query=learn+a+skill+in+10+minutes',
  },
  {
    title: 'Make your space 1% better',
    detail: 'Make tea, tidy one shelf, wipe one surface. Small visible wins tell your brain you are in control.',
  },
  {
    title: 'Cold reset: 30 seconds',
    detail: 'Hold ice cubes or splash very cold water on your face. It triggers the dive reflex and physically calms your nervous system.',
  },
]

const WATCH_LINKS = [
  ['YouTube', 'Funny and calm videos', 'https://www.youtube.com/'],
  ['Calm music on YouTube', 'Lo-fi and nature sounds', 'https://www.youtube.com/results?search_query=calm+lofi+music'],
  ['TikTok', 'Short distracting clips', 'https://www.tiktok.com/'],
  ['Instagram', 'Reels and friends', 'https://www.instagram.com/'],
  ['X', 'Timeline and follows', 'https://x.com/'],
]

function pick(pool, avoid) {
  const options = pool.length > 1 && avoid ? pool.filter((s) => s.title !== avoid.title) : pool
  return options[Math.floor(Math.random() * options.length)]
}

export default function DistractSheet({ interests, onStart }) {
  const base = interests?.length ? interests : DEFAULT_INTERESTS
  const [sel, setSel] = useState(base.slice())
  const [suggestion, setSuggestion] = useState(null)

  function toggle(t) {
    setSel((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function suggestFrom(list) {
    const pool = list.flatMap((t) => SUGGESTIONS[t] || [])
    if (!pool.length) return
    setSuggestion(pick(pool, suggestion))
    setTimeout(() => {
      document.getElementById('distract-idea')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  return (
    <Sheet>
      <h1>What sounds good right now?</h1>
      <p className="s" style={{ marginTop: 6 }}>
        Pick what fits your mood — we will turn it into something concrete to do for the next 15 minutes.
      </p>
      <h2>Your interests</h2>
      <div>
        {(interests?.length ? interests : DEFAULT_INTERESTS).map((t) => (
          <button key={t} className="chip" aria-pressed={sel.includes(t)} onClick={() => toggle(t)}>
            {t}
          </button>
        ))}
      </div>
      <button className="cta" style={{ padding: 12 }} onClick={() => suggestFrom(sel.length ? sel : base)}>
        Suggest something for me
      </button>
      <button className="ghost" onClick={() => {
        const pool = [...WILD, ...Object.values(SUGGESTIONS).flat()]
        setSuggestion(pick(pool, suggestion))
        setTimeout(() => {
          document.getElementById('distract-idea')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 50)
      }}>
        Surprise me
      </button>

      {suggestion ? (
        <div id="distract-idea" className="card anim-in" style={{ marginTop: 6, borderColor: 'var(--acc)' }}>
          <b>Try this right now</b>
          <p style={{ marginTop: 8, fontSize: 17, fontWeight: 700 }}>{suggestion.title}</p>
          <p className="s" style={{ marginTop: 6 }}>
            {suggestion.detail}
          </p>
          {suggestion.href ? (
            <a
              className="cta"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px 14px', fontSize: 14 }}
              href={suggestion.href}
              target="_blank"
              rel="noopener"
            >
              {suggestion.cta} ↗
            </a>
          ) : null}
          <div className="row" style={{ marginTop: 8 }}>
            <button
              className="ghost"
              style={{ flex: 1 }}
              onClick={() => suggestFrom(sel.length ? sel : base)}
            >
              Another idea
            </button>
            <button className="cta" style={{ marginTop: 0, padding: 12 }} onClick={onStart}>
              Done — I&apos;m calmer
            </button>
          </div>
        </div>
      ) : null}

      <h2>Watch and scroll</h2>
      <div className="card">
        {WATCH_LINKS.map(([label, sub, href]) => (
          <a
            key={label}
            className="card opt"
            style={{ display: 'block', color: 'var(--tx)', textDecoration: 'none', marginBottom: 10 }}
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
      <p className="s">Content is filtered to keep betting out of your feed.</p>
      <button className="cta" style={{ marginTop: 12 }} onClick={onStart}>
        I&apos;m calmer — continue
      </button>
    </Sheet>
  )
}
