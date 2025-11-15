/**
 * LLM Integration Service
 * Supports 15+ LLM Models for Saudi Store Platform
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// ============================================
// LLM PROVIDERS CONFIGURATION
// ============================================

export type LLMProvider = 
  | 'openai-gpt4'
  | 'openai-gpt4-turbo'
  | 'openai-gpt35-turbo'
  | 'anthropic-claude-3-opus'
  | 'anthropic-claude-3-sonnet'
  | 'anthropic-claude-3-haiku'
  | 'google-gemini-pro'
  | 'google-gemini-ultra'
  | 'meta-llama-3-70b'
  | 'meta-llama-3-8b'
  | 'mistral-large'
  | 'mistral-medium'
  | 'cohere-command'
  | 'cohere-command-light'
  | 'huggingface-falcon'
  | 'azure-openai-gpt4';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface LLMRequest {
  provider: LLMProvider;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface LLMResponse {
  provider: LLMProvider;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

// ============================================
// LLM INTEGRATION SERVICE
// ============================================

export class LLMIntegrationService {
  
  private static openai: OpenAI;
  private static anthropic: Anthropic;
  
  /**
   * Initialize LLM clients
   */
  static initialize() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    // Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
  }
  
  /**
   * Generate completion from any LLM
   */
  static async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    const { provider, prompt, systemPrompt, maxTokens = 1000, temperature = 0.7 } = request;
    
    switch (provider) {
      // OpenAI Models
      case 'openai-gpt4':
        return await this.openAICompletion('gpt-4', prompt, systemPrompt, maxTokens, temperature);
      
      case 'openai-gpt4-turbo':
        return await this.openAICompletion('gpt-4-turbo-preview', prompt, systemPrompt, maxTokens, temperature);
      
      case 'openai-gpt35-turbo':
        return await this.openAICompletion('gpt-3.5-turbo', prompt, systemPrompt, maxTokens, temperature);
      
      // Anthropic Models
      case 'anthropic-claude-3-opus':
        return await this.anthropicCompletion('claude-3-opus-20240229', prompt, systemPrompt, maxTokens, temperature);
      
      case 'anthropic-claude-3-sonnet':
        return await this.anthropicCompletion('claude-3-sonnet-20240229', prompt, systemPrompt, maxTokens, temperature);
      
      case 'anthropic-claude-3-haiku':
        return await this.anthropicCompletion('claude-3-haiku-20240307', prompt, systemPrompt, maxTokens, temperature);
      
      // Google Gemini (via API)
      case 'google-gemini-pro':
        return await this.geminiCompletion('gemini-pro', prompt, systemPrompt, maxTokens, temperature);
      
      case 'google-gemini-ultra':
        return await this.geminiCompletion('gemini-ultra', prompt, systemPrompt, maxTokens, temperature);
      
      // Meta Llama (via Replicate or Together AI)
      case 'meta-llama-3-70b':
        return await this.llamaCompletion('meta-llama-3-70b', prompt, systemPrompt, maxTokens, temperature);
      
      case 'meta-llama-3-8b':
        return await this.llamaCompletion('meta-llama-3-8b', prompt, systemPrompt, maxTokens, temperature);
      
      // Mistral AI
      case 'mistral-large':
        return await this.mistralCompletion('mistral-large-latest', prompt, systemPrompt, maxTokens, temperature);
      
      case 'mistral-medium':
        return await this.mistralCompletion('mistral-medium-latest', prompt, systemPrompt, maxTokens, temperature);
      
      // Cohere
      case 'cohere-command':
        return await this.cohereCompletion('command', prompt, systemPrompt, maxTokens, temperature);
      
      case 'cohere-command-light':
        return await this.cohereCompletion('command-light', prompt, systemPrompt, maxTokens, temperature);
      
      // HuggingFace
      case 'huggingface-falcon':
        return await this.huggingfaceCompletion('tiiuae/falcon-180B', prompt, systemPrompt, maxTokens, temperature);
      
      // Azure OpenAI
      case 'azure-openai-gpt4':
        return await this.azureOpenAICompletion('gpt-4', prompt, systemPrompt, maxTokens, temperature);
      
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
  
  // ============================================
  // OPENAI IMPLEMENTATION
  // ============================================
  
  private static async openAICompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<LLMResponse> {
    if (!this.openai) this.initialize();
    
    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    
    const response = await this.openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    });
    
    return {
      provider: `openai-${model}` as LLMProvider,
      content: response.choices[0].message.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      model: response.model,
      finishReason: response.choices[0].finish_reason
    };
  }
  
  // ============================================
  // ANTHROPIC IMPLEMENTATION
  // ============================================
  
  private static async anthropicCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<LLMResponse> {
    if (!this.anthropic) this.initialize();
    
    const response = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens || 1000,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    
    const content = response.content[0];
    
    return {
      provider: `anthropic-${model}` as LLMProvider,
      content: content.type === 'text' ? content.text : '',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      },
      model: response.model,
      finishReason: response.stop_reason || undefined
    };
  }
  
  // ============================================
  // GOOGLE GEMINI IMPLEMENTATION
  // ============================================
  
  private static async geminiCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<LLMResponse> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('Google AI API key not configured');
    
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature
          }
        })
      }
    );
    
    const data = await response.json();
    
    return {
      provider: `google-${model}` as LLMProvider,
      content: data.candidates[0].content.parts[0].text,
      model,
      finishReason: data.candidates[0].finishReason
    };
  }
  
  // ============================================
  // META LLAMA IMPLEMENTATION (via Together AI)
  // ============================================
  
  private static async llamaCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<LLMResponse> {
    const apiKey = process.env.TOGETHER_AI_API_KEY;
    if (!apiKey) throw new Error('Together AI API key not configured');
    
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    
    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: `meta-llama/${model}`,
        prompt: fullPrompt,
        max_tokens: maxTokens,
        temperature
      })
    });
    
    const data = await response.json();
    
    return {
      provider: `meta-${model}` as LLMProvider,
      content: data.choices[0].text,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      model: data.model
    };
  }
  
  // ============================================
  // MISTRAL AI IMPLEMENTATION
  // ============================================
  
  private static async mistralCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<LLMResponse> {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error('Mistral AI API key not configured');
    
    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature
      })
    });
    
    const data = await response.json();
    
    return {
      provider: `mistral-${model}` as LLMProvider,
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      model: data.model
    };
  }
  
  // ============================================
  // COHERE IMPLEMENTATION
  // ============================================
  
  private static async cohereCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<LLMResponse> {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) throw new Error('Cohere API key not configured');
    
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        max_tokens: maxTokens,
        temperature
      })
    });
    
    const data = await response.json();
    
    return {
      provider: `cohere-${model}` as LLMProvider,
      content: data.generations[0].text,
      model: data.meta.api_version.version
    };
  }
  
  // ============================================
  // HUGGINGFACE IMPLEMENTATION
  // ============================================
  
  private static async huggingfaceCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<LLMResponse> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) throw new Error('HuggingFace API key not configured');
    
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature
          }
        })
      }
    );
    
    const data = await response.json();
    
    return {
      provider: 'huggingface-falcon',
      content: data[0].generated_text,
      model
    };
  }
  
  // ============================================
  // AZURE OPENAI IMPLEMENTATION
  // ============================================
  
  private static async azureOpenAICompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<LLMResponse> {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    
    if (!apiKey || !endpoint || !deployment) {
      throw new Error('Azure OpenAI not configured');
    }
    
    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    
    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          max_tokens: maxTokens,
          temperature
        })
      }
    );
    
    const data = await response.json();
    
    return {
      provider: 'azure-openai-gpt4',
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      model: data.model
    };
  }
  
  // ============================================
  // UTILITY METHODS
  // ============================================
  
  /**
   * Get available LLM providers
   */
  static getAvailableProviders(): LLMProvider[] {
    const providers: LLMProvider[] = [];
    
    if (process.env.OPENAI_API_KEY) {
      providers.push('openai-gpt4', 'openai-gpt4-turbo', 'openai-gpt35-turbo');
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      providers.push('anthropic-claude-3-opus', 'anthropic-claude-3-sonnet', 'anthropic-claude-3-haiku');
    }
    
    if (process.env.GOOGLE_AI_API_KEY) {
      providers.push('google-gemini-pro', 'google-gemini-ultra');
    }
    
    if (process.env.TOGETHER_AI_API_KEY) {
      providers.push('meta-llama-3-70b', 'meta-llama-3-8b');
    }
    
    if (process.env.MISTRAL_API_KEY) {
      providers.push('mistral-large', 'mistral-medium');
    }
    
    if (process.env.COHERE_API_KEY) {
      providers.push('cohere-command', 'cohere-command-light');
    }
    
    if (process.env.HUGGINGFACE_API_KEY) {
      providers.push('huggingface-falcon');
    }
    
    if (process.env.AZURE_OPENAI_API_KEY) {
      providers.push('azure-openai-gpt4');
    }
    
    return providers;
  }
  
  /**
   * Get provider info
   */
  static getProviderInfo(provider: LLMProvider) {
    const info: Record<LLMProvider, any> = {
      'openai-gpt4': { name: 'GPT-4', company: 'OpenAI', contextWindow: 8192 },
      'openai-gpt4-turbo': { name: 'GPT-4 Turbo', company: 'OpenAI', contextWindow: 128000 },
      'openai-gpt35-turbo': { name: 'GPT-3.5 Turbo', company: 'OpenAI', contextWindow: 16385 },
      'anthropic-claude-3-opus': { name: 'Claude 3 Opus', company: 'Anthropic', contextWindow: 200000 },
      'anthropic-claude-3-sonnet': { name: 'Claude 3 Sonnet', company: 'Anthropic', contextWindow: 200000 },
      'anthropic-claude-3-haiku': { name: 'Claude 3 Haiku', company: 'Anthropic', contextWindow: 200000 },
      'google-gemini-pro': { name: 'Gemini Pro', company: 'Google', contextWindow: 32768 },
      'google-gemini-ultra': { name: 'Gemini Ultra', company: 'Google', contextWindow: 32768 },
      'meta-llama-3-70b': { name: 'Llama 3 70B', company: 'Meta', contextWindow: 8192 },
      'meta-llama-3-8b': { name: 'Llama 3 8B', company: 'Meta', contextWindow: 8192 },
      'mistral-large': { name: 'Mistral Large', company: 'Mistral AI', contextWindow: 32768 },
      'mistral-medium': { name: 'Mistral Medium', company: 'Mistral AI', contextWindow: 32768 },
      'cohere-command': { name: 'Command', company: 'Cohere', contextWindow: 4096 },
      'cohere-command-light': { name: 'Command Light', company: 'Cohere', contextWindow: 4096 },
      'huggingface-falcon': { name: 'Falcon 180B', company: 'HuggingFace', contextWindow: 2048 },
      'azure-openai-gpt4': { name: 'Azure GPT-4', company: 'Microsoft', contextWindow: 8192 }
    };
    
    return info[provider];
  }
}

// Initialize on import
LLMIntegrationService.initialize();
