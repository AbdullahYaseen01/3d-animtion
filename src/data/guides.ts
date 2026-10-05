import type { CategorySlug } from '../catalog/types'
import { publicText } from '../lib/publicCopy'

export interface GuideSection {
  heading: string
  body: string[]
  list?: string[]
}

export interface GuideQuestion {
  question: string
  answer: string
}

export interface Guide {
  slug: string
  title: string
  /** Meta description: 140–160 characters. */
  description: string
  intro: string
  sections: GuideSection[]
  /** Rendered on the page and mirrored in FAQPage markup word for word. */
  faq?: GuideQuestion[]
  relatedProducts: string[]
  /** Heading above the related products; defaults to "Styles mentioned in this guide". */
  productsHeading?: string
  /** Collections this guide helps with. The first is linked as the main next step. */
  categories: CategorySlug[]
  /** Other guides worth reading next. */
  relatedGuides?: string[]
  /** Share image, site-relative. */
  image: string
  imageAlt: string
  /** ISO dates. Change `updated` only when the advice itself changes. */
  published: string
  updated: string
}

/** Original editorial content. Product-specific statements refer to the catalog. */
const guideSource: Guide[] = [
  {
    slug: 'how-to-measure-your-feet',
    title: 'How to measure your feet at home',
    description:
      'A five-minute method for measuring foot length and width at home with paper and a ruler, and how to turn the numbers into the right US shoe size online.',
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
          'Every sneaker in our shop comes in a standard width. If your width measurement is well above average for your length, a knit or slip-on upper usually gives more room than a stiff synthetic one.',
        ],
      },
      {
        heading: 'Turn the measurement into a size',
        body: [
          'Compare your foot length with the centimeter column in our size chart and choose the size whose length is equal to or just above your measurement.',
          'For active wear, many people prefer about a thumb’s width of space in front of the longest toe to allow for foot swell during long days.',
        ],
        list: ['Between sizes in mesh or knit sneakers: consider the larger size.', 'Between sizes in stiffer synthetic uppers: the larger size is usually safer, since they give less than knit.'],
      },
      {
        heading: 'How the numbers map to a US size',
        body: [
          'Our [shoe size converter](/tools/shoe-size-converter) uses the same chart as the [fit guide](/fit-guide). A 27 cm foot matches US men 9 / UK 8 / EU 42.5. A 26 cm foot matches US men 8. If your length sits between two rows, choose the larger row so the toe is not against the end of the shoe.',
          'Women who usually wear a US women 10 should look at US men 8.5 on that chart. The offset is about 1.5 sizes. [Ndure men\'s sneakers](/collections/shoes) are sold in US men\'s sizes only, in standard width, typically 7 through 12.',
          'Do not convert from the size printed in an old pair unless you have measured that pair against the chart. Brands stamp different lasts. A "9" in one brand can match an 8.5 in another. The centimeter column is the only number that travels.',
        ],
      },
      {
        heading: 'Width, even when the shop only stocks standard',
        body: [
          'Every sneaker we sell is standard (D) width. We do not stock 2E. If the paper width is well above the average for your length, a knit or slip-on upper usually gives more room than a stiff synthetic one. Read [standard vs wide shoes](/guides/standard-vs-wide-shoes) before you order a structured lace-up.',
          'A mesh lace-up from the [lightweight mesh sneakers](/collections/running) collection will give more than a coated low-top. If your foot spills over the sole of shoes you already own, measuring width first saves a return.',
        ],
      },
      {
        heading: 'A worked example',
        body: [
          'Suppose the longer foot is 27.2 cm and the width at the ball is 10.2 cm. The next chart row at or above 27.2 cm is 27.5 cm, US men 9.5. That is the size to start with. If you swell at the end of a standing shift, do not size down to make the shoe look neater.',
          'If you already own a pair that fits, measure the insole length and compare it with the foot length. You want a little space in front of the toe. Then open the product you are considering — for example the [Ndure KAY-0003](/products/ndure-kay-0003-black) — and read the fit note on that page. The note is about that last, not a generic "runs large" claim.',
        ],
      },
      {
        heading: 'What this method does not do',
        body: [
          'It does not replace trying shoes on. It does not tell you how a high instep will feel under a tight lace. It does not convert kids\' sizes. It is a way to stop guessing when you order [men\'s sneakers](/collections/shoes) online and want the first pair to be close.',
          'If the measurement is below 25 cm or above 31 cm, our current sneakers are outside that range. Do not force a size at the end of the chart.',
        ],
      },
    ],
    faq: [
      {
        question: 'What time of day should I measure my feet?',
        answer: 'Measure late in the afternoon or evening. Feet swell slightly during the day, so an evening measurement matches how shoes feel after hours of wear.',
      },
      {
        question: 'Should I measure both feet?',
        answer: 'Yes. Most people have one foot slightly longer than the other. Use the longer measurement when you choose a size.',
      },
    ],
    relatedProducts: ['ndure-kay-0003-black', 'ndure-len-0013-grey', 'ndure-lok-0017-navy'],
    productsHeading: "Sneakers in US men's sizes",
    categories: ['shoes'],
    relatedGuides: ['standard-vs-wide-shoes', 'how-to-choose-running-shoes'],
    image: '/og/collection-shoes.jpg',
    imageAlt: 'Cream sneakers worn on stone steps',
    published: '2026-09-24',
    updated: '2026-10-04',
  },
  {
    slug: 'how-to-choose-running-shoes',
    title: 'Road or trail? Choosing your running shoe',
    description:
      'Road and trail running shoes compared: cushioning, heel-to-toe drop, lug depth, and toe protection, plus where casual jogger-style sneakers fit in your rotation.',
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
        heading: 'Where our jogger-style sneakers fit',
        body: [
          'The sneakers in our running collection are jogger-style casual shoes from Ndure, with mesh or knit uppers and EVA or PU soles. They suit walks, gym sessions, and long days on your feet.',
          'They are not specialist distance-running shoes, and no drop or lug depth is published for them. If you train for races or run technical trails, choose a dedicated running shoe for those sessions.',
        ],
      },
    ],
    faq: [
      {
        question: 'Can I run in jogger-style sneakers?',
        answer:
          'For short, easy runs on pavement many people do. For regular training or long distances, a dedicated running shoe with published cushioning and drop is the better choice.',
      },
    ],
    relatedProducts: ['ndure-kay-0003-black', 'ndure-len-0013-grey', 'ndure-alr-0008-off-white'],
    productsHeading: 'Jogger-style sneakers from our shop',
    categories: ['running'],
    relatedGuides: ['how-to-measure-your-feet', 'how-to-care-for-leather-sneakers'],
    image: '/og/collection-shoes.jpg',
    imageAlt: 'Cream sneakers worn on stone steps',
    published: '2026-09-24',
    updated: '2026-10-01',
  },
  {
    slug: 'how-to-care-for-leather-sneakers',
    title: 'How to clean mesh, knit, and leather sneakers',
    description:
      'Simple cleaning, drying, and storage habits for mesh, knit, synthetic, and leather sneakers, using only a soft brush, mild soap, and a cloth, with no machine wash.',
    intro:
      'Sneakers last longer with a little regular attention. The method depends on the upper: open mesh and knit need gentle cleaning, synthetic and leather uppers need wiping, and every pair needs to dry slowly.',
    sections: [
      {
        heading: 'Mesh and knit uppers',
        body: [
          'Knock off dry dirt first, then brush the upper with a soft brush dipped in water with a little mild soap. Work in small circles and avoid soaking the shoe.',
          'Blot with a dry towel, stuff the shoe with paper, and let it air dry at room temperature. Heat from a radiator or dryer can warp EVA soles and loosen glue.',
        ],
      },
      {
        heading: 'Synthetic and PU uppers',
        body: [
          'Wipe synthetic and polyurethane (PU) uppers with a damp cloth after wear. For scuffs, use a drop of mild soap, then wipe clean with plain water.',
          'Do not use solvents or household cleaners on PU. They can dull or crack the finish.',
        ],
      },
      {
        heading: 'Smooth leather and suede',
        body: [
          'Wipe smooth leather with a slightly damp cloth, and every few months apply a thin layer of neutral leather conditioner.',
          'Brush suede only when dry to lift the nap. If it gets wet, blot it and let it dry naturally.',
        ],
      },
      {
        heading: 'Soles, laces, and storage',
        body: [
          'Scrub rubber, TPR, and EVA soles with a soft brush and soapy water. Laces can be hand-washed and air dried.',
          'Store shoes away from direct sunlight and heat, which fade color. Crumpled paper helps pairs keep their shape.',
        ],
      },
    ],
    faq: [
      {
        question: 'Can I put sneakers in the washing machine?',
        answer:
          'We advise against it. Machine washing can loosen the glue between upper and sole and warp foam soles. Hand-clean with a brush and mild soap, then air dry.',
      },
    ],
    relatedProducts: ['ndure-kay-0003-black', 'ndure-mis-0006-grey', 'ndure-rig-0001-nvy-ofwht'],
    productsHeading: 'Mesh, knit, and PU sneakers',
    categories: ['lifestyle', 'shoes'],
    relatedGuides: ['how-to-measure-your-feet', 'how-to-choose-running-shoes'],
    image: '/og/collection-shoes.jpg',
    imageAlt: 'Cream sneakers worn on stone steps',
    published: '2026-09-24',
    updated: '2026-10-01',
  },
  {
    slug: 'standard-vs-wide-shoes',
    title: 'Standard or wide? How to choose a shoe width',
    description:
      'What the D and 2E width letters mean, the signs a standard shoe is too narrow for you, and how to check your foot width at home before you order shoes online.',
    intro:
      'Length gets most of the attention, but a shoe that is the right length and too narrow still pinches. Width is worth two minutes of checking before you order.',
    sections: [
      {
        heading: 'What the letters mean',
        body: [
          'US shoe widths are written as letters. On the men’s scale, D is standard and 2E (sometimes written EE) is wide.',
          'Men’s and women’s scales use the same letters for different widths, so always compare widths on the same scale.',
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
        heading: 'Widths in our shop',
        body: [
          'Every sneaker we currently sell is offered in a standard (D) width only. We do not stock wide fittings at the moment.',
          'Knit and slip-on uppers stretch a little more than stiff synthetic ones, so they may suit a slightly broader foot. If you normally need a 2E, check the measurements before you order and use our 30-day returns if the fit is wrong.',
        ],
      },
    ],
    relatedProducts: ['ndure-mis-0006-grey', 'ndure-len-0009-black', 'ndure-trn-0014-black'],
    productsHeading: 'Knit and slip-on sneakers with more give',
    categories: ['shoes', 'everyday'],
    relatedGuides: ['how-to-measure-your-feet', 'how-to-choose-running-shoes'],
    image: '/og/collection-shoes.jpg',
    imageAlt: 'Cream sneakers worn on stone steps',
    published: '2026-09-26',
    updated: '2026-10-01',
  },
  {
    slug: 'what-fits-in-a-crossbody-bag',
    title: 'What fits in a crossbody bag and wallet?',
    description:
      'How to read bag dimensions and strap drop, what a small crossbody bag and a bifold wallet realistically hold, and how to check the fit before you buy online.',
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
        heading: 'How our bags and wallets measure',
        body: [
          'Some Bag X crossbody styles, such as the Aries, list 9 in wide, 5 in high, and 2.5 in deep. That holds a phone, keys, and a card case, but not a full-size wallet plus a water bottle.',
          'Metro wallets list dimensions in centimeters. The 21-75 wallets measure 11 × 2 × 9 cm, which is close to the size of a folded US bill.',
        ],
      },
    ],
    relatedProducts: ['bagx-aries-black', 'bagx-nyra-beige', 'metro-21-75-12-10', 'metro-21-6904-12-10'],
    productsHeading: 'Bags and wallets in this guide',
    categories: ['handbags', 'wallets'],
    relatedGuides: ['handbag-styles-explained', 'how-to-care-for-a-wallet'],
    image: '/og/collection-handbags.jpg',
    imageAlt: 'Burgundy structured handbag',
    published: '2026-09-26',
    updated: '2026-10-01',
  },
  {
    slug: 'how-to-choose-a-laptop-backpack',
    title: 'How to choose a laptop backpack for your commute',
    description:
      'Check laptop fit by measuring the device, not the screen, then weigh capacity in liters, pockets, and straps to find a commuter backpack that really fits.',
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
        heading: 'If you do not need a laptop sleeve',
        body: [
          'We do not stock backpacks right now. If you carry a tablet or paperback rather than a laptop, a larger shoulder bag can do the job: some Bag X shoulder styles list 12 in wide, 11 in long, and 5 in deep.',
        ],
      },
    ],
    relatedProducts: ['bagx-leo-maroon', 'bagx-nyra-beige'],
    productsHeading: 'Bags to compare',
    categories: ['handbags'],
    relatedGuides: ['what-fits-in-a-crossbody-bag', 'handbag-styles-explained'],
    image: '/og/collection-backpacks.jpg',
    imageAlt: 'Dark backpack',
    published: '2026-09-26',
    updated: '2026-10-01',
  },
  {
    slug: 'watch-case-size-and-strap-fit',
    title: 'Watch case size and strap fit, explained',
    description:
      'How to measure your wrist, what a watch case diameter in millimeters means on the wrist, and how to check that a strap or metal bracelet will fit before you order.',
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
          'Our watches range from a 35 mm Casio AE-1100WD to a 45 mm Ferro FM40110A. Mid-size cases around 38–41 mm are a common everyday choice, while 43 mm and above reads as a bold, sporty size.',
        ],
      },
      {
        heading: 'Leather straps and metal bracelets',
        body: [
          'Buckle straps adjust through a series of holes, so they fit a range of wrist sizes. Leather softens and shapes to the wrist with wear; keep it dry.',
          'Metal bracelets are sized by removing links. A local jeweler or watch shop can do this in a few minutes if the bracelet is too long.',
        ],
      },
      {
        heading: 'Read the case and the strap',
        body: [
          'Each watch page lists the case, the movement, and the strap, so you can compare those numbers with your wrist before you order.',
          'Treat water resistance as only the rating written on that page. If none is listed, keep the watch dry.',
        ],
      },
      {
        heading: 'A simple comparison of sizes we actually sell',
        body: [
          'Think in three buckets. Compact (about 35–38 mm) sits inside the wrist and suits a slimmer dress shirt. Mid (39–42 mm) is the everyday default. Large (43–45 mm) reads as sport and needs a longer lug-to-lug or it will overhang.',
          'Open [men\'s watches](/collections/watches) and read the case field when it is published. If a listing has no case diameter, we do not invent one. [Fossil](/brands/fossil), [Seiko](/brands/seiko), and [Curren](/brands/curren) each have their own page.',
        ],
        list: [
          'Compact example: a 35 mm digital Casio on a steel bracelet.',
          'Mid example: a Daniel Klein analog on leather, often listed around 40 mm when the maker publishes it.',
          'Large example: a Ferro or similar sport quartz near 45 mm.',
        ],
      },
      {
        heading: 'Strap fit without guessing',
        body: [
          'A leather strap is a hole-and-buckle system. Count the unused holes after you try it: two holes on each side of the working hole is a comfortable range. A metal bracelet is a link system. If the product does not list a wrist range, assume you may need a jeweler to remove links.',
          'Shop [all men\'s watches](/collections/watches) and read the strap field on each page. Keep leather dry; rinse salt off a steel bracelet and dry it.',
        ],
      },
      {
        heading: 'Water resistance is not a swimming claim',
        body: [
          '30 meters usually means splash resistance. 50 meters is still not a dive rating. If the [product page](/collections/watches) has no water-resistance line, treat the watch as dry-only. Do not operate the crown in water.',
          'This page is the Q4 visualizer stand-in: we will add a wrist diagram in a later quarter. Until then, a paper wrist measurement plus the published case size is the honest method.',
        ],
      },
    ],
    faq: [
      {
        question: 'What watch size suits a small wrist?',
        answer: 'Cases from about 35 to 39 mm usually sit well on smaller wrists. Check that the lug-to-lug length does not overhang the edges of your wrist.',
      },
    ],
    relatedProducts: ['daniel-klein-dk12106-4', 'casio-youth-series-digital-silver-steel-ba', 'ferro-fm40110a-a6'],
    productsHeading: 'Watches from 35 to 45 mm',
    categories: ['watches'],
    relatedGuides: ['analog-vs-digital-watches', 'holiday-gift-guide-for-him'],
    image: '/og/collection-watches.jpg',
    imageAlt: 'Watch worn on a wrist',
    published: '2026-09-26',
    updated: '2026-10-04',
  },
  {
    slug: 'how-to-choose-a-mens-pea-coat',
    title: "How to choose a men's pea coat",
    description:
      "What makes a pea coat a pea coat, how a double-breasted front should fit, and why the fabric line matters more than the name when you shop for a men's pea coat.",
    intro:
      'The pea coat is a short, double-breasted wool-style coat that started as naval outerwear and became a city staple. It works over a sweater or a shirt and stops at the hip.',
    sections: [
      {
        heading: 'What defines a pea coat',
        body: [
          'A pea coat is double-breasted, usually with two rows of buttons, a wide collar that can be turned up, and a hip-length hem. It is shorter than an overcoat and more structured than a jacket.',
          'Our ZED pea coats all have a double-breasted button front and come in black, navy, charcoal, brown, and maroon.',
        ],
      },
      {
        heading: 'Read the fabric line, not the name',
        body: [
          'A coat called a wool pea coat is not always mostly wool. Look for the fiber percentages. Wool holds warmth when damp and drapes well; cotton and polyester blends are lighter and easier to care for, but less warm.',
          'In our current range, the Black Wool Pea Coat and Navy Blue Wool Pea Coat list 60% wool and 40% polyester. The other pea coats list 80% cotton and 20% polyester.',
        ],
      },
      {
        heading: 'How a pea coat should fit',
        list: [
          'Shoulders: the seam should sit at the edge of your shoulder, not past it.',
          'Buttoned: you should be able to button it over a sweater without the buttons pulling.',
          'Sleeves: end around the wrist bone so a shirt cuff just shows.',
          'Length: the hem should cover your belt and sit at the hip.',
        ],
        body: ['ZED describes most of these coats as tailored closer to the chest and waist with slimmer arms. If you plan to wear a thick knit underneath, consider your usual size and check it over the layer you will actually wear.'],
      },
      {
        heading: 'Care',
        body: ['ZED lists these coats as dry clean. Between cleanings, brush the coat after wear, hang it on a wide hanger, and let it air out before closing it in a wardrobe.'],
      },
      {
        heading: 'Pea coat versus the rest of the coat rack',
        body: [
          'A pea coat is hip length. An overcoat is closer to the knee. A trench is usually cotton and built for rain, not insulation. If you want the full comparison, read [pea coat vs overcoat](/guides/trench-coat-vs-overcoat). Shop the live list on [men\'s cotton pea coats](/collections/coats).',
          'For a city commute in rain plus cold, a pea coat over a sweater plus an umbrella is more honest than expecting a cotton-blend pea coat to replace a parka. We have one hooded parka in the coat collection; it is the outlier, not the default.',
        ],
        list: [
          'Wool-rich pea coat (60% wool / 40% polyester in the two ZED styles that list that blend): colder dry days.',
          'Cotton-blend pea coat (80% cotton / 20% polyester on the rest): fall and mild winter.',
          'Trench (100% cotton where listed): rain and shoulder seasons.',
        ],
      },
      {
        heading: 'Color and what to wear it with',
        body: [
          'Navy and charcoal sit over almost any knit. Black is the most formal of the current colors. Maroon and brown need a simpler layer underneath so the coat stays the loud piece. A [bomber jacket](/guides/types-of-mens-jackets) is the wrong comparison: it is a jacket, not a coat, and it does not cover the seat.',
          'Letter sizes are S to XL. Measure a coat you already own and use the [jacket and coat size guide](/guides/mens-jacket-and-coat-size-guide). ZED\'s model notes on each product say which size the photographed person wears.',
        ],
      },
      {
        heading: 'Price and what you are paying for',
        body: [
          'These are ZED coats sold by a US retailer, not heritage naval cloth. The value is a named fabric blend, a published fit, and [free US shipping](/shipping) with a [30-day return](/returns) if the size is wrong. Open the specification table on a coat such as the [Black Wool Pea Coat](/products/zed-black-wool-pea-coat) before you compare it with a nameless "wool" listing elsewhere.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is a pea coat warm enough for winter?',
        answer:
          'A wool-rich pea coat over a sweater handles most cold city days. A cotton-blend pea coat is better for fall and mild winter days. Check the fabric percentages on each coat.',
      },
      {
        question: 'Should a pea coat be fitted or loose?',
        answer: 'Fitted enough to look neat when buttoned, with room for a sweater underneath. The buttons should close without pulling across the chest.',
      },
    ],
    relatedProducts: ['zed-black-wool-pea-coat', 'zed-navy-blue-wool-pea-coat', 'zed-charcoal-pea-coat', 'zed-maroon-pea-coat'],
    productsHeading: 'Pea coats in our shop',
    categories: ['coats'],
    relatedGuides: ['trench-coat-vs-overcoat', 'how-to-care-for-a-wool-coat', 'mens-jacket-and-coat-size-guide'],
    image: '/images/products/zed-black-wool-pea-coat-1-1024.webp',
    imageAlt: 'Black Wool Pea Coat by ZED, front view',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'trench-coat-vs-overcoat',
    title: 'Trench coat vs overcoat: which do you need?',
    description:
      'Trench coat or overcoat? Compare fabric, length, warmth, and when to wear each, with real examples from our men’s coats so you can pick the right coat for your weather.',
    intro:
      'Both are long coats that go over a suit or a sweater, and both are worth owning. The difference comes down to fabric and weather: a trench is for rain and mild days, an overcoat is for cold.',
    sections: [
      {
        heading: 'The trench coat',
        body: [
          'A trench is a cotton gabardine or twill coat, often with a storm flap, belt, and epaulettes. It blocks wind and light rain and is not insulated, so it suits spring and fall.',
          'Our ZED trench coats list 100% cotton. They come in full-length twill and technical styles, and a cropped trench that stops higher on the thigh.',
        ],
      },
      {
        heading: 'The overcoat',
        body: [
          'An overcoat is a heavier, knee-length coat cut to go over tailoring. Traditionally it is wool, which keeps you warm on cold days.',
          'ZED lists our overcoats, including the double-breasted ones, as 80% cotton and 20% polyester, so they are mid-weight coats rather than heavy winter wool. Layer a knit underneath on cold days.',
        ],
      },
      {
        heading: 'Which to pick',
        list: [
          'Mostly rain and mild temperatures: a cotton trench.',
          'Cold, dry winters over a suit: an overcoat, ideally with a high wool content.',
          'Casual winter wear over a hoodie or knit: a pea coat or a hooded parka.',
        ],
        body: ['If you can own only one, choose by your coldest regular month. A trench layered with a sweater stretches further than an overcoat in a warm, wet climate.'],
      },
      {
        heading: 'Sizing a long coat',
        body: [
          'Try a long coat over the thickest layer you will wear with it. The coat should button without strain and the sleeves should cover a shirt cuff.',
          'Single-breasted coats can be worn open; double-breasted coats look best buttoned, so they need a closer chest fit.',
        ],
      },
      {
        heading: 'Side-by-side: trench, overcoat, pea coat',
        body: [
          'Use this as a decision table, then open the live [men\'s coats](/collections/coats). A [cotton pea coat](/guides/how-to-choose-a-mens-pea-coat) is shorter and more casual. A trench is the rain piece. An overcoat is the long layer over a shirt or knit.',
        ],
        list: [
          'Trench: 100% cotton where ZED published it; storm flap and belt on classic cuts; not sold as waterproof.',
          'Overcoat: knee-ish length; our current ZED overcoats list 80% cotton / 20% polyester, so they are mid-weight, not heavy wool.',
          'Pea coat: hip length, double-breasted; two ZED styles list 60% wool / 40% polyester, the rest 80/20 cotton-poly.',
        ],
      },
      {
        heading: 'Climate, not the catalog photo',
        body: [
          'If your coldest regular month is wet and around 45–55°F, a cotton trench plus a sweater covers more days than an overcoat you only wear twice. If you walk to work in dry cold below freezing, the overcoat or a wool-rich pea coat is the better single buy.',
          'None of these coats is a ski layer. If you need a hood every day, look at the hooded parka in the same collection rather than forcing a trench to do that job.',
        ],
      },
      {
        heading: 'How to try the length at home',
        body: [
          'When the coat arrives, put on the thickest knit you will wear with it and button the front. The trench belt should sit near the natural waist. An overcoat hem should clear the knee or sit just on it — check the product photos and any length note rather than assuming.',
          'Return it unused if the length is wrong. The [return policy](/returns) is 30 days. Care for the cloth with the [wool and cotton-blend coat guide](/guides/how-to-care-for-a-wool-coat), which follows the dry-clean line ZED prints.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is a trench coat waterproof?',
        answer:
          'A cotton trench resists wind and light showers but is not waterproof. In steady rain it will eventually soak through. None of our trench coats are sold as waterproof.',
      },
      {
        question: 'Can I wear an overcoat with jeans?',
        answer: 'Yes. A dark single-breasted overcoat over a knit and dark jeans is a common smart-casual winter outfit.',
      },
    ],
    relatedProducts: ['zed-beige-twill-trench-coat', 'zed-black-trench-coat', 'zed-black-double-breasted-wool-over-coat', 'zed-navy-blue-over-coat'],
    productsHeading: 'Trench coats and overcoats',
    categories: ['coats'],
    relatedGuides: ['how-to-choose-a-mens-pea-coat', 'how-to-care-for-a-wool-coat'],
    image: '/images/products/zed-beige-twill-trench-coat-1-1024.webp',
    imageAlt: 'Beige Twill Trench Coat by ZED, front view',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'how-to-care-for-a-wool-coat',
    title: 'How to care for a wool or cotton-blend coat',
    description:
      'Brush, air, store, and spot-clean a wool or cotton-blend coat so it lasts for seasons, and learn when a dry-clean-only coat really needs a trip to the cleaner.',
    intro: 'A good coat should last several winters. Most of that comes from what you do between cleanings, not from how often you dry clean it.',
    sections: [
      {
        heading: 'After every wear',
        body: [
          'Hang the coat on a wide, shaped hanger so the shoulders keep their form. Thin wire hangers leave bumps in the shoulders.',
          'Let it air out overnight before you put it in a closed wardrobe. Moisture from rain or body heat needs to escape.',
        ],
      },
      {
        heading: 'Brush, do not wash',
        body: [
          'A soft clothes brush lifts dust and lint from wool and cotton blends. Brush downward, in the direction of the fabric, once a week in heavy use.',
          'For a small mark, dab with a cloth dampened in cool water. Do not rub; rubbing spreads the stain and can felt wool.',
        ],
      },
      {
        heading: 'When to dry clean',
        body: [
          'ZED lists its coats as dry clean. Once or twice a season is usually enough, or after a stain you cannot lift with water. Frequent dry cleaning wears fabric faster.',
          'Always follow the care label on the coat itself. If the label and this guide disagree, the label wins.',
        ],
      },
      {
        heading: 'End-of-season storage',
        list: [
          'Clean the coat before storing it. Moths and stains are drawn to soiled fabric.',
          'Store it in a breathable cotton garment bag, not plastic.',
          'Add cedar blocks or lavender sachets to deter moths in wool.',
        ],
        body: [],
      },
    ],
    relatedProducts: ['zed-black-wool-pea-coat', 'zed-brown-wool-over-coat', 'zed-wool-funnel-neck-coat'],
    productsHeading: 'Coats in this guide',
    categories: ['coats', 'jackets'],
    relatedGuides: ['how-to-choose-a-mens-pea-coat', 'trench-coat-vs-overcoat'],
    image: '/images/products/zed-brown-wool-over-coat-1-1024.webp',
    imageAlt: 'Brown Wool Over Coat by ZED, front view',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'mens-jacket-and-coat-size-guide',
    title: "Men's jacket, hoodie, and coat size guide",
    description:
      "How to choose between S, M, L, and XL for men's jackets, hoodies, and coats: measure a garment you own, read the listed fit, and use the model's height and size.",
    intro:
      'Letter sizes are not standard across brands. The most reliable way to choose is to compare with a jacket you already own and to read the fit notes on the product.',
    sections: [
      {
        heading: 'Measure a jacket that fits you',
        body: [
          'Lay a jacket you like flat and buttoned. Measure straight across the chest from armpit to armpit, then double it for the chest circumference. Measure the back length from the collar seam to the hem, and the sleeve from shoulder seam to cuff.',
          'Use those numbers when you compare styles. They are more useful than your usual letter size because they describe how you like a jacket to sit.',
        ],
      },
      {
        heading: 'Read the fit line',
        body: [
          'Our ZED outerwear lists a fit on every product. Regular fit leaves room through the body. Tailored fit is cut closer to the chest and waist with slimmer arms. Boxy fit, used on the cropped hoodies, is wider and shorter.',
          'If you are between sizes, go up in a tailored or slim style, and stay with your usual size in a regular or boxy style.',
        ],
      },
      {
        heading: 'Use the model as a reference',
        body: [
          'ZED notes the model’s height and size on most styles. Usually the model is 5′11″ and wears a medium. If you are a similar height and build and like the fit in the photos, a medium is a sensible starting point.',
        ],
      },
      {
        heading: 'Sizes we carry',
        body: [
          'Jackets, hoodies, and coats run S to XL, but not every style comes in every size. The size picker on each product shows the sizes for that style, and sold-out sizes are marked.',
          'These are letter sizes for clothing, not shoe sizes. Our shoe size chart does not apply to outerwear.',
        ],
      },
    ],
    faq: [
      {
        question: 'Should I size up for a coat?',
        answer:
          'Only if you plan to wear thick layers underneath or the style is listed as tailored and you are between sizes. Otherwise choose your usual size.',
      },
      {
        question: 'What size does the model wear?',
        answer: 'On most ZED styles the model is 5′11″ and wears a medium. The exact note appears in the fit details on each product page.',
      },
    ],
    relatedProducts: ['zed-black-nylon-bomber-jacket', 'zed-black-essential-hoodie', 'zed-black-pea-coat', 'zed-navy-blue-trucker-jacket'],
    productsHeading: 'Regular and tailored fits',
    categories: ['jackets', 'hoodies', 'coats'],
    relatedGuides: ['types-of-mens-jackets', 'how-to-choose-a-hoodie'],
    image: '/og/collection-jackets.jpg',
    imageAlt: 'Men’s jacket on a hanger',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'types-of-mens-jackets',
    title: "Types of men's jackets: bomber to trucker",
    description:
      "Bomber, Harrington, trucker, racer, field, and safari jackets compared: what sets each style apart, when to wear it, and which men's jackets we carry in each style.",
    intro: 'Most casual jackets come from a handful of classic shapes. Knowing them makes it easier to pick one that works with what you already wear.',
    sections: [
      {
        heading: 'Bomber jacket',
        body: [
          'Short, zip-front, with ribbed cuffs and hem that gather at the waist. It came from flight jackets. It is relaxed and easy to wear over a T-shirt or hoodie.',
          'Our ZED bombers come in nylon (polyamide) with a zip, or cotton blends with a snap (popper) front.',
        ],
      },
      {
        heading: 'Harrington jacket',
        body: ['A light, hip-length jacket with a short collar and a straight hem. It is neater than a bomber and works over a shirt. Our Harringtons have a funnel neck and a snap front.'],
      },
      {
        heading: 'Trucker and denim jacket',
        body: ['A button-front jacket with chest pockets, usually in denim. It is the most casual of the group and pairs with chinos rather than more denim. Our black and charcoal denim jackets list 100% cotton.'],
      },
      {
        heading: 'Racer and biker jacket',
        body: [
          'Racer jackets have a clean zip front and a short band collar. Biker jackets add an asymmetric zip or more hardware. Both are traditionally leather.',
          'Our racers are faux leather or cotton blends, and the fleece biker jackets list 80% cotton and 20% polyester.',
        ],
      },
      {
        heading: 'Field and safari jacket',
        body: ['Utility jackets with four front pockets. A field jacket is straight and practical; a safari jacket adds a belt at the waist. Both work as a light layer in spring and fall.'],
      },
    ],
    relatedProducts: ['zed-black-nylon-bomber-jacket', 'zed-stone-harrington-jacket-with-funnel-neck', 'zed-black-denim-jacket', 'zed-black-faux-leather-racer-jacket', 'zed-khaki-green-field-jacket'],
    productsHeading: 'One of each style',
    categories: ['jackets'],
    relatedGuides: ['mens-jacket-and-coat-size-guide', 'how-to-choose-a-hoodie'],
    image: '/og/collection-jackets.jpg',
    imageAlt: 'Men’s jacket on a hanger',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'how-to-choose-a-hoodie',
    title: 'Essential, henley, cropped, or long-line hoodie?',
    description:
      "Compare four men's hoodie cuts, essential pullover, button henley, cropped boxy, and long-line, and learn which one suits your build and how you plan to layer it.",
    intro: 'A hoodie looks simple, but the cut changes everything: how it layers under a jacket, how it sits at the waist, and how dressed-up it can look.',
    sections: [
      {
        heading: 'Essential pullover',
        body: ['The classic pullover hoodie at hip length. Our ZED essential hoodies list a regular fit and 80% cotton, 20% polyester. It layers easily under a bomber or a trucker jacket.'],
      },
      {
        heading: 'Button henley hoodie',
        body: ['A pullover with a short button placket at the neck, so it looks a little sharper than a plain hoodie. Ours are cut in a tailored fit, closer to the chest and waist with slimmer arms.'],
      },
      {
        heading: 'Cropped, pronounced-shoulder hoodie',
        body: ['A shorter, boxy hoodie with dropped shoulders. It sits at or just above the waist and pairs best with straight or relaxed trousers. Choose your usual size; the boxy shape is designed in.'],
      },
      {
        heading: 'Long-line hoodie',
        body: ['Longer than an essential hoodie, falling below the hip. It suits taller builds and slim trousers, and looks best on its own rather than under a short jacket.'],
      },
      {
        heading: 'Care for cotton-blend hoodies',
        body: ['Turn the hoodie inside out, wash cold, and dry flat or on low heat to limit shrinking and pilling. Always follow the label on the garment.'],
      },
    ],
    faq: [
      {
        question: 'Which hoodie fits under a jacket?',
        answer: 'An essential pullover in a regular fit layers best under a bomber, trucker, or field jacket. Long-line hoodies can show below a short jacket.',
      },
    ],
    relatedProducts: ['zed-black-essential-hoodie', 'zed-navy-blue-button-down-pullover-henley-hood', 'zed-charcoal-cropped-pronounced-shoulder-hoodi', 'zed-white-long-line-hoodie'],
    productsHeading: 'One hoodie in each cut',
    categories: ['hoodies'],
    relatedGuides: ['mens-jacket-and-coat-size-guide', 'types-of-mens-jackets'],
    image: '/images/products/zed-black-essential-hoodie-1-1024.webp',
    imageAlt: 'Black Essential Hoodie by ZED, front view',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'how-to-care-for-a-wallet',
    title: 'How to care for a leather or synthetic wallet',
    description:
      'Keep a wallet in shape for years: avoid overfilling, wipe and condition leather, clean synthetic finishes, and store it properly. Plus how to tell what yours is made of.',
    intro: 'Wallets get handled more than almost anything else you own. A few habits keep the edges neat and the folds from cracking.',
    sections: [
      {
        heading: 'Know the material first',
        body: [
          'Some of our Metro wallets list leather, such as the 21-6904 bifolds. Many others do not publish a material. If the product does not say leather, treat it as a synthetic or coated finish and clean it gently.',
        ],
      },
      {
        heading: 'Do not overfill it',
        body: [
          'Overfilling is the main reason wallets lose shape. Carry the cards you use daily and keep the rest at home.',
          'Avoid sitting on a wallet in a back pocket. It bends the wallet and is not great for your back either.',
        ],
      },
      {
        heading: 'Cleaning',
        list: [
          'Leather: wipe with a dry or barely damp cloth, then apply a small amount of leather conditioner a few times a year.',
          'Synthetic or coated: wipe with a damp cloth and a drop of mild soap, then dry immediately.',
          'Never soak a wallet or use solvents, which can strip color and finish.',
        ],
        body: [],
      },
      {
        heading: 'Money clips and card holders',
        body: ['A money clip, like the Metro 21-8250, holds a few folded bills and cards with almost no bulk. Do not overload the clip, or it will lose its spring.'],
      },
    ],
    relatedProducts: ['metro-21-6904-12-10', 'metro-21-7017-23-10', 'metro-21-8250-44-10', 'metro-21-75-11-10'],
    productsHeading: 'Wallets and clips in this guide',
    categories: ['wallets'],
    relatedGuides: ['what-fits-in-a-crossbody-bag', 'holiday-gift-guide-for-him'],
    image: '/og/collection-wallets.jpg',
    imageAlt: 'Leather wallet on a table',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'how-to-clean-gold-plated-jewelry',
    title: 'How to clean gold-plated and silver jewelry',
    description:
      'Gentle ways to clean and store 925 sterling silver, gold-plated, and kundan jewelry, how long plating lasts, and the everyday habits that make plating wear faster.',
    intro: 'Gold plating is a thin layer of gold over another metal. Treated gently, it keeps its shine much longer. Treated like solid gold, it wears through.',
    sections: [
      {
        heading: 'Know what you have',
        body: [
          '925 sterling silver is 92.5% silver. It can tarnish but it does not wear away. Gold-plated or gold-coated pieces have a thin gold layer that can fade with friction, sweat, and chemicals.',
          'Meerzah lists the material and finish on each piece. For its 925 silver rings with 18K plating, the warranty covers the silver for the life of the piece and the plating for 3 months.',
        ],
      },
      {
        heading: 'Cleaning',
        list: [
          'Wipe with a soft, dry microfiber cloth after wearing.',
          'For grime, dip briefly in lukewarm water with a drop of mild soap, then rinse and pat completely dry.',
          'Do not use silver dip, toothpaste, or abrasive polishing cloths on plated pieces. They remove plating.',
          'Kundan and stone-set pieces: clean only with a dry cloth. Water can loosen settings and dull foil backing.',
        ],
        body: [],
      },
      {
        heading: 'Habits that protect plating',
        list: [
          'Put jewelry on last, after perfume, lotion, and hairspray.',
          'Take it off for swimming, the gym, showering, and cleaning.',
          'Store each piece separately in a soft pouch or lined box so pieces do not scratch each other.',
        ],
        body: [],
      },
      {
        heading: 'Kundan, zircon, and plated jewelry are not the same job',
        body: [
          'Kundan and stone-set necklace sets are for events. They have foil behind stones and do not like water. Gold-plated hoops and jhumkas are everyday pieces that still hate perfume and the gym. 925 silver rings can be worn more often; they tarnish and polish back.',
          'Shop [kundan necklace sets](/collections/womens-jewelry) and open a product for weight and finish. Pair a set with a [shoulder or crossbody bag](/collections/handbags) if you need a complete gift, and keep the care card with the box.',
        ],
        list: [
          '925 silver: tarnish is normal; a silver cloth is fine on unplated silver.',
          '18K gold plated over silver: wipe dry; no dip, no toothpaste.',
          'Kundan / foil-backed stones: dry cloth only.',
        ],
      },
      {
        heading: 'A weekly and a seasonal routine',
        body: [
          'Weekly: wipe what you wore, check clasps, and put each piece back in its pouch. Seasonal: look at plated rings and bracelets for a bright base metal showing through. That is wear, not dirt. You cannot plate it back at home.',
          'If you are gifting, include this care note. A [holiday gift guide for her](/guides/holiday-gift-guide-for-her) is the shorter list; this page is the care manual that should travel with the box.',
        ],
      },
      {
        heading: 'What we will not claim',
        body: [
          'We do not claim plating lasts a lifetime. Meerzah\'s own warranty language on plated 925 rings covers the silver for the life of the piece and the plating for three months. We repeat that, we do not stretch it.',
          'We do not sell solid gold kundan. If a listing says gold plated, it is plated. Read the specification table on the product page before you compare our price with a solid-gold jeweler.',
        ],
      },
    ],
    faq: [
      {
        question: 'How long does gold plating last?',
        answer:
          'It depends on how often the piece is worn and how much friction it gets. Rings and bracelets wear faster than earrings. Gentle care and dry storage make plating last much longer.',
      },
      {
        question: 'Can I shower with gold-plated jewelry?',
        answer: 'It is best not to. Soap, hot water, and chlorine speed up wear on plating. Remove plated pieces before showering or swimming.',
      },
    ],
    relatedProducts: ['mz-solid-925-chandi-2-3-grams-18k-gold-plated', 'mz-24k-gold-plated-farshi-kundan-necklace-set', 'mz-elegant-design-zircon-stone-gold-plated-ban', 'mz-viral-tulip-necklace'],
    productsHeading: 'Silver, plated, and kundan pieces',
    categories: ['womens-jewelry'],
    relatedGuides: ['holiday-gift-guide-for-her'],
    image: '/og/collection-jewelry.jpg',
    imageAlt: 'Gold jewelry on a neutral background',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'analog-vs-digital-watches',
    title: 'Analog vs digital watches: which to choose',
    description:
      'Analog or digital watch? Compare readability, features, battery life, and style, with real examples from Casio, Daniel Klein, and Fossil to help you choose a watch.',
    intro: 'The choice is less about technology than about how you use a watch. Both types here run on quartz, so both are accurate. The difference is how they show the time and what else they do.',
    sections: [
      {
        heading: 'Analog: hands on a dial',
        body: [
          'An analog watch shows time with hands. It is quicker to read at a glance for most people and pairs well with a shirt or a suit.',
          'Our Daniel Klein watches are analog quartz models with brass cases, Hardlex crystal, and either stainless steel bracelets or leather straps, with 30 or 50 meters of water resistance listed.',
        ],
      },
      {
        heading: 'Digital: numbers on a display',
        body: [
          'A digital watch shows the time as numbers and usually adds a stopwatch, alarm, backlight, and calendar. It is practical for training and travel.',
          'The Casio AE-1000W models list a 41 mm plastic case and 100 meters of water resistance, which makes them good everyday sport watches. The Fossil Retro Digital models put a digital display in a square stainless steel case for a dressier look.',
        ],
      },
      {
        heading: 'Which suits you',
        list: [
          'Office and evenings: an analog watch on a metal bracelet or leather strap.',
          'Gym, running, and outdoor days: a digital watch with a rubber strap and a high water-resistance rating.',
          'One watch for everything: an analog on a steel bracelet with at least 50 m water resistance.',
        ],
        body: [],
      },
      {
        heading: 'What water resistance means',
        body: ['30 m means splash resistant only, so keep it out of the shower. 50 m handles hand washing and rain. 100 m suits swimming. Only trust the rating listed for that specific model.'],
      },
    ],
    faq: [
      {
        question: 'Is a quartz watch accurate?',
        answer: 'Yes. Quartz movements are battery powered and typically accurate to within seconds per month, which is more accurate than most mechanical watches.',
      },
    ],
    relatedProducts: ['casio-mens-ae-1000w-1avcf-resin-sport-watc', 'fossil-fs-5843-retro-digital', 'daniel-klein-dk13738-1', 'daniel-klein-dk12330-4'],
    productsHeading: 'Analog and digital watches',
    categories: ['watches'],
    relatedGuides: ['watch-case-size-and-strap-fit', 'holiday-gift-guide-for-him'],
    image: '/og/collection-watches.jpg',
    imageAlt: 'Watch worn on a wrist',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'handbag-styles-explained',
    title: 'Hobo, shoulder, crossbody: handbag styles',
    description:
      'Hobo, shoulder, crossbody, and top-handle handbags explained: how each one carries, what it holds, and which handbag style suits work, errands, and evenings out.',
    intro: 'The same outfit looks different with a different bag. The shape decides how you carry it, how much fits, and how hands-free you are.',
    sections: [
      {
        heading: 'Hobo bag',
        body: ['A slouchy, crescent-shaped bag that sits under the arm. Soft and roomy, it suits casual days. The Bag X Monaco is a suede hobo with a drawstring closure and gold-tone hardware.'],
      },
      {
        heading: 'Shoulder bag',
        body: ['Carried on a single strap at the shoulder, usually structured with a flap. It is the most versatile day bag. Bag X shoulder styles list sizes from about 9 to 12 in wide.'],
      },
      {
        heading: 'Crossbody bag',
        body: ['A smaller bag on a long strap worn across the body, so both hands stay free. Good for travel, errands, and busy streets. The Bag X Nyra is a leather crossbody.'],
      },
      {
        heading: 'Top-handle handbag',
        body: ['Carried in the hand or the crook of the arm. It looks polished for work and evenings. Several Bag X top-handle bags list 11 to 14 in wide, which fits a tablet or a small notebook.'],
      },
      {
        heading: 'Choosing one bag',
        list: [
          'Hands-free and secure: crossbody.',
          'Work, with a tablet and a few documents: top-handle or a larger shoulder bag.',
          'Weekends and casual outfits: hobo.',
        ],
        body: [],
      },
    ],
    relatedProducts: ['bagx-monaco-choco', 'bagx-leo-maroon', 'bagx-nyra-beige', 'bagx-mulan-black'],
    productsHeading: 'One bag in each style',
    categories: ['handbags'],
    relatedGuides: ['what-fits-in-a-crossbody-bag', 'holiday-gift-guide-for-her'],
    image: '/og/collection-handbags.jpg',
    imageAlt: 'Burgundy structured handbag',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'holiday-gift-guide-for-him',
    title: 'Holiday gift guide for him',
    description:
      "Holiday gift ideas for him from our catalog: men's watches, wallets, hoodies, jackets, and sneakers, grouped by budget, with no-guess sizing tips for every pick.",
    intro:
      'The easiest gifts are the ones that need no size: a watch or a wallet. If you know his size, outerwear and sneakers are the more personal choice. Every price below is the current shop price.',
    sections: [
      {
        heading: 'No size needed',
        body: [
          'Wallets and watches are the safest gifts because they fit everyone. A Metro bifold or money clip is a practical everyday upgrade. A Casio AE-1000W digital watch, with its listed 100 m water resistance, suits someone active. A Daniel Klein on a leather strap suits someone who dresses up.',
        ],
      },
      {
        heading: 'If you know his size',
        body: [
          'A hoodie is the lowest-risk clothing gift. The ZED essential hoodies have a regular fit, so his usual letter size is a safe pick. Jackets and coats are bigger gifts; check the fit line on each product, since tailored styles run closer.',
          'For sneakers, ask what US size he wears in a sneaker he already likes. Our sneakers are standard width.',
        ],
      },
      {
        heading: 'Gifting tips',
        list: [
          'Order early. Standard US shipping takes 3–7 business days after one day of processing.',
          'Unworn items in original condition can be returned within 30 days, which covers most gift exchanges.',
          'Check the product page for stock before the holidays. Sold-out sizes are marked.',
        ],
        body: [],
      },
    ],
    relatedProducts: [
      'casio-mens-ae-1000w-1avcf-resin-sport-watc',
      'daniel-klein-dk13666-5',
      'metro-21-6904-11-10',
      'metro-21-8250-45-10',
      'zed-navy-blue-essential-hoodie',
      'zed-burgundy-nylon-bomber-jacket',
      'zed-navy-blue-wool-pea-coat',
      'ndure-kay-0003-black',
    ],
    productsHeading: 'Gift ideas for him',
    categories: ['watches', 'wallets', 'hoodies', 'jackets'],
    relatedGuides: ['fathers-day-gift-guide', 'holiday-gift-guide-for-her', 'analog-vs-digital-watches'],
    image: '/og/collection-watches.jpg',
    imageAlt: 'Watch worn on a wrist',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'holiday-gift-guide-for-her',
    title: 'Holiday gift guide for her',
    description:
      "Holiday gift ideas for her from our catalog: women's handbags, 925 silver and gold-plated jewelry, and necklace sets, with honest notes on materials and ring sizes.",
    intro: 'Handbags and jewelry make thoughtful gifts because they are personal and mostly size-free. Here is how to choose well, using pieces we actually stock.',
    sections: [
      {
        heading: 'Handbags',
        body: [
          'A crossbody is the most practical gift for someone always on the move. A shoulder or top-handle bag suits work. If you are unsure of her style, a black or chocolate bag goes with almost everything.',
          'Bag X lists the material and closure on every bag. Look for leather or suede if she prefers natural materials.',
        ],
      },
      {
        heading: 'Jewelry',
        body: [
          'Necklaces, earrings, and bracelets need no size, so they are the safest jewelry gifts. Rings need a size, and Meerzah lists ring sizes 16 to 19 for its 925 silver rings. If you do not know her size, choose a necklace or earrings instead.',
          'Kundan and zircon necklace sets make a statement for weddings and festive events. The tulip pendant and bracelets are lighter, everyday pieces.',
        ],
      },
      {
        heading: 'Gifting tips',
        list: [
          'Gold-plated jewelry lasts longer with gentle care. Our jewelry care guide is worth sharing with the gift.',
          'Standard US shipping takes 3–7 business days after processing.',
          'Items in original condition can be returned within 30 days.',
        ],
        body: [],
      },
    ],
    relatedProducts: [
      'bagx-nyra-pink',
      'bagx-monaco-black',
      'bagx-evline-brown-black',
      'mz-24k-gold-plated-farshi-kundan-necklace-set',
      'mz-tiny-tulip-pendant',
      'mz-elegant-silver-plated-tulip-bracelet',
      'mz-solid-925-chandi-2-2-grams-18k-silver-plate',
    ],
    productsHeading: 'Gift ideas for her',
    categories: ['handbags', 'womens-jewelry'],
    relatedGuides: ['how-to-clean-gold-plated-jewelry', 'handbag-styles-explained', 'holiday-gift-guide-for-him'],
    image: '/og/collection-jewelry.jpg',
    imageAlt: 'Gold jewelry on a neutral background',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
  {
    slug: 'fathers-day-gift-guide',
    title: "Father's Day and birthday gifts for dad",
    description:
      "Father's Day and birthday gift ideas for dad from our catalog: classic analog watches, leather bifold wallets, overcoats, and easy slip-on sneakers, by budget.",
    intro: 'Gifts for dad work best when they replace something he uses every day. A watch, a wallet, or a coat he will wear for years beats a novelty.',
    sections: [
      {
        heading: 'A classic watch',
        body: [
          'An analog watch on a steel bracelet is a gift he can wear to work and on weekends. The Casio MTP-1215A and Daniel Klein DK12106 are both analog quartz models; the Daniel Klein lists a 39 mm case, a size that suits most wrists.',
        ],
      },
      {
        heading: 'A wallet that lasts',
        body: ['The Metro 21-6904 bifold lists a leather upper and comes in black, brown, and tan. If his current wallet is bursting, a money clip is a slimmer alternative.'],
      },
      {
        heading: 'Comfort and outerwear',
        body: [
          'Slip-on sneakers are easy to wear for errands and travel. Ask for his US shoe size first.',
          'An overcoat or pea coat is a bigger gift for fall and winter birthdays. For Father’s Day in June, a cotton trench or a light Harrington jacket is the better season match.',
        ],
      },
    ],
    relatedProducts: ['casio-mtp-1215a-2avdf-watch', 'daniel-klein-dk12106-4', 'metro-21-6904-12-10', 'ndure-leo-0024-black', 'zed-navy-blue-harrington-jacket-with-funnel-ne', 'zed-black-wool-over-coat'],
    productsHeading: 'Gifts for dad',
    categories: ['watches', 'wallets', 'everyday', 'coats'],
    relatedGuides: ['holiday-gift-guide-for-him', 'watch-case-size-and-strap-fit'],
    image: '/og/collection-wallets.jpg',
    imageAlt: 'Leather wallet on a table',
    published: '2026-10-01',
    updated: '2026-10-01',
  },
]

function presentGuide(guide: Guide): Guide {
  return {
    ...guide,
    title: publicText(guide.title),
    description: publicText(guide.description),
    intro: publicText(guide.intro),
    imageAlt: publicText(guide.imageAlt),
    productsHeading: guide.productsHeading ? publicText(guide.productsHeading) : undefined,
    sections: guide.sections.map((section) => ({
      ...section,
      heading: publicText(section.heading),
      body: section.body.map(publicText),
      list: section.list?.map(publicText),
    })),
    faq: guide.faq?.map((item) => ({ question: publicText(item.question), answer: publicText(item.answer) })),
  }
}

export const guides: Guide[] = guideSource.map(presentGuide)

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
