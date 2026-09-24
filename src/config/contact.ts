export const CONTACT_TOPICS = ['Sizing & fit', 'An existing order', 'Returns', 'Product question', 'Something else'] as const
export type ContactTopic = (typeof CONTACT_TOPICS)[number]
