import { z } from 'zod';

const configSchema = z.object({
  shopifyDomain: z.string(),
  storefrontToken: z.string(),
  apiVersion: z.string(),
});

export const config = configSchema.parse({
  shopifyDomain: import.meta.env.PUBLIC_SHOPIFY_DOMAIN,
  storefrontToken: import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
  apiVersion: '2024-10',
});
