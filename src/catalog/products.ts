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
    summary: 'Sneakers and joggers for every day',
    intro: 'Cushioned sneakers and jogger-style shoes with breathable uppers and clean lines. Made for long days, easy outfits, and the miles in between.',
    seoTitle: 'Sneakers & Jogger Shoes',
    seoDescription: 'Shop sneakers and jogger-style shoes with cushioned soles, breathable uppers, and a full range of sizes.',
  },
  {
    slug: 'handbags',
    name: 'Handbags',
    kind: 'department',
    summary: 'Bags for the day and the evening',
    intro: 'Totes, hobos, and crossbody bags in suede, leather, and polished hardware. Shapes that carry the day and still look considered.',
    seoTitle: 'Handbags & Crossbody Bags',
    seoDescription: 'Shop handbags, shoulder bags, and crossbody bags in suede and leather, with polished hardware and everyday shapes.',
  },
  {
    slug: 'wallets',
    name: 'Wallets',
    kind: 'department',
    summary: 'Slim wallets for cards and cash',
    intro: 'Bifolds, card holders, and money clips in supple leather. Slim enough for a pocket, finished enough to keep.',
    seoTitle: "Men's Wallets & Bifolds",
    seoDescription: "Shop men's bifold wallets, card holders, and money clips in leather, made for everyday carry.",
  },
  {
    slug: 'jackets',
    name: 'Jackets',
    kind: 'department',
    summary: 'Bombers, field jackets, and shirt-jackets',
    intro: 'Jackets with a stated color, fabric, and size range. Each style uses its own S–XL chart, not the shoe chart.',
    seoTitle: 'Jackets',
    seoDescription: 'Shop jackets, bombers, and shirt-jackets in denim, wool, nylon, and suede, with S–XL sizing.',
  },
  {
    slug: 'hoodies',
    name: 'Hoodies',
    kind: 'department',
    summary: 'Hooded sweatshirts for every day',
    intro: 'Pullover and long-line hoodies in solid colors. Each style lists its sizes from the label, not the shoe chart.',
    seoTitle: 'Hoodies',
    seoDescription: 'Shop hoodies in solid colors, from essential pullovers to long-line styles, with S–XL sizing.',
  },
  {
    slug: 'coats',
    name: 'Coats',
    kind: 'department',
    summary: 'Wool coats and trenches',
    intro: 'Pea coats, overcoats, and trenches with a stated color and size range. Use the coat’s own size list, not the shoe chart.',
    seoTitle: 'Coats',
    seoDescription: 'Shop wool pea coats, overcoats, and trench coats, with S–XL sizing.',
  },
  {
    slug: 'womens-jewelry',
    name: "Women's Jewelry",
    kind: 'department',
    summary: 'Rings, bangles, and necklace sets',
    intro: 'Gold-plated rings, pearl strands, kundan sets, and bracelets with a polished finish. Pieces meant to catch the light and finish an outfit.',
    seoTitle: "Women's Jewelry: Rings, Bracelets & Necklace Sets",
    seoDescription: "Shop women's jewelry: rings, bangles, earrings, pendants, and necklace sets in gold plate, pearls, and stones.",
  },
  {
    slug: 'backpacks',
    name: 'Backpacks',
    kind: 'department',
    summary: 'Carry for the commute',
    intro: 'Backpacks with stated capacity, dimensions and laptop fit. Only the compatibility written on the product is claimed.',
    seoTitle: 'Laptop & Commuter Backpacks',
    seoDescription:
      'Shop Westora Style commuter backpacks. Each pack lists its capacity in liters, dimensions and measured laptop sleeve fit, plus pockets and straps.',
  },
  {
    slug: 'watches',
    name: 'Watches',
    kind: 'department',
    summary: 'Men’s watches for every day',
    intro: 'Crisp dials, leather and metal straps, and cases made to be worn every day. From slim dress watches to sport chronographs.',
    seoTitle: "Men's Watches",
    seoDescription: "Shop men's watches with leather and metal straps, clean dials, and cases for work and the weekend.",
  },
  {
    slug: 'running',
    name: 'Running',
    kind: 'shoe-use',
    summary: 'Cushioned trainers for road miles',
    intro:
      'Road shoes built around a high-rebound foam midsole and a breathable mesh upper. Start here if you log regular miles on pavement or treadmill and want a shoe that also works for the rest of your day.',
    seoTitle: 'Running Shoes: Cushioned Road Trainers',
    seoDescription:
      'Shop Westora Style running shoes: cushioned road trainers with breathable mesh uppers, US sizing and standard or wide widths.',
  },
  {
    slug: 'trail',
    name: 'Trail',
    kind: 'shoe-use',
    summary: 'Grip and protection off-road',
    intro:
      'Trail shoes with a lugged rubber outsole, a protective toe cap and a firmer, more stable platform for dirt, gravel and rocky paths.',
    seoTitle: 'Trail Running Shoes with Lugged Grip',
    seoDescription:
      'Shop Westora Style trail shoes with lugged outsoles, protective toe caps and ripstop uppers for dirt, gravel and mixed terrain.',
  },
  {
    slug: 'lifestyle',
    name: 'Lifestyle',
    kind: 'shoe-use',
    summary: 'Leather and suede everyday classics',
    intro:
      'Clean low- and high-top silhouettes in leather and suede, set on durable rubber cupsoles. Designed to pair with denim, chinos and everything in between.',
    seoTitle: 'Leather & Suede Lifestyle Sneakers',
    seoDescription:
      'Shop Westora Style lifestyle sneakers: a minimalist leather court shoe and a suede and leather high-top on durable rubber soles, in US men’s sizing.',
  },
  {
    slug: 'everyday',
    name: 'Everyday',
    kind: 'shoe-use',
    summary: 'Lightweight knits for all-day wear',
    intro:
      'Soft knit uppers and lightweight foam soles for commuting, travel and long days on your feet. Easy on, easy to live in.',
    seoTitle: 'Everyday Knit Sneakers & Slip-Ons',
    seoDescription:
      'Shop Westora Style everyday shoes: lightweight knit sneakers and slip-ons with soft foam midsoles for all-day wear, in standard and wide widths.',
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
