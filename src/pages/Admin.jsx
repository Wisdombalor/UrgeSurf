import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { formatUrgeTime } from '../lib/helpers'
import Icon from '../components/Icon'

function shortId(id) {
  const s = String(id || '')
  return s.length > 12 ? s.slice(0, 8) + '…' : s || '(no id)'
}

export default function Admin({ user, isAdmin, localReports, onLogin, onTakedown, onDismiss, onToast }) {
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchReports = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !isAdmin) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id,created_at,post_id,post_text,post_who,reporter,reason,details,status')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      setRemote(
        (data || []).map((r) => ({
          id: r.id,
          t: new Date(r.created_at).getTime(),
          postId: r.post_id || '',
          postText: r.post_text || '',
          postWho: r.post_who || '',
          reporter: r.reporter || '',
          reason: r.reason || '',
          details: r.details || '',
          status: r.status || 'open',
          remote: true,
        })),
      )
    } catch {
      // local reports still listed below
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  if (!user || !isAdmin) {
    return (
      <div>
        <h1>Admin</h1>
        <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
          <b>Restricted area</b>
          <p className="s" style={{ marginTop: 6 }}>
            Only signed-in admins can review reported posts. Log in with an admin account to continue.
          </p>
          <button className="cta" style={{ padding: '12px 14px', fontSize: 15 }} onClick={onLogin}>
            Admin log in
          </button>
        </div>
      </div>
    )
  }

  const seen = new Set()
  const reports = []
  remote.concat(localReports || []).forEach((r) => {
    const k = (r.remote ? 'r' : 'l') + (r.id || r.postId)
    if (!seen.has(k)) {
      seen.add(k)
      reports.push(r)
    }
  })
  reports.sort((a, b) => b.t - a.t)
  const open = reports.filter((r) => r.status !== 'resolved')

  return (
    <div>
      <h1>Admin dashboard</h1>
      <p className="s">
        Signed in as {user.email} · {open.length} open report{open.length === 1 ? '' : 's'}
      </p>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="ghost" style={{ flex: 1 }} onClick={() => { fetchReports(); onToast('Reports refreshed') }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="check" size={16} /> Refresh
          </span>
        </button>
      </div>
      {loading && !reports.length ? (
        <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
          <p className="s">Loading reports…</p>
        </div>
      ) : null}
      {!open.length && !loading ? (
        <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
          <b>All clear</b>
          <p className="s" style={{ marginTop: 6 }}>
            No open reports. New reports from the community will appear here with their post ID.
          </p>
        </div>
      ) : null}
      <div className="posts-grid">
        {open.map((r) => (
          <div className="card post enter" key={(r.remote ? 'r' : 'l') + r.id}>
            <div className="m">
              Post ID <code className="post-id">{shortId(r.postId)}</code> · {formatUrgeTime(r.t)}
            </div>
            <p style={{ marginTop: 6, fontSize: 14 }}>
              <b>Reason:</b> {r.reason}
              {r.details ? ` — ${r.details}` : ''}
            </p>
            <p className="s" style={{ marginTop: 4 }}>
              Reported by {r.reporter || 'anonymous'}
              {r.postWho ? ` · posted as ${r.postWho}` : ''}
            </p>
            <div className="card" style={{ marginTop: 8 }}>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{r.postText || '(no content captured)'}</p>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="danger" style={{ marginTop: 0 }} onClick={() => onTakedown(r)}>
                Take down post
              </button>
              <button className="ghost" style={{ flex: 1 }} onClick={() => onDismiss(r)}>
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
