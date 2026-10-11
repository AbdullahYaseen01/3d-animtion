/**
 * Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver share the index).
 * Google does not use IndexNow; it crawls the sitemap in robots.txt on its own schedule.
 *
 *   node scripts/seo/indexnow.mjs            # all sitemap URLs
 *   node scripts/seo/indexnow.mjs /guides/x  # specific paths
 *
 * The key is proven by the file public/<key>.txt, which Vite copies to the site root.
 */
const key = '36b54e162a7cd6c4dc50535704236629'
const site = (process.env.VITE_SITE_URL || 'https://westorastyle.com').replace(/\/$/, '')
const host = new URL(site).host

async function sitemapUrls() {
  const res = await fetch(`${site}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap.xml ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(site))
}

const keyCheck = await fetch(`${site}/${key}.txt`)
if (!keyCheck.ok || (await keyCheck.text()).trim() !== key) {
  console.error(`Key file ${site}/${key}.txt is not live yet. Deploy first.`)
  process.exit(1)
}

const args = process.argv.slice(2)
const urlList = args.length ? args.map((p) => (p.startsWith('http') ? p : `${site}${p}`)) : await sitemapUrls()

// IndexNow accepts up to 10,000 URLs per request; stay well under it.
for (let i = 0; i < urlList.length; i += 500) {
  const batch = urlList.slice(i, i + 500)
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList: batch }),
  })
  console.log(`IndexNow ${res.status} ${res.statusText} for ${batch.length} URLs`)
  if (res.status >= 400) {
    console.error(await res.text())
    process.exit(1)
  }
}
console.log(`Submitted ${urlList.length} URLs for ${host}`)
