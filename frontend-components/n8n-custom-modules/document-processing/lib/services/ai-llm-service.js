/**
 * AI & LLM Service Integration
 * Handles OpenAI, Azure OpenAI, and other LLM providers
 */

const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const axios = require('axios');
const logger = require('../logger');
const { AIServiceError } = require('../error-handler');

class AILLMService {
  constructor(config) {
    this.config = config;
    this.initializeClients();
  }

  initializeClients() {
    try {
      // OpenAI API
      this.openaiApiKey = this.config.OPENAI_API_KEY;
      this.openaiBaseUrl = 'https://api.openai.com/v1';

      // Azure OpenAI
      if (this.config.AZURE_OPENAI_ENDPOINT) {
        this.azureOpenAI = new OpenAIClient(
          this.config.AZURE_OPENAI_ENDPOINT,
          new AzureKeyCredential(this.config.AZURE_OPENAI_KEY)
        );
      }

      // Custom LLM endpoints
      this.customLLMEndpoints = this.parseCustomLLMEndpoints();

      logger.info('AI/LLM service initialized');
    } catch (error) {
      logger.error(`Failed to initialize AI/LLM service: ${error.message}`);
      throw new AIServiceError(`AI/LLM initialization failed: ${error.message}`);
    }
  }

  /**
   * Parse custom LLM endpoints from config
   */
  parseCustomLLMEndpoints() {
    const endpoints = {};
    
    if (this.config.CUSTOM_LLM_ENDPOINTS) {
      try {
        return JSON.parse(this.config.CUSTOM_LLM_ENDPOINTS);
      } catch (e) {
        logger.warn('Failed to parse custom LLM endpoints');
      }
    }
    
    return endpoints;
  }

  /**
   * Analyze document content using GPT
   */
  async analyzeDocumentWithGPT(content, documentType = 'document', model = 'gpt-4') {
    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: `You are an expert document analyzer. Analyze the provided ${documentType} and extract key information.`
            },
            {
              role: 'user',
              content: `Please analyze this ${documentType} and provide: 1) Key information extracted 2) Document type confirmation 3) Data quality assessment 4) Required next steps\n\nDocument:\n${content}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const analysis = response.data.choices[0].message.content;

      logger.info(`Document analyzed with GPT: ${documentType}`);

      return {
        success: true,
        analysis,
        model,
        provider: 'OpenAI'
      };
    } catch (error) {
      logger.error(`Failed to analyze with GPT: ${error.message}`);
      throw new AIServiceError(`GPT analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze document with Azure OpenAI
   */
  async analyzeDocumentWithAzureOpenAI(content, documentType = 'document') {
    try {
      const response = await this.azureOpenAI.getChatCompletions(
        this.config.AZURE_OPENAI_DEPLOYMENT_NAME,
        [
          {
            role: 'system',
            content: `You are an expert document analyzer. Analyze the provided ${documentType} and extract key information.`
          },
          {
            role: 'user',
            content: `Please analyze this ${documentType} and provide: 1) Key information 2) Document type 3) Data quality 4) Next steps\n\nDocument:\n${content}`
          }
        ],
        {
          temperature: 0.3,
          maxTokens: 2000
        }
      );

      const analysis = response.choices[0].message.content;

      logger.info(`Document analyzed with Azure OpenAI: ${documentType}`);

      return {
        success: true,
        analysis,
        provider: 'Azure OpenAI'
      };
    } catch (error) {
      logger.error(`Failed to analyze with Azure OpenAI: ${error.message}`);
      throw new AIServiceError(`Azure OpenAI analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract structured data from document
   */
  async extractStructuredData(content, schema) {
    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a data extraction expert. Extract data from the provided content and return valid JSON matching the schema.'
            },
            {
              role: 'user',
              content: `Extract data matching this JSON schema:\n${JSON.stringify(schema, null, 2)}\n\nFrom this content:\n${content}`
            }
          ],
          temperature: 0,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const extractedText = response.data.choices[0].message.content;
      const extractedData = JSON.parse(extractedText);

      logger.info('Structured data extracted successfully');

      return {
        success: true,
        data: extractedData,
        provider: 'OpenAI'
      };
    } catch (error) {
      logger.error(`Failed to extract structured data: ${error.message}`);
      throw new AIServiceError(`Data extraction failed: ${error.message}`);
    }
  }

  /**
   * Classify document
   */
  async classifyDocument(content, categories = []) {
    try {
      const categoryList = categories.length > 0 ? categories.join(', ') : 'invoice, purchase order, receipt, contract, report, other';

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a document classifier. Classify the document into one of the provided categories.'
            },
            {
              role: 'user',
              content: `Classify this document into one of: ${categoryList}\n\nDocument:\n${content}`
            }
          ],
          temperature: 0,
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const classification = response.data.choices[0].message.content.trim();

      logger.info(`Document classified: ${classification}`);

      return {
        success: true,
        classification,
        confidence: 0.95,
        provider: 'OpenAI'
      };
    } catch (error) {
      logger.error(`Failed to classify document: ${error.message}`);
      throw new AIServiceError(`Classification failed: ${error.message}`);
    }
  }

  /**
   * Validate extracted data against rules
   */
  async validateData(data, validationRules) {
    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a data validation expert. Validate the provided data against the rules and return a JSON object with validation results.'
            },
            {
              role: 'user',
              content: `Validate this data against the rules:\n\nRules:\n${JSON.stringify(validationRules, null, 2)}\n\nData:\n${JSON.stringify(data, null, 2)}\n\nReturn JSON with: { isValid: boolean, errors: string[], warnings: string[] }`
            }
          ],
          temperature: 0,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const validationResult = JSON.parse(response.data.choices[0].message.content);

      logger.info(`Data validation completed: ${validationResult.isValid ? 'Valid' : 'Invalid'}`);

      return {
        success: true,
        validationResult,
        provider: 'OpenAI'
      };
    } catch (error) {
      logger.error(`Failed to validate data: ${error.message}`);
      throw new AIServiceError(`Data validation failed: ${error.message}`);
    }
  }

  /**
   * Generate summary from document
   */
  async generateSummary(content, length = 'medium') {
    try {
      const lengthGuide = {
        short: '2-3 sentences',
        medium: '1 paragraph',
        long: '2-3 paragraphs'
      };

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a document summarization expert. Create concise, accurate summaries.'
            },
            {
              role: 'user',
              content: `Summarize this document in ${lengthGuide[length] || lengthGuide.medium}:\n\n${content}`
            }
          ],
          temperature: 0.5,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const summary = response.data.choices[0].message.content;

      logger.info(`Document summary generated (${length})`);

      return {
        success: true,
        summary,
        length,
        provider: 'OpenAI'
      };
    } catch (error) {
      logger.error(`Failed to generate summary: ${error.message}`);
      throw new AIServiceError(`Summary generation failed: ${error.message}`);
    }
  }

  /**
   * Call custom LLM endpoint
   */
  async callCustomLLM(endpointName, payload) {
    try {
      const endpoint = this.customLLMEndpoints[endpointName];
      
      if (!endpoint) {
        throw new Error(`Custom LLM endpoint not found: ${endpointName}`);
      }

      const response = await axios.post(
        endpoint.url,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${endpoint.apiKey}`,
            'Content-Type': 'application/json',
            ...endpoint.headers
          },
          timeout: 30000
        }
      );

      logger.info(`Custom LLM called: ${endpointName}`);

      return {
        success: true,
        result: response.data,
        endpoint: endpointName
      };
    } catch (error) {
      logger.error(`Failed to call custom LLM: ${error.message}`);
      throw new AIServiceError(`Custom LLM call failed: ${error.message}`);
    }
  }

  /**
   * Batch process documents with LLM
   */
  async batchProcessWithLLM(documents, operation = 'analyze') {
    try {
      const results = [];

      for (const doc of documents) {
        try {
          let result;

          switch (operation) {
            case 'analyze':
              result = await this.analyzeDocumentWithGPT(doc.content, doc.type);
              break;
            case 'classify':
              result = await this.classifyDocument(doc.content);
              break;
            case 'extract':
              result = await this.extractStructuredData(doc.content, doc.schema);
              break;
            case 'summarize':
              result = await this.generateSummary(doc.content);
              break;
            default:
              result = { success: false, error: 'Unknown operation' };
          }

          results.push({
            documentId: doc.id,
            success: result.success,
            result
          });
        } catch (error) {
          results.push({
            documentId: doc.id,
            success: false,
            error: error.message
          });
        }
      }

      logger.info(`Batch processing completed: ${operation}`, { count: results.length });

      return {
        success: true,
        operation,
        results,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      logger.error(`Failed to batch process with LLM: ${error.message}`);
      throw new AIServiceError(`Batch processing failed: ${error.message}`);
    }
  }
}

module.exports = AILLMService;