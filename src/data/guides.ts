export interface GuideSection {
  heading: string
  body: string[]
  list?: string[]
}

export interface Guide {
  slug: string
  title: string
  description: string
  intro: string
  sections: GuideSection[]
  relatedProducts: string[]
  relatedCategory?: string
}

/** Original editorial content. Product-specific statements refer to the catalog. */
export const guides: Guide[] = [
  {
    slug: 'how-to-measure-your-feet',
    title: 'How to measure your feet at home',
    description: 'A five-minute method for finding your foot length and width, and how to translate it into a shoe size.',
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
  },
  {
    slug: 'how-to-choose-running-shoes',
    title: 'Road or trail? Choosing your running shoe',
    description: 'The differences between road and trail shoes, and how cushioning, drop and grip affect the way a shoe feels.',
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
    relatedCategory: 'running',
  },
  {
    slug: 'how-to-care-for-leather-sneakers',
    title: 'Caring for leather and suede sneakers',
    description: 'Simple cleaning and storage habits that keep leather and suede sneakers looking good for longer.',
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
    relatedCategory: 'lifestyle',
  },
]

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}
