import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { adminHash } from '../lib/constants'
import { formatUrgeTime } from '../lib/helpers'
import Icon from '../components/Icon'

const NAV = [
  ['dashboard', 'Dashboard'],
  ['reports', 'Reports'],
  ['posts', 'Posts'],
  ['users', 'Users'],
  ['history', 'History'],
]

const STATUSES = ['pending', 'reviewed', 'resolved', 'dismissed']
const TYPES = ['post', 'user']

function shortId(id) {
  const s = String(id || '')
  return s.length > 12 ? s.slice(0, 8) + '…' : s || '(no id)'
}

function fullId(id) {
  return String(id || '(no id)')
}

function mapReport(r, remote) {
  return remote
    ? {
        id: r.id,
        t: new Date(r.created_at).getTime(),
        type: r.type || 'post',
        postId: r.post_id || '',
        postText: r.post_text || '',
        postWho: r.post_who || '',
        reportedUserId: r.reported_user_id || null,
        reporter: r.reporter || '',
        reason: r.reason || '',
        details: r.details || '',
        status: r.status || 'pending',
        actionTaken: r.action_taken || '',
        remote: true,
      }
    : { ...r, remote: false }
}

export default function AdminArea({
  user,
  sub,
  data,
  posts,
  onToast,
  onPostRemoved,
  onRefreshPosts,
  onLogAction,
  onSetReportStatus,
  onSetPostState,
  onSetStanding,
  onExit,
}) {
  const [remoteReports, setRemoteReports] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [users, setUsers] = useState([])
  const [log, setLog] = useState([])
  const [stats, setStats] = useState(null)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)
  const [busy, setBusy] = useState(false)

  const db = supabase && isSupabaseConfigured ? supabase : null

  const fetchAll = useCallback(async () => {
    if (!db) return
    try {
      const [rep, pst, usr, lg] = await Promise.all([
        db.from('reports').select('*').order('created_at', { ascending: false }).limit(200),
        db.from('posts').select('id,created_at,text,who,sober_days,owner_id,mod_state').order('created_at', { ascending: false }).limit(200),
        db.from('profiles').select('id,name,email,is_admin,status,warnings,created_at').order('created_at', { ascending: false }).limit(200),
        db.from('moderation_log').select('*').order('created_at', { ascending: false }).limit(100),
      ])
      if (rep.data) {
        setRemoteReports(
          rep.data.map((r) => ({
            id: r.id,
            t: new Date(r.created_at).getTime(),
            type: r.type || 'post',
            postId: r.post_id || '',
            postText: r.post_text || '',
            postWho: r.post_who || '',
            reportedUserId: r.reported_user_id || null,
            reporter: r.reporter || '',
            reason: r.reason || '',
            details: r.details || '',
            status: r.status || 'pending',
            actionTaken: r.action_taken || '',
            remote: true,
          })),
        )
      }
      if (pst.data) {
        setAllPosts(
          pst.data.map((r) => ({
            id: r.id,
            t: new Date(r.created_at).getTime(),
            text: r.text,
            who: r.who || '',
            soberDays: r.sober_days ?? null,
            owner: r.owner_id || '',
            modState: r.mod_state || 'active',
          })),
        )
      }
      if (usr.data) setUsers(usr.data)
      if (lg.data) setLog(lg.data)
    } catch {
      // local fallbacks below still render
    }
  }, [db])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const reports = useMemo(() => {
    const seen = new Set()
    const out = []
    remoteReports.concat((data.reports || []).map((r) => mapReport(r, false))).forEach((r) => {
      const k = (r.remote ? 'r' : 'l') + r.id
      if (!seen.has(k)) {
        seen.add(k)
        out.push(r)
      }
    })
    return out.sort((a, b) => b.t - a.t)
  }, [remoteReports, data.reports])

  useEffect(() => {
    const pending = reports.filter((r) => r.status === 'pending').length
    const resolved = reports.filter((r) => r.status === 'resolved').length
    const activeUsers = users.filter((u) => (u.status || 'active') === 'active').length
    const restricted = users.filter((u) => (u.status || 'active') !== 'active').length
    const removed = allPosts.filter((p) => p.modState === 'removed').length
    const hidden = allPosts.filter((p) => p.modState === 'hidden').length
    setStats({ pending, resolved, activeUsers, restricted, removed, hidden, totalReports: reports.length })
  }, [reports, users, allPosts])

  async function run(fn) {
    if (busy) return
    setBusy(true)
    try {
      await fn()
      await fetchAll()
      onRefreshPosts()
    } finally {
      setBusy(false)
    }
  }

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (query) {
      const q = query.toLowerCase()
      const hay = `${r.id} ${r.postId} ${r.postText} ${r.reason} ${r.reporter} ${r.postWho}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const postById = (id) => allPosts.find((p) => String(p.id) === String(id))
  const userById = (id) => users.find((u) => String(u.id) === String(id))
  const reportsForPost = (id) => reports.filter((r) => String(r.postId) === String(id))
  const reportsForUser = (id) =>
    reports.filter((r) => String(r.reportedUserId) === String(id) || (r.type === 'user' && r.postWho && userById(id)?.name === r.postWho))
  const postsByUser = (id) => allPosts.filter((p) => String(p.owner) === String(id))

  async function actOnReportStatus(r, status) {
    await run(async () => {
      await onSetReportStatus(r, status, r.actionTaken)
      await onLogAction({
        action: `report_${status}`,
        targetType: 'report',
        targetId: r.id,
        prevState: r.status,
        newState: status,
      })
    })
    onToast(`Report marked ${status}`)
  }

  async function actRemovePost(postId, prevState, report) {
    await run(async () => {
      const ok = await onSetPostState(postId, 'removed', prevState)
      if (!ok) {
        onToast('Could not remove post')
        return
      }
      onPostRemoved(postId)
      if (report) await onSetReportStatus(report, 'resolved', 'post_removed')
      await onLogAction({
        action: 'post_removed',
        targetType: 'post',
        targetId: postId,
        prevState: prevState || 'active',
        newState: 'removed',
        note: report ? `report ${report.id}` : '',
      })
    })
    onToast('Post removed')
  }

  async function actRestorePost(postId, prevState) {
    await run(async () => {
      const ok = await onSetPostState(postId, 'active', prevState)
      if (!ok) onToast('Could not restore post')
      else {
        await onLogAction({
          action: 'post_restored',
          targetType: 'post',
          targetId: postId,
          prevState: prevState || 'removed',
          newState: 'active',
        })
        onToast('Post restored')
      }
    })
  }

  async function actHidePost(postId, prevState, report) {
    await run(async () => {
      const ok = await onSetPostState(postId, 'hidden', prevState)
      if (!ok) {
        onToast('Could not hide post')
        return
      }
      onPostRemoved(postId)
      if (report) await onSetReportStatus(report, 'resolved', 'post_hidden')
      await onLogAction({
        action: 'post_hidden',
        targetType: 'post',
        targetId: postId,
        prevState: prevState || 'active',
        newState: 'hidden',
        note: report ? `report ${report.id}` : '',
      })
    })
    onToast('Post hidden')
  }

  async function actStanding(targetId, patch, actionLabel) {
    await run(async () => {
      const target = userById(targetId)
      const ok = await onSetStanding(targetId, { ...patch, action: actionLabel })
      if (!ok) onToast('Could not update user')
      else onToast(`User ${actionLabel.replace(/_/g, ' ')}`)
    })
  }

  function authorActions(uid, label) {
    if (!uid) return null
    const target = userById(uid)
    const standing = target?.status || 'active'
    return (
      <div className="row" style={{ marginTop: 8 }}>
        <button
          className="ghost"
          style={{ flex: 1 }}
          disabled={busy}
          onClick={() => actStanding(uid, { warnings: (target?.warnings || 0) + 1, note: `warned re ${label}` }, 'user_warned')}
        >
          Warn{target?.warnings ? ` (${target.warnings})` : ''}
        </button>
        {standing === 'active' ? (
          <>
            <button className="danger" style={{ flex: 1, marginTop: 0 }} disabled={busy} onClick={() => actStanding(uid, { status: 'suspended', note: `suspended re ${label}` }, 'user_suspended')}>
              Suspend
            </button>
            <button className="danger" style={{ flex: 1, marginTop: 0 }} disabled={busy} onClick={() => actStanding(uid, { status: 'banned', note: `banned re ${label}` }, 'user_banned')}>
              Ban
            </button>
          </>
        ) : (
          <button className="cta" style={{ flex: 1, marginTop: 0, padding: '10px 14px', fontSize: 14 }} disabled={busy} onClick={() => actStanding(uid, { status: 'active', note: `restored re ${label}` }, 'user_restored')}>
            Restore
          </button>
        )}
      </div>
    )
  }

  const q = query.trim().toLowerCase()
  const matchedUsers = !q
    ? users
    : users.filter((u) => `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(q))
  const matchedPosts = !q
    ? allPosts
    : allPosts.filter((p) => `${p.id} ${p.text} ${p.who}`.toLowerCase().includes(q))

  return (
    <div>
      <div className="row" style={{ alignItems: 'center' }}>
        <p className="s brand-line">
          <b style={{ color: 'var(--acc)' }}>Admin</b>
          <span>moderation · {user.email}</span>
        </p>
        <button className="icon-btn" aria-label="Back to app" onClick={onExit}>
          <Icon name="chevR" size={24} />
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        {NAV.map(([key, label]) => (
          <button
            key={key}
            className="chip"
            aria-pressed={sub === key}
            onClick={() => {
              window.location.hash = adminHash(key === 'dashboard' ? '' : key)
            }}
          >
            {label}
            {key === 'reports' && stats?.pending ? ` (${stats.pending})` : ''}
          </button>
        ))}
      </div>

      {sub === 'dashboard' || !NAV.some(([k]) => k === sub) ? (
        <section>
          <h2>Overview</h2>
          {!db ? (
            <div className="error-banner">Admin backend is not connected (missing Supabase URL). Local reports still appear under Reports.</div>
          ) : null}
          <div className="row" style={{ marginTop: 10 }}>
            <div className="card stat">
              <b>{stats?.pending ?? '—'}</b>
              <span>pending reports</span>
            </div>
            <div className="card stat">
              <b>{stats?.resolved ?? '—'}</b>
              <span>reports resolved</span>
            </div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <div className="card stat">
              <b>{stats?.activeUsers ?? '—'}</b>
              <span>active users</span>
            </div>
            <div className="card stat">
              <b>{stats?.restricted ?? '—'}</b>
              <span>suspended / banned</span>
            </div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <div className="card stat">
              <b>{stats?.removed ?? '—'}</b>
              <span>posts removed</span>
            </div>
            <div className="card stat">
              <b>{stats?.hidden ?? '—'}</b>
              <span>posts hidden</span>
            </div>
          </div>
          <h2>Recent moderation activity</h2>
          {log.slice(0, 5).map((e) => (
            <div className="card post anim-in" key={e.id}>
              <div className="m">
                Admin {shortId(e.admin_id)} {e.action?.replace(/_/g, ' ')} {e.target_type} {shortId(e.target_id)} · {formatUrgeTime(new Date(e.created_at).getTime())}
              </div>
              <p className="s" style={{ marginTop: 4 }}>
                {e.prev_state || '—'} → {e.new_state || '—'}
                {e.note ? ` · ${e.note}` : ''}
              </p>
            </div>
          ))}
          {!log.length ? <p className="s" style={{ marginTop: 8 }}>No admin actions recorded yet.</p> : null}
        </section>
      ) : null}

      {sub === 'reports' ? (
        <section>
          <h2>Reports queue</h2>
          <input
            className="in"
            placeholder="Search by report ID, post ID, text, reporter…"
            value={query}
            aria-label="Search reports"
            onChange={(e) => setQuery(e.target.value)}
          />
          <div style={{ marginTop: 10 }}>
            <p className="s"><b style={{ color: 'var(--tx)' }}>Status</b></p>
            <div style={{ marginTop: 6 }}>
              {['all', ...STATUSES].map((s) => (
                <button key={s} className="chip" aria-pressed={statusFilter === s} onClick={() => setStatusFilter(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <p className="s"><b style={{ color: 'var(--tx)' }}>Type</b></p>
            <div style={{ marginTop: 6 }}>
              {['all', ...TYPES].map((t) => (
                <button key={t} className="chip" aria-pressed={typeFilter === t} onClick={() => setTypeFilter(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {!filteredReports.length ? (
            <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
              <b>No reports match</b>
              <p className="s" style={{ marginTop: 6 }}>Try a different status, type, or search.</p>
            </div>
          ) : null}
          <div className="posts-grid">
            {filteredReports.map((r) => {
              const linked = r.type === 'post' ? postById(r.postId) : null
              const open = openId === (r.remote ? 'r' : 'l') + r.id
              return (
                <div className="card post enter" key={(r.remote ? 'r' : 'l') + r.id}>
                  <div className="m">
                    {r.type} report · <code className="post-id">{shortId(r.id)}</code> · {r.status} · {formatUrgeTime(r.t)}
                  </div>
                  <p style={{ marginTop: 6, fontSize: 14 }}>
                    <b>{r.reason}</b>
                    {r.details ? ` — ${r.details}` : ''}
                  </p>
                  <p className="s" style={{ marginTop: 4 }}>
                    {r.type === 'post' ? (
                      <>Post <code className="post-id">{shortId(r.postId)}</code> · </>
                    ) : (
                      <>User {r.reportedUserId ? <code className="post-id">{shortId(r.reportedUserId)}</code> : (r.reportedUserLabel || r.postWho || 'unknown')} · </>
                    )}
                    reported by {r.reporter || 'anonymous'}
                  </p>
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="ghost" style={{ flex: 1 }} onClick={() => setOpenId(open ? null : (r.remote ? 'r' : 'l') + r.id)}>
                      {open ? 'Hide details' : 'Inspect'}
                    </button>
                    <button className="ghost" style={{ flex: 1 }} disabled={busy} onClick={() => actOnReportStatus(r, 'reviewed')}>
                      Mark reviewed
                    </button>
                  </div>
                  {open ? (
                    <div className="card" style={{ marginTop: 8 }}>
                      <p className="s">Report ID</p>
                      <p style={{ fontSize: 13, wordBreak: 'break-all' }}>{fullId(r.id)}</p>
                      {r.type === 'post' ? (
                        <>
                          <p className="s" style={{ marginTop: 8 }}>Reported content</p>
                          {linked ? (
                            <p style={{ fontSize: 14, marginTop: 4 }}>{linked.text}</p>
                          ) : (
                            <p style={{ fontSize: 14, marginTop: 4 }}>{r.postText || '(post no longer available)'}</p>
                          )}
                          <p className="s" style={{ marginTop: 4 }}>
                            State: {linked ? linked.modState : 'removed or missing'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="s" style={{ marginTop: 8 }}>Reported user</p>
                          <p style={{ fontSize: 14, marginTop: 4 }}>
                            {userById(r.reportedUserId)?.name || r.reportedUserLabel || r.postWho || 'unknown'}
                            {r.reportedUserId ? ` (${fullId(r.reportedUserId)})` : ''}
                          </p>
                        </>
                      )}
                      <div className="row" style={{ marginTop: 8 }}>
                        {r.type === 'post' && linked && linked.modState === 'active' ? (
                          <>
                            <button className="ghost" style={{ flex: 1 }} disabled={busy} onClick={() => actHidePost(r.postId, linked.modState, r)}>
                              Hide post
                            </button>
                            <button className="danger" style={{ flex: 1, marginTop: 0 }} disabled={busy} onClick={() => actRemovePost(r.postId, linked.modState, r)}>
                              Remove post
                            </button>
                          </>
                        ) : null}
                        <button className="ghost" style={{ flex: 1 }} disabled={busy} onClick={() => actOnReportStatus(r, 'resolved')}>
                          Resolve
                        </button>
                        <button className="ghost" style={{ flex: 1 }} disabled={busy} onClick={() => actOnReportStatus(r, 'dismissed')}>
                          Dismiss
                        </button>
                      </div>
                      {authorActions(r.reportedUserId || linked?.owner, `report ${shortId(r.id)}`)}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {sub === 'posts' ? (
        <section>
          <h2>Posts</h2>
          <input
            className="in"
            placeholder="Search by post ID, text, or author…"
            value={query}
            aria-label="Search posts"
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="posts-grid">
            {matchedPosts.map((p) => (
              <div className="card post enter" key={p.id}>
                <div className="m">
                  <code className="post-id">{shortId(p.id)}</code> · {p.modState} · {formatUrgeTime(p.t)}
                </div>
                <p style={{ marginTop: 6, fontSize: 14 }}>{p.text}</p>
                <p className="s" style={{ marginTop: 4 }}>
                  by {p.who || 'anonymous'} · {reportsForPost(p.id).length} report(s)
                </p>
                {p.modState === 'active' ? (
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="ghost" style={{ flex: 1 }} disabled={busy} onClick={() => actHidePost(p.id, p.modState, null)}>
                      Hide
                    </button>
                    <button className="danger" style={{ flex: 1, marginTop: 0 }} disabled={busy} onClick={() => actRemovePost(p.id, p.modState, null)}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="cta" style={{ flex: 1, marginTop: 0, padding: '10px 14px', fontSize: 14 }} disabled={busy} onClick={() => actRestorePost(p.id, p.modState)}>
                      Restore to active
                    </button>
                  </div>
                )}
                {authorActions(p.owner, `post ${shortId(p.id)}`)}
              </div>
            ))}
          </div>
          {!matchedPosts.length ? (
            <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
              <b>No posts found</b>
            </div>
          ) : null}
        </section>
      ) : null}

      {sub === 'users' ? (
        <section>
          <h2>Users</h2>
          <input
            className="in"
            placeholder="Search by name, email, or user ID…"
            value={query}
            aria-label="Search users"
            onChange={(e) => setQuery(e.target.value)}
          />
          {!matchedUsers.length ? (
            <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
              <b>No users found</b>
              <p className="s" style={{ marginTop: 6 }}>Users appear here after they log in once.</p>
            </div>
          ) : null}
          {matchedUsers.map((u) => {
            const open = openId === 'u' + u.id
            const uposts = postsByUser(u.id)
            const ureports = reportsForUser(u.id)
            return (
              <div className="card post enter" key={u.id}>
                <div className="m"><code className="post-id">{shortId(u.id)}</code></div>
                <p style={{ marginTop: 6 }}>
                  <b>{u.name || '(no name)'}</b> · {u.email || '(no email)'}
                </p>
                <p className="s" style={{ marginTop: 4 }}>
                  {u.status || 'active'}
                  {u.is_admin ? ' · admin' : ''} · warnings: {u.warnings || 0} · {uposts.length} post(s) · {ureports.length} report(s)
                </p>
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="ghost" style={{ flex: 1 }} onClick={() => setOpenId(open ? null : 'u' + u.id)}>
                    {open ? 'Hide profile' : 'View profile'}
                  </button>
                </div>
                {open ? (
                  <div className="card" style={{ marginTop: 8 }}>
                    <p className="s">User ID</p>
                    <p style={{ fontSize: 13, wordBreak: 'break-all' }}>{fullId(u.id)}</p>
                    <p className="s" style={{ marginTop: 8 }}>Posts ({uposts.length})</p>
                    {uposts.slice(0, 5).map((p) => (
                      <p key={p.id} className="s" style={{ marginTop: 4 }}>
                        <code className="post-id">{shortId(p.id)}</code> {p.modState} — {(p.text || '').slice(0, 80)}
                      </p>
                    ))}
                    {!uposts.length ? <p className="s">No posts.</p> : null}
                    <p className="s" style={{ marginTop: 8 }}>Reports about them ({ureports.length})</p>
                    {ureports.slice(0, 5).map((r) => (
                      <p key={(r.remote ? 'r' : 'l') + r.id} className="s" style={{ marginTop: 4 }}>
                        {r.status} — {r.reason} ({shortId(r.id)})
                      </p>
                    ))}
                    {!ureports.length ? <p className="s">None.</p> : null}
                    {authorActions(u.id, `user ${shortId(u.id)}`)}
                  </div>
                ) : null}
              </div>
            )
          })}
        </section>
      ) : null}

      {sub === 'history' ? (
        <section>
          <h2>Moderation history</h2>
          <p className="s">Every admin action, newest first. Entries are append-only.</p>
          {!log.length ? (
            <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
              <b>No actions yet</b>
            </div>
          ) : null}
          {log.map((e) => (
            <div className="card post anim-in" key={e.id}>
              <div className="m">
                {formatUrgeTime(new Date(e.created_at).getTime())} · Admin <code className="post-id">{shortId(e.admin_id)}</code>
              </div>
              <p style={{ marginTop: 6, fontSize: 14 }}>
                <b>{(e.action || '').replace(/_/g, ' ')}</b> — {e.target_type} <code className="post-id">{shortId(e.target_id)}</code>
              </p>
              <p className="s" style={{ marginTop: 4 }}>
                {e.prev_state || '—'} → {e.new_state || '—'}
                {e.note ? ` · ${e.note}` : ''}
              </p>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}
