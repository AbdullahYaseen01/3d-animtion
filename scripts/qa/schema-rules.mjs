/**
 * Structured-data checks based on Google's documented required properties for
 * the types this store emits. Used by tests and by scripts/qa/validate-seo.mjs.
 * This is a guard against regressions, not a replacement for the Rich Results Test.
 */

export function extractJsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
}

const isAbsolute = (u) => typeof u === 'string' && /^https?:\/\/[^/]+/.test(u)
const isIsoDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/.test(d)
const nonEmpty = (v) => (Array.isArray(v) ? v.length > 0 : v != null && v !== '')

function findForbidden(node, path = '$', out = []) {
  if (Array.isArray(node)) node.forEach((n, i) => findForbidden(n, `${path}[${i}]`, out))
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'review' || k === 'aggregateRating') out.push(`${path}.${k}`)
      if (k === '@type' && (v === 'Review' || v === 'AggregateRating')) out.push(`${path} is ${v}`)
      findForbidden(v, `${path}.${k}`, out)
    }
  }
  return out
}

function checkList(items, label, errors, needs) {
  if (!Array.isArray(items) || !items.length) return errors.push(`${label}: itemListElement is empty`)
  items.forEach((it, i) => {
    if (it.position !== i + 1) errors.push(`${label}: position ${it.position} at index ${i}`)
    const url = it[needs]
    if (!isAbsolute(url)) errors.push(`${label}: item ${i + 1} ${needs} is not an absolute URL`)
    if (!nonEmpty(it.name)) errors.push(`${label}: item ${i + 1} has no name`)
  })
}

function checkOffer(offer, label, errors) {
  if (!offer) return errors.push(`${label}: no offers`)
  if (!/^\d+(\.\d{1,2})?$/.test(String(offer.price))) errors.push(`${label}: offer price "${offer.price}" is not a plain number`)
  if (!/^[A-Z]{3}$/.test(offer.priceCurrency ?? '')) errors.push(`${label}: offer has no ISO priceCurrency`)
  if (!/^https:\/\/schema\.org\/(InStock|OutOfStock|PreOrder|BackOrder|LimitedAvailability|SoldOut|Discontinued)$/.test(offer.availability ?? ''))
    errors.push(`${label}: offer availability is not a schema.org URL`)
}

/** Returns human-readable problems; an empty array means the block passes. */
export function validateJsonLd(block) {
  const errors = []
  const type = block['@type']
  const label = String(type)
  if (block['@context'] !== 'https://schema.org') errors.push(`${label}: @context must be https://schema.org`)
  if (!type) errors.push('block has no @type')
  for (const p of findForbidden(block)) errors.push(`${label}: review markup is not allowed (${p})`)

  switch (type) {
    case 'Organization':
      if (!nonEmpty(block.name) || !isAbsolute(block.url) || !isAbsolute(block.logo)) errors.push('Organization: needs name, absolute url and logo')
      break
    case 'WebSite':
      if (!nonEmpty(block.name) || !isAbsolute(block.url)) errors.push('WebSite: needs name and absolute url')
      if (block.potentialAction && !String(block.potentialAction.target?.urlTemplate ?? '').includes('{search_term_string}'))
        errors.push('WebSite: SearchAction urlTemplate must contain {search_term_string}')
      break
    case 'BreadcrumbList':
      checkList(block.itemListElement, 'BreadcrumbList', errors, 'item')
      break
    case 'ItemList':
      checkList(block.itemListElement, 'ItemList', errors, 'url')
      if (block.numberOfItems !== block.itemListElement?.length) errors.push('ItemList: numberOfItems does not match the list')
      break
    case 'ProductGroup':
      if (!nonEmpty(block.name) || !nonEmpty(block.image) || !nonEmpty(block.productGroupID)) errors.push('ProductGroup: needs name, image and productGroupID')
      if (!nonEmpty(block.hasVariant)) errors.push('ProductGroup: hasVariant is empty')
      for (const v of block.hasVariant ?? []) {
        const vl = `ProductGroup variant ${v.sku}`
        if (!nonEmpty(v.name) || !nonEmpty(v.sku) || !nonEmpty(v.image)) errors.push(`${vl}: needs name, sku and image`)
        if (v.inProductGroupWithID !== block.productGroupID) errors.push(`${vl}: inProductGroupWithID does not match`)
        checkOffer(v.offers, vl, errors)
      }
      break
    case 'Product':
      if (!nonEmpty(block.name) || !nonEmpty(block.image)) errors.push('Product: needs name and image')
      checkOffer(block.offers, 'Product', errors)
      break
    case 'Article':
      if (!nonEmpty(block.headline) || String(block.headline).length > 110) errors.push('Article: headline missing or over 110 characters')
      if (!nonEmpty(block.image)) errors.push('Article: image is required')
      if (!isIsoDate(block.datePublished)) errors.push('Article: datePublished must be an ISO date')
      if (!isIsoDate(block.dateModified) || block.dateModified < block.datePublished) errors.push('Article: dateModified must be an ISO date on or after datePublished')
      if (!nonEmpty(block.author?.name)) errors.push('Article: author needs a name')
      break
    case 'FAQPage':
      if (!nonEmpty(block.mainEntity)) errors.push('FAQPage: mainEntity is empty')
      for (const q of block.mainEntity ?? []) {
        if (q['@type'] !== 'Question' || !nonEmpty(q.name) || !nonEmpty(q.acceptedAnswer?.text)) errors.push(`FAQPage: incomplete question "${q.name}"`)
      }
      break
    default:
      errors.push(`${label}: unexpected type, add rules before emitting it`)
  }
  return errors
}
