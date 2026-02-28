import { pgTable, text, timestamp, uuid, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Users ────────────────────────────────────────
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Campaigns ────────────────────────────────────
export const campaigns = pgTable('campaigns', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Untitled Campaign'),
    theme: text('theme').notNull().default('jewelry'),
    tone: text('tone').notNull().default('Luxury'), // Luxury | Trendy | Minimal | Bold
    status: text('status').notNull().default('draft'), // draft | generating | done | error
    heroImageUrl: text('hero_image_url'),
    heroImagePrompt: text('hero_image_prompt'),
    masterCaptionInstagram: text('master_caption_instagram'),
    masterCaptionFacebook: text('master_caption_facebook'),
    masterCaptionTiktok: text('master_caption_tiktok'),
    masterCaptionWhatsapp: text('master_caption_whatsapp'),
    masterHashtags: jsonb('master_hashtags').$type<string[]>().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Products ─────────────────────────────────────
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
    name: text('name'),
    price: text('price'),
    description: text('description'),
    imageUrl: text('image_url').notNull(),
    cloudinaryPublicId: text('cloudinary_public_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Generations ──────────────────────────────────
export const generations = pgTable('generations', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    captionInstagram: text('caption_instagram'),
    captionFacebook: text('caption_facebook'),
    captionTiktok: text('caption_tiktok'),
    captionWhatsapp: text('caption_whatsapp'),
    hashtags: jsonb('hashtags').$type<string[]>().default([]),
    estimatedPrice: text('estimated_price'),
    priceConfidence: text('price_confidence'), // 'high' | 'medium' | 'low'
    variationNumber: integer('variation_number').notNull().default(1),
    // AI-generated promotional image
    promoImageUrl: text('promo_image_url'),
    imagePrompt: text('image_prompt'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
    campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
    user: one(users, { fields: [campaigns.userId], references: [users.id] }),
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    campaign: one(campaigns, { fields: [products.campaignId], references: [campaigns.id] }),
    generations: many(generations),
}));

export const generationsRelations = relations(generations, ({ one }) => ({
    product: one(products, { fields: [generations.productId], references: [products.id] }),
}));

// ─── Types ────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type InsertProduct = typeof products.$inferInsert;
export type InsertGeneration = typeof generations.$inferInsert;
