import { store } from '../config/store'
import { buildSku, formatSize, getCategory, productImagePath, stockFor, type Product } from '../catalog'
import { centsToDecimal } from './money'
import { absoluteUrl, orgRef } from './seo'

function shippingDetails() {
  const s = store.shipping.standard
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: centsToDecimal(s.priceCents), currency: 'USD' },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: store.shipping.processingBusinessDays, unitCode: 'DAY' },
      transitTime: { '@type': 'QuantitativeValue', minValue: s.minBusinessDays, maxValue: s.maxBusinessDays, unitCode: 'DAY' },
    },
  }
}

function returnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'US',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: store.returns.windowDays,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  }
}

/** ProductGroup with one Product per purchasable variant, mirroring what the page shows. */
export function productGroupLd(product: Product) {
  const url = absoluteUrl(`/products/${product.slug}`)
  const category = getCategory(product.category)
  const shipping = shippingDetails()
  const returns = returnPolicy()
  const variesBy = product.variant === 'simple' ? ['https://schema.org/color'] : ['https://schema.org/color', 'https://schema.org/size']
  const variants = product.colors.flatMap((color) =>
    product.sizes.flatMap((size) =>
      product.widths.map((width) => {
        const sku = buildSku(product.id, color.slug, size, width.code)
        const widthText = product.variant === 'footwear' && product.widths.length > 1 ? ` ${width.label}` : ''
        const sizeName = product.variant === 'footwear' ? `US M ${formatSize(size)}` : product.variant === 'apparel' ? (product.sizeLabels?.[size] ?? formatSize(size)) : ''
        return {
          '@type': 'Product',
          sku,
          inProductGroupWithID: product.id,
          name: `${store.name} ${product.name} – ${color.name}${sizeName ? `, ${sizeName}` : ''}${widthText}`,
          color: color.name,
          ...(product.variant === 'simple'
            ? {}
            : {
                size: {
                  '@type': 'SizeSpecification',
                  name: sizeName,
                  ...(product.variant === 'footwear'
                    ? {
                        sizeSystem: 'https://schema.org/WearableSizeSystemUS',
                        sizeGroup: 'https://schema.org/WearableSizeGroupMens',
                      }
                    : {}),
                },
              }),
          image: color.images.map((k) => absoluteUrl(productImagePath(k, 1024))),
          ...(product.widths.length > 1
            ? { additionalProperty: { '@type': 'PropertyValue', name: 'Width', value: `${width.label} (${width.code})` } }
            : {}),
          offers: {
            '@type': 'Offer',
            url: `${url}?color=${color.slug}`,
            price: centsToDecimal(product.priceCents),
            priceCurrency: 'USD',
            itemCondition: 'https://schema.org/NewCondition',
            availability: stockFor(product, sku) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: orgRef(),
            shippingDetails: shipping,
            hasMerchantReturnPolicy: returns,
          },
        }
      }),
    ),
  )
  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': `${url}#product`,
    name: `${store.name} ${product.name}`,
    description: product.description,
    url,
    brand: { '@type': 'Brand', name: store.name },
    productGroupID: product.id,
    category: category?.name,
    material: product.materials,
    variesBy: product.widths.length > 1 ? [...variesBy, 'https://schema.org/additionalProperty'] : variesBy,
    image: product.colors[0].images.map((k) => absoluteUrl(productImagePath(k, 1024))),
    hasVariant: variants,
  }
}
