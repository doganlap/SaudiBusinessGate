import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export class EmbeddingsService {
  
  /**
   * Generate embedding for a single text
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small', // 1536 dimensions
        input: text.substring(0, 8000) // Limit to 8000 chars
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
  
  /**
   * Generate embeddings for multiple texts
   */
  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts.map(t => t.substring(0, 8000))
      });
      
      return response.data.map(d => d.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
  
  /**
   * Generate embedding for a product
   */
  static async generateProductEmbedding(product: {
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    category: string;
  }): Promise<number[]> {
    // Combine all text fields
    const text = [
      product.name,
      product.nameAr,
      product.description,
      product.descriptionAr,
      product.category
    ].filter(Boolean).join(' ');
    
    return await this.generateEmbedding(text);
  }
  
  /**
   * Generate embedding for a document
   */
  static async generateDocumentEmbedding(document: {
    title: string;
    titleAr: string;
    content: string;
    contentAr: string;
  }): Promise<number[]> {
    const text = [
      document.title,
      document.titleAr,
      document.content.substring(0, 2000),
      document.contentAr.substring(0, 2000)
    ].filter(Boolean).join(' ');
    
    return await this.generateEmbedding(text);
  }
  
  /**
   * Generate embedding for a support article
   */
  static async generateSupportEmbedding(article: {
    question: string;
    questionAr: string;
    answer: string;
    answerAr: string;
  }): Promise<number[]> {
    const text = [
      article.question,
      article.questionAr,
      article.answer.substring(0, 1000),
      article.answerAr.substring(0, 1000)
    ].filter(Boolean).join(' ');
    
    return await this.generateEmbedding(text);
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
