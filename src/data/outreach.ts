/**
 * Earned-media targets for manual, one-to-one outreach. No paid links, link exchanges, or automated pitching.
 * Every pitch must stay truthful: we are a retailer, products are made by the named brands, and only facts on
 * the product pages may be quoted. Check each outlet's current submission guidelines before contacting it.
 */
export type OutreachType =
  | 'menswear-blog'
  | 'gift-guide'
  | 'running-community'
  | 'womens-style'
  | 'watch-publication'
  | 'craft-story'
  | 'journalist-requests'
  | 'youtube-review'
  | 'local-listing'
  | 'forum'
  | 'pakistani-press'

export interface OutreachTarget {
  name: string
  url: string
  type: OutreachType
  /** The page on our site worth pitching to this outlet. */
  asset: string
  angle: string
  /** How to reach them. Check current guidelines before sending. */
  contact?: string
}

export const outreachTargets: OutreachTarget[] = [
  { name: 'Put This On', url: 'https://putthison.com', type: 'menswear-blog', asset: '/guides/how-to-choose-a-mens-pea-coat', angle: 'How to read a coat fabric line before you buy.' },
  { name: 'Primer', url: 'https://www.primermagazine.com', type: 'menswear-blog', asset: '/guides/types-of-mens-jackets', angle: 'Plain-English guide to classic casual jacket shapes.' },
  { name: 'The Modest Man', url: 'https://www.themodestman.com', type: 'menswear-blog', asset: '/guides/mens-jacket-and-coat-size-guide', angle: 'Choosing letter sizes by measuring a jacket you own.' },
  { name: 'He Spoke Style', url: 'https://hespokestyle.com', type: 'menswear-blog', asset: '/guides/trench-coat-vs-overcoat', angle: 'Trench or overcoat, chosen by your coldest regular month.' },
  { name: 'Effortless Gent', url: 'https://effortlessgent.com', type: 'menswear-blog', asset: '/guides/how-to-care-for-a-wool-coat', angle: 'Coat care between dry cleanings.' },
  { name: 'Dappered', url: 'https://dappered.com', type: 'menswear-blog', asset: '/collections/coats', angle: 'Budget pea coats and trenches with the fabric blend stated up front.' },
  { name: 'Gear Patrol', url: 'https://www.gearpatrol.com', type: 'menswear-blog', asset: '/guides/analog-vs-digital-watches', angle: 'Everyday quartz watches compared on published specs.' },
  { name: 'Valet.', url: 'https://www.valetmag.com', type: 'menswear-blog', asset: '/guides/how-to-care-for-a-wallet', angle: 'Making an everyday wallet last.' },
  { name: 'GQ gift guides', url: 'https://www.gq.com', type: 'gift-guide', asset: '/guides/holiday-gift-guide-for-him', angle: 'Size-free gifts for him with exact specs and prices.' },
  { name: 'Esquire gift guides', url: 'https://www.esquire.com', type: 'gift-guide', asset: '/guides/fathers-day-gift-guide', angle: 'Watch and wallet gifts for dad.' },
  { name: "Men's Health", url: 'https://www.menshealth.com', type: 'gift-guide', asset: '/guides/holiday-gift-guide-for-him', angle: 'Practical gifts: digital sport watches with listed water resistance.' },
  { name: 'New York Magazine, The Strategist', url: 'https://nymag.com/strategist', type: 'gift-guide', asset: '/guides/holiday-gift-guide-for-her', angle: 'Gold-plated jewelry gifts with an honest care note.' },
  { name: 'Business Insider Reviews', url: 'https://www.businessinsider.com/guides', type: 'gift-guide', asset: '/guides/holiday-gift-guide-for-him', angle: 'Gifts under 100 dollars that need no size.' },
  { name: 'BuzzFeed Shopping', url: 'https://www.buzzfeed.com/shopping', type: 'gift-guide', asset: '/guides/holiday-gift-guide-for-her', angle: 'Handbag and jewelry gift picks with materials listed.' },
  { name: 'Real Simple', url: 'https://www.realsimple.com', type: 'womens-style', asset: '/guides/how-to-clean-gold-plated-jewelry', angle: 'Make gold plating last: simple care habits.' },
  { name: 'Who What Wear', url: 'https://www.whowhatwear.com', type: 'womens-style', asset: '/guides/handbag-styles-explained', angle: 'Hobo, shoulder, crossbody, and top-handle bags explained.' },
  { name: 'Refinery29', url: 'https://www.refinery29.com', type: 'womens-style', asset: '/collections/womens-jewelry', angle: 'Kundan and zircon necklace sets for weddings and festive events, with weight and finish listed.' },
  { name: 'InStyle', url: 'https://www.instyle.com', type: 'womens-style', asset: '/guides/what-fits-in-a-crossbody-bag', angle: 'What really fits in a small crossbody bag.' },
  { name: 'Byrdie', url: 'https://www.byrdie.com', type: 'womens-style', asset: '/guides/how-to-clean-gold-plated-jewelry', angle: 'Why perfume and showers wear out plated jewelry.' },
  { name: "Runner's World", url: 'https://www.runnersworld.com', type: 'running-community', asset: '/guides/how-to-choose-running-shoes', angle: 'When a casual mesh sneaker is enough and when you need a specialist running shoe.' },
  { name: "Women's Running", url: 'https://www.womensrunning.com', type: 'running-community', asset: '/guides/how-to-measure-your-feet', angle: 'Measure your feet at home before ordering shoes online.' },
  { name: 'Trail Runner Magazine', url: 'https://www.trailrunnermag.com', type: 'running-community', asset: '/guides/how-to-choose-running-shoes', angle: 'Road vs trail shoe basics for new runners.' },
  { name: 'iRunFar', url: 'https://www.irunfar.com', type: 'running-community', asset: '/guides/how-to-choose-running-shoes', angle: 'Beginner explainer on drop, cushioning, and lugs.' },
  { name: 'Local run clubs on Strava (US)', url: 'https://www.strava.com/clubs', type: 'running-community', asset: '/fit-guide', angle: 'Free shoe size chart and measuring guide for club newsletters.' },
  { name: 'Worn & Wound', url: 'https://wornandwound.com', type: 'watch-publication', asset: '/guides/watch-case-size-and-strap-fit', angle: 'Case size and wrist fit, with examples from 35 to 45 mm.' },
  { name: 'Hodinkee', url: 'https://www.hodinkee.com', type: 'watch-publication', asset: '/guides/analog-vs-digital-watches', angle: 'Everyday quartz, analog or digital, explained simply.' },
  { name: 'Dawn Images (Pakistan fashion coverage)', url: 'https://images.dawn.com', type: 'craft-story', asset: '/press', angle: 'Pakistani fashion brands reaching US shoppers through a small retailer.' },
  { name: 'The Juggernaut (South Asian diaspora stories)', url: 'https://www.thejuggernaut.com', type: 'craft-story', asset: '/press', angle: 'South Asian brands and diaspora shoppers in the US.' },
  { name: 'Help a B2B Writer / journalist request services (formerly HARO)', url: 'https://helpab2bwriter.com', type: 'journalist-requests', asset: '/press', angle: 'Answer only requests where we have verifiable facts: sizing, fabric labels, gift ideas.' },
  { name: 'Qwoted', url: 'https://www.qwoted.com', type: 'journalist-requests', asset: '/press', angle: 'Expert quotes on reading clothing care and fabric labels.' },
  { name: 'Featured.com', url: 'https://featured.com', type: 'journalist-requests', asset: '/press', angle: 'Short expert answers on gift buying and sizing online.', contact: 'Join Featured and answer only on-brief requests' },
  { name: 'Teddy Baldassarre', url: 'https://teddybaldassarre.com', type: 'youtube-review', asset: '/collections/watches', angle: 'Affordable Casio quartz we stock, with published model numbers. Sample offered, must be disclosed.', contact: 'YouTube / site contact' },
  { name: 'Watchfinder & Co. editorial (US readers)', url: 'https://www.watchfinder.com/articles', type: 'watch-publication', asset: '/guides/watch-case-size-and-strap-fit', angle: 'Case size primer using only published diameters.', contact: 'Editorial pitch form' },
  { name: 'The Slanted Wrist', url: 'https://theslantedwrist.com', type: 'watch-publication', asset: '/collections/watches', angle: 'Naviforce quartz models with listed water resistance.', contact: 'Blog contact' },
  { name: 'Just One More Watch (YouTube)', url: 'https://www.youtube.com', type: 'youtube-review', asset: '/collections/watches', angle: 'Under-$200 quartz roundup. Sample offered, disclosed.', contact: 'YouTube about email' },
  { name: 'Urban Gents', url: 'https://www.urbangents.com', type: 'menswear-blog', asset: '/guides/types-of-mens-jackets', angle: 'Bomber vs shacket vs trucker, using ZED examples.', contact: 'Site contact' },
  { name: 'Gentleman\'s Gazette (reader Qs)', url: 'https://www.gentlemansgazette.com', type: 'menswear-blog', asset: '/guides/how-to-choose-a-mens-pea-coat', angle: 'How to read a pea-coat fabric line.', contact: 'Editorial email on site' },
  { name: 'The Modest Man YouTube', url: 'https://www.youtube.com/@themodestman', type: 'youtube-review', asset: '/collections/coats', angle: 'Cotton-blend vs wool-rich pea coats. Sample offered, disclosed.', contact: 'YouTube about' },
  { name: 'Fashionista gift guides', url: 'https://fashionista.com', type: 'gift-guide', asset: '/guides/holiday-gift-guide-for-her', angle: 'Kundan and plated jewelry gifts with honest care notes.', contact: 'Tips@ / editorial' },
  { name: 'The Cut gift guides', url: 'https://www.thecut.com', type: 'gift-guide', asset: '/guides/holiday-gift-guide-for-her', angle: 'Handbags and jewelry under a set budget.', contact: 'Editorial pitch' },
  { name: 'Wirecutter extras / gift ideas', url: 'https://www.nytimes.com/wirecutter', type: 'gift-guide', asset: '/tools/shoe-size-converter', angle: 'A free US-UK-EU-cm converter as a useful tool mention, not a product push.', contact: 'Wirecutter contact' },
  { name: 'Helo / Help a Reporter (if still used)', url: 'https://www.helpareporter.com', type: 'journalist-requests', asset: '/press', angle: 'Same rule: answer only when we have a catalog fact.', contact: 'Query desk' },
  { name: 'Something Haute (Pakistan fashion)', url: 'https://www.somethinghaute.com', type: 'pakistani-press', asset: '/press', angle: 'Pakistani labels (ZED, Bag X, Meerzah, Ndure) sold to US shoppers.', contact: 'Editorial email' },
  { name: 'Images.dawn.com style desk follow-up', url: 'https://images.dawn.com', type: 'pakistani-press', asset: '/collections/coats', angle: 'ZED coats with fabric blends stated for a US reader.', contact: 'Images desk' },
  { name: 'Tribune Lifestyle (Pakistan)', url: 'https://tribune.com.pk', type: 'pakistani-press', asset: '/press', angle: 'US-facing retailer carrying Pakistani fashion brands.', contact: 'lifestyle@' },
  { name: 'Google Business Profile', url: 'https://www.google.com/business/', type: 'local-listing', asset: '/contact', angle: 'Create the GBP for the legal entity once an address exists.', contact: 'GBP dashboard' },
  { name: 'Bing Places / Webmaster', url: 'https://www.bing.com/webmasters', type: 'local-listing', asset: '/press', angle: 'Submit https://westorastyle.com/sitemap.xml after Bing verification.', contact: 'Bing Webmaster Tools' },
  { name: 'Apple Business Connect', url: 'https://businessconnect.apple.com', type: 'local-listing', asset: '/contact', angle: 'Optional listing if a pickup or office address exists.', contact: 'Business Connect' },
  { name: 'r/Watches (US buyers, disclosed retailer)', url: 'https://www.reddit.com/r/Watches', type: 'forum', asset: '/guides/watch-case-size-and-strap-fit', angle: 'Answer size questions with the guide. Disclose affiliation. No link spam.', contact: 'Subreddit rules first' },
  { name: 'r/malefashionadvice', url: 'https://www.reddit.com/r/malefashionadvice', type: 'forum', asset: '/guides/types-of-mens-jackets', angle: 'Helpful jacket-type answers only, disclosed if asked.', contact: 'Subreddit rules first' },
  { name: 'Watchuseek quartz forum', url: 'https://www.watchuseek.com', type: 'forum', asset: '/collections/watches', angle: 'Model-number answers from published specs only.', contact: 'Forum PM after contributing' },
]
