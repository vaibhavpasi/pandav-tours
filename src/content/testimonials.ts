/**
 * Customer testimonials. ONLY add genuine testimonials supplied by the owner,
 * with the customer's permission to publish. The homepage section is hidden
 * while this list is empty. Never invent reviews or ratings.
 */
export type Testimonial = { quote: string; name: string; trip?: string };

export const TESTIMONIALS: Testimonial[] = [];
