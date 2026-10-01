import type { DepartmentSlug, ShoeUse } from '../catalog/types'

/**
 * One source for search targeting. Titles exclude the brand (Seo appends it), stay under 45 characters so
 * the suffix fits in 60, and lead with the primary keyword. Descriptions are 140–160 characters.
 */
export interface SeoTarget {
  primary: string
  supporting: string[]
  title: string
  description: string
  h1: string
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

export const pageKeywords: Record<PageKey, SeoTarget> = {
  home: {
    primary: 'sneakers, coats, handbags and watches',
    supporting: ["men's sneakers", "men's coats", "women's handbags", "men's watches", "women's gold plated jewelry"],
    title: 'Sneakers, Coats, Handbags & Watches',
    description:
      "Shop men's sneakers, jackets, coats, and watches plus women's handbags and gold-plated jewelry. Free US standard shipping and 30-day returns.",
    h1: 'Sneakers, coats, handbags & watches',
  },
  shop: {
    primary: 'shop sneakers, outerwear and accessories',
    supporting: ['online clothing store', "men's outerwear", 'accessories online', 'gifts for him', 'gifts for her'],
    title: 'Shop All Sneakers, Outerwear & Accessories',
    description:
      "Browse every Westora Style piece: men's sneakers, jackets, hoodies, coats, wallets, and watches, plus women's handbags and jewelry. Filter by size and color.",
    h1: 'Shop all sneakers, outerwear & accessories',
  },
  guides: {
    primary: 'style, fit and care guides',
    supporting: ['how to choose a coat', 'shoe size guide', 'jewelry care', 'gift guide for him', 'gift guide for her'],
    title: 'Style, Fit & Care Guides for Men and Women',
    description:
      'Practical guides to sizing sneakers and jackets, choosing coats, bags, and watches, caring for leather and gold plating, and picking gifts from our catalog.',
    h1: 'Style, fit & care guides',
  },
  about: {
    primary: 'about Westora Style',
    supporting: ['online accessories store', 'curated brands', 'Pakistani brands', 'US shipping'],
    title: 'About Us: How We Choose What We Sell',
    description:
      'Westora Style is a small online store that curates sneakers, outerwear, bags, jewelry, and watches from named brands and ships them to US customers.',
    h1: 'About Westora Style',
  },
  faq: {
    primary: 'Westora Style FAQ',
    supporting: ['sizing questions', 'shipping questions', 'return questions', 'payment methods'],
    title: 'FAQ: Sizing, Shipping, Returns & Payment',
    description:
      'Answers to common questions about shoe and apparel sizing, US shipping times, 30-day returns, payment methods, and product care at Westora Style.',
    h1: 'Frequently asked questions',
  },
  shipping: {
    primary: 'shipping information',
    supporting: ['US delivery times', 'free standard shipping', 'order processing', 'order tracking'],
    title: 'Shipping Information & US Delivery Times',
    description:
      'How Westora Style ships orders to US addresses: order processing time, the standard delivery window, shipping costs, and what happens after you check out.',
    h1: 'Shipping information',
  },
  returns: {
    primary: '30-day return policy',
    supporting: ['how to return an order', 'refund timing', 'return eligibility', 'unworn shoes'],
    title: '30-Day Return Policy & How to Return',
    description:
      'Return eligible Westora Style items within 30 days in original condition. See what qualifies, how to start a return, and when your refund is issued.',
    h1: '30-day return policy',
  },
  fitGuide: {
    primary: 'shoe size chart',
    supporting: ['US to UK shoe size', 'US to EU shoe size', 'how to measure feet', 'jacket size guide'],
    title: 'Shoe Size Chart & Fit Guide: US, UK, EU',
    description:
      "Convert US men's and women's shoe sizes to UK and EU, measure your foot length at home, and check how our jackets, hoodies, and coats are sized.",
    h1: 'Shoe size chart & fit guide',
  },
  contact: {
    primary: 'contact Westora Style',
    supporting: ['customer service', 'sizing help', 'order help', 'return help'],
    title: 'Contact Us: Sizing, Order & Return Help',
    description:
      'Email Westora Style with questions about sizing, an order, shipping, or a return. Include your order number and we will reply with a clear answer.',
    h1: 'Contact us',
  },
  privacy: {
    primary: 'privacy policy',
    supporting: ['personal data', 'cookies', 'payment data'],
    title: 'Privacy Policy: How We Use Your Data',
    description:
      'How Westora Style collects, uses, and protects the personal information you share when you browse, place an order, or contact our support team.',
    h1: 'Privacy policy',
  },
  terms: {
    primary: 'terms of service',
    supporting: ['order terms', 'pricing', 'returns terms'],
    title: 'Terms of Service for Orders & Site Use',
    description:
      'The terms that apply when you browse westorastyle.com or place an order, covering pricing, payment, shipping, returns, and use of the website.',
    h1: 'Terms of service',
  },
  press: {
    primary: 'Westora Style press',
    supporting: ['press kit', 'media contact', 'brand facts', 'product images'],
    title: 'Press & Media: Facts, Images & Contact',
    description:
      'Press information for Westora Style: verified store facts, the brands we carry, policies, product image use, and how journalists can reach us.',
    h1: 'Press & media',
  },
}

export const departmentKeywords: Record<DepartmentSlug, SeoTarget> = {
  shoes: {
    primary: "men's sneakers",
    supporting: ['jogger sneakers', 'slip-on sneakers', 'casual sneakers', 'lightweight sneakers'],
    title: "Men's Sneakers & Lightweight Jogger Shoes",
    description:
      "Shop men's sneakers from Ndure: jogger-style lace-ups, casual low-tops, and slip-ons with mesh or synthetic uppers in US sizes 7–12. Free US shipping.",
    h1: "Men's sneakers",
  },
  handbags: {
    primary: "women's handbags",
    supporting: ['hobo bags', 'crossbody bags', 'shoulder bags', 'top handle bags', 'suede handbags'],
    title: "Women's Handbags: Hobo, Shoulder & Crossbody",
    description:
      "Shop women's handbags from Bag X in hobo, shoulder, crossbody, and top-handle styles. Each bag lists its material, closure, hardware, and size where given.",
    h1: "Women's handbags",
  },
  wallets: {
    primary: "men's wallets",
    supporting: ['card wallets', 'brown wallets', 'black wallets', 'gift wallets'],
    title: "Men's Wallets for Everyday Cards & Cash",
    description:
      "Shop men's wallets from Metro in black, brown, and other colors. Every wallet lists its exact dimensions so you can check pocket fit before you order.",
    h1: "Men's wallets",
  },
  jackets: {
    primary: "men's jackets",
    supporting: ['bomber jackets', 'denim jackets', 'faux leather jackets', 'puffer jackets', 'canvas jackets'],
    title: "Men's Jackets: Bomber, Denim & Faux Leather",
    description:
      "Shop men's jackets from ZED: bomber, denim, canvas, faux leather, and puffer styles in sizes S to XL, each with its listed fabric, fit, and care.",
    h1: "Men's jackets",
  },
  hoodies: {
    primary: "men's hoodies",
    supporting: ['pullover hoodies', 'zip-up hoodies', 'henley hoodies', 'basic hoodies'],
    title: "Men's Hoodies: Pullover & Zip-Up Styles",
    description:
      "Shop men's hoodies from ZED in pullover, henley, and zip-up styles. Sizes S to XL with the fabric, fit, and care listed on every product page.",
    h1: "Men's hoodies",
  },
  coats: {
    primary: "men's coats",
    supporting: ['pea coats', 'trench coats', 'overcoats', 'double-breasted coats', 'winter coats'],
    title: "Men's Coats: Pea Coats, Overcoats & Trenches",
    description:
      "Shop men's coats from ZED: pea coats, overcoats, cotton twill trench coats, and a hooded parka in sizes S to XL, with the listed fabric blend on every page.",
    h1: "Men's coats",
  },
  'womens-jewelry': {
    primary: "women's gold plated jewelry",
    supporting: ['sterling silver rings', '18K gold plated rings', 'necklace sets', 'earrings', 'jewelry gifts'],
    title: "Women's Gold-Plated Jewelry & 925 Silver",
    description:
      "Shop women's jewelry from Meerzah: 925 silver rings, gold-plated bangles, kundan necklace sets, and earrings, each with its listed weight and finish.",
    h1: "Women's gold-plated jewelry",
  },
  backpacks: {
    primary: 'laptop backpacks',
    supporting: ['commuter backpacks', 'travel backpacks', 'water-resistant backpacks'],
    title: 'Laptop & Commuter Backpacks for Work',
    description:
      'Shop laptop and commuter backpacks with the capacity, sleeve size, and materials listed on every product page, plus free standard US shipping.',
    h1: 'Laptop & commuter backpacks',
  },
  watches: {
    primary: "men's watches",
    supporting: ['quartz watches', 'analog watches', 'digital watches', 'stainless steel watches', 'Casio watches'],
    title: "Men's Watches: Quartz, Analog & Digital",
    description:
      "Shop men's watches from Casio, Naviforce, Daniel Klein, Curren, and more. Each lists its movement, case, strap, and water resistance where published.",
    h1: "Men's watches",
  },
}

export const shoeKeywords: Record<ShoeUse, SeoTarget> = {
  running: {
    primary: "men's jogger sneakers",
    supporting: ['running-style sneakers', 'mesh sneakers', 'training sneakers', 'lightweight sneakers'],
    title: "Men's Jogger & Running-Style Sneakers",
    description:
      "Shop men's jogger-style sneakers with breathable mesh uppers and EVA soles for gym sessions, walks, and long days. US sizes 7–12 with free US shipping.",
    h1: "Men's jogger & running-style sneakers",
  },
  trail: {
    primary: "men's trail shoes",
    supporting: ['hiking sneakers', 'outdoor shoes', 'grippy sneakers'],
    title: "Men's Trail Shoes & Outdoor Sneakers",
    description:
      "Shop men's trail and outdoor sneakers with the upper and sole materials listed on every page, in US sizes, with free standard US shipping and returns.",
    h1: "Men's trail shoes",
  },
  lifestyle: {
    primary: "men's casual sneakers",
    supporting: ['lace-up sneakers', 'low-top sneakers', 'contrast sole sneakers', 'everyday casual shoes'],
    title: "Men's Casual Sneakers: Lace-Up & Low-Top",
    description:
      "Shop men's casual sneakers from Ndure: lace-up low-tops and contrast-sole styles for jeans and chinos, in US sizes 7–12 with free US standard shipping.",
    h1: "Men's casual sneakers",
  },
  everyday: {
    primary: "men's slip-on sneakers",
    supporting: ['easy fit sneakers', 'laceless sneakers', 'comfortable everyday shoes'],
    title: "Men's Slip-On Sneakers & Easy-Fit Shoes",
    description:
      "Shop men's slip-on and easy-fit sneakers from Ndure for errands, travel, and all-day wear. Upper and sole materials are listed on every product page.",
    h1: "Men's slip-on sneakers",
  },
}

export interface RelatedLink {
  href: string
  label: string
}

/** Sibling collections a shopper in one collection is likely to want next, with descriptive anchors. */
export const relatedCollections: Record<string, RelatedLink[]> = {
  jackets: [
    { href: '/collections/coats', label: "Men's pea coats and trench coats" },
    { href: '/collections/hoodies', label: "Men's pullover and zip-up hoodies" },
  ],
  coats: [
    { href: '/collections/jackets', label: "Men's bomber, denim, and faux leather jackets" },
    { href: '/collections/hoodies', label: "Men's hoodies for layering" },
  ],
  hoodies: [
    { href: '/collections/jackets', label: "Men's jackets to wear over a hoodie" },
    { href: '/collections/coats', label: "Men's coats for colder days" },
  ],
  handbags: [
    { href: '/collections/wallets', label: 'Wallets for cards and cash' },
    { href: '/collections/backpacks', label: 'Laptop and commuter backpacks' },
    { href: '/collections/womens-jewelry', label: "Women's gold-plated jewelry" },
  ],
  wallets: [
    { href: '/collections/watches', label: "Men's quartz and digital watches" },
    { href: '/collections/handbags', label: "Women's handbags" },
    { href: '/collections/backpacks', label: 'Laptop and commuter backpacks' },
  ],
  backpacks: [
    { href: '/collections/handbags', label: "Women's handbags" },
    { href: '/collections/wallets', label: "Men's wallets" },
  ],
  watches: [
    { href: '/collections/wallets', label: "Men's wallets to pair with a watch" },
    { href: '/collections/shoes', label: "Men's sneakers" },
  ],
  'womens-jewelry': [
    { href: '/collections/handbags', label: "Women's hobo and crossbody handbags" },
    { href: '/collections/watches', label: 'Watches' },
  ],
  shoes: [
    { href: '/collections/running', label: "Men's jogger and running-style sneakers" },
    { href: '/collections/trail', label: "Men's trail shoes" },
    { href: '/collections/lifestyle', label: "Men's casual lace-up sneakers" },
    { href: '/collections/everyday', label: "Men's slip-on sneakers" },
  ],
  running: [
    { href: '/collections/shoes', label: "All men's sneakers" },
    { href: '/collections/lifestyle', label: "Men's casual sneakers" },
    { href: '/collections/everyday', label: "Men's slip-on sneakers" },
    { href: '/collections/trail', label: "Men's trail shoes" },
  ],
  trail: [
    { href: '/collections/shoes', label: "All men's sneakers" },
    { href: '/collections/running', label: "Men's jogger sneakers" },
  ],
  lifestyle: [
    { href: '/collections/shoes', label: "All men's sneakers" },
    { href: '/collections/running', label: "Men's jogger sneakers" },
    { href: '/collections/everyday', label: "Men's slip-on sneakers" },
    { href: '/collections/trail', label: "Men's trail shoes" },
  ],
  everyday: [
    { href: '/collections/shoes', label: "All men's sneakers" },
    { href: '/collections/lifestyle', label: "Men's casual sneakers" },
    { href: '/collections/running', label: "Men's jogger sneakers" },
    { href: '/collections/trail', label: "Men's trail shoes" },
  ],
}

export function keywordsFor(slug: string): SeoTarget | undefined {
  return (departmentKeywords as Record<string, SeoTarget>)[slug] ?? (shoeKeywords as Record<string, SeoTarget>)[slug]
}
