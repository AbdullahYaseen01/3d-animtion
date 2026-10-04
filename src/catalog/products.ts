import { departmentKeywords as dk, shoeKeywords as sk } from '../lib/seoKeywords.js'
import type { Category, Product } from './types.js'
import { bagxHandbags } from './bagxHandbags.js'
import { meerzahJewelry } from './meerzahJewelry.js'
import { mensSneakers } from './mensSneakers.js'
import { mensWallets } from './mensWallets.js'
import { mensWatches } from './mensWatches.js'
import { zedOuterwear } from './zedOuterwear.js'

/**
 * Live assortment. Placeholder styles are not included.
 */
export const CATALOG_IS_SAMPLE = false

export const categories: Category[] = [
  {
    slug: 'shoes',
    name: 'Shoes',
    kind: 'department',
    summary: "Men's sneakers",
    intro:
      "Men's sneakers from Ndure, a Pakistani footwear brand: mesh lace-ups, casual low-tops, and slip-ons. Every pair lists its upper and sole materials and comes in standard width, US men's sizes.",
    seoTitle: dk.shoes.title,
    seoDescription: dk.shoes.description,
  },
  {
    slug: 'handbags',
    name: 'Handbags',
    kind: 'department',
    summary: 'Hobo, shoulder, and crossbody bags',
    intro:
      "Women's handbags from Bag X in hobo, shoulder, crossbody, and top-handle shapes, plus three-piece sets. Each bag lists the material, closure, and hardware the brand publishes, and measurements in inches where they are given.",
    seoTitle: dk.handbags.title,
    seoDescription: dk.handbags.description,
  },
  {
    slug: 'wallets',
    name: 'Wallets',
    kind: 'department',
    summary: 'Wallets for cards and cash',
    intro:
      "Men's wallets, bifolds, and money clips from Metro. Each one lists its exact dimensions in centimeters so you can check pocket fit. Where Metro does not publish a material, we say so instead of guessing.",
    seoTitle: dk.wallets.title,
    seoDescription: dk.wallets.description,
  },
  {
    slug: 'jackets',
    name: 'Jackets',
    kind: 'department',
    summary: 'Bombers, denim, and faux leather',
    intro:
      "Men's jackets from ZED: bombers, denim and trucker jackets, Harringtons, faux leather racers, field and safari jackets, and puffers. Each style shows ZED's listed fabric blend, fit, and care, with letter sizes S to XL.",
    seoTitle: dk.jackets.title,
    seoDescription: dk.jackets.description,
  },
  {
    slug: 'hoodies',
    name: 'Hoodies',
    kind: 'department',
    summary: 'Pullover and long-line hoodies',
    intro:
      "Men's hoodies from ZED in essential pullover, henley, cropped, and long-line cuts. Sizes run S to XL on each style's own chart, and the listed fit is on every product page.",
    seoTitle: dk.hoodies.title,
    seoDescription: dk.hoodies.description,
  },
  {
    slug: 'coats',
    name: 'Coats',
    kind: 'department',
    summary: 'Pea coats, overcoats, and trenches',
    intro:
      "Men's coats from ZED: pea coats, single- and double-breasted overcoats, trench coats, and a hooded parka. The fabric blend ZED lists is shown on each coat, so you can see how much wool it actually contains.",
    seoTitle: dk.coats.title,
    seoDescription: dk.coats.description,
  },
  {
    slug: 'womens-jewelry',
    name: "Women's Jewelry",
    kind: 'department',
    summary: 'Rings, bangles, and necklace sets',
    intro:
      "Women's jewelry from Meerzah: 925 sterling silver rings, gold-plated bangles and karas, kundan and zircon necklace sets, and earrings. Weight, finish, and sizes are listed where Meerzah publishes them.",
    seoTitle: dk['womens-jewelry'].title,
    seoDescription: dk['womens-jewelry'].description,
  },
  {
    slug: 'backpacks',
    name: 'Backpacks',
    kind: 'department',
    summary: 'Carry for the commute',
    intro: 'Backpacks with stated capacity, dimensions and laptop fit. Only the compatibility written on the product is claimed.',
    seoTitle: dk.backpacks.title,
    seoDescription: dk.backpacks.description,
  },
  {
    slug: 'watches',
    name: 'Watches',
    kind: 'department',
    summary: 'Quartz, analog, and digital',
    intro:
      "Men's watches from Casio, Naviforce, Daniel Klein, Curren, Fossil, and other named brands. Each listing shows the model number, movement, strap, and the water resistance rating only when the maker publishes one.",
    seoTitle: dk.watches.title,
    seoDescription: dk.watches.description,
  },
  {
    slug: 'running',
    name: 'Running',
    kind: 'shoe-use',
    summary: 'Lightweight mesh sneakers',
    intro:
      'Lace-up sneakers with mesh or knit uppers and EVA or PU soles. They suit gym sessions, walks, and long days on your feet. They are casual sneakers, not specialist distance-running shoes.',
    seoTitle: sk.running.title,
    seoDescription: sk.running.description,
  },
  {
    slug: 'trail',
    name: 'Trail',
    kind: 'shoe-use',
    summary: 'Grip and protection off-road',
    intro: 'Trail shoes with the outsole, upper, and protection listed on every product page.',
    seoTitle: sk.trail.title,
    seoDescription: sk.trail.description,
  },
  {
    slug: 'lifestyle',
    name: 'Lifestyle',
    kind: 'shoe-use',
    summary: 'Casual lace-ups and low-tops',
    intro:
      'Casual lace-up and contrast-sole sneakers with synthetic or PU uppers. Pair them with jeans or chinos. Upper and sole materials are listed on each pair.',
    seoTitle: sk.lifestyle.title,
    seoDescription: sk.lifestyle.description,
  },
  {
    slug: 'everyday',
    name: 'Everyday',
    kind: 'shoe-use',
    summary: 'Slip-on sneakers',
    intro:
      'Slip-on sneakers with knit or mesh uppers for errands, travel, and long days. No laces to tie, and the upper and sole materials are on every pair.',
    seoTitle: sk.everyday.title,
    seoDescription: sk.everyday.description,
  },
]

export const products: Product[] = [
  ...mensWallets,
  ...mensWatches,
  ...mensSneakers,
  ...bagxHandbags,
  ...meerzahJewelry,
  ...zedOuterwear,
]
