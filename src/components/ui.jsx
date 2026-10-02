import { useState } from 'react'
import { COUNTRIES, CURRENCIES } from '../lib/constants'
import { crisisEntry } from '../lib/helpers'

export function Chip({ children, pressed, onToggle }) {
  const [on, setOn] = useState(!!pressed)
  const isControlled = pressed !== undefined
  const active = isControlled ? pressed : on
  return (
    <button
      className="chip"
      aria-pressed={active}
      onClick={() => {
        if (isControlled) onToggle?.(!active)
        else {
          setOn(!on)
          onToggle?.(!on)
        }
      }}
    >
      {children}
    </button>
  )
}

export function ToggleChips({ options, selected, onChange, multi = true }) {
  return (
    <div>
      {options.map((t) => {
        const active = multi ? selected.includes(t) : selected === t
        return (
          <button
            key={t}
            className="chip"
            aria-pressed={active}
            onClick={() => {
              if (multi) {
                onChange(active ? selected.filter((x) => x !== t) : [...selected, t])
              } else {
                onChange(t)
              }
            }}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

/** Card with selectable highlight, mirrors original pick() behaviour. */
export function SelectableCard({ selected, onSelect, title, sub, value }) {
  return (
    <button
      className="card opt"
      data-h={value !== undefined ? value : undefined}
      onClick={onSelect}
      style={{ borderColor: selected ? 'var(--acc)' : 'var(--line)' }}
    >
      <b>{title}</b>
      {sub ? <span>{sub}</span> : null}
    </button>
  )
}

export function CallButton({ number, display }) {
  return (
    <a
      className="cta"
      style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: 10, marginTop: 8 }}
      href={'tel:' + number}
    >
      Call {display}
    </a>
  )
}

export function SupportLines({ rows }) {
  return (
    <>
      {rows.map((r) => (
        <div className="card" style={{ marginTop: 10 }} key={r[0] + r[1]}>
          <b>{r[0]}</b>
          <CallButton number={r[1]} display={r[2]} />
          {r[3] ? (
            <a className="s" style={{ display: 'block', marginTop: 8 }} href={r[3]} target="_blank" rel="noopener">
              {r[3].replace('https://', '')}
            </a>
          ) : null}
        </div>
      ))}
    </>
  )
}

export function HelpCard({ country, onOpenCrisis }) {
  const c = crisisEntry(country)
  return (
    <div className="card" style={{ marginTop: 14 }}>
      <b>Help is available</b>
      <p className="s" style={{ margin: '4px 0 10px' }}>
        {c[1].length ? (
          <>In danger right now? Call {c[1][0][2]} ({c[0]}).</>
        ) : (
          <>In danger right now? Call your local emergency number ({c[0]}).</>
        )}
      </p>
      <button className="cta" style={{ margin: 0, padding: 11 }} onClick={onOpenCrisis}>
        Crisis numbers
      </button>
    </div>
  )
}

export function CountrySelect({ value, onChange }) {
  return (
    <select className="in" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Country">
      {COUNTRIES.map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  )
}

function stripDigits(s) {
  return (s ?? '').toString().replace(/[^0-9]/g, '')
}

export function formatGrouped(raw) {
  const digits = stripDigits(raw).replace(/^0+(?=\d)/, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-US')
}

// Text field that shows thousand separators (5,000) while storing raw digits.
export function AmountInput({ value, onChange, ...rest }) {
  return (
    <input
      {...rest}
      className="in"
      type="text"
      inputMode="numeric"
      placeholder="e.g. 5,000"
      value={formatGrouped(value)}
      onChange={(e) => {
        const prev = stripDigits(value)
        const next = stripDigits(e.target.value)
        // Deleting a comma leaves digits unchanged — drop the last digit instead.
        if (next === prev && e.target.value.length < formatGrouped(value).length) {
          onChange(prev.slice(0, -1))
        } else {
          onChange(next.replace(/^0+(?=\d)/, ''))
        }
      }}
    />
  )
}

export function CurrencySelect({ value, onChange }) {
  return (
    <select className="in" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Currency">
      {CURRENCIES.map(([code, symbol, name]) => (
        <option key={code} value={code}>
          {symbol} {code} — {name}
        </option>
      ))}
    </select>
  )
}
