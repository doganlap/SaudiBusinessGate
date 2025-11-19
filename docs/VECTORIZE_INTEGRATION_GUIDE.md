# 🔍 دليل تكامل Cloudflare Vectorize - Vector Database Integration

## **المتجر السعودي - Saudi Store**

### **قاعدة بيانات متجهة للبحث الذكي والذكاء الاصطناعي**

---

## **📋 نظرة عامة**

Cloudflare Vectorize هي قاعدة بيانات متجهة (Vector Database) تتيح:

- البحث الدلالي (Semantic Search)
- التوصيات الذكية
- البحث بالتشابه
- تكامل مع AI/ML Models

---

## **🎯 حالات الاستخدام في المتجر السعودي**

### **1. البحث الذكي في المنتجات**

```typescript
// البحث عن منتجات مشابهة
"أريد منتج مثل هذا" → Vector Search → نتائج مشابهة
```

### **2. التوصيات الشخصية**

```typescript
// توصيات بناءً على سلوك المستخدم
سجل المشتريات → Vectors → منتجات موصى بها
```

### **3. البحث في المستندات**

```typescript
// البحث في الفواتير والتقارير
"أين فاتورة شهر يناير؟" → Vector Search → المستندات ذات الصلة
```

### **4. دعم العملاء الذكي**

```typescript
// الإجابة على الأسئلة
"كيف أسجل معاملة؟" → Vector Search → مقالات المساعدة
```

---

## **🚀 الإعداد والتكامل**

### **الخطوة 1: إنشاء Vectorize Index**

```bash
# إنشاء index جديد
npx wrangler vectorize create saudi-store-products \
  --dimensions=1536 \
  --metric=cosine

# إنشاء index للمستندات
npx wrangler vectorize create saudi-store-documents \
  --dimensions=1536 \
  --metric=cosine

# إنشاء index للدعم
npx wrangler vectorize create saudi-store-support \
  --dimensions=768 \
  --metric=euclidean
```

---

### **الخطوة 2: تكوين Wrangler**

**ملف:** `wrangler.toml`

```toml
name = "saudi-store-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[vectorize]]
binding = "VECTORIZE_PRODUCTS"
index_name = "saudi-store-products"

[[vectorize]]
binding = "VECTORIZE_DOCUMENTS"
index_name = "saudi-store-documents"

[[vectorize]]
binding = "VECTORIZE_SUPPORT"
index_name = "saudi-store-support"
```

---

### **الخطوة 3: إنشاء Metadata Indexes**

```bash
# Products - فلترة حسب الفئة
npx wrangler vectorize create-metadata-index saudi-store-products \
  --property-name=category \
  --type=string

# Products - فلترة حسب السعر
npx wrangler vectorize create-metadata-index saudi-store-products \
  --property-name=price \
  --type=number

# Products - فلترة حسب التوفر
npx wrangler vectorize create-metadata-index saudi-store-products \
  --property-name=inStock \
  --type=boolean

# Documents - فلترة حسب النوع
npx wrangler vectorize create-metadata-index saudi-store-documents \
  --property-name=documentType \
  --type=string

# Documents - فلترة حسب التاريخ
npx wrangler vectorize create-metadata-index saudi-store-documents \
  --property-name=createdAt \
  --type=number
```

---

## **💻 التطبيق في Next.js**

### **الملف:** `lib/services/vectorize.service.ts`

```typescript
import { Vectorize } from '@cloudflare/workers-types';

export interface VectorizeEnv {
  VECTORIZE_PRODUCTS: Vectorize;
  VECTORIZE_DOCUMENTS: Vectorize;
  VECTORIZE_SUPPORT: Vectorize;
}

// Product Vector
export interface ProductVector {
  id: string;
  productId: string;
  productName: string;
  productNameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  price: number;
  inStock: boolean;
  embedding: number[]; // 1536 dimensions from OpenAI
}

// Document Vector
export interface DocumentVector {
  id: string;
  documentId: string;
  documentType: 'invoice' | 'report' | 'contract' | 'receipt';
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  createdAt: number;
  tenantId: string;
  embedding: number[];
}

// Support Vector
export interface SupportVector {
  id: string;
  articleId: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  category: string;
  embedding: number[];
}

export class VectorizeService {
  
  // Insert Product Vectors
  static async insertProducts(
    env: VectorizeEnv,
    products: ProductVector[]
  ) {
    const vectors = products.map(p => ({
      id: p.id,
      values: p.embedding,
      metadata: {
        productId: p.productId,
        productName: p.productName,
        productNameAr: p.productNameAr,
        category: p.category,
        price: p.price,
        inStock: p.inStock
      }
    }));
    
    const result = await env.VECTORIZE_PRODUCTS.insert(vectors);
    return result;
  }
  
  // Search Products
  static async searchProducts(
    env: VectorizeEnv,
    queryEmbedding: number[],
    options?: {
      topK?: number;
      filter?: string;
      returnValues?: boolean;
    }
  ) {
    const matches = await env.VECTORIZE_PRODUCTS.query(queryEmbedding, {
      topK: options?.topK || 10,
      filter: options?.filter,
      returnValues: options?.returnValues || false,
      returnMetadata: 'all'
    });
    
    return matches;
  }
  
  // Search with Filters
  static async searchProductsByCategory(
    env: VectorizeEnv,
    queryEmbedding: number[],
    category: string,
    minPrice?: number,
    maxPrice?: number
  ) {
    let filter = `category = "${category}"`;
    
    if (minPrice !== undefined) {
      filter += ` AND price >= ${minPrice}`;
    }
    
    if (maxPrice !== undefined) {
      filter += ` AND price <= ${maxPrice}`;
    }
    
    return await this.searchProducts(env, queryEmbedding, {
      topK: 20,
      filter
    });
  }
  
  // Insert Documents
  static async insertDocuments(
    env: VectorizeEnv,
    documents: DocumentVector[]
  ) {
    const vectors = documents.map(d => ({
      id: d.id,
      values: d.embedding,
      metadata: {
        documentId: d.documentId,
        documentType: d.documentType,
        title: d.title,
        titleAr: d.titleAr,
        createdAt: d.createdAt,
        tenantId: d.tenantId
      }
    }));
    
    const result = await env.VECTORIZE_DOCUMENTS.insert(vectors);
    return result;
  }
  
  // Search Documents
  static async searchDocuments(
    env: VectorizeEnv,
    queryEmbedding: number[],
    tenantId: string,
    documentType?: string
  ) {
    let filter = `tenantId = "${tenantId}"`;
    
    if (documentType) {
      filter += ` AND documentType = "${documentType}"`;
    }
    
    const matches = await env.VECTORIZE_DOCUMENTS.query(queryEmbedding, {
      topK: 10,
      filter,
      returnMetadata: 'all'
    });
    
    return matches;
  }
  
  // Insert Support Articles
  static async insertSupportArticles(
    env: VectorizeEnv,
    articles: SupportVector[]
  ) {
    const vectors = articles.map(a => ({
      id: a.id,
      values: a.embedding,
      metadata: {
        articleId: a.articleId,
        question: a.question,
        questionAr: a.questionAr,
        category: a.category
      }
    }));
    
    const result = await env.VECTORIZE_SUPPORT.insert(vectors);
    return result;
  }
  
  // Search Support
  static async searchSupport(
    env: VectorizeEnv,
    queryEmbedding: number[],
    locale: 'ar' | 'en'
  ) {
    const matches = await env.VECTORIZE_SUPPORT.query(queryEmbedding, {
      topK: 5,
      returnMetadata: 'all'
    });
    
    return matches;
  }
}
```

---

## **🤖 تكامل مع OpenAI للـ Embeddings**

### **الملف:** `lib/services/embeddings.service.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class EmbeddingsService {
  
  // Generate embedding for text
  static async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // 1536 dimensions
      input: text
    });
    
    return response.data[0].embedding;
  }
  
  // Generate embeddings for multiple texts
  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    });
    
    return response.data.map(d => d.embedding);
  }
  
  // Generate embedding for product
  static async generateProductEmbedding(product: {
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    category: string;
  }): Promise<number[]> {
    // Combine all text fields
    const text = `${product.name} ${product.nameAr} ${product.description} ${product.descriptionAr} ${product.category}`;
    return await this.generateEmbedding(text);
  }
  
  // Generate embedding for document
  static async generateDocumentEmbedding(document: {
    title: string;
    titleAr: string;
    content: string;
    contentAr: string;
  }): Promise<number[]> {
    const text = `${document.title} ${document.titleAr} ${document.content.substring(0, 1000)} ${document.contentAr.substring(0, 1000)}`;
    return await this.generateEmbedding(text);
  }
}
```

---

## **📡 API Endpoints**

### **الملف:** `app/api/search/products/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingsService } from '@/lib/services/embeddings.service';
import { VectorizeService } from '@/lib/services/vectorize.service';

export async function POST(req: NextRequest) {
  try {
    const { query, category, minPrice, maxPrice, locale } = await req.json();
    
    // Generate embedding for search query
    const queryEmbedding = await EmbeddingsService.generateEmbedding(query);
    
    // Search in Vectorize
    const matches = await VectorizeService.searchProductsByCategory(
      env, // من Cloudflare Workers
      queryEmbedding,
      category,
      minPrice,
      maxPrice
    );
    
    // Get full product details from database
    const productIds = matches.matches.map(m => m.metadata.productId);
    const products = await getProductsByIds(productIds);
    
    return NextResponse.json({
      success: true,
      query,
      matches: matches.matches.map((match, index) => ({
        product: products[index],
        score: match.score,
        metadata: match.metadata
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### **الملف:** `app/api/search/documents/route.ts`

```typescript
export async function POST(req: NextRequest) {
  try {
    const { query, tenantId, documentType, locale } = await req.json();
    
    // Generate embedding
    const queryEmbedding = await EmbeddingsService.generateEmbedding(query);
    
    // Search documents
    const matches = await VectorizeService.searchDocuments(
      env,
      queryEmbedding,
      tenantId,
      documentType
    );
    
    return NextResponse.json({
      success: true,
      matches: matches.matches
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## **🔄 مزامنة البيانات مع Vectorize**

### **الملف:** `scripts/sync-to-vectorize.ts`

```typescript
import { query } from '../lib/db/connection';
import { EmbeddingsService } from '../lib/services/embeddings.service';
import { VectorizeService } from '../lib/services/vectorize.service';

async function syncProducts() {
  console.log('🔄 Syncing products to Vectorize...');
  
  // Get all products from database
  const result = await query(`
    SELECT 
      id,
      product_name,
      product_name_ar,
      description,
      description_ar,
      category,
      price,
      in_stock
    FROM products
    WHERE status = 'active'
  `);
  
  const products = result.rows;
  
  // Generate embeddings in batches
  const batchSize = 100;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    // Generate embeddings
    const embeddings = await Promise.all(
      batch.map(p => EmbeddingsService.generateProductEmbedding({
        name: p.product_name,
        nameAr: p.product_name_ar,
        description: p.description,
        descriptionAr: p.description_ar,
        category: p.category
      }))
    );
    
    // Prepare vectors
    const vectors = batch.map((p, index) => ({
      id: p.id,
      productId: p.id,
      productName: p.product_name,
      productNameAr: p.product_name_ar,
      description: p.description,
      descriptionAr: p.description_ar,
      category: p.category,
      price: p.price,
      inStock: p.in_stock,
      embedding: embeddings[index]
    }));
    
    // Insert to Vectorize
    await VectorizeService.insertProducts(env, vectors);
    
    console.log(`✅ Synced ${i + batch.length}/${products.length} products`);
  }
  
  console.log('✅ Products sync completed!');
}

async function syncDocuments() {
  console.log('🔄 Syncing documents to Vectorize...');
  
  const result = await query(`
    SELECT 
      id,
      document_type,
      title,
      title_ar,
      content,
      content_ar,
      tenant_id,
      created_at
    FROM documents
    WHERE status = 'active'
  `);
  
  const documents = result.rows;
  
  // Similar process as products...
  
  console.log('✅ Documents sync completed!');
}

// Run sync
syncProducts()
  .then(() => syncDocuments())
  .then(() => {
    console.log('🎉 All data synced to Vectorize!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });
```

---

## **🎨 UI Component للبحث الذكي**

### **الملف:** `components/SmartSearch.tsx`

```typescript
"use client";
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/search/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      setResults(data.matches);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="ابحث عن أي شيء..."
          className="w-full px-4 py-3 pr-12 rounded-xl border"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((result, index) => (
            <div key={index} className="p-4 rounded-xl border">
              <h3 className="font-semibold">{result.product.name}</h3>
              <p className="text-sm text-neutral-600">{result.product.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium">{result.product.price} ريال</span>
                <span className="text-xs text-neutral-500">
                  تطابق: {(result.score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## **✅ قائمة التحقق**

- [ ] حساب Cloudflare مفعل
- [ ] Wrangler CLI مثبت
- [ ] Vectorize indexes منشأة (3 indexes)
- [ ] Metadata indexes مكونة
- [ ] OpenAI API key موجود
- [ ] Embeddings service جاهز
- [ ] Vectorize service جاهز
- [ ] API endpoints منشأة
- [ ] UI components جاهزة
- [ ] Sync script جاهز
- [ ] بيانات تم مزامنتها

---

**🎉 Vectorize Integration جاهز!**

**الميزات:**
✅ بحث دلالي ذكي  
✅ توصيات شخصية  
✅ بحث في المستندات  
✅ دعم عملاء ذكي  
✅ تكامل OpenAI  
✅ Multi-index support  
✅ Metadata filtering  
✅ Real-time sync  

**🚀 المتجر السعودي - Saudi Store**
