import { useState } from 'react'
import { absoluteUrl } from '../../lib/seo'
import { store } from '../../config/store'
import './LinkToThis.css'

interface Props {
  /** Site-relative path of the page being linked. */
  path: string
  /** Anchor text suggested in the snippet, e.g. "shoe size conversion chart". */
  label: string
  /** What the reader is linking to, in a few words, e.g. "this chart" or "this guide". */
  noun?: string
}

/**
 * A copyable attribution snippet. Publishers, teachers and forum users who reuse a
 * chart or guide get a ready-made credit line, which is how reference pages earn links.
 */
export function LinkToThis({ path, label, noun = 'this page' }: Props) {
  const url = absoluteUrl(path)
  const html = `<a href="${url}">${label}</a> by ${store.name}`
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable: the text is still selectable */
    }
  }

  return (
    <aside className="link-to-this" aria-labelledby="link-to-this-title">
      <h2 id="link-to-this-title" className="link-to-this__title">
        Reuse {noun}
      </h2>
      <p>
        You are welcome to quote or reproduce {noun} on your own site, class handout, or forum post. Please credit it with a link so readers can
        find the current version:
      </p>
      <div className="link-to-this__row">
        <input className="input link-to-this__code" readOnly value={html} aria-label="HTML credit line" onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="btn btn--secondary" onClick={copy}>
          {copied ? 'Copied' : 'Copy HTML'}
        </button>
      </div>
      <p className="link-to-this__plain">
        Plain text: {label} – {url}
      </p>
    </aside>
  )
}
