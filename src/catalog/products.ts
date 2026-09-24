import type { Category, Product, WidthOption } from './types.js'

/**
 * SAMPLE CATALOG — LAUNCH BLOCKER.
 * The previous site had no product data. Names, prices, specs, materials,
 * stock levels and imagery below are placeholders created for the redesign
 * and must be replaced with the merchant's real catalog before selling.
 * While this flag is true the checkout API refuses live Stripe keys.
 */
export const CATALOG_IS_SAMPLE = true

const STANDARD: WidthOption = { code: 'D', label: 'Standard' }
const WIDE: WidthOption = { code: '2E', label: 'Wide' }

const FULL_RUN = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13]

export const categories: Category[] = [
  {
    slug: 'running',
    name: 'Running',
    summary: 'Cushioned trainers for road miles',
    intro:
      'Road shoes built around a high-rebound foam midsole and a breathable mesh upper. Start here if you log regular miles on pavement or treadmill and want a shoe that also works for the rest of your day.',
    seoTitle: 'Running Shoes',
    seoDescription:
      'Shop NOVA running shoes: cushioned road trainers with breathable mesh uppers, US sizing and standard or wide widths.',
  },
  {
    slug: 'trail',
    name: 'Trail',
    summary: 'Grip and protection off-road',
    intro:
      'Trail shoes with a lugged rubber outsole, a protective toe cap and a firmer, more stable platform for dirt, gravel and rocky paths.',
    seoTitle: 'Trail Running Shoes',
    seoDescription:
      'Shop NOVA trail shoes with lugged outsoles, protective toe caps and ripstop uppers for dirt, gravel and mixed terrain.',
  },
  {
    slug: 'lifestyle',
    name: 'Lifestyle',
    summary: 'Leather and suede everyday classics',
    intro:
      'Clean low- and high-top silhouettes in leather and suede, set on durable rubber cupsoles. Designed to pair with denim, chinos and everything in between.',
    seoTitle: 'Lifestyle Sneakers',
    seoDescription:
      'Shop NOVA lifestyle sneakers: minimalist leather court shoes and suede high-tops on rubber cupsoles.',
  },
  {
    slug: 'everyday',
    name: 'Everyday',
    summary: 'Lightweight knits for all-day wear',
    intro:
      'Soft knit uppers and lightweight foam soles for commuting, travel and long days on your feet. Easy on, easy to live in.',
    seoTitle: 'Everyday Comfort Shoes',
    seoDescription:
      'Shop NOVA everyday shoes: lightweight knit sneakers and slip-ons with soft foam midsoles for all-day wear.',
  },
]

export const products: Product[] = [
  {
    id: 'stride-runner',
    slug: 'stride-runner',
    name: 'Stride Runner',
    category: 'running',
    tagline: 'Cushioned daily trainer',
    description:
      'The Stride Runner is our everyday road shoe: a thick, rockered foam midsole for smooth heel-to-toe transitions, an engineered mesh upper that breathes on warm runs, and a durable rubber outsole that holds up to daily miles and daily wear.',
    priceCents: 14500,
    isNew: true,
    colors: [
      {
        slug: 'chalk-ember',
        name: 'Chalk / Ember',
        swatch: ['#EDEAE3', '#C45A2C'],
        images: ['stride-chalk-ember-side', 'stride-chalk-ember-angle'],
        family: 'white',
      },
      {
        slug: 'carbon',
        name: 'Carbon',
        swatch: ['#2B2B2B', '#C45A2C'],
        images: ['stride-carbon-side', 'stride-carbon-angle'],
        family: 'black',
      },
    ],
    sizes: FULL_RUN,
    widths: [STANDARD, WIDE],
    highlights: [
      'Rockered foam midsole for smooth transitions',
      'Breathable engineered mesh upper',
      'Heel pull tab and padded collar',
      'Available in standard and wide',
    ],
    specs: [
      { label: 'Heel-to-toe drop', value: '8 mm' },
      { label: 'Weight', value: '9.6 oz (US M 9)' },
      { label: 'Cushioning', value: 'High' },
      { label: 'Surface', value: 'Road, treadmill' },
    ],
    materials: 'Engineered polyester mesh upper, synthetic suede overlays, EVA-blend foam midsole, carbon rubber outsole.',
    care: 'Remove the insole and wipe the upper with a damp cloth and mild soap. Air dry away from direct heat. Do not machine wash.',
    fit: {
      summary: 'Standard fit with a roomy toe box.',
      advice: 'Order your usual running shoe size. If you have a wide forefoot, choose the Wide (2E) option.',
    },
    bestFor: ['Daily training', 'Easy runs', 'All-day wear'],
    defaultStock: 14,
    stock: {
      'stride-runner:chalk-ember:7:2E': 0,
      'stride-runner:chalk-ember:13:2E': 0,
      'stride-runner:chalk-ember:10:D': 3,
      'stride-runner:carbon:7:D': 0,
      'stride-runner:carbon:7:2E': 0,
      'stride-runner:carbon:12:2E': 2,
    },
    relatedGuides: ['how-to-choose-running-shoes', 'how-to-measure-your-feet'],
  },
  {
    id: 'ridge-trail',
    slug: 'ridge-trail',
    name: 'Ridge Trail',
    category: 'trail',
    tagline: 'Grippy, protective trail shoe',
    description:
      'The Ridge Trail pairs a lugged rubber outsole with a ripstop upper and welded overlays for support on uneven ground. A rubber toe cap shields against rocks and roots, and a slightly firmer midsole keeps the ride stable on descents.',
    priceCents: 15500,
    colors: [
      {
        slug: 'moss',
        name: 'Moss',
        swatch: ['#4F5A2E', '#C45A2C'],
        images: ['ridge-moss-side', 'ridge-moss-angle'],
        family: 'green',
      },
      {
        slug: 'slate',
        name: 'Slate',
        swatch: ['#5E6670'],
        images: ['ridge-slate-side', 'ridge-slate-angle'],
        family: 'grey',
      },
    ],
    sizes: FULL_RUN,
    widths: [STANDARD],
    highlights: [
      '4.5 mm multi-directional lugs',
      'Protective rubber toe cap',
      'Ripstop upper with welded overlays',
      'Gusseted tongue keeps debris out',
    ],
    specs: [
      { label: 'Heel-to-toe drop', value: '6 mm' },
      { label: 'Weight', value: '10.4 oz (US M 9)' },
      { label: 'Lug depth', value: '4.5 mm' },
      { label: 'Surface', value: 'Trail, gravel, mixed' },
    ],
    materials: 'Ripstop polyester upper, TPU overlays, rubber toe cap, EVA-blend midsole, sticky rubber lugged outsole.',
    care: 'Knock off dirt once dry, then brush and rinse the outsole. Wipe the upper with a damp cloth. Air dry with the insole removed.',
    fit: {
      summary: 'Secure, slightly snug midfoot.',
      advice: 'Order your usual size. If you wear thick hiking socks, consider a half size up.',
    },
    bestFor: ['Trail runs', 'Day hikes', 'Wet or loose ground'],
    defaultStock: 10,
    stock: {
      'ridge-trail:moss:7:D': 0,
      'ridge-trail:moss:13:D': 1,
      'ridge-trail:slate:12:D': 0,
      'ridge-trail:slate:13:D': 0,
    },
    relatedGuides: ['how-to-choose-running-shoes'],
  },
  {
    id: 'court-low',
    slug: 'court-low',
    name: 'Court Low',
    category: 'lifestyle',
    tagline: 'Minimal leather low-top',
    description:
      'A clean, low-profile court sneaker in smooth leather with a perforated toe for airflow. The stitched rubber cupsole is built for years of everyday wear and a padded collar keeps the heel comfortable from the first day.',
    priceCents: 12500,
    colors: [
      {
        slug: 'bone-gum',
        name: 'Bone / Gum',
        swatch: ['#EFE9DD', '#B98A55'],
        images: ['court-bone-gum-side', 'court-bone-gum-angle'],
        family: 'white',
      },
      {
        slug: 'black',
        name: 'Black',
        swatch: ['#1C1C1C'],
        images: ['court-black-side', 'court-black-angle'],
        family: 'black',
      },
    ],
    sizes: FULL_RUN,
    widths: [STANDARD],
    highlights: [
      'Smooth leather upper with perforated toe',
      'Stitched rubber cupsole',
      'Padded collar and tongue',
      'Removable cushioned insole',
    ],
    specs: [
      { label: 'Upper', value: 'Leather' },
      { label: 'Sole', value: 'Stitched rubber cupsole' },
      { label: 'Weight', value: '13.1 oz (US M 9)' },
      { label: 'Lining', value: 'Textile' },
    ],
    materials: 'Leather upper, textile lining, foam insole, rubber cupsole.',
    care: 'Wipe with a soft damp cloth. Condition the leather occasionally with a neutral leather cream. Store away from direct sunlight.',
    fit: {
      summary: 'Runs slightly long.',
      advice: 'If you are between sizes, choose the smaller size. The leather softens with wear.',
    },
    bestFor: ['Everyday wear', 'Office casual', 'Travel'],
    defaultStock: 12,
    stock: {
      'court-low:bone-gum:9:D': 2,
      'court-low:bone-gum:13:D': 0,
      'court-low:black:7:D': 0,
    },
    relatedGuides: ['how-to-care-for-leather-sneakers', 'how-to-measure-your-feet'],
  },
  {
    id: 'drift-knit',
    slug: 'drift-knit',
    name: 'Drift Knit',
    category: 'everyday',
    tagline: 'Lightweight knit sneaker',
    description:
      'The Drift Knit is made for long days on your feet. A soft, stretchy knit upper moves with your foot, a lightweight foam sole absorbs impact on hard floors, and the low-profile shape pairs easily with most outfits.',
    priceCents: 11500,
    isNew: true,
    colors: [
      {
        slug: 'stone',
        name: 'Stone',
        swatch: ['#B9B4AA'],
        images: ['drift-stone-side', 'drift-stone-angle'],
        family: 'grey',
      },
      {
        slug: 'sage',
        name: 'Sage',
        swatch: ['#9CAA93'],
        images: ['drift-sage-side', 'drift-sage-angle'],
        family: 'green',
      },
    ],
    sizes: FULL_RUN,
    widths: [STANDARD, WIDE],
    highlights: [
      'Soft, stretchy knit upper',
      'Lightweight foam midsole',
      'Flexible rubber outsole',
      'Available in standard and wide',
    ],
    specs: [
      { label: 'Weight', value: '8.2 oz (US M 9)' },
      { label: 'Heel-to-toe drop', value: '6 mm' },
      { label: 'Cushioning', value: 'Medium' },
      { label: 'Surface', value: 'City, indoor' },
    ],
    materials: 'Polyester knit upper, EVA foam midsole, rubber outsole pods.',
    care: 'Brush off dust and spot clean with a damp cloth and mild soap. Air dry. Do not machine wash.',
    fit: {
      summary: 'True to size with a flexible upper.',
      advice: 'Order your usual size. The knit stretches slightly with wear.',
    },
    bestFor: ['Commuting', 'Travel', 'Standing all day'],
    defaultStock: 16,
    stock: {
      'drift-knit:stone:13:2E': 0,
      'drift-knit:sage:7:2E': 0,
      'drift-knit:sage:12:D': 2,
    },
    relatedGuides: ['how-to-measure-your-feet'],
  },
  {
    id: 'arc-high',
    slug: 'arc-high',
    name: 'Arc High',
    category: 'lifestyle',
    tagline: 'Suede and leather high-top',
    description:
      'A high-top built from suede and smooth leather panels with contrast stitching. The padded ankle collar adds comfort and the vulcanized rubber sole gives a flexible, grounded feel.',
    priceCents: 13500,
    colors: [
      {
        slug: 'oxblood',
        name: 'Oxblood',
        swatch: ['#6B1F26'],
        images: ['arc-oxblood-side', 'arc-oxblood-angle'],
        family: 'red',
      },
    ],
    sizes: FULL_RUN,
    widths: [STANDARD],
    highlights: [
      'Suede and leather upper',
      'Padded ankle collar',
      'Contrast stitching',
      'Vulcanized rubber sole',
    ],
    specs: [
      { label: 'Upper', value: 'Suede and leather' },
      { label: 'Sole', value: 'Vulcanized rubber' },
      { label: 'Weight', value: '14.0 oz (US M 9)' },
      { label: 'Lining', value: 'Textile' },
    ],
    materials: 'Suede and leather upper, textile lining, foam insole, vulcanized rubber sole.',
    care: 'Use a suede brush to lift the nap and remove dry dirt. Treat with a suede protector before first wear. Avoid soaking.',
    fit: {
      summary: 'True to size.',
      advice: 'Order your usual sneaker size. The collar feels snug at first and eases in after a few wears.',
    },
    bestFor: ['Everyday wear', 'Cooler weather'],
    defaultStock: 8,
    stock: {
      'arc-high:oxblood:7:D': 0,
      'arc-high:oxblood:7.5:D': 0,
      'arc-high:oxblood:11:D': 1,
    },
    relatedGuides: ['how-to-care-for-leather-sneakers'],
  },
  {
    id: 'glide-slip-on',
    slug: 'glide-slip-on',
    name: 'Glide Slip-On',
    category: 'everyday',
    tagline: 'Laceless, cushioned slip-on',
    description:
      'Step in and go. The Glide Slip-On has stretch gore panels for easy entry, a heel pull loop, and a cushioned foam sole with a gentle rocker that keeps each step smooth on long walks.',
    priceCents: 10500,
    colors: [
      {
        slug: 'charcoal',
        name: 'Charcoal',
        swatch: ['#3D3D3D', '#C45A2C'],
        images: ['glide-charcoal-side', 'glide-charcoal-angle'],
        family: 'grey',
      },
      {
        slug: 'sand',
        name: 'Sand',
        swatch: ['#CDB99A', '#C45A2C'],
        images: ['glide-sand-side', 'glide-sand-angle'],
        family: 'neutral',
      },
    ],
    sizes: FULL_RUN,
    widths: [STANDARD, WIDE],
    highlights: [
      'Stretch gore panels for easy on and off',
      'Heel pull loop',
      'Cushioned rocker foam sole',
      'Available in standard and wide',
    ],
    specs: [
      { label: 'Weight', value: '8.8 oz (US M 9)' },
      { label: 'Closure', value: 'Laceless slip-on' },
      { label: 'Cushioning', value: 'Medium-high' },
      { label: 'Surface', value: 'City, travel' },
    ],
    materials: 'Polyester stretch knit upper, elastic gore panels, EVA foam midsole, rubber outsole.',
    care: 'Spot clean with a damp cloth and mild soap. Air dry away from direct heat.',
    fit: {
      summary: 'Snug at first, relaxes with wear.',
      advice: 'Order your usual size. If you are between sizes, go up a half size.',
    },
    bestFor: ['Travel', 'Errands', 'Long walks'],
    defaultStock: 12,
    stock: {
      'glide-slip-on:charcoal:13:2E': 0,
      'glide-slip-on:sand:7:D': 0,
      'glide-slip-on:sand:7:2E': 0,
      'glide-slip-on:sand:13:2E': 0,
    },
    relatedGuides: ['how-to-measure-your-feet'],
  },
]
