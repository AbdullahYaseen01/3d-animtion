import { useState } from 'react'
import { absoluteUrl } from '../../lib/seo'
import { store } from '../../config/store'
import './LinkToThis.css'

interface Props {
  /** Site-relative path of the header-less widget page. */
  embedPath: string
  /** Site-relative path of the full tool, used in the credit line under the iframe. */
  toolPath: string
  /** Anchor text for the credit line, e.g. "Shoe size converter (US, UK, EU, cm)". */
  label: string
  /** iframe title for assistive tech. */
  title: string
  /** Height in CSS pixels that fits the widget without an inner scrollbar. */
  height?: number
}

/**
 * Copyable iframe snippet. The credit line sits outside the iframe, in the host page's own HTML,
 * so a site that embeds the tool also publishes a normal link to the full version.
 */
export function EmbedThis({ embedPath, toolPath, label, title, height = 340 }: Props) {
  const src = absoluteUrl(embedPath)
  const full = absoluteUrl(toolPath)
  const html = [
    `<iframe src="${src}" title="${title}" width="100%" height="${height}" loading="lazy" style="border:0;max-width:40rem"></iframe>`,
    `<p>Tool: <a href="${full}">${label}</a> by ${store.name}</p>`,
  ].join('\n')
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
    <aside className="link-to-this" aria-labelledby="embed-this-title">
      <h2 id="embed-this-title" className="link-to-this__title">
        Embed this converter on your site
      </h2>
      <p>
        Paste this into a blog post, club newsletter page, or resource list. The converter runs inside the frame with no sign-up or ads, and
        the line below it credits the full version so readers can find the chart and measuring guide.
      </p>
      <div className="link-to-this__row">
        <textarea className="input link-to-this__code" readOnly rows={3} value={html} aria-label="HTML embed code" onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="btn btn--secondary" onClick={copy}>
          {copied ? 'Copied' : 'Copy embed code'}
        </button>
      </div>
      <p className="link-to-this__plain">
        Preview: <a href={src}>{src}</a>
      </p>
    </aside>
  )
}
