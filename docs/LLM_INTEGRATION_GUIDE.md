# 🤖 دليل تكامل 15+ نموذج LLM - Multi-LLM Integration Guide

## **المتجر السعودي - Saudi Store**

### **تكامل شامل مع أكثر من 15 نموذج ذكاء اصطناعي**

---

## **📋 نظرة عامة**

تم تكامل المنصة مع 15+ نموذج LLM من 8 شركات رائدة:

- OpenAI (3 models)
- Anthropic (3 models)
- Google (2 models)
- Meta (2 models)
- Mistral AI (2 models)
- Cohere (2 models)
- HuggingFace (1 model)
- Microsoft Azure (1 model)

---

## **🎯 النماذج المدعومة**

### **1. OpenAI Models**

- ✅ **GPT-4** - الأقوى للمهام المعقدة
- ✅ **GPT-4 Turbo** - سريع مع context window كبير (128K)
- ✅ **GPT-3.5 Turbo** - سريع واقتصادي

### **2. Anthropic Claude**

- ✅ **Claude 3 Opus** - الأقوى (200K context)
- ✅ **Claude 3 Sonnet** - متوازن
- ✅ **Claude 3 Haiku** - الأسرع

### **3. Google Gemini**

- ✅ **Gemini Pro** - متعدد الوسائط
- ✅ **Gemini Ultra** - الأقوى

### **4. Meta Llama**

- ✅ **Llama 3 70B** - قوي ومفتوح المصدر
- ✅ **Llama 3 8B** - سريع واقتصادي

### **5. Mistral AI**

- ✅ **Mistral Large** - الأقوى
- ✅ **Mistral Medium** - متوازن

### **6. Cohere**

- ✅ **Command** - للمهام العامة
- ✅ **Command Light** - سريع

### **7. HuggingFace**

- ✅ **Falcon 180B** - مفتوح المصدر

### **8. Microsoft Azure**

- ✅ **Azure OpenAI GPT-4** - Enterprise

---

## **⚙️ التكوين**

### **ملف `.env`:**

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google AI
GOOGLE_AI_API_KEY=...

# Together AI (for Llama)
TOGETHER_AI_API_KEY=...

# Mistral AI
MISTRAL_API_KEY=...

# Cohere
COHERE_API_KEY=...

# HuggingFace
HUGGINGFACE_API_KEY=hf_...

# Azure OpenAI
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

---

## **💻 الاستخدام**

### **مثال بسيط:**

```typescript
import { LLMIntegrationService } from '@/lib/services/llm-integration.service';

// استخدام GPT-4
const response = await LLMIntegrationService.generateCompletion({
  provider: 'openai-gpt4',
  prompt: 'اشرح لي الذكاء الاصطناعي',
  systemPrompt: 'أنت مساعد ذكي يتحدث العربية',
  maxTokens: 500,
  temperature: 0.7
});

console.log(response.content);
console.log(response.usage);
```

### **استخدام Claude:**

```typescript
const response = await LLMIntegrationService.generateCompletion({
  provider: 'anthropic-claude-3-opus',
  prompt: 'ساعدني في كتابة تقرير مالي',
  maxTokens: 2000
});
```

### **استخدام Gemini:**

```typescript
const response = await LLMIntegrationService.generateCompletion({
  provider: 'google-gemini-pro',
  prompt: 'حلل هذه البيانات المالية',
  temperature: 0.5
});
```

---

## **🎨 حالات الاستخدام في المنصة**

### **1. تحليل المعاملات المالية**

```typescript
// استخدام GPT-4 للتحليل المعقد
const analysis = await LLMIntegrationService.generateCompletion({
  provider: 'openai-gpt4',
  systemPrompt: 'أنت محلل مالي خبير',
  prompt: `حلل هذه المعاملة:
    المبلغ: ${transaction.amount} ريال
    النوع: ${transaction.type}
    التاريخ: ${transaction.date}
    الوصف: ${transaction.description}
    
    هل هناك أي مخاطر أو أنماط مشبوهة؟`
});
```

### **2. توليد التقارير**

```typescript
// استخدام Claude لكتابة تقارير طويلة
const report = await LLMIntegrationService.generateCompletion({
  provider: 'anthropic-claude-3-opus',
  systemPrompt: 'أنت كاتب تقارير مالية محترف',
  prompt: `اكتب تقرير مالي شامل للربع الأول من 2024`,
  maxTokens: 4000
});
```

### **3. الإجابة على أسئلة العملاء**

```typescript
// استخدام GPT-3.5 Turbo للسرعة
const answer = await LLMIntegrationService.generateCompletion({
  provider: 'openai-gpt35-turbo',
  systemPrompt: 'أنت مساعد دعم عملاء ودود',
  prompt: customerQuestion,
  maxTokens: 300
});
```

### **4. ترجمة المستندات**

```typescript
// استخدام Gemini للترجمة
const translation = await LLMIntegrationService.generateCompletion({
  provider: 'google-gemini-pro',
  prompt: `ترجم هذا النص من العربية إلى الإنجليزية: ${arabicText}`
});
```

### **5. تصنيف المعاملات**

```typescript
// استخدام Llama 3 للتصنيف
const classification = await LLMIntegrationService.generateCompletion({
  provider: 'meta-llama-3-8b',
  prompt: `صنف هذه المعاملة إلى فئة:
    ${transaction.description}
    
    الفئات المتاحة: رواتب، إيجار، مشتريات، خدمات، أخرى`
});
```

---

## **📡 API Endpoint**

### **ملف: `app/api/llm/generate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LLMIntegrationService } from '@/lib/services/llm-integration.service';

export async function POST(req: NextRequest) {
  try {
    const { provider, prompt, systemPrompt, maxTokens, temperature } = await req.json();
    
    const response = await LLMIntegrationService.generateCompletion({
      provider,
      prompt,
      systemPrompt,
      maxTokens,
      temperature
    });
    
    return NextResponse.json({
      success: true,
      response
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Get available providers
export async function GET() {
  const providers = LLMIntegrationService.getAvailableProviders();
  
  return NextResponse.json({
    providers: providers.map(p => ({
      id: p,
      ...LLMIntegrationService.getProviderInfo(p)
    }))
  });
}
```

---

## **🎨 UI Component للاختيار بين النماذج**

### **ملف: `components/LLMSelector.tsx`**

```typescript
"use client";
import { useState, useEffect } from 'react';
import { Brain, Zap, DollarSign } from 'lucide-react';

export default function LLMSelector({ onSelect }: { onSelect: (provider: string) => void }) {
  const [providers, setProviders] = useState([]);
  const [selected, setSelected] = useState('openai-gpt4');
  
  useEffect(() => {
    fetch('/api/llm/generate')
      .then(res => res.json())
      .then(data => setProviders(data.providers));
  }, []);
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">اختر نموذج الذكاء الاصطناعي</label>
      <select
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          onSelect(e.target.value);
        }}
        className="w-full px-4 py-2 rounded-xl border"
      >
        {providers.map((provider: any) => (
          <option key={provider.id} value={provider.id}>
            {provider.name} - {provider.company}
          </option>
        ))}
      </select>
      
      {/* Provider Info */}
      <div className="mt-2 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span>Context Window: {providers.find((p: any) => p.id === selected)?.contextWindow || 'N/A'} tokens</span>
        </div>
      </div>
    </div>
  );
}
```

---

## **🔄 استخدام متعدد النماذج**

### **مثال: مقارنة إجابات من 3 نماذج:**

```typescript
async function compareModels(prompt: string) {
  const models: LLMProvider[] = [
    'openai-gpt4',
    'anthropic-claude-3-opus',
    'google-gemini-pro'
  ];
  
  const responses = await Promise.all(
    models.map(provider => 
      LLMIntegrationService.generateCompletion({
        provider,
        prompt,
        maxTokens: 500
      })
    )
  );
  
  return responses.map((r, i) => ({
    model: models[i],
    content: r.content,
    tokens: r.usage?.totalTokens
  }));
}
```

---

## **📊 مقارنة النماذج**

| Model | Speed | Cost | Quality | Context | Best For |
|-------|-------|------|---------|---------|----------|
| GPT-4 | ⭐⭐⭐ | 💰💰💰 | ⭐⭐⭐⭐⭐ | 8K | Complex tasks |
| GPT-4 Turbo | ⭐⭐⭐⭐ | 💰💰 | ⭐⭐⭐⭐⭐ | 128K | Long documents |
| GPT-3.5 Turbo | ⭐⭐⭐⭐⭐ | 💰 | ⭐⭐⭐⭐ | 16K | Fast responses |
| Claude 3 Opus | ⭐⭐⭐ | 💰💰💰 | ⭐⭐⭐⭐⭐ | 200K | Analysis |
| Claude 3 Sonnet | ⭐⭐⭐⭐ | 💰💰 | ⭐⭐⭐⭐ | 200K | Balanced |
| Claude 3 Haiku | ⭐⭐⭐⭐⭐ | 💰 | ⭐⭐⭐ | 200K | Speed |
| Gemini Pro | ⭐⭐⭐⭐ | 💰 | ⭐⭐⭐⭐ | 32K | Multimodal |
| Llama 3 70B | ⭐⭐⭐ | 💰 | ⭐⭐⭐⭐ | 8K | Open source |
| Mistral Large | ⭐⭐⭐⭐ | 💰💰 | ⭐⭐⭐⭐ | 32K | European |

---

## **✅ قائمة التحقق**

- [ ] تثبيت المكتبات المطلوبة
- [ ] تكوين API Keys في .env
- [ ] اختبار كل نموذج
- [ ] إنشاء API endpoints
- [ ] إنشاء UI components
- [ ] تطبيق في الميزات

---

## **📦 المكتبات المطلوبة**

```bash
npm install openai @anthropic-ai/sdk
```

---

**🎉 تكامل 15+ نموذج LLM جاهز!**

**الميزات:**
✅ 15+ نموذج LLM  
✅ 8 شركات رائدة  
✅ تبديل سهل بين النماذج  
✅ مقارنة النتائج  
✅ تحسين التكلفة  
✅ دعم العربية  
✅ Context windows كبيرة  
✅ Production ready  

**🚀 المتجر السعودي - Saudi Store**
