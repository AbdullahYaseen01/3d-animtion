import type { DepartmentSlug, Product, ShoeUse } from '../catalog/types'
import { brandOf } from './productText.js'

/**
 * One source for search targeting. Titles exclude the brand suffix (Seo appends it), stay 34–44
 * characters so the branded title fits 50–60, and lead with the primary keyword.
 * Descriptions are 140–160 characters. Volumes are estimates or unknown; never invented as exact.
 */
export type KeywordTier = 1 | 2 | 3 | 'info'
export type KeywordIntent = 'transactional' | 'commercial' | 'informational' | 'navigational'

export interface SeoTarget {
  primary: string
  supporting: string[]
  title: string
  description: string
  h1: string
  tier: KeywordTier
  intent: KeywordIntent
  /** Monthly US searches. Use "unknown" when no tool figure exists. */
  estimatedVolume: number | 'unknown'
  volumeSource: string
  currentRank: 'unknown'
  winnability: string
}

export type PageKey =
  | 'home'
  | 'shop'
  | 'guides'
  | 'about'
  | 'faq'
  | 'shipping'
  | 'returns'
  | 'fitGuide'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'press'
  | 'shoeSizeConverter'

const UNKNOWN = {
  estimatedVolume: 'unknown' as const,
  volumeSource: 'unknown',
  currentRank: 'unknown' as const,
}

export const pageKeywords: Record<PageKey, SeoTarget> = {
  home: {
    primary: 'Westora Style online store',
    supporting: ["men's sneakers", "men's coats", "women's handbags", "men's watches", "women's gold plated jewelry"],
    title: 'Sneakers, Coats, Handbags & Watches',
    description:
      "Shop men's sneakers, jackets, coats, and watches plus women's handbags and gold-plated jewelry. Free US standard shipping and 30-day returns.",
    h1: 'Sneakers, coats, handbags & watches',
    tier: 2,
    intent: 'navigational',
    ...UNKNOWN,
    winnability: 'Brand query is contested by similarly named stores; this page is the home entity, not a head-term target.',
  },
  shop: {
    primary: 'Westora Style shop all',
    supporting: ['online clothing store', "men's outerwear", 'accessories online', 'gifts for him', 'gifts for her'],
    title: 'Shop Westora Style US Online Store',
    description:
      "Browse every Westora Style piece: men's sneakers, jackets, hoodies, coats, wallets, and watches, plus women's handbags and jewelry. Filter by size and color.",
    h1: 'Shop the Westora Style US store',
    tier: 2,
    intent: 'navigational',
    ...UNKNOWN,
    winnability: 'Nobody searches "shop all"; this page serves the brand plus catalog browse.',
  },
  guides: {
    primary: 'style, fit and care guides',
    supporting: ['how to choose a coat', 'shoe size guide', 'jewelry care', 'gift guide for him', 'gift guide for her'],
    title: 'Style, Fit & Care Guides for Men and Women',
    description:
      'Practical guides to sizing sneakers and jackets, choosing coats, bags, and watches, caring for leather and gold plating, and picking gifts from our catalog.',
    h1: 'Style, fit & care guides',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Hub page for informational queries already assigned to individual guides.',
  },
  about: {
    primary: 'about Westora Style',
    supporting: ['online accessories store', 'curated brands', 'Pakistani brands', 'US shipping'],
    title: 'About Us: How We Choose What We Sell',
    description:
      'Westora Style is a small online store that curates sneakers, outerwear, bags, jewelry, and watches from named brands and ships them to US customers.',
    h1: 'About Westora Style',
    tier: 2,
    intent: 'navigational',
    ...UNKNOWN,
    winnability: 'Only useful once people search the brand name.',
  },
  faq: {
    primary: 'Westora Style FAQ',
    supporting: ['sizing questions', 'shipping questions', 'return questions', 'payment methods'],
    title: 'FAQ: Sizing, Shipping, Returns & Payment',
    description:
      'Answers to common questions about shoe and apparel sizing, US shipping times, 30-day returns, payment methods, and product care at Westora Style.',
    h1: 'Frequently asked questions',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Supports branded help queries after the first orders.',
  },
  shipping: {
    primary: 'Westora Style shipping',
    supporting: ['US delivery times', 'free standard shipping', 'order processing', 'order tracking'],
    title: 'Shipping Information & US Delivery Times',
    description:
      'How Westora Style ships orders to US addresses: order processing time, the standard delivery window, shipping costs, and what happens after you check out.',
    h1: 'Shipping information',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Policy page; ranks for brand + shipping once the domain is known.',
  },
  returns: {
    primary: '30-day return policy',
    supporting: ['how to return an order', 'refund timing', 'return eligibility', 'unworn shoes'],
    title: '30-Day Return Policy & How to Return',
    description:
      'Return eligible Westora Style items within 30 days in original condition. See what qualifies, how to start a return, and when your refund is issued.',
    h1: '30-day return policy',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Policy page; brand + returns is the realistic query.',
  },
  fitGuide: {
    primary: 'US to EU shoe size men',
    supporting: ['US to UK shoe size', 'shoe size chart', 'how to measure feet', 'jacket size guide'],
    title: 'US to EU Men\'s Shoe Size Converter',
    description:
      "Convert US men's and women's shoe sizes to UK and EU, measure your foot length at home, and check how our jackets, hoodies, and coats are sized.",
    h1: 'US to EU men\'s shoe size chart',
    tier: 1,
    intent: 'informational',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: People also ask for how to measure foot size; converter long-tail is the winnable form',
    currentRank: 'unknown',
    winnability: 'Long-tail converter queries are less competitive than "shoe size chart" alone.',
  },
  contact: {
    primary: 'contact Westora Style',
    supporting: ['customer service', 'sizing help', 'order help', 'return help'],
    title: 'Contact Us: Sizing, Order & Return Help',
    description:
      'Email Westora Style with questions about sizing, an order, shipping, or a return. Include your order number and we will reply with a clear answer.',
    h1: 'Contact us',
    tier: 2,
    intent: 'navigational',
    ...UNKNOWN,
    winnability: 'Brand help query only.',
  },
  privacy: {
    primary: 'Westora Style privacy policy',
    supporting: ['personal data', 'cookies', 'payment data'],
    title: 'Privacy Policy: How We Use Your Data',
    description:
      'How Westora Style collects, uses, and protects the personal information you share when you browse, place an order, or contact our support team.',
    h1: 'Privacy policy',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Required legal page, not a demand target.',
  },
  terms: {
    primary: 'Westora Style terms of service',
    supporting: ['order terms', 'pricing', 'returns terms'],
    title: 'Terms of Service for Orders & Site Use',
    description:
      'The terms that apply when you browse westorastyle.com or place an order, covering pricing, payment, shipping, returns, and use of the website.',
    h1: 'Terms of service',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Required legal page, not a demand target.',
  },
  press: {
    primary: 'Westora Style press kit',
    supporting: ['press kit', 'media contact', 'brand facts', 'product images'],
    title: 'Press & Media: Facts, Images & Contact',
    description:
      'Press information for Westora Style: verified store facts, the brands we carry, policies, product image use, and how journalists can reach us.',
    h1: 'Press & media',
    tier: 2,
    intent: 'navigational',
    ...UNKNOWN,
    winnability: 'Outreach landing page for journalists.',
  },
  shoeSizeConverter: {
    primary: 'US to EU shoe size converter',
    supporting: ['US to UK shoe size men', 'shoe size conversion chart', 'cm to US shoe size'],
    title: 'Shoe Size Converter: US, UK, EU, cm',
    description:
      "Convert men's and women's shoe sizes between US, UK, EU, and centimeters. Use the same chart as our sneakers, then open the fit guide for measuring tips.",
    h1: 'Shoe size converter: US, UK, EU, and cm',
    tier: 1,
    intent: 'informational',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: People also ask and related searches around US to EU shoe size',
    currentRank: 'unknown',
    winnability: 'A working tool is more linkable than a static chart and matches a demonstrated query shape.',
  },
}

export const departmentKeywords: Record<DepartmentSlug, SeoTarget> = {
  shoes: {
    primary: 'mens mesh and casual sneakers',
    supporting: ['mens mesh sneakers', 'mens slip-on sneakers', 'mens casual lace-up sneakers', "men's sneakers"],
    title: "Men's Mesh and Casual Sneakers, US",
    description:
      "Shop men's mesh lace-ups, casual low-tops, and slip-ons in standard width, US men's sizes. Free US shipping and 30-day returns on unused pairs.",
    h1: "Men's mesh and casual sneakers",
    tier: 1,
    intent: 'commercial',
    estimatedVolume: 'unknown',
    volumeSource: 'unknown; "men\'s sneakers" is a year-one head term we do not target as primary',
    currentRank: 'unknown',
    winnability: 'Brand plus product type matches the only sneaker brand we stock.',
  },
  handbags: {
    primary: 'womens shoulder and hobo bags',
    supporting: ['hobo bag', 'small crossbody bag with zipper', 'womens crossbody bags under 50', "women's handbags"],
    title: 'Women\'s Shoulder, Hobo & Crossbody Bags',
    description:
      "Shop women's shoulder, hobo, and crossbody bags. Each listing shows material, closure, and size where they are published. Free US shipping and returns.",
    h1: "Women's shoulder, hobo & crossbody bags",
    tier: 1,
    intent: 'commercial',
    estimatedVolume: 1800,
    volumeSource: 'estimate: Amazon search frequency for hobo crossbody bags for women via asinsight, Jul 2026 (~1,800/week on Amazon, not Google)',
    currentRank: 'unknown',
    winnability: 'Style terms (shoulder, hobo, crossbody) have demonstrated demand; the head term does not.',
  },
  wallets: {
    primary: 'mens bifold leather wallet brown',
    supporting: ['slim card wallet', 'mens bifold wallet', "men's wallets"],
    title: 'Men\'s Bifold Leather & Card Wallets',
    description:
      "Shop men's bifold and slim card wallets in brown, black, and other colors. Every wallet lists its dimensions. Free US shipping and 30-day returns.",
    h1: "Men's bifold and slim card wallets",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Style plus material plus color is the rankable shape; "men\'s wallets" is a head term.',
  },
  jackets: {
    primary: 'mens bomber jacket and shacket',
    supporting: ['mens bomber jacket', 'mens shacket', 'mens faux leather jacket', "men's jackets"],
    title: "Men's Bomber Jackets and Shackets, US",
    description:
      "Shop men's bomber jackets, shackets, denim, and faux leather styles in sizes S to XL. Fabric blend, fit, and care are listed. Free US shipping.",
    h1: "Men's bomber jackets and shackets",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Style-qualified jacket queries match inventory; the bare head term does not.',
  },
  hoodies: {
    primary: 'mens zip hoodie under 50',
    supporting: ['mens pullover hoodie', 'mens zip hoodie', "men's hoodies"],
    title: "Men's Zip and Pullover Hoodies, US",
    description:
      "Shop men's zip and pullover hoodies in sizes S to XL. Each page lists the fabric, fit, and care. Free US standard shipping and 30-day returns.",
    h1: "Men's zip and pullover hoodies",
    tier: 2,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Price-qualified hoodie queries are more realistic than "men\'s hoodies" in year one.',
  },
  coats: {
    primary: 'mens cotton pea coat',
    supporting: ['affordable mens pea coat', 'pea coat vs overcoat', "men's coats"],
    title: 'Men\'s Cotton Pea Coats & Overcoats',
    description:
      "Shop men's pea coats, overcoats, and cotton twill trenches in sizes S to XL. Most coats are 80% cotton / 20% polyester, not 100% wool. Free US shipping.",
    h1: "Men's cotton pea coats and overcoats",
    tier: 1,
    intent: 'commercial',
    estimatedVolume: 1066,
    volumeSource: 'estimate: accio winter 2026 Amazon sales table for a competing pea coat (~1,066 units/month), not Google volume',
    currentRank: 'unknown',
    winnability: 'Pea-coat long-tail has demonstrated demand; fabric honesty is a differentiator.',
  },
  'womens-jewelry': {
    primary: 'kundan necklace set',
    supporting: ['polki necklace set', 'gold plated jhumka earrings', "women's gold plated jewelry"],
    title: 'Kundan Necklace Sets & Gold Jhumkas',
    description:
      "Shop kundan and zircon necklace sets, gold-plated jhumkas, and 925 silver rings. Weight and finish are listed. Free US shipping and 30-day returns.",
    h1: 'Kundan necklace sets and gold-plated jewelry',
    tier: 1,
    intent: 'commercial',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: US competitors Tarinika, Fabricoz, Inaury rank for kundan/polki at $80–$150, matching our range',
    currentRank: 'unknown',
    winnability: 'Style-specific jewelry terms match inventory and US festive-wear SERPs.',
  },
  backpacks: {
    primary: 'laptop backpacks',
    supporting: ['commuter backpacks', 'travel backpacks', 'water-resistant backpacks'],
    title: 'Laptop & Commuter Backpacks for Work',
    description:
      'Shop laptop and commuter backpacks with the capacity, sleeve size, and materials listed on every product page, plus free standard US shipping.',
    h1: 'Laptop & commuter backpacks',
    tier: 3,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'No live backpacks in the catalog; this copy exists only so an empty department 404 stays consistent.',
  },
  watches: {
    primary: 'casio and naviforce mens watches',
    supporting: ['casio watches', 'naviforce watch', 'daniel klein watch', "men's watches"],
    title: 'Casio, Naviforce and Klein Watches',
    description:
      "Shop men's Casio, Naviforce, and Daniel Klein watches. Each page lists model number, movement, strap, and water resistance when the maker published it.",
    h1: "Casio, Naviforce, and Daniel Klein watches",
    tier: 1,
    intent: 'commercial',
    estimatedVolume: 135800,
    volumeSource: 'estimate: techlist.ai 2026 figure for "casio watches" (~136K/mo); that head term is supporting context only',
    currentRank: 'unknown',
    winnability: 'Brand-qualified watch queries match 8+ units each; model-number pages carry the long tail.',
  },
}

export const shoeKeywords: Record<ShoeUse, SeoTarget> = {
  running: {
    primary: 'mens lightweight mesh sneakers',
    supporting: ['mens mesh gym sneakers', 'lightweight sneakers for walking'],
    title: 'Men\'s Lightweight Mesh Gym Sneakers',
    description:
      "Shop men's mesh lace-up sneakers with EVA or PU soles for gym sessions and walks. Standard width, US men's sizes. Free US shipping and 30-day returns.",
    h1: "Men's lightweight mesh sneakers",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Replaces invented "jogger-style" / "running-style" phrasing with materials shoppers actually search.',
  },
  trail: {
    primary: 'mens trail sneakers',
    supporting: ['hiking sneakers', 'outdoor shoes', 'grippy sneakers'],
    title: 'Men\'s Trail Shoes & Outdoor Sneakers',
    description:
      "Shop men's trail and outdoor sneakers with the upper and sole materials listed on every page, in US sizes, with free standard US shipping and returns.",
    h1: "Men's trail sneakers",
    tier: 3,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'No live trail shoes; kept so the empty collection 404 stays consistent.',
  },
  lifestyle: {
    primary: 'mens casual lace-up sneakers',
    supporting: ['low-top sneakers', 'contrast sole sneakers', "men's casual sneakers"],
    title: "Men's Casual Lace-Up Low-Top Sneakers",
    description:
      "Shop men's casual lace-up low-tops for jeans and chinos. Standard width, US men's sizes. Upper and sole materials are listed. Free US shipping.",
    h1: "Men's casual lace-up sneakers",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Style plus closure is more specific than the "casual sneakers" head term.',
  },
  everyday: {
    primary: 'mens slip-on sneakers under 50',
    supporting: ['mens slip-on sneakers', 'laceless sneakers'],
    title: "Men's Slip-On Sneakers Under $50, US",
    description:
      "Shop men's slip-on sneakers for errands and travel. Knit or mesh uppers, standard width, US men's sizes. Free US shipping and 30-day returns.",
    h1: "Men's slip-on sneakers under $50",
    tier: 2,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Price-qualified slip-on queries are the realistic form of this collection.',
  },
}

export const brandKeywords: Record<string, SeoTarget> = {
  curren: {
    primary: 'Curren mens watches',
    supporting: ['Curren metal band watch', 'Curren quartz watch'],
    title: "Curren Men's Quartz Watches in the US",
    description:
      "Shop Curren men's quartz watches on metal bracelets. Dial, case, and water resistance are listed when published. Free US shipping and 30-day returns.",
    h1: "Curren men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Four Curren models; brand-plus-model queries are thin in the US.',
  },
  fossil: {
    primary: 'Fossil mens watches',
    supporting: ['Fossil retro digital watch', 'Fossil leather watch'],
    title: "Fossil Men's Watches Sold in the US",
    description:
      "Shop Fossil men's quartz watches, including retro digital models, with the published specs on each page. Free US shipping and 30-day returns.",
    h1: "Fossil men's watches",
    tier: 2,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Fossil is a known US watch brand; three in-stock models can rank for the model, not the head term.',
  },
  seiko: {
    primary: 'Seiko mens watch',
    supporting: ['Seiko metal band watch'],
    title: "Seiko Men's Watch We Sell in the US",
    description:
      "Shop the Seiko men's watch we stock, with the dial and strap listed as published. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Seiko men's watches",
    tier: 2,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'One Seiko listing; the page exists for the brand name US shoppers already search.',
  },
  'mini-focus': {
    primary: 'Mini Focus mens watch',
    supporting: ['Mini Focus quartz watch'],
    title: "Mini Focus Men's Quartz Watches, US",
    description:
      "Shop Mini Focus men's quartz watches with the published case, dial, and strap on each page. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Mini Focus men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Four Mini Focus models; the brand name has little US competition.',
  },
  skmei: {
    primary: 'Skmei mens watch',
    supporting: ['Skmei quartz watch'],
    title: "Skmei Men's Quartz Watches in the US",
    description:
      "Shop Skmei men's quartz watches with listed model details, dials, and straps. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Skmei men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Four Skmei models; brand-name queries are thin and match this inventory.',
  },
  omax: {
    primary: 'Omax mens watch',
    supporting: ['Omax quartz watch'],
    title: "Omax Men's Quartz Watches Sold in US",
    description:
      "Shop Omax men's quartz watches with the published dial, strap, and water resistance where the maker listed them. Free US shipping and 30-day returns.",
    h1: "Omax men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Four Omax models; a dedicated page matches the brand query without a broad watches head term.',
  },
  bonito: {
    primary: 'Bonito mens watch',
    supporting: ['Bonito quartz watch'],
    title: "Bonito Men's Quartz Watches in the US",
    description:
      "Shop Bonito men's quartz watches with the published dial and strap on each page. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Bonito men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Three Bonito models; the brand page is the short list US shoppers can scan.',
  },
  ferro: {
    primary: 'Ferro mens watch',
    supporting: ['Ferro sport quartz watch'],
    title: "Ferro Men's Sport Quartz Watches, US",
    description:
      "Shop Ferro men's sport quartz watches with the published case and strap on each page. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Ferro men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Three Ferro sport models; brand-plus-watch queries are thin.',
  },
  crysma: {
    primary: 'Crysma mens watch',
    supporting: ['Crysma quartz watch'],
    title: "Crysma Men's Quartz Watches in the US",
    description:
      "Shop Crysma men's quartz watches with the published dial, case, and strap on each page. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Crysma men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Three Crysma models; the page collects the brand instead of leaving each watch alone.',
  },
  slazenger: {
    primary: 'Slazenger mens watch',
    supporting: ['Slazenger quartz watch'],
    title: "Slazenger Men's Watches Sold in the US",
    description:
      "Shop Slazenger men's quartz watches with the published dial and strap on each page. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Slazenger men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Two Slazenger watches; the brand page is the full list we sell in the US.',
  },
  'royal-london': {
    primary: 'Royal London mens watch',
    supporting: ['Royal London quartz watch'],
    title: "Royal London Men's Watches in the US",
    description:
      "Shop Royal London men's watches with the published dial and strap on each page. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Royal London men's watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Two Royal London watches; a brand page matches the name US shoppers search.',
  },
}

export const subCollectionKeywords: Record<string, SeoTarget> = {
  'shoulder-bags': {
    primary: 'womens shoulder bags',
    supporting: ['shoulder bag with zipper', 'small shoulder bag'],
    title: 'Women\'s Shoulder Bags With Zippers',
    description:
      "Shop women's shoulder bags. Closures, materials, and measurements are listed where they were published. Free US shipping and 30-day returns.",
    h1: "Women's shoulder bags",
    tier: 1,
    intent: 'commercial',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: Google Trends — shoulder bag interest spiked to 100 in Feb 2026 vs tote 73 and crossbody 55',
    currentRank: 'unknown',
    winnability: 'Shoulder-bag style demand is real; we have 8+ shoulder bags in the catalog.',
  },
  'crossbody-bags': {
    primary: 'womens crossbody bags under 50',
    supporting: ['small crossbody bag with zipper', 'hobo crossbody bags for women'],
    title: 'Women\'s Small Crossbody Bags, Zipper',
    description:
      "Shop women's crossbody bags with listed closures, materials, and measurements. Free US standard shipping and 30-day returns on every unused bag.",
    h1: "Women's crossbody bags",
    tier: 2,
    intent: 'commercial',
    estimatedVolume: 1800,
    volumeSource: 'estimate: asinsight Jul 2026 Amazon weekly searches for hobo crossbody bags for women',
    currentRank: 'unknown',
    winnability: 'Crossbody plus price qualifier matches 8+ bags in the catalog.',
  },
  'digital-watches': {
    primary: 'casio digital watch under 50',
    supporting: ['mens digital watches', 'digital sport watch'],
    title: 'Casio Digital Watches and Sport Models',
    description:
      "Shop digital watches with the published model number, movement, and water resistance on each page. Free US standard shipping and 30-day returns.",
    h1: "Men's digital watches",
    tier: 2,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Only created when 8+ digital watches are in stock; Casio model pages take the long tail.',
  },
  'leather-strap-watches': {
    primary: 'mens leather strap watch',
    supporting: ['leather strap quartz watch', 'daniel klein leather watch'],
    title: 'Men\'s Leather Strap Quartz Watches',
    description:
      "Shop men's quartz watches on leather straps. Case, crystal, and water resistance are listed when the maker published them. Free US shipping, 30-day returns.",
    h1: "Men's leather-strap watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Strap-material queries match leather-strap inventory when the count is 8+.',
  },
  'metal-bracelet-watches': {
    primary: 'mens metal bracelet watch',
    supporting: ['stainless steel bracelet watch', 'naviforce metal band watch'],
    title: 'Men\'s Metal Bracelet Quartz Watches',
    description:
      "Shop men's quartz watches on metal bracelets. Model number, movement, and water resistance are listed where published. Free US shipping and 30-day returns.",
    h1: "Men's metal-bracelet watches",
    tier: 1,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Metal-bracelet watches are the bulk of the watch catalog.',
  },
  'watches-under-50': {
    primary: 'mens watches under 50',
    supporting: ['affordable mens quartz watch', 'casio digital watch under 50'],
    title: 'Affordable Men\'s Watches Under $50',
    description:
      "Shop men's watches priced under $50, each with a published model number and movement. Free US standard shipping and 30-day returns on unused watches.",
    h1: "Men's watches under $50",
    tier: 2,
    intent: 'commercial',
    ...UNKNOWN,
    winnability: 'Price-qualified watch queries are mid-volume and match cheaper quartz models if 8+ exist.',
  },
}

export const guideKeywords: Record<string, SeoTarget> = {
  'how-to-measure-your-feet': {
    primary: 'how to measure foot size',
    supporting: ['measure feet at home', 'foot length cm to shoe size'],
    title: 'How to measure your feet at home',
    description:
      'A five-minute method for measuring foot length and width at home with paper and a ruler, and how to turn the numbers into the right US shoe size online.',
    h1: 'How to measure your feet at home',
    tier: 'info',
    intent: 'informational',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: People also ask for how to measure foot size',
    currentRank: 'unknown',
    winnability: 'Demonstrated PAA demand; pairs with the converter tool.',
  },
  'how-to-choose-running-shoes': {
    primary: 'road vs trail sneakers',
    supporting: ['gym sneakers vs running shoes'],
    title: 'Road or trail? Choosing your running shoe',
    description:
      'How to tell a casual mesh sneaker from a specialist running shoe, using cushioning, drop, and outsole — written from the sneakers we actually sell.',
    h1: 'Road or trail? Choosing your running shoe',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Supports the mesh-sneaker collection without inventing "running-style" demand.',
  },
  'how-to-care-for-leather-sneakers': {
    primary: 'how to clean mesh sneakers',
    supporting: ['clean knit sneakers', 'leather sneaker care'],
    title: 'How to clean mesh, knit, and leather sneakers',
    description:
      'Care steps for mesh, knit, and synthetic sneakers using only methods that match the materials listed on each pair we sell.',
    h1: 'How to clean mesh, knit, and leather sneakers',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Care query that matches the uppers we stock.',
  },
  'standard-vs-wide-shoes': {
    primary: 'standard vs wide shoe width',
    supporting: ['how to measure shoe width', 'D width vs 2E'],
    title: 'Standard or wide? How to choose a shoe width',
    description:
      'How to check whether you need a wide shoe, and what to do when a store only stocks standard (D) width — which is every sneaker we sell today.',
    h1: 'Standard or wide? How to choose a shoe width',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Honest width advice; we do not claim wide sizes.',
  },
  'what-fits-in-a-crossbody-bag': {
    primary: 'what fits in a crossbody bag',
    supporting: ['small crossbody bag capacity'],
    title: 'What fits in a crossbody bag and wallet?',
    description:
      'What actually fits in the crossbody bags we sell, using the measurements published on each product page.',
    h1: 'What fits in a crossbody bag and wallet?',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Supports the crossbody collection with a practical question.',
  },
  'how-to-choose-a-laptop-backpack': {
    primary: 'how to choose a laptop backpack',
    supporting: ['laptop backpack sleeve size'],
    title: 'How to choose a laptop backpack for your commute',
    description:
      'How to read laptop-sleeve size, capacity, and materials on a backpack listing. We currently do not stock backpacks; this guide stays honest about that.',
    h1: 'How to choose a laptop backpack for your commute',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Kept for completeness; no backpack inventory.',
  },
  'watch-case-size-and-strap-fit': {
    primary: 'watch case size guide',
    supporting: ['what size watch for my wrist', '35mm vs 42mm watch'],
    title: 'Watch case size and strap fit, explained',
    description:
      'How to read case diameter and strap type on a watch listing, using the model numbers and specs published on our Casio, Naviforce, and Klein watches.',
    h1: 'Watch case size and strap fit, explained',
    tier: 'info',
    intent: 'informational',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: People also ask for watch case size guide',
    currentRank: 'unknown',
    winnability: 'Demonstrated informational demand next to model-number product pages.',
  },
  'how-to-choose-a-mens-pea-coat': {
    primary: 'how to choose a mens pea coat',
    supporting: ['mens cotton pea coat', 'pea coat fabric blend'],
    title: 'How to choose a men\'s pea coat',
    description:
      'How to read a pea-coat fabric line, including coats labeled wool that are mostly cotton-polyester, using the coats we sell.',
    h1: "How to choose a men's pea coat",
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Pairs with the cotton pea-coat collection and winter season.',
  },
  'trench-coat-vs-overcoat': {
    primary: 'pea coat vs overcoat',
    supporting: ['trench coat vs overcoat', 'when to wear a pea coat'],
    title: 'Trench coat vs overcoat: which do you need?',
    description:
      'Pea coat, trench, and overcoat compared by cloth, closure, and weather, using the coats in this catalog rather than generic fashion claims.',
    h1: 'Trench coat vs overcoat: which do you need?',
    tier: 'info',
    intent: 'informational',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: People also ask for pea coat vs overcoat',
    currentRank: 'unknown',
    winnability: 'Comparison query with demonstrated PAA presence.',
  },
  'how-to-care-for-a-wool-coat': {
    primary: 'how to care for a wool blend coat',
    supporting: ['dry clean pea coat', 'cotton polyester coat care'],
    title: 'How to care for a wool or cotton-blend coat',
    description:
      'Care for coats whose labels say wool or 80% cotton / 20% polyester. We follow the care line on the product, not a generic wool ritual.',
    h1: 'How to care for a wool or cotton-blend coat',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Honest fabric-care angle for the coat catalog.',
  },
  'mens-jacket-and-coat-size-guide': {
    primary: 'mens jacket size guide',
    supporting: ['how to measure a jacket you own', 'S M L XL jacket fit'],
    title: 'Men\'s jacket, hoodie, and coat size guide',
    description:
      'How to pick letter sizes S to XL by measuring a jacket you already own, plus the fit notes printed on each product page.',
    h1: "Men's jacket, hoodie, and coat size guide",
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Supports every apparel collection.',
  },
  'types-of-mens-jackets': {
    primary: 'what to wear with a bomber jacket',
    supporting: ['types of mens jackets', 'shacket vs jacket'],
    title: 'Types of men\'s jackets: bomber to trucker',
    description:
      'Bomber, shacket, trucker, racer, and field jackets explained with the styles we stock, including what to wear with a bomber jacket.',
    h1: "Types of men's jackets: bomber to trucker",
    tier: 'info',
    intent: 'informational',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: People also ask / related searches for what to wear with a bomber jacket',
    currentRank: 'unknown',
    winnability: 'Outfit query attached to real jacket types in the catalog.',
  },
  'how-to-choose-a-hoodie': {
    primary: 'pullover vs zip hoodie',
    supporting: ['how to choose a hoodie'],
    title: 'Essential, henley, cropped, or long-line hoodie?',
    description:
      'How the hoodie cuts we sell differ — pullover, henley, cropped, and long-line — using the fit notes on each product page.',
    h1: 'Essential, henley, cropped, or long-line hoodie?',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Supports the hoodie collection; weaker demand than coat and jewelry guides.',
  },
  'how-to-care-for-a-wallet': {
    primary: 'how to care for a leather wallet',
    supporting: ['synthetic wallet care'],
    title: 'How to care for a leather or synthetic wallet',
    description:
      'Care for wallets when the material is listed, and what we do not claim when a listing does not publish a material.',
    h1: 'How to care for a leather or synthetic wallet',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Supports wallet gift guides.',
  },
  'how-to-clean-gold-plated-jewelry': {
    primary: 'how to clean gold plated jewelry',
    supporting: ['gold plated jewelry care', 'kundan jewelry care'],
    title: 'How to clean gold-plated and silver jewelry',
    description:
      'How to clean gold-plated and 925 silver jewelry without stripping the finish, written for the pieces we sell.',
    h1: 'How to clean gold-plated and silver jewelry',
    tier: 'info',
    intent: 'informational',
    estimatedVolume: 'unknown',
    volumeSource: 'estimate: People also ask for how to clean gold plated jewelry',
    currentRank: 'unknown',
    winnability: 'High-intent care query next to kundan and plated product pages.',
  },
  'analog-vs-digital-watches': {
    primary: 'analog vs digital watches',
    supporting: ['quartz analog or digital'],
    title: 'Analog vs digital watches: which to choose',
    description:
      'Analog quartz versus digital watches compared on the specs our Casio, Naviforce, and other listings actually publish.',
    h1: 'Analog vs digital watches: which to choose',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Supports watch brand and digital sub-collection pages.',
  },
  'handbag-styles-explained': {
    primary: 'hobo vs shoulder vs crossbody bag',
    supporting: ['handbag styles explained', 'hobo bag'],
    title: 'Hobo, shoulder, crossbody: handbag styles',
    description:
      'Hobo, shoulder, crossbody, and top-handle bags explained using the styles in this catalog and the measurements on each page.',
    h1: 'Hobo, shoulder, crossbody: handbag styles',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Supports bag style collections; weaker than jewelry and coat guides.',
  },
  'holiday-gift-guide-for-him': {
    primary: 'holiday gift guide for him',
    supporting: ['gifts for him under 100', 'watch and wallet gifts'],
    title: 'Holiday gift guide for him',
    description:
      'Watches, wallets, and sneakers from this catalog that do not need a clothing size, with the published specs and prices on each gift.',
    h1: 'Holiday gift guide for him',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Seasonal; refresh by November each year.',
  },
  'holiday-gift-guide-for-her': {
    primary: 'holiday gift guide for her',
    supporting: ['jewelry gift guide', 'handbag gifts'],
    title: 'Holiday gift guide for her',
    description:
      'Handbags and gold-plated jewelry from this catalog, with materials, care, and prices listed — sized as gifts that do not need a clothing size.',
    h1: 'Holiday gift guide for her',
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Seasonal; refresh by November each year.',
  },
  'fathers-day-gift-guide': {
    primary: 'fathers day gift guide watches',
    supporting: ['gifts for dad under 100', 'watch gift for dad'],
    title: 'Father\'s Day and birthday gifts for dad',
    description:
      "Watches and wallets from this catalog that work as Father's Day or birthday gifts, with model numbers and dimensions listed.",
    h1: "Father's Day and birthday gifts for dad",
    tier: 'info',
    intent: 'informational',
    ...UNKNOWN,
    winnability: 'Seasonal; refresh by May for June.',
  },
}

export interface RelatedLink {
  href: string
  label: string
}

/** Sibling collections a shopper in one collection is likely to want next, with descriptive anchors. */
export const relatedCollections: Record<string, RelatedLink[]> = {
  jackets: [
    { href: '/collections/coats', label: "Men's cotton pea coats and overcoats" },
    { href: '/collections/hoodies', label: "Men's zip and pullover hoodies" },
  ],
  coats: [
    { href: '/collections/jackets', label: "Men's bomber jackets and shackets" },
    { href: '/collections/hoodies', label: "Men's hoodies for layering" },
  ],
  hoodies: [
    { href: '/collections/jackets', label: "Men's jackets to wear over a hoodie" },
    { href: '/collections/coats', label: "Men's cotton pea coats" },
  ],
  handbags: [
    { href: '/collections/wallets', label: "Men's bifold and card wallets" },
    { href: '/collections/womens-jewelry', label: 'Kundan necklace sets and gold-plated jewelry' },
    { href: '/collections/shoulder-bags', label: "Women's shoulder bags" },
    { href: '/collections/crossbody-bags', label: "Women's crossbody bags" },
  ],
  wallets: [
    { href: '/collections/watches', label: 'Casio, Naviforce, and Daniel Klein watches' },
    { href: '/collections/handbags', label: "Women's shoulder and crossbody bags" },
  ],
  backpacks: [
    { href: '/collections/handbags', label: "Women's handbags" },
    { href: '/collections/wallets', label: "Men's bifold wallets" },
  ],
  watches: [
    { href: '/collections/wallets', label: "Men's bifold and card wallets" },
    { href: '/collections/shoes', label: "Men's mesh and casual sneakers" },
    { href: '/collections/digital-watches', label: "Men's digital watches" },
    { href: '/collections/metal-bracelet-watches', label: "Men's metal-bracelet watches" },
    { href: '/brands/fossil', label: 'Fossil watches' },
    { href: '/brands/seiko', label: 'Seiko watches' },
    { href: '/brands/curren', label: 'Curren watches' },
  ],
  'womens-jewelry': [
    { href: '/collections/handbags', label: "Women's shoulder, hobo, and crossbody bags" },
    { href: '/collections/watches', label: 'Casio and Naviforce watches' },
  ],
  shoes: [
    { href: '/collections/running', label: "Men's lightweight mesh sneakers" },
    { href: '/collections/lifestyle', label: "Men's casual lace-up sneakers" },
    { href: '/collections/everyday', label: "Men's slip-on sneakers under $50" },
  ],
  running: [
    { href: '/collections/shoes', label: "All men's sneakers" },
    { href: '/collections/lifestyle', label: "Men's casual lace-up sneakers" },
    { href: '/collections/everyday', label: "Men's slip-on sneakers" },
  ],
  trail: [
    { href: '/collections/shoes', label: "All men's sneakers" },
    { href: '/collections/running', label: "Men's lightweight mesh sneakers" },
  ],
  lifestyle: [
    { href: '/collections/shoes', label: "All men's sneakers" },
    { href: '/collections/running', label: "Men's lightweight mesh sneakers" },
    { href: '/collections/everyday', label: "Men's slip-on sneakers" },
  ],
  everyday: [
    { href: '/collections/shoes', label: "All men's sneakers" },
    { href: '/collections/lifestyle', label: "Men's casual lace-up sneakers" },
    { href: '/collections/running', label: "Men's lightweight mesh sneakers" },
  ],
  'shoulder-bags': [
    { href: '/collections/handbags', label: "All women's handbags" },
    { href: '/collections/crossbody-bags', label: "Women's crossbody bags" },
  ],
  'crossbody-bags': [
    { href: '/collections/handbags', label: "All women's handbags" },
    { href: '/collections/shoulder-bags', label: "Women's shoulder bags" },
  ],
  'digital-watches': [
    { href: '/collections/watches', label: "All men's watches" },
    { href: '/brands/fossil', label: 'Fossil watches' },
  ],
  'leather-strap-watches': [
    { href: '/collections/watches', label: "All men's watches" },
    { href: '/brands/royal-london', label: 'Royal London watches' },
  ],
  'metal-bracelet-watches': [
    { href: '/collections/watches', label: "All men's watches" },
    { href: '/brands/curren', label: 'Curren watches' },
  ],
  'watches-under-50': [
    { href: '/collections/watches', label: "All men's watches" },
    { href: '/collections/digital-watches', label: 'Digital watches' },
  ],
}

export interface SeasonEntry {
  id: string
  name: string
  /** Inclusive month range, 1–12. May wrap (e.g. Oct–Jan). */
  months: number[]
  publishBy: string
  href: string
  keyword: string
  label: string
}

export const seasonalCalendar: SeasonEntry[] = [
  { id: 'valentines', name: "Valentine's Day", months: [2], publishBy: '2027-01-15', href: '/guides/holiday-gift-guide-for-her', keyword: 'valentine jewelry gifts', label: "Valentine's jewelry gifts" },
  { id: 'fathers-day', name: "Father's Day", months: [6], publishBy: '2027-05-01', href: '/guides/fathers-day-gift-guide', keyword: 'fathers day gift guide watches', label: "Father's Day gifts for dad" },
  { id: 'back-to-school', name: 'Back to school', months: [8], publishBy: '2027-07-15', href: '/collections/everyday', keyword: 'mens slip-on sneakers under 50', label: 'Slip-on sneakers for fall' },
  { id: 'winter-coats', name: 'Winter coats', months: [10, 11, 12, 1], publishBy: '2026-10-01', href: '/collections/coats', keyword: 'mens cotton pea coat', label: "Men's cotton pea coats" },
  { id: 'bfcm', name: 'Black Friday and Cyber Monday', months: [11], publishBy: '2026-11-01', href: '/shop', keyword: 'Westora Style shop all', label: 'Shop the full catalog' },
  { id: 'holiday-him', name: 'Holiday gifts for him', months: [11, 12], publishBy: '2026-11-01', href: '/guides/holiday-gift-guide-for-him', keyword: 'holiday gift guide for him', label: 'Holiday gift guide for him' },
  { id: 'holiday-her', name: 'Holiday gifts for her', months: [11, 12], publishBy: '2026-11-01', href: '/guides/holiday-gift-guide-for-her', keyword: 'holiday gift guide for her', label: 'Holiday gift guide for her' },
]

export function seasonalLinksFor(date = new Date()): SeasonEntry[] {
  const month = date.getMonth() + 1
  return seasonalCalendar.filter((entry) => entry.months.includes(month))
}

export function keywordsFor(slug: string): SeoTarget | undefined {
  return (
    (departmentKeywords as Record<string, SeoTarget>)[slug] ??
    (shoeKeywords as Record<string, SeoTarget>)[slug] ??
    subCollectionKeywords[slug] ??
    brandKeywords[slug]
  )
}

const PAGE_PATHS: Record<string, PageKey> = {
  '/': 'home',
  '/shop': 'shop',
  '/guides': 'guides',
  '/about': 'about',
  '/faq': 'faq',
  '/shipping': 'shipping',
  '/returns': 'returns',
  '/fit-guide': 'fitGuide',
  '/contact': 'contact',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/press': 'press',
  '/tools/shoe-size-converter': 'shoeSizeConverter',
}

export function specOf(p: Product, re: RegExp): string | undefined {
  return p.specs.find((s) => re.test(s.label))?.value
}

export function productPrimaryKeyword(p: Product): string {
  const brand = brandOf(p)
  const model = specOf(p, /^Model$/)
  if (p.category === 'watches' && model) return `${brand} ${model}`.toLowerCase()
  const style = specOf(p, /^Style$|^Type$/)
  if (style) return `${brand} ${style}`.toLowerCase()
  return `${p.name} ${brand}`.toLowerCase()
}

export function productKeywordPlan(p: Product): SeoTarget {
  const brand = brandOf(p)
  const model = specOf(p, /^Model$/)
  const primary = productPrimaryKeyword(p)
  const titleBase = p.category === 'watches' && model ? `${brand} ${model}` : p.name
  return {
    primary,
    supporting: [brand, p.category],
    title: titleBase.slice(0, 44),
    description: `${p.name} from ${brand}.`,
    h1: p.name,
    tier: 1,
    intent: 'transactional',
    estimatedVolume: 'unknown',
    volumeSource: p.category === 'watches' && model ? 'estimate: model-number queries are individually small with thin competition' : 'unknown',
    currentRank: 'unknown',
    winnability:
      p.category === 'watches' && model
        ? 'People search the exact model number; this page is the only one that matches our listing.'
        : 'Product-name query with a unique URL and specs from the catalog.',
  }
}

/** Every indexable URL that is not a product gets a plan from this map. Products use productKeywordPlan. */
export function keywordPlanForPath(path: string): SeoTarget | undefined {
  const clean = path.replace(/\/+$/, '') || '/'
  const pageKey = PAGE_PATHS[clean]
  if (pageKey) return pageKeywords[pageKey]
  const collection = clean.match(/^\/collections\/([^/]+)$/)
  if (collection) return keywordsFor(collection[1])
  const brand = clean.match(/^\/brands\/([^/]+)$/)
  if (brand) return brandKeywords[brand[1]]
  const guide = clean.match(/^\/guides\/([^/]+)$/)
  if (guide) return guideKeywords[guide[1]]
  return undefined
}

export function allStaticKeywordTargets(): SeoTarget[] {
  return [
    ...Object.values(pageKeywords),
    ...Object.values(departmentKeywords),
    ...Object.values(shoeKeywords),
    ...Object.values(brandKeywords),
    ...Object.values(subCollectionKeywords),
    ...Object.values(guideKeywords),
  ]
}
