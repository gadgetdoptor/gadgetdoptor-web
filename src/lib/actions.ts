'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { products, brands, categories, heroSliders, users, orders, orderItems, reviews, coupons, admins, settings, activityLogs, deliveryLocations } from '@/lib/schema';
import { eq, and, ne, desc, inArray, or, sql, asc, count as drizzleCount } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getProducts, getProductById, getBrandById, getCategoryById, getHeroSliderById } from './data';
import { generateSlug } from '@/lib/utils';
import { sendTelegramNotification, sendContactMessageNotification } from './telegram';
import { logActivity } from '@/lib/logger';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import bcrypt from 'bcryptjs';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const S3_BUCKET = 'assets';
const S3_ENDPOINT = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/$/, '');

// Build the public URL for an S3 object
function buildS3Url(key: string): string {
  return `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
}

// Delete an S3 object by its full URL
async function deleteS3Object(url: string): Promise<void> {
  try {
    // Extract the key: everything after /{bucket}/
    const prefix = `${S3_ENDPOINT}/${S3_BUCKET}/`;
    if (!url.startsWith(prefix)) return;
    const key = url.slice(prefix.length);
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  } catch (err) {
    console.error('S3 delete error:', err);
  }
}



const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters long."),
  slug: z.string().min(3, "Slug must be at least 3 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format: only lowercase letters, numbers, and hyphens are allowed.'),
  sku: z.coerce.number().int("SKU must be a whole number.").min(1, "SKU is required."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  originalPrice: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().min(0, "Original price cannot be negative.").nullable().optional()
  ),
  buyPrice: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().min(0, "Buy price cannot be negative.").nullable().optional()
  ),
  stock: z.coerce.number().int("Stock must be a whole number.").min(0, "Stock cannot be negative."),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  images: z.array(z.any()).optional(),
  isTrending: z.boolean().default(false),
  isBestSelling: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  discount: z.coerce.number().min(0).default(0),
  status: z.enum(["draft", "published"]).default("published"),
});

export async function createProduct(data: unknown) {
  const validatedFields = productFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { slug, sku } = validatedFields.data;

  const existingProduct = await db.query.products.findFirst({ where: eq(products.slug, slug) });
  if (existingProduct) {
    return { success: false, message: 'A product with this name already exists, resulting in a duplicate slug.' };
  }

  const existingProductSku = await db.query.products.findFirst({ where: eq(products.sku, sku) });
  if (existingProductSku) {
    return { success: false, message: `A product with this SKU (${sku}) already exists.` };
  }

  const images = validatedFields.data.images || [];

  try {
    await db.insert(products).values({
      id: createId(),
      ...validatedFields.data,
      description: validatedFields.data.description || null,
      categoryId: validatedFields.data.categoryId || null,
      brandId: validatedFields.data.brandId || null,
      price: String(validatedFields.data.price),
      originalPrice: validatedFields.data.originalPrice != null ? String(validatedFields.data.originalPrice) : null,
      buyPrice: validatedFields.data.buyPrice != null ? String(validatedFields.data.buyPrice) : null,
      discount: String(validatedFields.data.discount),
      images,
      keywords: validatedFields.data.keywords || [],
    });
  } catch (error: any) {
    // Enhanced error logging
    console.error('Create Product Error:', error);
    if (error.cause) console.error('Error Cause:', error.cause);
    // @ts-ignore
    if (error.body) console.error('Error Body:', error.body);

    let details = error.detail || '';
    if (!details && error.cause && (error.cause as any).detail) {
      details = (error.cause as any).detail;
    }

    return {
      success: false,
      message: `Database Error: Failed to Create Product. ${error.message || ''} ${details ? '- ' + details : ''}`,
    };
  }

  await logActivity({ event: 'PRODUCT_CREATE', message: `Created product "${validatedFields.data.name}" (SKU ${sku}).` });

  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}

export async function updateProduct(id: string, data: unknown) {
  const validatedFields = productFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }

  const { slug, sku } = validatedFields.data;
  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), ne(products.id, id)),
  });
  if (existingProduct) {
    return { success: false, message: 'A product with this name already exists, resulting in a duplicate slug.' };
  }

  const existingProductSku = await db.query.products.findFirst({
    where: and(eq(products.sku, sku), ne(products.id, id)),
  });
  if (existingProductSku) {
    return { success: false, message: `A product with this SKU (${sku}) already exists.` };
  }

  const images = validatedFields.data.images || [];

  try {
    // Get existing product to check for deleted images
    const oldProduct = await db.query.products.findFirst({
      where: eq(products.id, id)
    });

    if (oldProduct && oldProduct.images) {
      const removedImages = oldProduct.images.filter(
        (oldImg: string) => !images.includes(oldImg) && oldImg.startsWith(S3_ENDPOINT + '/' + S3_BUCKET + '/')
      );
      await Promise.all(removedImages.map(deleteS3Object));
    }

    await db.update(products).set({
      ...validatedFields.data,
      description: validatedFields.data.description || null,
      categoryId: validatedFields.data.categoryId || null,
      brandId: validatedFields.data.brandId || null,
      price: String(validatedFields.data.price),
      originalPrice: validatedFields.data.originalPrice != null ? String(validatedFields.data.originalPrice) : null,
      buyPrice: validatedFields.data.buyPrice != null ? String(validatedFields.data.buyPrice) : null,
      discount: String(validatedFields.data.discount),
      images,
      keywords: validatedFields.data.keywords || [],
      updatedAt: new Date(),
    }).where(eq(products.id, id));
  } catch (error: any) {
    // Enhanced error logging
    console.error('Update Product Error:', error);
    if (error.cause) console.error('Error Cause:', error.cause);
    // @ts-ignore
    if (error.body) console.error('Error Body:', error.body);

    let details = error.detail || '';
    if (!details && error.cause && (error.cause as any).detail) {
      details = (error.cause as any).detail;
    }

    return {
      success: false,
      message: `Database Error: Failed to Update Product. ${error.message || ''} ${details ? '- ' + details : ''}`,
    };
  }

  await logActivity({ event: 'PRODUCT_UPDATE', message: `Updated product "${validatedFields.data.name}" (SKU ${sku}).` });

  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}

export async function deleteProduct(id: string) {
  try {
    const productToDelete = await getProductById(id);

    // Delete images from S3
    if (productToDelete && productToDelete.images.length > 0) {
      await Promise.all(productToDelete.images.filter(Boolean).map(deleteS3Object));
    }

    await db.delete(products).where(eq(products.id, id));
    await logActivity({ event: 'PRODUCT_DELETE', message: `Deleted product "${productToDelete?.name || id}".` });
    revalidatePath('/admin/products');
    revalidatePath('/', 'layout');
    return { message: 'Deleted Product.' };
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Delete Product.',
    };
  }
}

// Brand Actions
export async function deleteMultipleProducts(ids: string[]) {
  try {
    // 1. Fetch products to get image URLs
    const productsToDelete = await db.query.products.findMany({
      where: inArray(products.id, ids),
    });

    // 2. Collect all image URLs to delete from S3
    const urlsToDelete: string[] = [];
    productsToDelete.forEach((product: any) => {
      if (product.images && product.images.length > 0) {
        product.images.forEach((url: string) => {
          if (url) urlsToDelete.push(url);
        });
      }
    });

    // 3. Delete images from S3
    await Promise.all(urlsToDelete.map(deleteS3Object));

    // 4. Delete products from DB
    await db.delete(products).where(inArray(products.id, ids));

    await logActivity({ event: 'PRODUCT_DELETE', message: `Bulk deleted ${ids.length} products.` });

    revalidatePath('/admin/products');
    revalidatePath('/', 'layout');
    return { success: true, message: `Deleted ${ids.length} products.` };
  } catch (error) {
    console.error('Delete multiple products error:', error);
    return {
      success: false,
      message: 'Database Error: Failed to Delete Products.',
    };
  }
}

// Brand Actions
const brandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters long.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long.'),
  imageUrl: z.string().optional().nullable(),
});

export async function createBrand(data: unknown) {
  const validatedFields = brandSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create brand.' };
  }
  const { name, slug, imageUrl } = validatedFields.data;

  const existing = await db.query.brands.findFirst({ where: eq(brands.slug, slug) });
  if (existing) {
    return { success: false, message: 'A brand with this name already exists, resulting in a duplicate slug.' };
  }

  try {
    await db.insert(brands).values({ id: createId(), name, slug, imageUrl });
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to create brand.' };
  }
  revalidatePath('/admin/brand');
  revalidatePath('/', 'layout');
  redirect('/admin/brand');
}

export async function updateBrand(id: string, data: unknown) {
  const validatedFields = brandSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to update brand.' };
  }
  const { name, slug, imageUrl } = validatedFields.data;

  const existing = await db.query.brands.findFirst({ where: and(eq(brands.slug, slug), ne(brands.id, id)) });
  if (existing) {
    return { success: false, message: 'A brand with this name already exists, resulting in a duplicate slug.' };
  }

  try {
    const oldBrand = await getBrandById(id);
    if (oldBrand && oldBrand.imageUrl && oldBrand.imageUrl !== imageUrl) {
      await deleteS3Object(oldBrand.imageUrl);
    }

    await db.update(brands).set({ name, slug, imageUrl, updatedAt: new Date() }).where(eq(brands.id, id));
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to update brand.' };
  }
  revalidatePath('/admin/brand');
  revalidatePath(`/admin/brand/${id}/edit`);
  revalidatePath('/', 'layout');
  redirect('/admin/brand');
}

export async function deleteBrand(id: string) {
  try {
    const brandToDelete = await getBrandById(id);
    if (brandToDelete && brandToDelete.imageUrl) {
      await deleteS3Object(brandToDelete.imageUrl);
    }

    await db.delete(brands).where(eq(brands.id, id));
    revalidatePath('/admin/brand');
    revalidatePath('/', 'layout');
    return { message: 'Deleted brand.' };
  } catch (error: any) {
    if (error && error.code === '23503') {
      return { message: 'Failed to delete brand. It is currently being used by one or more products.' };
    }
    console.error('Delete brand error:', error);
    return { message: 'Database Error: Failed to delete brand.' };
  }
}

// Category Actions
const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long.'),
  parentId: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export async function createCategory(data: unknown) {
  const validatedFields = categorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create category.' };
  }
  const { name, slug, parentId, imageUrl, isFeatured } = validatedFields.data;

  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  if (existing) {
    return { success: false, message: 'A category with this name already exists, resulting in a duplicate slug.' };
  }

  try {
    await db.insert(categories).values({
      id: createId(),
      name,
      slug,
      parentId: (parentId && parentId !== 'none') ? parentId : null,
      imageUrl,
      isFeatured
    });
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to create category.' };
  }
  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}

export async function updateCategory(id: string, data: unknown) {
  const validatedFields = categorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to update category.' };
  }
  const { name, slug, parentId, imageUrl, isFeatured } = validatedFields.data;

  const existing = await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), ne(categories.id, id)) });
  if (existing) {
    return { success: false, message: 'A category with this name already exists, resulting in a duplicate slug.' };
  }

  try {
    const oldCategory = await getCategoryById(id);
    if (oldCategory && oldCategory.imageUrl && oldCategory.imageUrl !== imageUrl) {
      await deleteS3Object(oldCategory.imageUrl);
    }

    await db.update(categories).set({
      name,
      slug,
      parentId: (parentId && parentId !== 'none') ? parentId : null,
      imageUrl,
      isFeatured: isFeatured,
      updatedAt: new Date(),
    }).where(eq(categories.id, id));
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to update category.' };
  }
  revalidatePath('/admin/categories');
  revalidatePath(`/admin/categories/${id}/edit`);
  revalidatePath('/', 'layout');
  redirect('/admin/categories');
}

export async function deleteCategory(id: string) {
  try {
    const children = await db.query.categories.findFirst({ where: eq(categories.parentId, id) });
    if (children) {
      return { message: 'Failed to delete category. It has one or more sub-categories.' };
    }

    const categoryToDelete = await getCategoryById(id);
    if (categoryToDelete && categoryToDelete.imageUrl) {
      await deleteS3Object(categoryToDelete.imageUrl);
    }

    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { message: 'Deleted category.' };
  } catch (error: any) {
    if (error && error.code === '23503') {
      return { message: 'Failed to delete category. It is currently being used by one or more products.' };
    }
    console.error(error);
    return { message: 'Database Error: Failed to delete category.' };
  }
}

export async function toggleCategoryFeatured(id: string, isFeatured: boolean) {
  try {
    await db.update(categories).set({ isFeatured, updatedAt: new Date() }).where(eq(categories.id, id));
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true, message: `Category ${isFeatured ? 'marked as featured' : 'removed from featured'}.` };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Database Error: Failed to toggle featured status.' };
  }
}

// JSON returning actions for use in client components
const quickBrandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters long.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long.').optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function createBrandJson(data: unknown) {
  const validatedFields = quickBrandSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create brand.' };
  }

  const { name, slug: providedSlug, imageUrl } = validatedFields.data;
  let slug = providedSlug || generateSlug(name);
  const existing = await db.query.brands.findFirst({ where: eq(brands.slug, slug) });
  if (existing) {
    return { success: false, message: 'A brand with this name already exists.' };
  }

  try {
    const [newBrand] = await db.insert(brands).values({ id: createId(), name, slug, imageUrl }).returning();
    revalidatePath('/admin/brand');
    revalidatePath('/', 'layout');
    return { success: true, brand: newBrand };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Database Error: Failed to create brand.' };
  }
}

const quickCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long.').optional(),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export async function createCategoryJson(data: unknown) {
  const validatedFields = quickCategorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create category.' };
  }
  const { name, slug: providedSlug, parentId, imageUrl, isFeatured } = validatedFields.data;
  let slug = providedSlug || generateSlug(name);

  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  if (existing) {
    return { success: false, message: 'A category with this name already exists.' };
  }

  try {
    const [newCategory] = await db.insert(categories).values({
      id: createId(),
      name,
      slug,
      parentId: (parentId && parentId !== 'none') ? parentId : null,
      imageUrl,
      isFeatured
    }).returning();

    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');

    let parentName: string | null = null;
    if (newCategory.parentId) {
      const parent = await db.query.categories.findFirst({ where: eq(categories.id, newCategory.parentId) });
      parentName = parent?.name || null;
    }

    return { success: true, category: { ...newCategory, parentName } };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Database Error: Failed to create category.' };
  }
}

// Slug checking actions (kept for potential future client-side validation)
export async function checkProductSlug(slug: string, id?: string) {
  if (!slug) return { isUnique: false, message: 'Slug cannot be empty.' };
  try {
    const query = db.query.products.findFirst({
      where: id
        ? and(eq(products.slug, slug), ne(products.id, id))
        : eq(products.slug, slug),
    });
    const existing = await query;
    if (existing) {
      return { isUnique: false, message: 'This slug is already in use.' };
    }
    return { isUnique: true, message: 'Slug is available.' };
  } catch (error) {
    console.error(error);
    return { isUnique: false, message: 'Error checking slug.' };
  }
}

export async function checkProductSku(val: string | number, id?: string) {
  const sku = typeof val === 'string' ? parseInt(val, 10) : val;
  if (isNaN(sku)) return { isUnique: false, message: 'Invalid SKU.' };

  try {
    const query = db.query.products.findFirst({
      where: id
        ? and(eq(products.sku, sku), ne(products.id, id))
        : eq(products.sku, sku),
    });
    const existing = await query;
    if (existing) {
      return { isUnique: false, message: 'This SKU is already in use.' };
    }
    return { isUnique: true, message: 'SKU is available.' };
  } catch (error) {
    console.error(error);
    return { isUnique: false, message: 'Error checking SKU.' };
  }
}

export async function getLatestSku() {
  try {
    const latestProduct = await db.query.products.findFirst({
      orderBy: desc(products.sku),
      columns: {
        sku: true,
      },
    });

    return latestProduct?.sku ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function checkBrandSlug(slug: string, id?: string) {
  if (!slug) return { isUnique: false, message: 'Slug cannot be empty.' };
  try {
    const query = db.query.brands.findFirst({
      where: id
        ? and(eq(brands.slug, slug), ne(brands.id, id))
        : eq(brands.slug, slug),
    });
    const existing = await query;
    if (existing) {
      return { isUnique: false, message: 'This slug is already in use.' };
    }
    return { isUnique: true, message: 'Slug is available.' };
  } catch (error) {
    console.error(error);
    return { isUnique: false, message: 'Error checking slug.' };
  }
}

export async function checkCategorySlug(slug: string, id?: string) {
  if (!slug) return { isUnique: false, message: 'Slug cannot be empty.' };
  try {
    const query = db.query.categories.findFirst({
      where: id
        ? and(eq(categories.slug, slug), ne(categories.id, id))
        : eq(categories.slug, slug),
    });
    const existing = await query;
    if (existing) {
      return { isUnique: false, message: 'This slug is already in use.' };
    }
    return { isUnique: true, message: 'Slug is available.' };
  } catch (error) {
    console.error(error);
    return { isUnique: false, message: 'Error checking slug.' };
  }
}


// Hero Slider Actions
const heroSliderSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long.'),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required."),
  link: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(false),
  type: z.enum(['carousel', 'promo-top', 'promo-bottom']).default('carousel'),
});

export async function createHeroSlider(data: unknown) {
  const validatedFields = heroSliderSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create hero slider.' };
  }
  const { title, subtitle, imageUrl, link, displayOrder, isActive, type } = validatedFields.data;

  try {
    await db.insert(heroSliders).values({
      id: createId(),
      title,
      subtitle: subtitle || null,
      imageUrl: imageUrl,
      link: link || null,
      displayOrder,
      isActive,
      type,
    });
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to create hero slider.' };
  }
  revalidatePath('/admin/hero-sliders');
  redirect('/admin/hero-sliders');
}

export async function updateHeroSlider(id: string, data: unknown) {
  const validatedFields = heroSliderSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to update hero slider.' };
  }
  const { title, subtitle, imageUrl, link, displayOrder, isActive, type } = validatedFields.data;

  try {
    const oldSlider = await getHeroSliderById(id);
    if (oldSlider && oldSlider.imageUrl && oldSlider.imageUrl !== imageUrl) {
      await deleteS3Object(oldSlider.imageUrl);
    }

    await db.update(heroSliders).set({
      title,
      subtitle: subtitle || null,
      imageUrl: imageUrl,
      link: link || null,
      displayOrder,
      isActive,
      type,
      updatedAt: new Date(),
    }).where(eq(heroSliders.id, id));
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to update hero slider.' };
  }
  revalidatePath('/admin/hero-sliders');
  revalidatePath(`/admin/hero-sliders/${id}/edit`);
  revalidatePath('/');
  redirect('/admin/hero-sliders');
}

export async function deleteHeroSlider(id: string) {
  try {
    const sliderToDelete = await getHeroSliderById(id);

    if (sliderToDelete && sliderToDelete.imageUrl) {
      await deleteS3Object(sliderToDelete.imageUrl);
    }

    await db.delete(heroSliders).where(eq(heroSliders.id, id));
    revalidatePath('/admin/hero-sliders');
    revalidatePath('/');
    return { message: 'Deleted hero slider.' };
  } catch (error) {
    console.error('Delete hero slider error:', error);
    return { message: 'Database Error: Failed to delete hero slider.' };
  }
}


// Checkout Action
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  mobile: z.string().min(11, "A valid 11-digit mobile number is required.").max(11, "A valid 11-digit mobile number is required."),
  email: z.string().min(1, "Email is required.").email({ message: "Invalid email address." }),
  address: z.string().min(1, "Address is required."),
  district: z.string().min(1, "District is required."),
  deliveryMethod: z.string().min(1, "Delivery location is required."),
  paymentMethod: z.enum(['bkash', 'cod']),
  userId: z.string().optional(),
});


export async function processCheckout(
  data: any,
  totalAmount: number,
  items: { id: string; quantity: number; price: number }[],
  couponId?: string,
  discountAmount?: number
): Promise<{ success: true; url: string } | { success: false; message: string }> {
  const validatedFields = checkoutSchema.safeParse(data);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten())
    return { success: false, message: 'Invalid checkout data.' };
  }

  const { paymentMethod, email, mobile } = validatedFields.data;

  try {
    const orderNumber = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    const deliveryFee = String(await getDeliveryFeeForLocation(validatedFields.data.deliveryMethod));

    // Wrap the entire checkout process in a transaction
    const result: { success: true; url: string; orderId: string; productDetails: string[] } = await db.transaction(async (tx) => {
      // 1. Verify Stock Availability for ALL items first
      const itemsWithNames: { id: string, name: string }[] = [];
      for (const item of items) {
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.id),
          columns: { stock: true, name: true, status: true }
        });

        if (!product || product.status !== 'published') {
          throw new Error(`Product "${product?.name || 'Unknown'}" is not available for purchase.`);
        }

        itemsWithNames.push({ id: item.id, name: product.name });

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} left.`);
        }
      }

      // 2. Decrement Stock for each item and increment version
      for (const item of items) {
        await tx.update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
            version: sql`${products.version} + 1`,
            updatedAt: new Date()
          })
          .where(eq(products.id, item.id));
      }

      // 2.5 Coupon Usage
      if (couponId) {
        await tx.update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.id, couponId));
      }

      // 3. Create Order
      const orderId = createId();
      await tx.insert(orders).values({
        id: orderId,
        orderNumber,
        userId: validatedFields.data.userId || null,
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        mobile: validatedFields.data.mobile,
        email: validatedFields.data.email || null,
        address: validatedFields.data.address,
        district: validatedFields.data.district,
        deliveryMethod: validatedFields.data.deliveryMethod,
        deliveryFee,
        totalAmount: String(totalAmount),
        paymentMethod: validatedFields.data.paymentMethod,
        couponId: couponId || null,
        discountAmount: String(discountAmount || 0),
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });

      // 4. Create Order Items
      const orderItemsValues = items.map((item) => ({
        id: createId(),
        orderId: orderId,
        productId: item.id,
        quantity: item.quantity,
        price: String(item.price),
      }));

      if (orderItemsValues.length > 0) {
        await tx.insert(orderItems).values(orderItemsValues);
      }

      const productDetails = items.map(item => {
        const p = itemsWithNames.find(i => i.id === item.id);
        return `${p?.name || 'Product'} (x${item.quantity})`;
      });

      return { success: true, url: `/order-confirmed/${orderNumber}`, orderId, productDetails };
    });

    // 5. Send Telegram Notification (Background)
    // Scheduled with `after` so it's guaranteed to run to completion even
    // after the response is sent, instead of being an un-awaited promise
    // that a suspended serverless function can cut off mid-flight.
    after(() =>
      sendTelegramNotification({
        orderNumber,
        customerName: `${validatedFields.data.firstName} ${validatedFields.data.lastName}`,
        phone: validatedFields.data.mobile,
        items: result.productDetails,
        totalAmount: String(totalAmount),
        address: `${validatedFields.data.address}, ${validatedFields.data.district}`,
        orderId: result.orderId,
      }).catch(err => console.error('Telegram notification error:', err))
    );

    await logActivity({
      event: 'ORDER_CREATE',
      actor: `${validatedFields.data.firstName} ${validatedFields.data.lastName}`,
      message: `Order #${orderNumber} placed online for Tk ${totalAmount}.`,
    });

    return result;

  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT') throw error;
    return {
      success: false,
      message: error.message || 'Failed to process checkout. Please try again.'
    };
  }
}

/**
 * Enterprise Guardrail: Pre-checkout Stock Verification
 * Checks if the user's cart items are still available BEFORE they fill out the checkout form.
 */
export async function verifyCartStock(items: { id: string; quantity: number }[]) {
  try {
    const results = await Promise.all(
      items.map(async (item) => {
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.id),
          columns: { id: true, stock: true, name: true }
        });

        if (!product) return { id: item.id, available: false, reason: 'Product not found.' };
        if (product.stock < item.quantity) {
          return {
            id: item.id,
            available: false,
            reason: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
            currentStock: product.stock
          };
        }
        return { id: item.id, available: true };
      })
    );

    const isAllAvailable = results.every(r => r.available);
    return { success: isAllAvailable, details: results };
  } catch (error) {
    console.error('Cart verification error:', error);
    return { success: false, message: 'Failed to verify stock.' };
  }
}


export async function searchProducts(query: string, limit: number, searchBy: 'all' | 'sku' = 'all') {
  if (!query) {
    return [];
  }
  const { products } = await getProducts({ query, limit, searchBy });
  return products;
}

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; message?: string; }> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, message: 'No file provided.' };
  }

  if (!process.env.AWS_ENDPOINT_URL_S3 || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return { success: false, message: 'S3 environment variables are not configured.' };
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const ext = file.name.split('.').pop() || 'jpg';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    }));

    const url = buildS3Url(key);
    return { success: true, url };
  } catch (error) {
    console.error('S3 upload error:', error);
    return { success: false, message: 'Failed to upload image.' };
  }
}

export async function syncUserWithNeon(profile: {
  uid: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
}) {
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, profile.uid),
    });

    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db.update(users).set({
        email: profile.email || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber || existingUser.phoneNumber,
        updatedAt: new Date(),
      }).where(eq(users.id, profile.uid)).returning();
      return { success: true, user: updatedUser };
    } else {
      // Create new user
      const [newUser] = await db.insert(users).values({
        id: profile.uid,
        email: profile.email || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
      }).returning();
      return { success: true, user: newUser };
    }
  } catch (error) {
    console.error('Sync User Error:', error);
    return { success: false, message: 'Failed to sync user with database.' };
  }
}

export async function getUserProfile(uid: string) {
  try {
    const profile = await db.query.users.findFirst({
      where: eq(users.id, uid),
    });
    return profile || null;
  } catch (error) {
    console.error('Get User Profile Error:', error);
    return null;
  }
}

export async function updateUserProfile(uid: string, data: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  district?: string;
}) {
  try {
    await db.update(users).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(users.id, uid));
    revalidatePath('/account/profile');
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    console.error('Update User Profile Error:', error);
    return { success: false, message: 'Failed to update profile.' };
  }
}

export async function getUserOrders(uid: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, uid),
      columns: { email: true }
    });

    const conditions = [eq(orders.userId, uid)];
    if (user?.email) {
      conditions.push(eq(orders.email, user.email));
    }

    const userOrders = await db.query.orders.findMany({
      where: or(...conditions),
      orderBy: desc(orders.createdAt),
      with: {
        items: {
          with: {
            product: true
          }
        },
      },
    });
    return userOrders;
  } catch (error) {
    console.error('Get User Orders Error:', error);
    return [];
  }
}

export async function getAllOrders() {
  try {
    const allOrders = await db.query.orders.findMany({
      orderBy: desc(orders.createdAt),
      with: {
        items: {
          with: {
            product: true
          }
        },
      },
    });
    return allOrders;
  } catch (error) {
    console.error('Get All Orders Error:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const orderRecord = await db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
          items: true,
        }
      });

      if (!order) throw new Error("Order not found");

      // Handle stock reversion if order is cancelled
      if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
        for (const item of order.items) {
          await tx
            .update(products)
            .set({
              stock: sql`${products.stock} + ${item.quantity}`,
            })
            .where(eq(products.id, item.productId));
        }
      }

      // Handle stock deduction if a cancelled order is moved back to active status
      if (order.orderStatus === 'cancelled' && status !== 'cancelled') {
        for (const item of order.items) {
          // Check stock first
          const product = await tx.query.products.findFirst({
            where: eq(products.id, item.productId),
            columns: { stock: true, name: true }
          });

          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for "${product?.name || 'product'}" to restore order.`);
          }

          await tx
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
            })
            .where(eq(products.id, item.productId));
        }
      }

      const updateData: any = {
        orderStatus: status,
        updatedAt: new Date(),
      };

      // Set specific timestamps based on status
      if (status === 'processing') updateData.processingAt = new Date();
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'delivered') {
        updateData.deliveredAt = new Date();
        updateData.paymentStatus = 'paid';
        updateData.paidAt = new Date();
      }
      if (status === 'cancelled') updateData.cancelledAt = new Date();

      await tx.update(orders).set(updateData).where(eq(orders.id, orderId));

      return order;
    });

    await logActivity({ event: 'ORDER_STATUS_UPDATE', message: `Order #${orderRecord?.orderNumber || orderId} status changed to "${status}".` });

    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');
    return { success: true, message: `Order status updated to ${status}.` };
  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return { success: false, message: error.message || 'Failed to update order status.' };
  }
}

export async function updatePaymentStatus(orderId: string, status: string) {
  try {
    const updateData: any = {
      paymentStatus: status,
      updatedAt: new Date(),
    };

    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const target = await db.query.orders.findFirst({ where: eq(orders.id, orderId), columns: { orderNumber: true } });

    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

    await logActivity({ event: 'PAYMENT_STATUS_UPDATE', message: `Order #${target?.orderNumber || orderId} payment status changed to "${status}".` });

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    return { success: true, message: `Payment status updated to ${status}.` };
  } catch (error) {
    console.error('Update Payment Status Error:', error);
    return { success: false, message: 'Failed to update payment status.' };
  }
}

export async function getAllUsers() {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: desc(users.createdAt),
    });
    return allUsers;
  } catch (error) {
    console.error('Get All Users Error:', error);
    return [];
  }
}

export async function getDashboardStats() {
  try {
    const totalOrdersCount = await db.select({ count: drizzleCount() }).from(orders);
    const totalProductsCount = await db.select({ count: drizzleCount() }).from(products);
    const totalCustomersCount = await db.select({ count: drizzleCount() }).from(users);

    // Calculate total revenue from PAID orders only
    const revenueResult = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)`
    }).from(orders).where(eq(orders.paymentStatus, 'paid'));

    const recentOrders = await db.query.orders.findMany({
      limit: 5,
      orderBy: desc(orders.createdAt),
      with: {
        items: true
      }
    });

    // Get sales data for the last 7 days (PAID only)
    const salesDataRaw = await db.select({
      date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
      total: sql<number>`SUM(CAST(${orders.totalAmount} AS NUMERIC))`
    })
      .from(orders)
      .where(eq(orders.paymentStatus, 'paid'))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(asc(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`));

    return {
      stats: {
        totalRevenue: Number(revenueResult[0]?.total || 0),
        totalSales: Number(totalOrdersCount[0]?.count || 0),
        totalProducts: Number(totalProductsCount[0]?.count || 0),
        totalCustomers: Number(totalCustomersCount[0]?.count || 0),
      },
      recentOrders,
      salesData: salesDataRaw.map(item => ({
        ...item,
        total: Number(item.total)
      })),
    };
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return {
      stats: { totalRevenue: 0, totalSales: 0, totalProducts: 0, totalCustomers: 0 },
      recentOrders: [],
      salesData: [],
    };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: {
        items: {
          with: {
            product: true
          }
        },
      },
    });
    return order || null;
  } catch (error) {
    console.error('Get Order By Number Error:', error);
    return null;
  }
}


// Review Actions
const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required.'),
  userName: z.string().min(1, 'Name is required.'),
  rating: z.coerce.number().min(1, 'Rating must be at least 1.').max(5, 'Rating must be at most 5.'),
  comment: z.string().optional(),
  userId: z.string().optional(),
});

export async function submitReview(data: unknown) {
  const validatedFields = reviewSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid review data.',
    };
  }

  const { productId, userName, rating, comment, userId } = validatedFields.data;

  try {
    await db.insert(reviews).values({
      id: createId(),
      productId,
      userId: userId || null,
      userName,
      rating,
      comment: comment || null,
      status: 'approved',
    });

    revalidatePath(`/product/[slug]`); // Only generic path revalidation works reliably without dynamic params
    return { success: true, message: 'Review submitted successfully.' };
  } catch (error: any) {
    console.error('Submit Review Error:', error);
    return { success: false, message: 'Failed to submit review.' };
  }
}

/**
 * Manual/POS Order System (Unified)
 * Handles in-shop purchases (local) and manual online orders (WhatsApp/Phone).
 */
export async function createOrderManual(
  data: {
    customerName?: string;
    customerMobile?: string;
    customerEmail?: string;
    customerAddress?: string;
    customerDistrict?: string;
    deliveryMethod?: string;
    deliveryFee?: number;
    paymentMethod: 'cash' | 'bkash' | 'nagad' | 'pos' | 'other';
    items: { id: string; quantity: number; price: number; name: string; discount?: number }[];
    orderSource: 'local' | 'online';
    orderStatus?: string;
    paymentStatus?: string;
    couponId?: string;
    discountAmount?: number;
  }
): Promise<{ success: true; orderNumber: string; totalAmount: number } | { success: false; message: string }> {
  try {
    const {
      customerName,
      customerMobile,
      customerEmail,
      customerAddress,
      customerDistrict,
      deliveryMethod,
      deliveryFee = 0,
      paymentMethod,
      items,
      orderSource = 'local',
      couponId,
      discountAmount = 0
    } = data;

    const isOnline = orderSource === 'online';
    const orderNumber = `${isOnline ? 'ONL' : 'POS'}-${Date.now().toString().slice(-6)}`;

    // Total calculation: sum(items) + deliveryFee - couponDiscount
    const itemsTotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const finalTotal = itemsTotal + Number(deliveryFee) - Number(discountAmount);

    const result: { success: true; orderNumber: string; totalAmount: number } = await db.transaction(async (tx) => {
      // 1. Stock Adjustment
      for (const item of items) {
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.id),
          columns: { stock: true, name: true }
        });

        if (!product) throw new Error(`Product "${item.name}" not found.`);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
        }

        await tx.update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
            updatedAt: new Date()
          })
          .where(eq(products.id, item.id));
      }

      // 1.5 Coupon Usage
      if (couponId) {
        await tx.update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.id, couponId));
      }

      // 2. Create Order Record
      const orderId = createId();
      await tx.insert(orders).values({
        id: orderId,
        orderNumber,
        firstName: customerName || 'Walk-in',
        lastName: isOnline ? '' : '',
        mobile: customerMobile || 'N/A',
        email: customerEmail || null,
        address: customerAddress || (isOnline ? '' : 'In-Shop Purchase'),
        district: customerDistrict || 'Gaibandha',
        deliveryMethod: deliveryMethod || 'gaibandha',
        deliveryFee: String(deliveryFee),
        totalAmount: String(finalTotal),
        paymentMethod,
        couponId: couponId || null,
        discountAmount: String(discountAmount),
        paymentStatus: isOnline ? (data.paymentStatus || 'pending') : 'paid',
        orderStatus: isOnline ? (data.orderStatus || 'pending') : 'delivered',
        orderSource: orderSource,
      });

      // 3. Order Items
      const orderItemsValues = items.map((item) => ({
        id: createId(),
        orderId: orderId,
        productId: item.id,
        quantity: item.quantity,
        price: String(item.price),
      }));

      await tx.insert(orderItems).values(orderItemsValues);

      return { success: true, orderNumber, totalAmount: finalTotal };
    });

    await logActivity({
      event: isOnline ? 'ORDER_CREATE' : 'POS_ORDER_CREATE',
      message: `${isOnline ? 'Online' : 'POS'} order ${orderNumber} created for Tk ${finalTotal} (${customerName || 'Walk-in'}).`,
    });

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');

    return result;
  } catch (error: any) {
    console.error('Order Creation Error:', error);
    return { success: false, message: error.message || "Failed to create order" };
  }
}

// COUPON ACTIONS
export async function getCoupons() {
  try {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return [];
  }
}

export async function createCoupon(data: any) {
  try {
    const id = createId();
    await db.insert(coupons).values({
      ...data,
      id,
      code: data.code.toUpperCase().trim(),
      discountValue: String(data.discountValue),
      minOrderAmount: String(data.minOrderAmount || 0),
      maxDiscountAmount: data.maxDiscountAmount ? String(data.maxDiscountAmount) : null,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      usedCount: 0,
    });
    await logActivity({ event: 'COUPON_CREATE', message: `Created coupon "${data.code.toUpperCase().trim()}".` });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create coupon:', error);
    return { success: false, message: error.message || 'Failed to create coupon' };
  }
}

export async function updateCoupon(id: string, data: any) {
  try {
    await db.update(coupons).set({
      ...data,
      code: data.code?.toUpperCase().trim(),
      discountValue: String(data.discountValue),
      minOrderAmount: String(data.minOrderAmount || 0),
      maxDiscountAmount: data.maxDiscountAmount ? String(data.maxDiscountAmount) : null,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      updatedAt: new Date(),
    }).where(eq(coupons.id, id));
    await logActivity({ event: 'COUPON_UPDATE', message: `Updated coupon "${data.code?.toUpperCase().trim() || id}".` });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error('Failed to update coupon:', error);
    return { success: false };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const target = await db.query.coupons.findFirst({ where: eq(coupons.id, id), columns: { code: true } });
    await db.delete(coupons).where(eq(coupons.id, id));
    await logActivity({ event: 'COUPON_DELETE', message: `Deleted coupon "${target?.code || id}".` });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    return { success: false };
  }
}

export async function validateCoupon(code: string, orderAmount: number) {
  try {
    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.code, code.toUpperCase().trim()),
        eq(coupons.isActive, true)
      )
    });

    if (!coupon) return { success: false, message: 'Invalid or inactive coupon code' };

    // Date check
    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) return { success: false, message: 'Coupon not yet active' };
    if (coupon.endDate && now > new Date(coupon.endDate)) return { success: false, message: 'Coupon expired' };

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { success: false, message: 'Coupon usage limit reached' };

    // Min amount check
    if (Number(coupon.minOrderAmount) > orderAmount) {
      return { success: false, message: `Minimum order amount of Tk ${coupon.minOrderAmount} required` };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    return { success: true, coupon, discount };
  } catch (error) {
    console.error('Failed to validate coupon:', error);
    return { success: false, message: 'Validation error' };
  }
}

// ADMIN AUTH ACTIONS
export async function loginAdmin(data: any) {
  const { identifier, password } = data;

  try {
    const admin = await db.query.admins.findFirst({
      where: and(
        or(
          eq(admins.username, identifier),
          eq(admins.email, identifier)
        ),
        eq(admins.isActive, true)
      )
    });

    if (!admin) {
      await logActivity({ event: 'AUTH_LOGIN', actor: identifier, status: 'failed', message: `Failed login attempt for "${identifier}": unknown account.` });
      return { success: false, message: "Invalid credentials." };
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      await logActivity({ event: 'AUTH_LOGIN', actor: admin.username, status: 'failed', message: `Failed login attempt for "${admin.username}": incorrect password.` });
      return { success: false, message: "Invalid credentials." };
    }

    (await cookies()).set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Optionally set another cookie for the admin's role/username if needed
    (await cookies()).set("admin_username", admin.username, {
      httpOnly: false, // accessible to client if needed for UI
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    await logActivity({ event: 'AUTH_LOGIN', actor: admin.username, message: `Admin "${admin.username}" authenticated successfully.` });

    return { success: true };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: "Something went wrong during login." };
  }
}

export async function logoutAdmin() {
  const username = (await cookies()).get("admin_username")?.value;
  await logActivity({ event: 'AUTH_LOGOUT', actor: username, message: `Admin "${username || 'unknown'}" logged out.` });
  (await cookies()).delete("admin_session");
  (await cookies()).delete("admin_username");
  redirect("/admin/login");
}

export async function getAllAdmins() {
  try {
    return await db.query.admins.findMany({
      orderBy: desc(admins.createdAt)
    });
  } catch (error) {
    console.error("Failed to fetch admins:", error);
    return [];
  }
}

export async function createAdmin(data: any) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const id = createId();
    await db.insert(admins).values({
      ...data,
      id,
      password: hashedPassword,
    });
    await logActivity({ event: 'ADMIN_CREATE', message: `Created staff account "${data.username}".` });
    revalidatePath('/admin/administration');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to create staff member." };
  }
}

export async function updateAdmin(id: string, data: any) {
  try {
    let updateData = { ...data, updatedAt: new Date() };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }

    await db.update(admins)
      .set(updateData)
      .where(eq(admins.id, id));

    await logActivity({ event: 'ADMIN_UPDATE', message: `Updated staff account "${data.username || id}".` });
    revalidatePath('/admin/administration');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update staff member." };
  }
}

export async function deleteAdmin(id: string) {
  try {
    // Prevent self-deletion if we had a session ID, but for now simple delete
    const target = await db.query.admins.findFirst({ where: eq(admins.id, id), columns: { username: true } });
    await db.delete(admins).where(eq(admins.id, id));
    await logActivity({ event: 'ADMIN_DELETE', message: `Deleted staff account "${target?.username || id}".` });
    revalidatePath('/admin/administration');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete staff member." };
  }
}

// Temporary Seed Function - call this if you need to create the first admin
export async function seedInitialAdmin() {
  try {
    const existing = await db.query.admins.findFirst({
      where: eq(admins.username, 'reyad')
    });

    if (existing) return { success: true, message: "Admin already exists" };

    const hashedPassword = await bcrypt.hash('12345678', 10);
    await db.insert(admins).values({
      username: 'reyad',
      email: 'asifreyad1@gmail.com',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true
    });
    return { success: true, message: "Initial Admin Seeded" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// SETTINGS ACTIONS
export async function getSettings() {
  try {
    return await db.query.settings.findMany();
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return [];
  }
}

// DELIVERY LOCATIONS ACTIONS
export async function getDeliveryLocations() {
  try {
    return await db.query.deliveryLocations.findMany({
      orderBy: (deliveryLocations, { asc }) => [asc(deliveryLocations.sortOrder), asc(deliveryLocations.name)],
    });
  } catch (error) {
    console.error("Failed to fetch delivery locations:", error);
    return [];
  }
}

const deliveryLocationSchema = z.object({
  name: z.string().min(1, "Location name is required."),
  fee: z.coerce.number().min(0, "Fee must be a positive number."),
  isDefault: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

export async function createDeliveryLocation(data: z.infer<typeof deliveryLocationSchema>) {
  const validated = deliveryLocationSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, message: validated.error.issues[0].message };
  }
  try {
    if (validated.data.isDefault) {
      await db.update(deliveryLocations).set({ isDefault: false });
    }
    await db.insert(deliveryLocations).values({
      id: createId(),
      name: validated.data.name,
      fee: String(validated.data.fee),
      isDefault: validated.data.isDefault || false,
      sortOrder: validated.data.sortOrder || 0,
    });
    revalidatePath('/admin/settings');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message?.includes('unique') ? 'A location with this name already exists.' : error.message };
  }
}

export async function updateDeliveryLocation(id: string, data: z.infer<typeof deliveryLocationSchema>) {
  const validated = deliveryLocationSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, message: validated.error.issues[0].message };
  }
  try {
    if (validated.data.isDefault) {
      await db.update(deliveryLocations).set({ isDefault: false });
    }
    await db.update(deliveryLocations)
      .set({
        name: validated.data.name,
        fee: String(validated.data.fee),
        isDefault: validated.data.isDefault || false,
        sortOrder: validated.data.sortOrder || 0,
        updatedAt: new Date(),
      })
      .where(eq(deliveryLocations.id, id));
    revalidatePath('/admin/settings');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message?.includes('unique') ? 'A location with this name already exists.' : error.message };
  }
}

export async function deleteDeliveryLocation(id: string) {
  try {
    await db.delete(deliveryLocations).where(eq(deliveryLocations.id, id));
    revalidatePath('/admin/settings');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getDeliveryFeeForLocation(locationName: string): Promise<number> {
  try {
    const location = await db.query.deliveryLocations.findFirst({
      where: eq(deliveryLocations.name, locationName),
    });
    if (location) return Number(location.fee);
    const fallback = await db.query.deliveryLocations.findFirst({
      orderBy: (deliveryLocations, { asc }) => [asc(deliveryLocations.sortOrder)],
    });
    return fallback ? Number(fallback.fee) : 100;
  } catch (error) {
    console.error("Failed to fetch delivery fee:", error);
    return 100;
  }
}

export async function updateSettings(data: { key: string, value: string }[]) {
  try {
    for (const item of data) {
      await db.insert(settings)
        .values({
          id: createId(),
          key: item.key,
          value: item.value,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: item.value,
            updatedAt: new Date()
          },
        });
    }
    await logActivity({ event: 'SETTINGS_UPDATE', message: `Updated ${data.length} setting${data.length === 1 ? '' : 's'}: ${data.map(d => d.key).join(', ')}.` });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function seedInitialSettings() {
  const defaults = [
    { key: 'site_name', value: 'Gadget Doptor', label: 'Shop Name', group: 'General' },
    { key: 'site_tagline', value: 'Best price in Bangladesh', label: 'Tagline', group: 'General' },
    { key: 'contact_email', value: 'support@gadgetdoptor.com', label: 'Email', group: 'Contact' },
    { key: 'contact_phone', value: '+880 1XXX-XXXXXX', label: 'Phone', group: 'Contact' },
    { key: 'contact_whatsapp', value: '+880 1XXX-XXXXXX', label: 'WhatsApp', group: 'Contact' },
    { key: 'contact_address', value: 'Dhaka, Bangladesh', label: 'Address', group: 'Contact' },
  ];

  try {
    for (const s of defaults) {
      await db.insert(settings)
        .values({
          id: createId(),
          key: s.key,
          value: s.value,
          label: s.label,
          group: s.group
        })
        .onConflictDoNothing();
    }
    return { success: true, message: "Settings seeded successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export async function submitContactForm(data: unknown) {
  const validatedFields = contactFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Please check your input.',
    };
  }

  try {
    await sendContactMessageNotification(validatedFields.data);
    return { success: true, message: "Message sent successfully! We'll get back to you soon." };
  } catch (error) {
    console.error('Contact Form Submission Error:', error);
    return { success: false, message: "Failed to send message. Please try again later." };
  }
}

// SYSTEM LOGS ACTIONS
export async function getSystemLogs(limit: number = 100) {
  try {
    return await db.query.activityLogs.findMany({
      orderBy: desc(activityLogs.createdAt),
      limit,
    });
  } catch (error) {
    console.error('Failed to fetch system logs:', error);
    return [];
  }
}

export async function getLogStats() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [[totalRow], [todayRow], [failedTodayRow]] = await Promise.all([
      db.select({ count: drizzleCount() }).from(activityLogs),
      db.select({ count: drizzleCount() }).from(activityLogs).where(sql`${activityLogs.createdAt} >= ${startOfDay}`),
      db.select({ count: drizzleCount() }).from(activityLogs).where(and(eq(activityLogs.status, 'failed'), sql`${activityLogs.createdAt} >= ${startOfDay}`)),
    ]);

    const total = totalRow?.count || 0;
    const today = todayRow?.count || 0;
    const failedToday = failedTodayRow?.count || 0;

    return { total, today, failedToday };
  } catch (error) {
    console.error('Failed to fetch log stats:', error);
    return { total: 0, today: 0, failedToday: 0 };
  }
}

export async function getReportsData(days: number = 30) {
  const emptyState = {
    stats: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      totalCustomers: 0,
      revenueGrowth: 0,
      lowStockCount: 0,
    },
    revenueTrend: [] as { date: string; total: number }[],
    orderStatusBreakdown: [] as { status: string; count: number }[],
    paymentMethodBreakdown: [] as { method: string; count: number; total: number }[],
    topProducts: [] as { id: string; name: string; image: string | null; quantitySold: number; revenue: number }[],
    topCategories: [] as { id: string; name: string; revenue: number; unitsSold: number }[],
  };

  try {
    const now = new Date();
    const rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - (days - 1));
    rangeStart.setHours(0, 0, 0, 0);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      revenueResult,
      paidOrdersCount,
      totalCustomersCount,
      lowStockResult,
      thisMonthRevenueResult,
      lastMonthRevenueResult,
      revenueTrendRaw,
      orderStatusRaw,
      paymentMethodRaw,
      topProductsRaw,
      topCategoriesRaw,
    ] = await Promise.all([
      db.select({ total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)` })
        .from(orders).where(eq(orders.paymentStatus, 'paid')),
      db.select({ count: drizzleCount() }).from(orders).where(eq(orders.paymentStatus, 'paid')),
      db.select({ count: drizzleCount() }).from(users),
      db.select({ count: drizzleCount() }).from(products).where(sql`${products.stock} <= 5`),
      db.select({ total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)` })
        .from(orders).where(and(eq(orders.paymentStatus, 'paid'), sql`${orders.createdAt} >= ${startOfThisMonth}`)),
      db.select({ total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)` })
        .from(orders).where(and(
          eq(orders.paymentStatus, 'paid'),
          sql`${orders.createdAt} >= ${startOfLastMonth}`,
          sql`${orders.createdAt} < ${startOfThisMonth}`
        )),
      db.select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        total: sql<number>`SUM(CAST(${orders.totalAmount} AS NUMERIC))`,
      })
        .from(orders)
        .where(and(eq(orders.paymentStatus, 'paid'), sql`${orders.createdAt} >= ${rangeStart}`))
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(asc(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)),
      db.select({ status: orders.orderStatus, count: drizzleCount() })
        .from(orders)
        .groupBy(orders.orderStatus),
      db.select({
        method: orders.paymentMethod,
        count: drizzleCount(),
        total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)`,
      })
        .from(orders)
        .where(eq(orders.paymentStatus, 'paid'))
        .groupBy(orders.paymentMethod),
      db.select({
        id: products.id,
        name: products.name,
        image: sql<string>`${products.images}[1]`,
        quantitySold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<number>`SUM(${orderItems.quantity} * CAST(${orderItems.price} AS NUMERIC))`,
      })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orders.paymentStatus, 'paid'))
        .groupBy(products.id, products.name, products.images)
        .orderBy(desc(sql`SUM(${orderItems.quantity} * CAST(${orderItems.price} AS NUMERIC))`))
        .limit(5),
      db.select({
        id: categories.id,
        name: categories.name,
        revenue: sql<number>`SUM(${orderItems.quantity} * CAST(${orderItems.price} AS NUMERIC))`,
        unitsSold: sql<number>`SUM(${orderItems.quantity})`,
      })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(orders.paymentStatus, 'paid'))
        .groupBy(categories.id, categories.name)
        .orderBy(desc(sql`SUM(${orderItems.quantity} * CAST(${orderItems.price} AS NUMERIC))`))
        .limit(5),
    ]);

    const totalRevenue = Number(revenueResult[0]?.total || 0);
    const totalOrders = Number(paidOrdersCount[0]?.count || 0);
    const thisMonthRevenue = Number(thisMonthRevenueResult[0]?.total || 0);
    const lastMonthRevenue = Number(lastMonthRevenueResult[0]?.total || 0);
    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : (thisMonthRevenue > 0 ? 100 : 0);

    return {
      stats: {
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        totalCustomers: Number(totalCustomersCount[0]?.count || 0),
        revenueGrowth,
        lowStockCount: Number(lowStockResult[0]?.count || 0),
      },
      revenueTrend: revenueTrendRaw.map(item => ({ date: item.date, total: Number(item.total) })),
      orderStatusBreakdown: orderStatusRaw.map(item => ({ status: item.status, count: Number(item.count) })),
      paymentMethodBreakdown: paymentMethodRaw.map(item => ({
        method: item.method,
        count: Number(item.count),
        total: Number(item.total),
      })),
      topProducts: topProductsRaw.map(item => ({
        ...item,
        quantitySold: Number(item.quantitySold),
        revenue: Number(item.revenue),
      })),
      topCategories: topCategoriesRaw.map(item => ({
        ...item,
        revenue: Number(item.revenue),
        unitsSold: Number(item.unitsSold),
      })),
    };
  } catch (error) {
    console.error('Get Reports Data Error:', error);
    return emptyState;
  }
}
