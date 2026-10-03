import { useState } from 'react'
import { COMMUNITY_RULES, STORY_SOBER_FILTERS, STORY_TIME_FILTERS, soberBucket } from '../lib/constants'
import { formatUrgeTime } from '../lib/helpers'
import Icon from '../components/Icon'

const DEFAULT_FILTERS = { time: 'all', sober: 'any', media: 'any', from: 'any', sort: 'new' }

function inTimeWindow(t, f) {
  if (f === 'all') return true
  if (f === 'today') return new Date(t).toDateString() === new Date().toDateString()
  const ageDays = (Date.now() - t) / 864e5
  if (f === 'week') return ageDays <= 7
  if (f === 'month') return ageDays <= 30
  return true
}

function matchesFilters(post, f) {
  if (!inTimeWindow(post.t, f.time)) return false
  if (f.sober !== 'any') {
    if (post.soberDays == null) return false
    if (soberBucket(post.soberDays) !== f.sober) return false
  }
  if (f.media === 'media' && !(post.media?.length)) return false
  if (f.media === 'text' && post.media?.length) return false
  if (f.from === 'anon' && post.who) return false
  if (f.from === 'named' && !post.who) return false
  return true
}

function MediaGrid({ media }) {
  if (!media?.length) return null
  return (
    <div className="media-grid">
      {media.map((m, i) =>
        m.type.startsWith('video') ? (
          <video key={i} src={m.url} controls playsInline preload="metadata" />
        ) : (
          <img key={i} src={m.url} alt={`Shared attachment ${i + 1}`} loading="lazy" />
        ),
      )}
    </div>
  )
}

function SoberBadge({ days }) {
  if (days == null) return null
  return (
    <span className="sober-badge" title="Author’s sober streak when they posted">
      🌱 {days}d sober
    </span>
  )
}

function PostCard({ post, you, saved, onToast, onReport, onDelete, onToggleSave, liked, onToggleLike }) {
  return (
    <div className="card post enter">
      <div className="m">
        {(post.who || '') || 'Anonymous member'}
        {you ? ' · You' : ''} · {post.cat || 'Story'} · {formatUrgeTime(post.t)}
      </div>
      <div style={{ marginTop: 6 }}>
        <SoberBadge days={post.soberDays} />
      </div>
      <p style={{ marginTop: 6 }}>{post.text}</p>
      <MediaGrid media={post.media} />
      <div className="acts">
        <button
          aria-pressed={!!liked}
          onClick={() => {
            const on = !liked
            onToggleLike(on)
            onToast(on ? 'Support sent' : 'Support removed')
          }}
        >
          Support
        </button>
        <button aria-pressed={!!saved} onClick={() => onToggleSave(post)}>
          {saved ? 'Unsaved tip' : 'Save tip'}
        </button>
        <button onClick={() => onReport(post)}>Report</button>
        {you && onDelete ? <button onClick={() => onDelete(post)}>Delete</button> : null}
      </div>
    </div>
  )
}

function FilterRow({ label, options, value, onPick }) {
  return (
    <div style={{ marginTop: 10 }}>
      <p className="s">
        <b style={{ color: 'var(--tx)' }}>{label}</b>
      </p>
      <div style={{ marginTop: 6 }}>
        {options.map(([k, text]) => (
          <button key={k} className="chip" aria-pressed={value === k} onClick={() => onPick(k)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Community({ data, posts, isGuest, onLogin, onShare, onToast, onDeleteShared, onDeletePrivate, onReport, onToggleSave }) {
  const [liked, setLiked] = useState({})
  const [filter, setFilter] = useState('all')
  const [showRules, setShowRules] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [draft, setDraft] = useState(DEFAULT_FILTERS)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const seen = {}
  const all = []
  posts.concat(data.mine).forEach((x) => {
    const k = x.id || x.t
    if (!seen[k]) {
      seen[k] = 1
      all.push(x)
    }
  })
  const mineKeys = new Set(data.mine.map((x) => x.id || x.t))
  const savedTips = [...(data.savedTips || [])].sort((a, b) => (b.savedAt || b.t) - (a.savedAt || a.t))
  const savedKeys = new Set(savedTips.map((x) => x.id || x.t))
  const mine = all.filter((x) => mineKeys.has(x.id || x.t))
  const priv = [...(data.stories || [])].sort((a, b) => b.t - a.t)

  function apply(list) {
    const out = list.filter((x) => matchesFilters(x, filters))
    out.sort((a, b) => (filters.sort === 'new' ? b.t - a.t : a.t - b.t))
    return out
  }
  const visibleAll = apply(all)
  const visibleMine = apply(mine)

  const activeCount =
    (filters.time !== 'all' ? 1 : 0) +
    (filters.sober !== 'any' ? 1 : 0) +
    (filters.media !== 'any' ? 1 : 0) +
    (filters.from !== 'any' ? 1 : 0) +
    (filters.sort !== 'new' ? 1 : 0)
  const set = (k) => (v) => setDraft((f) => ({ ...f, [k]: v }))
  const draftActive =
    (draft.time !== 'all' ? 1 : 0) +
    (draft.sober !== 'any' ? 1 : 0) +
    (draft.media !== 'any' ? 1 : 0) +
    (draft.from !== 'any' ? 1 : 0) +
    (draft.sort !== 'new' ? 1 : 0)

  function openFilters() {
    setDraft(filters)
    setShowFilters(true)
  }

  function askDelete(kind, key) {
    setConfirmDelete({ kind, key })
  }

  function confirmYes() {
    if (!confirmDelete) return
    if (confirmDelete.kind === 'shared') onDeleteShared(confirmDelete.key)
    else onDeletePrivate(confirmDelete.key)
    setConfirmDelete(null)
  }

  return (
    <div>
      <h1>Community</h1>
      <p className="s">Moderated. Post anonymously or with a name you choose.</p>

      {isGuest ? (
        <div className="card" style={{ marginTop: 12, borderColor: 'var(--acc)' }}>
          <b>You&apos;re browsing as a guest</b>
          <p className="s" style={{ marginTop: 4 }}>
            Log in or create an account to share posts with the community. Your private journal works
            without an account.
          </p>
          <button className="cta" style={{ marginTop: 10, padding: '10px 14px', fontSize: 14 }} onClick={onLogin}>
            Log in / Sign up
          </button>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 12 }}>
        <button
          className="ghost"
          style={{ padding: 0, textAlign: 'left', width: 'auto' }}
          onClick={() => setShowRules((s) => !s)}
          aria-expanded={showRules}
        >
          <b>Community rules {showRules ? '▾' : '▸'}</b>
          <span className="s" style={{ display: 'block' }}>
            Read before you post. Reports go straight to the admin.
          </span>
        </button>
        {showRules ? (
          <ul style={{ marginTop: 10, paddingLeft: 18, fontSize: 14, lineHeight: 1.55 }}>
            {COMMUNITY_RULES.map(([t, s]) => (
              <li key={t} style={{ marginBottom: 6 }}>
                <b>{t}.</b> <span className="s">{s}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div style={{ marginTop: 12 }}>
        {['all', 'mine', 'saved', 'private'].map((f) => (
          <button
            key={f}
            className="chip"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === 'all'
              ? `All (${all.length})`
              : f === 'mine'
                ? `Mine (${mine.length})`
                : f === 'saved'
                  ? `Saved (${savedTips.length})`
                  : `Private (${priv.length})`}
          </button>
        ))}
      </div>

      {filter !== 'private' && filter !== 'saved' ? (
        <div className="card" style={{ marginTop: 10 }}>
          <button
            className="ghost"
            style={{ padding: 0, textAlign: 'left', width: 'auto' }}
            onClick={() => (showFilters ? setShowFilters(false) : openFilters())}
            aria-expanded={showFilters}
          >
            <b style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="sliders" size={18} />
              Filter stories {showFilters ? '▾' : '▸'}
              {activeCount ? ` · ${activeCount} applied` : ''}
            </b>
            <span className="s" style={{ display: 'block' }}>
              By time, sobriety streak, and more.
            </span>
          </button>
          {showFilters ? (
            <>
              <FilterRow label="Posted" options={STORY_TIME_FILTERS} value={draft.time} onPick={set('time')} />
              <FilterRow label="Author’s sober streak" options={STORY_SOBER_FILTERS} value={draft.sober} onPick={set('sober')} />
              <FilterRow
                label="Attachments"
                options={[
                  ['any', 'Any'],
                  ['media', 'With photos/video'],
                  ['text', 'Text only'],
                ]}
                value={draft.media}
                onPick={set('media')}
              />
              <FilterRow
                label="Posted as"
                options={[
                  ['any', 'Anyone'],
                  ['anon', 'Anonymous'],
                  ['named', 'Named'],
                ]}
                value={draft.from}
                onPick={set('from')}
              />
              <FilterRow
                label="Order"
                options={[
                  ['new', 'Newest first'],
                  ['old', 'Oldest first'],
                ]}
                value={draft.sort}
                onPick={set('sort')}
              />
              <div className="row" style={{ marginTop: 12 }}>
                <button
                  className="cta"
                  style={{ marginTop: 0, padding: 12 }}
                  onClick={() => {
                    setFilters(draft)
                    setShowFilters(false)
                  }}
                >
                  Apply filters{draftActive ? ` (${draftActive})` : ''}
                </button>
                <button
                  className="ghost"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setDraft(DEFAULT_FILTERS)
                    setFilters(DEFAULT_FILTERS)
                  }}
                >
                  Clear
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {filter === 'all' ? (
        <>
          {activeCount ? (
            <p className="s" style={{ marginTop: 10 }}>
              Showing {visibleAll.length} of {all.length} stories.
              {filters.sober !== 'any' ? ' Older stories without streak info are hidden.' : ''}
            </p>
          ) : null}
          {visibleAll.length ? (
            <div className="posts-grid">
              {visibleAll.map((x) => {
                const key = x.id || x.t
                return (
                  <PostCard
                    key={key}
                    post={x}
                    you={mineKeys.has(key)}
                    saved={savedKeys.has(key)}
                    onToggleSave={onToggleSave}
                    liked={liked[key]}
                    onToggleLike={(on) => setLiked((l) => ({ ...l, [key]: on }))}
                    onToast={onToast}
                    onReport={onReport}
                    onDelete={mineKeys.has(key) ? () => askDelete('shared', key) : null}
                  />
                )
              })}
            </div>
          ) : (
            <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
              <b>{all.length ? 'No stories match those filters' : 'No stories yet'}</b>
              <p className="s" style={{ marginTop: 6 }}>
                {all.length
                  ? 'Try widening the time range or clearing the streak filter.'
                  : 'Be the first to share. You can stay anonymous — it will appear here instantly.'}
              </p>
              {all.length ? (
                <button
                  className="ghost"
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS)
                    setDraft(DEFAULT_FILTERS)
                  }}
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          )}
        </>
      ) : null}

      {filter === 'mine' ? (
        mine.length ? (
          visibleMine.length ? (
            <div className="posts-grid">
              {visibleMine.map((x) => {
                const key = x.id || x.t
                return (
                  <PostCard
                    key={key}
                    post={x}
                    you
                    saved={savedKeys.has(key)}
                    onToggleSave={onToggleSave}
                    liked={liked[key]}
                    onToggleLike={(on) => setLiked((l) => ({ ...l, [key]: on }))}
                    onToast={onToast}
                    onReport={onReport}
                    onDelete={() => askDelete('shared', key)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
              <b>None of your stories match those filters</b>
              <p className="s" style={{ marginTop: 6 }}>
                Try widening the time range or clearing the streak filter.
              </p>
              <button
                className="ghost"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS)
                  setDraft(DEFAULT_FILTERS)
                }}
              >
                Clear all filters
              </button>
            </div>
          )
        ) : (
          <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
            <b>Nothing from you yet</b>
            <p className="s" style={{ marginTop: 6 }}>
              Anonymous posts appear here with an “Anonymous · You” label so you can always find them.
            </p>
          </div>
        )
      ) : null}

      {filter === 'saved' ? (
        savedTips.length ? (
          <div className="posts-grid">
            {savedTips.map((x) => {
              const key = x.id || x.t
              return (
                <PostCard
                  key={key}
                  post={x}
                  you={mineKeys.has(key)}
                  saved
                  onToggleSave={onToggleSave}
                  liked={liked[key]}
                  onToggleLike={(on) => setLiked((l) => ({ ...l, [key]: on }))}
                  onToast={onToast}
                  onReport={onReport}
                  onDelete={mineKeys.has(key) ? () => askDelete('shared', key) : null}
                />
              )
            })}
          </div>
        ) : (
          <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
            <b>No saved tips yet</b>
            <p className="s" style={{ marginTop: 6 }}>
              Tap “Save tip” on any story and it will wait for you here — even after you refresh or log
              back in.
            </p>
          </div>
        )
      ) : null}

      {filter === 'private' ? (
        priv.length ? (
          priv.map((x) => (
            <div className="card post anim-in" key={x.t}>
              <div className="m">Only you · {formatUrgeTime(x.t)}</div>
              <p>{x.text}</p>
              <div className="acts">
                <button onClick={() => askDelete('private', x.t)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
            <b>No private entries</b>
            <p className="s" style={{ marginTop: 6 }}>
              Choose “Only me” when sharing to keep a journal only you can see.
            </p>
          </div>
        )
      ) : null}

      {confirmDelete ? (
        <div className="card" style={{ marginTop: 12, borderColor: 'var(--urge)' }} role="alertdialog" aria-label="Confirm delete">
          <b>Delete this {confirmDelete.kind === 'shared' ? 'story' : 'journal entry'}?</b>
          <p className="s" style={{ marginTop: 4 }}>
            This cannot be undone on this device.
          </p>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="danger" style={{ marginTop: 0 }} onClick={confirmYes}>
              Delete
            </button>
            <button className="ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>
              Keep it
            </button>
          </div>
        </div>
      ) : null}

      <button className="cta" onClick={onShare}>
        Share your story
      </button>
    </div>
  )
}
