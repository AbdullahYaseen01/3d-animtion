import type { CategorySlug } from '../catalog/types'

export interface GuideSection {
  heading: string
  body: string[]
  list?: string[]
}

export interface Guide {
  slug: string
  title: string
  /** Meta description: 120–160 characters. */
  description: string
  intro: string
  sections: GuideSection[]
  relatedProducts: string[]
  /** Heading above the related products; defaults to "Styles mentioned in this guide". */
  productsHeading?: string
  /** Collections this guide helps with. The first is linked as the main next step. */
  categories: CategorySlug[]
  /** Other guides worth reading next. */
  relatedGuides?: string[]
  /** Share image under /og. */
  image: string
  imageAlt: string
  /** ISO dates. Change `updated` only when the advice itself changes. */
  published: string
  updated: string
}

/** Original editorial content. Product-specific statements refer to the catalog. */
export const guides: Guide[] = [
  {
    slug: 'how-to-measure-your-feet',
    title: 'How to measure your feet at home',
    description:
      'A five-minute method for measuring foot length and width at home with paper and a ruler, and how to turn the numbers into the right shoe size.',
    intro:
      'Most sizing mistakes come from guessing. Measuring your feet takes a few minutes, a sheet of paper and a ruler, and it makes online shoe shopping far more predictable.',
    sections: [
      {
        heading: 'What you need',
        body: ['A sheet of paper larger than your foot, a pen or pencil, a ruler or tape measure, and the socks you plan to wear with the shoes.'],
      },
      {
        heading: 'Measure length',
        body: [
          'Measure late in the day, when feet are at their largest. Place the paper flat against a wall on a hard floor.',
          'Stand on the paper with your heel touching the wall and your weight evenly spread. Have someone mark the tip of your longest toe, or lean forward carefully and mark it yourself.',
          'Measure from the wall edge of the paper to the mark in centimeters. Repeat for the other foot and use the longer measurement.',
        ],
      },
      {
        heading: 'Measure width',
        body: [
          'While standing on the paper, mark both sides of your foot at the widest point, usually across the ball of the foot. Measure the distance between the marks.',
          'If your width measurement is noticeably wider than average for your length, or standard shoes press on the sides of your forefoot, look for styles offered in Wide (2E).',
        ],
      },
      {
        heading: 'Turn the measurement into a size',
        body: [
          'Compare your foot length with the centimeter column in our size chart and choose the size whose length is equal to or just above your measurement.',
          'For running shoes, many people prefer about a thumb’s width of space in front of the longest toe to allow for foot swell on longer runs.',
        ],
        list: ['Between sizes in running shoes: consider the larger size.', 'Between sizes in leather styles: the smaller size is often better, as leather softens.'],
      },
    ],
    relatedProducts: ['stride-runner', 'drift-knit', 'glide-slip-on'],
    productsHeading: 'Shoes available in standard and wide',
    categories: ['shoes'],
    relatedGuides: ['standard-vs-wide-shoes', 'how-to-choose-running-shoes'],
    image: '/og/collection-shoes.jpg',
    imageAlt: 'Cream sneakers worn on stone steps',
    published: '2026-09-24',
    updated: '2026-09-24',
  },
  {
    slug: 'how-to-choose-running-shoes',
    title: 'Road or trail? Choosing your running shoe',
    description:
      'Road and trail running shoes compared: how cushioning, heel-to-toe drop, lug depth and toe protection change the way a running shoe feels.',
    intro:
      'Road and trail running shoes look similar but are built for very different ground. Knowing where you run most often is the quickest way to narrow down the right pair.',
    sections: [
      {
        heading: 'Where do you run?',
        body: [
          'Road shoes are designed for pavement, tracks and treadmills. They prioritize cushioning and smooth transitions on predictable surfaces.',
          'Trail shoes are designed for dirt, gravel, roots and rock. They add deeper lugs for grip, a more protective upper and a steadier platform for uneven ground.',
        ],
      },
      {
        heading: 'Cushioning and drop',
        body: [
          'Cushioning describes how much foam sits under your foot. Higher cushioning feels softer and is popular for daily training and longer runs.',
          'Drop is the height difference between heel and forefoot. A higher drop (around 8–10 mm) can feel familiar if you are used to traditional running shoes; a lower drop (around 4–6 mm) encourages a more midfoot landing.',
        ],
      },
      {
        heading: 'Grip and protection',
        body: [
          'On the trail, lug depth matters. Deeper, widely spaced lugs shed mud and bite into loose ground. Shallower lugs feel smoother on hard-packed paths and roads.',
          'Look for a toe cap and a gusseted tongue if you run on rocky or debris-covered trails.',
        ],
      },
      {
        heading: 'Where NOVA styles fit',
        body: [
          'The Stride Runner is our road shoe, with a rockered foam midsole, an 8 mm drop and standard or wide widths.',
          'The Ridge Trail is our trail shoe, with 4.5 mm lugs, a rubber toe cap and a 6 mm drop.',
        ],
      },
    ],
    relatedProducts: ['stride-runner', 'ridge-trail'],
    productsHeading: 'Running shoes in this guide',
    categories: ['running'],
    relatedGuides: ['how-to-measure-your-feet', 'standard-vs-wide-shoes'],
    image: '/og/collection-shoes.jpg',
    imageAlt: 'Cream sneakers worn on stone steps',
    published: '2026-09-24',
    updated: '2026-09-24',
  },
  {
    slug: 'how-to-care-for-leather-sneakers',
    title: 'Caring for leather and suede sneakers',
    description:
      'Simple cleaning, conditioning and storage habits that keep leather and suede sneakers looking good for longer, using only a cloth and a brush.',
    intro: 'Leather and suede age well when they get a little regular attention. None of this takes long, and most of it needs only a soft cloth and a brush.',
    sections: [
      {
        heading: 'Smooth leather',
        body: [
          'Wipe off dust and marks with a soft, slightly damp cloth after wear. For stubborn marks, use a small amount of mild soap in water, then wipe clean.',
          'Every few months, apply a thin layer of neutral leather conditioner to keep the leather supple and help prevent creasing and cracking.',
        ],
      },
      {
        heading: 'Suede',
        body: [
          'Brush suede when it is dry to lift the nap and remove dirt. Brush in one direction for an even finish.',
          'Apply a suede protector spray before first wear and reapply occasionally. Avoid soaking suede; if it gets wet, blot with a towel and let it dry naturally.',
        ],
      },
      {
        heading: 'Soles, laces and storage',
        body: [
          'Scrub rubber soles with a soft brush and soapy water. Laces can be hand-washed and air dried.',
          'Store shoes away from direct sunlight and heat, which can fade color and dry out leather. Shoe trees or crumpled paper help pairs keep their shape.',
        ],
      },
    ],
    relatedProducts: ['court-low', 'arc-high'],
    productsHeading: 'Leather and suede sneakers',
    categories: ['lifestyle'],
    relatedGuides: ['how-to-measure-your-feet'],
    image: '/og/collection-shoes.jpg',
    imageAlt: 'Cream sneakers worn on stone steps',
    published: '2026-09-24',
    updated: '2026-09-24',
  },
  {
    slug: 'standard-vs-wide-shoes',
    title: 'Standard or wide? How to choose a shoe width',
    description:
      'What the D and 2E width letters mean, the signs a standard shoe is too narrow for you, and how to check your width before you order online.',
    intro:
      'Length gets most of the attention, but a shoe that is the right length and too narrow still pinches. Width is worth two minutes of checking before you order.',
    sections: [
      {
        heading: 'What the letters mean',
        body: [
          'US shoe widths are written as letters. On the men’s scale that NOVA shoes use, D is standard and 2E (sometimes written EE) is wide.',
          'Men’s and women’s scales use the same letters for different widths, so always compare widths on the same scale. Every NOVA shoe lists its width options on the product page.',
        ],
      },
      {
        heading: 'Signs you may need a wide',
        body: ['These are fit signals, not medical advice. If you have ongoing foot pain, talk to a podiatrist or another qualified professional.'],
        list: [
          'The sides of the forefoot feel pressed even when the length is right.',
          'The upper bulges over the edge of the sole at the widest part of your foot.',
          'You often size up in length only to get more room across the ball of the foot.',
          'Laces sit close together or fully tightened eyelets still feel snug.',
        ],
      },
      {
        heading: 'Check your width at home',
        body: [
          'Trace your foot while standing, then measure across the widest point, usually the ball of the foot. Our foot measuring guide walks through the steps.',
          'Compare the number with a pair you already find comfortable. If that pair is a wide, start with a wide. If your comfortable pairs are standard and roomy, standard is a safe first choice.',
        ],
      },
      {
        heading: 'Which NOVA shoes come in wide',
        body: [
          'The Stride Runner, Drift Knit and Glide Slip-On are each offered in Standard (D) and Wide (2E). The other shoes are standard width only.',
          'Knit uppers stretch a little more than leather, so a knit shoe in standard may suit a slightly broader foot than a leather shoe in standard.',
        ],
      },
    ],
    relatedProducts: ['stride-runner', 'drift-knit', 'glide-slip-on'],
    productsHeading: 'Shoes available in Wide (2E)',
    categories: ['shoes'],
    relatedGuides: ['how-to-measure-your-feet', 'how-to-choose-running-shoes'],
    image: '/og/collection-shoes.jpg',
    imageAlt: 'Cream sneakers worn on stone steps',
    published: '2026-09-26',
    updated: '2026-09-26',
  },
  {
    slug: 'what-fits-in-a-crossbody-bag',
    title: 'What fits in a crossbody bag and wallet?',
    description:
      'How to read bag dimensions and strap drop, what a small crossbody and a slim bifold wallet realistically hold, and how to check before you buy.',
    intro:
      'Bag photos rarely show scale. The dimensions on the product page tell you far more, once you know what to compare them with.',
    sections: [
      {
        heading: 'Read the three dimensions',
        body: [
          'Bag sizes are usually listed as width × height × depth. Width and height tell you whether a flat item fits; depth tells you how many items fit together.',
          'The easiest check is to measure a bag you already own and compare. A phone, keys and a card wallet are the usual test.',
        ],
      },
      {
        heading: 'Strap drop and how it sits',
        body: [
          'Strap drop is the distance from the top of the strap to the top of the bag when it hangs. A longer drop sits the bag at the hip when worn across the body; a shorter drop sits it higher.',
          'An adjustable strap lets you switch between shoulder and crossbody wear, so the listed drop is usually the maximum.',
        ],
      },
      {
        heading: 'Wallets: cards and bills',
        body: [
          'A standard payment card is about 3.37 × 2.13 in. A US bill is about 6.14 in long, so a bifold carries bills folded in half, at a little over 3 in.',
          'Count the cards you carry every day, not the ones you might need. Slim wallets feel slim only when they are not overfilled.',
        ],
      },
      {
        heading: 'How the NOVA styles measure',
        body: [
          'The Mini Crossbody measures 8.5 × 5.5 × 2.5 in with a 22 in adjustable strap drop, a top zip, one main compartment and a slip pocket. It is sized for a phone, keys and a card wallet.',
          'The Slim Wallet is a 4.3 × 3.2 × 0.4 in bifold with four card slots, a central cash pocket and a snap closure.',
        ],
      },
    ],
    relatedProducts: ['mini-crossbody', 'slim-wallet'],
    productsHeading: 'Bags and wallets in this guide',
    categories: ['handbags', 'wallets'],
    relatedGuides: ['how-to-choose-a-laptop-backpack'],
    image: '/og/collection-handbags.jpg',
    imageAlt: 'Burgundy structured handbag',
    published: '2026-09-26',
    updated: '2026-09-26',
  },
  {
    slug: 'how-to-choose-a-laptop-backpack',
    title: 'How to choose a laptop backpack for your commute',
    description:
      'Check laptop fit by measuring the device, not the screen, then weigh capacity in liters, pockets and straps to find a commuter backpack that fits.',
    intro:
      'A laptop backpack has two jobs: protect the computer and carry everything else without feeling like luggage. Getting the fit right starts with a tape measure.',
    sections: [
      {
        heading: 'Measure the laptop, not the screen',
        body: [
          'Laptop sizes such as “15-inch” describe the screen diagonal. The body of the laptop is what has to fit the sleeve, and bodies vary between brands and models.',
          'Measure your laptop’s width, depth and thickness, and include any case you keep it in. When a bag lists a sleeve size, only trust the fit that is written on the product.',
        ],
      },
      {
        heading: 'Capacity in liters',
        body: [
          'Backpack capacity is measured in liters. Smaller daypacks suit a laptop, charger and a few essentials; larger packs add room for a jacket, lunch or gym kit.',
          'More volume is not always better for a commute. A pack that is mostly empty lets things shift and can feel bulkier on a crowded train.',
        ],
      },
      {
        heading: 'Pockets and straps',
        list: [
          'A separate padded laptop sleeve keeps the computer from sharing space with keys and bottles.',
          'A front pocket keeps small items reachable without opening the main compartment.',
          'Padded shoulder straps spread the load when the bag is full.',
        ],
        body: ['Look for the features you will use every day rather than the longest feature list.'],
      },
      {
        heading: 'How the Commute Pack measures',
        body: [
          'The Commute Pack is an 18 L backpack measuring 17 × 11 × 6 in, with a padded sleeve measured for a 15-inch laptop, a main compartment, a front pocket and padded straps.',
          'Laptop fit is limited to that 15-inch sleeve. If your laptop is unusually large for its screen size, compare its measurements before ordering.',
        ],
      },
    ],
    relatedProducts: ['commute-pack'],
    productsHeading: 'The backpack in this guide',
    categories: ['backpacks'],
    relatedGuides: ['what-fits-in-a-crossbody-bag'],
    image: '/og/collection-backpacks.jpg',
    imageAlt: 'Dark backpack',
    published: '2026-09-26',
    updated: '2026-09-26',
  },
  {
    slug: 'watch-case-size-and-strap-fit',
    title: 'Watch case size and strap fit, explained',
    description:
      'How to measure your wrist, what a watch case diameter means in millimeters, and how to check that a leather strap will fit before you order.',
    intro: 'A watch that fits looks right and stays put. Two numbers decide most of it: the case diameter and the range the strap adjusts to.',
    sections: [
      {
        heading: 'Measure your wrist',
        body: [
          'Wrap a soft tape measure, or a strip of paper you then lay against a ruler, around your wrist just above the wrist bone, where a watch usually sits.',
          'Keep it snug but not tight. That number is your wrist size; compare it with the strap fit range listed on the product.',
        ],
      },
      {
        heading: 'What case size means',
        body: [
          'Case size is the diameter of the watch case in millimeters, usually measured without the crown. It is the main number that decides how large a watch looks on the wrist.',
          'There is no fixed rule, but mid-size cases in the high 30s of millimeters are a common everyday choice. Lug-to-lug length, from the top strap attachment to the bottom one, also matters: it should not overhang the edges of your wrist.',
        ],
      },
      {
        heading: 'Leather strap fit',
        body: [
          'Buckle straps adjust through a series of holes, so they fit a range of wrist sizes rather than one size. Check that your wrist sits inside the listed range, ideally not at either end.',
          'Leather softens and shapes to the wrist with wear. Keep it dry, since water can stain and stiffen leather.',
        ],
      },
      {
        heading: 'How the Line Watch measures',
        body: [
          'The Line Watch has a 38 mm round case, quartz movement and a tan leather strap listed to fit wrists of about 6.3–7.8 in.',
          'No water-resistance rating is published for this preview style, so treat it as a watch to keep dry.',
        ],
      },
    ],
    relatedProducts: ['line-watch'],
    productsHeading: 'The watch in this guide',
    categories: ['watches'],
    relatedGuides: ['what-fits-in-a-crossbody-bag'],
    image: '/og/collection-watches.jpg',
    imageAlt: 'Watch worn on a wrist',
    published: '2026-09-26',
    updated: '2026-09-26',
  },
]

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}

const SHOE_USES: CategorySlug[] = ['running', 'trail', 'lifestyle', 'everyday']

/** Guides for a collection. General shoe guides also appear on every shoe-type collection, and vice versa. */
export function guidesForCategory(slug: CategorySlug): Guide[] {
  const isShoe = slug === 'shoes' || SHOE_USES.includes(slug)
  return guides.filter(
    (g) => g.categories.includes(slug) || (isShoe && (g.categories.includes('shoes') || (slug === 'shoes' && g.categories.some((c) => SHOE_USES.includes(c))))),
  )
}
