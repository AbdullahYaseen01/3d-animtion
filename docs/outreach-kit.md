# Outreach kit (US backlinks)

Ready-to-send material for the links that need a human account or inbox. Everything on-site that earns links is already built: the size converter and fit guide carry a copyable credit line, every guide has an Article + FAQ page with a "Reuse this guide" block, `/press` is the fact sheet, and `npm run seo:indexnow` pushes new URLs to Bing/Yandex/DuckDuckGo the moment they deploy.

Rules: no paid placements, no link exchanges, no PBNs, no mass mailing. One email per outlet, written to a named person, quoting only facts that appear on our product pages. Disclose any sample sent.

## 1. Accounts to open this week (15 minutes each)

| Where | Why it matters | Exact step |
| --- | --- | --- |
| Google Search Console | Impressions, queries, indexing errors | Add property `westorastyle.com` (Domain) via DNS TXT at the registrar, or HTML-tag: set `VITE_GSC_VERIFICATION=<token only>` in Vercel env, redeploy. Then submit `https://westorastyle.com/sitemap.xml`. |
| Bing Webmaster Tools | Bing + DuckDuckGo + Yahoo; imports GSC in one click | Sign in → "Import from Google Search Console". IndexNow key `36b54e162a7cd6c4dc50535704236629` is already hosted; Bing shows submissions under IndexNow. |
| Google Merchant Center (free listings) | Product grid in Google Shopping tab, no spend | Create account → "Add products" → "Add products from your website". Our ProductGroup/Offer schema already carries price, availability, shipping, SKU, color, size. Verify the site with the same GSC token. |
| Instagram, Pinterest, TikTok, YouTube, Facebook page | Brand-name SERP, `sameAs` in Organization schema | Handle `westorastyle` everywhere. Then add each profile to `store.social` in `src/config/store.ts`; the `sameAs` array fills in automatically. |
| Pinterest Verified Merchant | Free product pins with price, every guide image is pinnable | Claim site (HTML tag or DNS), connect the Merchant Center feed. |

## 2. Supplier stockist links (highest-probability links; send first)

Each brand we carry can list us as a US stockist or "where to buy". These are editorial, relevant, and permanent. Send from `hello@westorastyle.com`.

Brands: **ZED** (outerwear), **Ndure** (sneakers), **Bag X** (handbags), **Meerzah** (jewelry), **Metro** (wallets). Find each brand's official site → Contact / Wholesale / Stockists page.

> Subject: Westora Style now stocking [Brand] for US customers
>
> Hi [Name],
>
> We're Westora Style (westorastyle.com), a US-facing online store. We currently carry [N] [Brand] styles, including [product name 1] and [product name 2], at full price with free US shipping.
>
> Could you add us to your stockists / where-to-buy page as the US online retailer? Our collection page is https://westorastyle.com/collections/[slug]. [Watch brands only: and a short brand page is https://westorastyle.com/brands/[brand-slug].]
>
> Happy to send our logo, product photography, or a brand mention on our side in return. Thank you,
> [Your name], Westora Style

## 3. Free-tool link pitches (size converter and chart)

Asset: https://westorastyle.com/tools/shoe-size-converter and https://westorastyle.com/fit-guide. These are the pages other sites link to without being asked to sell anything.

Send to: running-club newsletters on Strava (US), school and college athletics departments buying team shoes, podiatry and physiotherapy practice blogs, ESL and immigrant-resource sites (shoe size conversion is a top question), sewing/cosplay communities, and any blog with an outdated or image-only size chart.

> Subject: A free US/UK/EU/cm shoe size converter your readers can use
>
> Hi [Name],
>
> I read your piece on [article] and noticed the size chart is [an image / UK-only / missing cm]. We maintain a free converter that handles US men's, US women's, UK, EU and foot length in cm, with a measuring method underneath: https://westorastyle.com/tools/shoe-size-converter
>
> No sign-up, no ads, and the chart can be reproduced with a credit line. If it's useful, a link from that article would help other readers find it.
>
> Thanks for your time,
> [Your name], Westora Style

### 3b. Embed pitch (the converter as a widget)

`/tools/shoe-size-converter` now has an "Embed this converter" block. The copied snippet is an iframe of `/embed/shoe-size-converter` (header-less, noindex) plus a credit line in the host page's own HTML: `Tool: <a href="https://westorastyle.com/tools/shoe-size-converter">Shoe size converter: US, UK, EU and cm</a> by Westora Style`. A site that embeds it publishes a normal link to the tool page. Offer this to anyone who would rather host the tool than send readers away: school athletics pages, run-club sites, ESL resource pages, sewing and cosplay wikis.

> Subject: Free shoe size converter you can embed (no sign-up, no ads)
>
> Hi [Name],
>
> Your [page] helps people [buy team shoes / order from overseas / pick boots for a costume], and the size question comes up every time. We built a converter for US men's, US women's, UK, EU and cm that you can drop onto the page as a widget, so readers never leave your site: https://westorastyle.com/tools/shoe-size-converter (scroll to "Embed this converter" and copy the two lines).
>
> It is free, has no ads or sign-up, and the only thing we ask is the one-line credit that comes with the snippet. Happy to answer any questions.
>
> [Your name], Westora Style

### 3c. Ready to send: first five emails

Fill in the bracketed parts from the outlet's current page, then send from `hello@westorastyle.com`. One per outlet, no follow-up before 10 days.

**1. Ndure (stockist link)** — find the official Ndure site, Contact or Stockists page.
> Subject: Westora Style now stocking Ndure for US customers
>
> Hi [Name], we're Westora Style (westorastyle.com), a US-facing online store. We currently carry [N] Ndure sneaker styles including [two product names from /collections/shoes], at full price with free US shipping. Could you add us to your stockists / where-to-buy page as the US online retailer? Collection: https://westorastyle.com/collections/shoes. Happy to send our logo or a brand mention in return. Thank you, [Your name]

**2. ZED (stockist link)** — same email, swap in ZED, https://westorastyle.com/collections/coats, and two coat names.

**3. Women's Running — "measure your feet at home" resource**
> Subject: A free measuring guide for readers ordering shoes online
>
> Hi [Editor], your [date] piece on [shoe topic] told readers to size up; the step most skip is measuring. We wrote a plain how-to with a cm-to-size chart underneath and no products in the body: https://westorastyle.com/guides/how-to-measure-your-feet. If it's useful as a link in that article or a future one, great. If you'd like a short quote on measuring at home, I can send one the same day. Thanks, [Your name], Westora Style

**4. Put This On — reading a coat's fabric line**
> Subject: Why a "wool" pea coat can be 70% cotton
>
> Hi [Name], your readers ask about pea coats every autumn. We stock coats whose fabric lines show exactly how much wool is in them, and wrote up how to read those lines before buying: https://westorastyle.com/guides/how-to-choose-a-mens-pea-coat. The examples are real listings with the blends stated. If it fits a reader Q&A or a roundup, a link would be appreciated. Thanks, [Your name], Westora Style

**5. Real Simple — gold-plated jewelry care**
> Subject: Short expert source: making gold plating last
>
> Hi [Editor], for a future piece on jewelry care: we sell gold-plated pieces and publish an honest care note on each one (perfume, showers, and sweat wear plating down). The full guide is here: https://westorastyle.com/guides/how-to-clean-gold-plated-jewelry. I can give you a quote with specifics on cleaning and storage within a day of your request. Thanks, [Your name], Westora Style

## 4. Guide pitches to the 50 targets in `src/data/outreach.ts`

Match the guide to the outlet's recent coverage, name the editor, and offer one concrete thing: an expert quote, a corrected fact, or a resource link. Priority order: menswear blogs (Put This On, Primer, The Modest Man, Effortless Gent, Dappered), watch publications (Worn & Wound, The Slanted Wrist), women's style sites (Real Simple, Byrdie) for the gold-plated jewelry care guide.

> Subject: Quick resource for your [topic] readers
>
> Hi [Name],
>
> Your [date] article on [topic] covered [specific point]. One thing readers often ask next is [question the guide answers]. We wrote it up plainly here, with no products pushed in the body: https://westorastyle.com/guides/[slug]
>
> If you'd like a quote from us for a future piece on [topic], I can give specifics on [sizing / fabric labels / plating care]. Either way, thanks for the article.
>
> [Your name], Westora Style

## 5. Journalist request services (daily, 10 minutes)

Join Qwoted, Featured.com, and Help a B2B Writer. Answer only requests about: shoe sizing online, reading coat fabric labels, caring for gold-plated jewelry, choosing a watch case size, gifts under $100. Each answer links to the matching guide; the credit normally includes a link to `/press` or the homepage. Decline anything that needs a claim we cannot back from a product page.

## 6. Directories worth the time (all free, all editorially reviewed)

- Bing Places (once a business address exists), Apple Business Connect (same).
- Google Business Profile: only when there is a real address; do not use a virtual office.
- Brand-name profiles: Crunchbase company page, LinkedIn company page, Trustpilot business profile (claimed, not solicited reviews).
- Pakistani-brand angle: Something Haute, Images (Dawn), Tribune Lifestyle; pitch the "US retailer carrying ZED, Bag X, Meerzah, Ndure" story with `/press`.

Skip: general web directories, "SEO directories", article spinners, Fiverr backlink gigs, reciprocal link pages.

## 7. Measuring what works

Search Console → Links report (external) lists each new referring domain. Impressions and average position for the target guides appear in Performance → Pages. Re-run `npm run seo:indexnow /guides/<slug>` after any guide edit so Bing recrawls within the hour.
