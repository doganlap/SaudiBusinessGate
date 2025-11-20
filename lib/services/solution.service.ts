import { query } from '@/lib/db/connection';
import { LLMIntegrationService, LLMRequest } from '@/lib/services/llm-integration.service';
import { 
  RFP, 
  RFPTag, 
  SolutionDesign, 
  Proposal, 
  ContentBlock,
  RFPAnalytics,
  ContentTemplate,
  SolutionSuggestion
} from '@/types/solution';

/**
 * Solution Service
 * Handles RFP intake, solutioning, proposal generation, and analytics
 */
export class SolutionService {
  // RFP CRUD Operations

  static async getRFPs(tenantId: string, filters?: {
    status?: string;
    sector?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<RFP[]> {
    try {
      let sql = 'SELECT * FROM solution_rfps WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.sector) {
        sql += ` AND sector = $${paramIndex}`;
        params.push(filters.sector);
        paramIndex++;
      }

      if (filters?.assigned_to) {
        sql += ` AND assigned_to = $${paramIndex}`;
        params.push(filters.assigned_to);
        paramIndex++;
      }

      sql += ' ORDER BY created_at DESC';

      if (filters?.limit) {
        sql += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      if (filters?.offset) {
        sql += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }

      const result = await query<RFP>(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      // Return mock data if database is not available
      return this.getMockRFPs(filters);
    }
  }

  static async createRFP(tenantId: string, rfpData: Omit<RFP, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'rfp_number'>): Promise<RFP> {
    try {
      // Generate RFP number
      const rfpNumber = `RFP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const result = await query<RFP>(
        `INSERT INTO solution_rfps (
          tenant_id, rfp_number, title, description, client_name, client_industry, 
          sector, language, received_date, submission_deadline, status, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          tenantId,
          rfpNumber,
          rfpData.title,
          rfpData.description || null,
          rfpData.client_name,
          rfpData.client_industry || null,
          rfpData.sector || null,
          rfpData.language || 'both',
          rfpData.received_date || new Date().toISOString(),
          rfpData.submission_deadline || null,
          rfpData.status || 'intake',
          rfpData.tags ? JSON.stringify(rfpData.tags) : null
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating RFP:', error);
      throw error;
    }
  }

  static async getRFPById(tenantId: string, rfpId: string): Promise<RFP | null> {
    try {
      const result = await query<RFP>(
        'SELECT * FROM solution_rfps WHERE tenant_id = $1 AND id = $2',
        [tenantId, rfpId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching RFP:', error);
      return null;
    }
  }

  static async updateRFP(tenantId: string, rfpId: string, rfpData: Partial<Omit<RFP, 'id' | 'tenant_id' | 'created_at'>>): Promise<RFP | null> {
    try {
      const fields = Object.keys(rfpData);
      const values = Object.values(rfpData);
      
      if (fields.length === 0) {
        return null;
      }

      // Handle tags array serialization
      const setClause = fields.map((field, index) => {
        if (field === 'tags' && Array.isArray(rfpData.tags)) {
          return `tags = $${index + 3}::jsonb`;
        }
        return `${field} = $${index + 3}`;
      }).join(', ');

      const params = [tenantId, rfpId];
      fields.forEach((field, index) => {
        if (field === 'tags' && Array.isArray(values[index])) {
          params.push(JSON.stringify(values[index]));
        } else {
          params.push(values[index]);
        }
      });

      const result = await query<RFP>(
        `UPDATE solution_rfps SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
         WHERE tenant_id = $1 AND id = $2 RETURNING *`,
        params
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating RFP:', error);
      return null;
    }
  }

  // Advanced AI-powered auto-tagging using LLM
  static async autoTagRFP(tenantId: string, rfpId: string, rfpText: string): Promise<RFPTag> {
    try {
      const systemPrompt = `You are an expert RFP analyst. Analyze the RFP document and extract:
1. Sector/Industry (finance, healthcare, retail, government, education, manufacturing, technology, etc.)
2. Language requirements (Arabic, English, or both)
3. Complexity level (low, medium, high) based on scope, requirements, and timeline
4. Revenue potential (low, medium, high) based on client size and project scope
5. Strategic fit (low, medium, high) based on alignment with standard solutions

Return JSON format: {"sector": "...", "language": "ar|en|both", "complexity": "low|medium|high", "revenue_potential": "low|medium|high", "strategic_fit": "low|medium|high"}`;

      const prompt = `Analyze this RFP document and extract tags:

${rfpText.substring(0, 8000)}

Return only valid JSON, no explanations.`;

      const llmRequest: LLMRequest = {
        provider: 'openai-gpt4-turbo', // Use GPT-4 Turbo for better analysis
        prompt,
        systemPrompt,
        maxTokens: 500,
        temperature: 0.3 // Lower temperature for more consistent tagging
      };

      const llmResponse = await LLMIntegrationService.generateCompletion(llmRequest);
      
      // Parse LLM response
      try {
        const tagsJson = JSON.parse(llmResponse.content);
        const tags: RFPTag = {
          sector: tagsJson.sector,
          language: tagsJson.language === 'both' ? undefined : tagsJson.language,
          complexity: tagsJson.complexity,
          revenue_potential: tagsJson.revenue_potential,
          strategic_fit: tagsJson.strategic_fit
        };

        // Update RFP with tags
        const rfp = await this.getRFPById(tenantId, rfpId);
        if (rfp) {
          const updatedTags = [...(rfp.tags || []), ...Object.values(tags).filter(Boolean) as string[]];
          await this.updateRFP(tenantId, rfpId, { 
            tags: updatedTags, 
            sector: tags.sector || rfp.sector,
            language: tags.language || rfp.language
          });
        }

        return tags;
      } catch (parseError) {
        console.error('Error parsing LLM response for tags:', parseError);
        // Fallback to basic tagging
        return this.basicAutoTagRFP(tenantId, rfpId, rfpText);
      }
    } catch (error) {
      console.error('Error in AI auto-tagging, falling back to basic:', error);
      return this.basicAutoTagRFP(tenantId, rfpId, rfpText);
    }
  }

  // Basic fallback tagging
  private static async basicAutoTagRFP(tenantId: string, rfpId: string, rfpText: string): Promise<RFPTag> {
    const tags: RFPTag = {
      language: rfpText.includes('عربي') || rfpText.match(/[\u0600-\u06FF]/) ? 'ar' : 'en',
      complexity: rfpText.length > 5000 ? 'high' : rfpText.length > 2000 ? 'medium' : 'low',
    };

    const sectors = ['finance', 'healthcare', 'retail', 'government', 'education', 'manufacturing'];
    for (const sector of sectors) {
      if (rfpText.toLowerCase().includes(sector)) {
        tags.sector = sector;
        break;
      }
    }

    const rfp = await this.getRFPById(tenantId, rfpId);
    if (rfp) {
      const updatedTags = [...(rfp.tags || []), ...Object.values(tags).filter(Boolean) as string[]];
      await this.updateRFP(tenantId, rfpId, { tags: updatedTags, sector: tags.sector });
    }

    return tags;
  }

  // Advanced AI-powered qualification & scoring using LLM
  static async qualifyRFP(tenantId: string, rfpId: string, criteria?: any): Promise<number> {
    try {
      const rfp = await this.getRFPById(tenantId, rfpId);
      if (!rfp) return 0;

      // Use AI for detailed evaluation
      const systemPrompt = `You are an expert RFP qualification analyst. Evaluate the RFP based on:
1. Strategic Fit (0-30 points): Alignment with standard solutions, sector expertise, past success
2. Revenue Potential (0-30 points): Client size, project scope, long-term value
3. Delivery Complexity (0-20 points): Technical requirements, timeline, resources needed (inverse: lower complexity = higher score)
4. Timeline Feasibility (0-20 points): Adequate time for response, realistic deadlines

Return JSON format: {"strategic_fit_score": 0-30, "revenue_potential_score": 0-30, "delivery_complexity_score": 0-20, "timeline_feasibility_score": 0-20, "total_score": 0-100, "win_probability": 0-100, "reasoning": "detailed explanation"}`;

      const prompt = `Evaluate this RFP:

Title: ${rfp.title}
Client: ${rfp.client_name}
Industry: ${rfp.client_industry || 'Unknown'}
Sector: ${rfp.sector || 'Unknown'}
Description: ${rfp.description || 'No description'}
Submission Deadline: ${rfp.submission_deadline || 'Not specified'}
Language: ${rfp.language || 'Unknown'}
Tags: ${rfp.tags?.join(', ') || 'None'}

${rfp.submission_deadline ? `Current Date: ${new Date().toISOString()}` : ''}

Provide detailed scoring analysis. Return only valid JSON.`;

      try {
        const llmRequest: LLMRequest = {
          provider: 'openai-gpt4-turbo',
          prompt,
          systemPrompt,
          maxTokens: 800,
          temperature: 0.3
        };

        const llmResponse = await LLMIntegrationService.generateCompletion(llmRequest);
        const evaluationJson = JSON.parse(llmResponse.content);

        const score = evaluationJson.total_score || 0;
        const winProbability = evaluationJson.win_probability || score * 0.8;

        // Update RFP with score and AI reasoning
        await this.updateRFP(tenantId, rfpId, { 
          qualification_score: score,
          win_probability: winProbability,
          tags: [...(rfp.tags || []), `ai_reasoning:${evaluationJson.reasoning?.substring(0, 200)}`]
        });

        return score;
      } catch (llmError) {
        console.error('AI evaluation failed, using rule-based scoring:', llmError);
        return this.basicQualifyRFP(tenantId, rfpId);
      }
    } catch (error) {
      console.error('Error qualifying RFP:', error);
      return 0;
    }
  }

  // Basic fallback qualification
  private static async basicQualifyRFP(tenantId: string, rfpId: string): Promise<number> {
    const rfp = await this.getRFPById(tenantId, rfpId);
    if (!rfp) return 0;

    let score = 0;
    
    if (rfp.sector) score += 10;
    if (rfp.tags && rfp.tags.length > 0) score += 10;
    if (rfp.client_industry) score += 10;

    if (rfp.client_name && rfp.client_name.length > 0) score += 15;
    if (rfp.client_industry) score += 15;

    const complexity = rfp.description?.length || 0;
    if (complexity < 1000) score += 20;
    else if (complexity < 5000) score += 10;

    if (rfp.submission_deadline) {
      const deadline = new Date(rfp.submission_deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline > 30) score += 20;
      else if (daysUntilDeadline > 14) score += 10;
    }

    await this.updateRFP(tenantId, rfpId, { 
      qualification_score: score,
      win_probability: score * 0.8
    });

    return score;
  }

  // Solution Design Operations

  static async createSolutionDesign(tenantId: string, rfpId: string, designData: Omit<SolutionDesign, 'id' | 'rfp_id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<SolutionDesign> {
    try {
      const result = await query<SolutionDesign>(
        `INSERT INTO solution_designs (
          tenant_id, rfp_id, selected_modules, custom_modules, value_propositions, 
          estimated_timeline, complexity_assessment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          tenantId,
          rfpId,
          JSON.stringify(designData.selected_modules || []),
          designData.custom_modules ? JSON.stringify(designData.custom_modules) : null,
          designData.value_propositions ? JSON.stringify(designData.value_propositions) : null,
          designData.estimated_timeline || null,
          designData.complexity_assessment || null
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating solution design:', error);
      throw error;
    }
  }

  static async getSolutionDesigns(tenantId: string, rfpId?: string): Promise<SolutionDesign[]> {
    try {
      let sql = 'SELECT * FROM solution_designs WHERE tenant_id = $1';
      const params: any[] = [tenantId];

      if (rfpId) {
        sql += ' AND rfp_id = $2';
        params.push(rfpId);
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query<SolutionDesign>(sql, params);
      return result.rows.map(row => ({
        ...row,
        selected_modules: typeof row.selected_modules === 'string' ? JSON.parse(row.selected_modules) : row.selected_modules,
        custom_modules: row.custom_modules && typeof row.custom_modules === 'string' ? JSON.parse(row.custom_modules) : row.custom_modules,
        value_propositions: row.value_propositions && typeof row.value_propositions === 'string' ? JSON.parse(row.value_propositions) : row.value_propositions,
      }));
    } catch (error) {
      console.error('Error fetching solution designs:', error);
      return [];
    }
  }

  // Advanced AI-powered module suggestions using LLM
  static async suggestModules(tenantId: string, rfpId: string): Promise<SolutionSuggestion[]> {
    try {
      const rfp = await this.getRFPById(tenantId, rfpId);
      if (!rfp) return [];

      const availableModules = [
        'finance', 'sales', 'crm', 'hr', 'procurement', 'analytics', 
        'ai-agents', 'grc', 'project-management', 'workflows', 'integrations'
      ];

      const systemPrompt = `You are an expert solution architect. Analyze the RFP requirements and suggest relevant SBG platform modules.

Available modules: ${availableModules.join(', ')}

For each relevant module, provide:
1. Confidence score (0-1): How well this module fits the requirements
2. Reasoning: Why this module is needed
3. Use cases: Specific use cases from the RFP that this module addresses

Return JSON format: [{"module": "module_name", "confidence": 0-1, "reasoning": "...", "use_cases": ["..."]}, ...]`;

      const prompt = `Analyze this RFP and suggest relevant modules:

Title: ${rfp.title}
Description: ${rfp.description || 'No description'}
Client: ${rfp.client_name}
Industry: ${rfp.client_industry || 'Unknown'}
Sector: ${rfp.sector || 'Unknown'}

Suggest modules based on the requirements. Only include modules with confidence > 0.3. Return only valid JSON array.`;

      try {
        const llmRequest: LLMRequest = {
          provider: 'openai-gpt4-turbo',
          prompt,
          systemPrompt,
          maxTokens: 1500,
          temperature: 0.4
        };

        const llmResponse = await LLMIntegrationService.generateCompletion(llmRequest);
        const suggestionsJson = JSON.parse(llmResponse.content);

        // Convert to SolutionSuggestion format
        const suggestions: SolutionSuggestion[] = (Array.isArray(suggestionsJson) ? suggestionsJson : []).map((item: any) => ({
          module: item.module,
          confidence: item.confidence || 0.5,
          reasoning: item.reasoning || `${item.use_cases?.join(', ') || 'Module fits requirements'}`,
          past_wins: 0 // TODO: Query actual past wins from analytics
        }));

        // Fallback to keyword-based if AI fails or returns empty
        if (suggestions.length === 0) {
          return this.basicSuggestModules(rfp);
        }

        return suggestions.sort((a, b) => b.confidence - a.confidence);
      } catch (llmError) {
        console.error('AI module suggestion failed, using keyword-based:', llmError);
        return this.basicSuggestModules(rfp);
      }
    } catch (error) {
      console.error('Error suggesting modules:', error);
      return [];
    }
  }

  // Basic fallback module suggestion
  private static basicSuggestModules(rfp: RFP): SolutionSuggestion[] {
    const modules = ['finance', 'sales', 'crm', 'hr', 'procurement', 'analytics', 'ai-agents', 'grc'];
    const suggestions: SolutionSuggestion[] = [];
    const rfpText = `${rfp.title} ${rfp.description || ''}`.toLowerCase();

    const keywords: any = {
      finance: ['finance', 'accounting', 'budget', 'invoice', 'payment', 'financial'],
      sales: ['sales', 'revenue', 'pipeline', 'lead', 'customer', 'revenue'],
      crm: ['customer', 'client', 'relationship', 'contact', 'crm'],
      hr: ['human', 'resource', 'employee', 'payroll', 'attendance', 'hr'],
      procurement: ['procurement', 'purchase', 'vendor', 'supplier', 'inventory'],
      analytics: ['analytics', 'report', 'dashboard', 'insight', 'kpi', 'metric'],
      'ai-agents': ['ai', 'artificial', 'intelligence', 'automation', 'machine'],
      grc: ['governance', 'risk', 'compliance', 'audit', 'security', 'regulatory']
    };

    for (const module of modules) {
      const moduleKeywords = keywords[module] || [];
      const matches = moduleKeywords.filter((keyword: string) => rfpText.includes(keyword)).length;
      const confidence = Math.min(matches * 0.25, 0.95);

      if (confidence > 0.1) {
        suggestions.push({
          module,
          confidence,
          reasoning: `${matches} keyword matches found`,
          past_wins: 0
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // AI-powered proposal content generation
  static async generateProposalContent(
    tenantId: string,
    rfpId: string,
    solutionDesignId: string,
    contentType: 'executive_summary' | 'solution_overview' | 'module_description',
    language: 'ar' | 'en' = 'en'
  ): Promise<string> {
    try {
      const rfp = await this.getRFPById(tenantId, rfpId);
      if (!rfp) throw new Error('RFP not found');

      const solutionDesign = (await this.getSolutionDesigns(tenantId, rfpId)).find(s => s.id === solutionDesignId);
      if (!solutionDesign) throw new Error('Solution design not found');

      const languageInstruction = language === 'ar' ? 'Write in Arabic (العربية).' : 'Write in English.';

      const systemPrompts: any = {
        executive_summary: `You are an expert proposal writer. Create a compelling executive summary that:
- Highlights key benefits of the proposed solution
- Addresses the client's main pain points
- Emphasizes value proposition
- Is professional and persuasive
${languageInstruction}`,
        solution_overview: `You are an expert solution architect. Create a detailed solution overview that:
- Describes the overall solution approach
- Explains how selected modules address requirements
- Shows integration and workflow benefits
- Demonstrates ROI potential
${languageInstruction}`,
        module_description: `You are an expert module specialist. Create module descriptions that:
- Explain module features and capabilities
- Show how it addresses specific RFP requirements
- Highlight unique value propositions
- Include use cases and benefits
${languageInstruction}`
      };

      const prompts: any = {
        executive_summary: `Create an executive summary for this proposal:

RFP: ${rfp.title}
Client: ${rfp.client_name}
Industry: ${rfp.client_industry || 'Unknown'}
Key Requirements: ${rfp.description?.substring(0, 1000) || 'Not specified'}
Selected Modules: ${solutionDesign.selected_modules?.join(', ') || 'None'}

Generate a compelling executive summary (2-3 paragraphs).`,
        solution_overview: `Create a solution overview for this proposal:

RFP: ${rfp.title}
Client: ${rfp.client_name}
Selected Modules: ${solutionDesign.selected_modules?.join(', ') || 'None'}
Value Propositions: ${solutionDesign.value_propositions?.join(', ') || 'Not specified'}
Complexity: ${solutionDesign.complexity_assessment || 'Medium'}

Generate a comprehensive solution overview (3-4 paragraphs).`,
        module_description: `Create module descriptions for these modules: ${solutionDesign.selected_modules?.join(', ') || 'None'}

RFP Context: ${rfp.title}
Requirements: ${rfp.description?.substring(0, 800) || 'Not specified'}

For each module, provide a brief description (1-2 paragraphs per module) explaining how it addresses the requirements.`
      };

      const llmRequest: LLMRequest = {
        provider: 'openai-gpt4-turbo',
        prompt: prompts[contentType],
        systemPrompt: systemPrompts[contentType],
        maxTokens: 2000,
        temperature: 0.7
      };

      const llmResponse = await LLMIntegrationService.generateCompletion(llmRequest);
      return llmResponse.content;
    } catch (error) {
      console.error('Error generating proposal content:', error);
      throw error;
    }
  }

  // Proposal Operations

  static async createProposal(tenantId: string, rfpId: string, solutionDesignId: string, proposalData: Omit<Proposal, 'id' | 'rfp_id' | 'solution_design_id' | 'tenant_id' | 'created_at' | 'updated_at' | 'proposal_number'>): Promise<Proposal> {
    try {
      const proposalNumber = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const result = await query<Proposal>(
        `INSERT INTO solution_proposals (
          tenant_id, rfp_id, solution_design_id, proposal_number, title, 
          content_blocks, pricing, compliance, localization, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          tenantId,
          rfpId,
          solutionDesignId,
          proposalNumber,
          proposalData.title,
          JSON.stringify(proposalData.content_blocks || []),
          proposalData.pricing ? JSON.stringify(proposalData.pricing) : null,
          proposalData.compliance ? JSON.stringify(proposalData.compliance) : null,
          proposalData.localization ? JSON.stringify(proposalData.localization) : null,
          proposalData.status || 'draft'
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }

  static async getProposals(tenantId: string, rfpId?: string): Promise<Proposal[]> {
    try {
      let sql = 'SELECT * FROM solution_proposals WHERE tenant_id = $1';
      const params: any[] = [tenantId];

      if (rfpId) {
        sql += ' AND rfp_id = $2';
        params.push(rfpId);
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query<Proposal>(sql, params);
      return result.rows.map(row => ({
        ...row,
        content_blocks: typeof row.content_blocks === 'string' ? JSON.parse(row.content_blocks) : row.content_blocks,
        pricing: row.pricing && typeof row.pricing === 'string' ? JSON.parse(row.pricing) : row.pricing,
        compliance: row.compliance && typeof row.compliance === 'string' ? JSON.parse(row.compliance) : row.compliance,
        localization: row.localization && typeof row.localization === 'string' ? JSON.parse(row.localization) : row.localization,
      }));
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return [];
    }
  }

  // Analytics

  static async getAnalytics(tenantId: string, filters?: { dateFrom?: string; dateTo?: string }): Promise<RFPAnalytics> {
    try {
      const rfps = await this.getRFPs(tenantId);
      
      const won = rfps.filter(r => r.status === 'won').length;
      const submitted = rfps.filter(r => r.status === 'submitted' || r.status === 'won' || r.status === 'lost').length;
      const winRate = submitted > 0 ? (won / submitted) * 100 : 0;

      const avgQualificationScore = rfps
        .filter(r => r.qualification_score)
        .reduce((sum, r) => sum + (r.qualification_score || 0), 0) / rfps.filter(r => r.qualification_score).length || 0;

      const avgWinProbability = rfps
        .filter(r => r.win_probability)
        .reduce((sum, r) => sum + (r.win_probability || 0), 0) / rfps.filter(r => r.win_probability).length || 0;

      // Group by sector
      const sectorMap = new Map<string, { count: number; wins: number; submitted: number }>();
      rfps.forEach(rfp => {
        const sector = rfp.sector || 'Unknown';
        const current = sectorMap.get(sector) || { count: 0, wins: 0, submitted: 0 };
        current.count++;
        if (rfp.status === 'won') current.wins++;
        if (rfp.status === 'submitted' || rfp.status === 'won' || rfp.status === 'lost') current.submitted++;
        sectorMap.set(sector, current);
      });

      const bySector = Array.from(sectorMap.entries()).map(([sector, data]) => ({
        sector,
        count: data.count,
        win_rate: data.submitted > 0 ? (data.wins / data.submitted) * 100 : 0
      }));

      // Group by status
      const statusMap = new Map<string, number>();
      rfps.forEach(rfp => {
        statusMap.set(rfp.status, (statusMap.get(rfp.status) || 0) + 1);
      });

      const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

      return {
        total_rfps: rfps.length,
        active_rfps: rfps.filter(r => ['intake', 'qualified', 'solution_design', 'proposal', 'review'].includes(r.status)).length,
        qualified_rfps: rfps.filter(r => r.status !== 'intake').length,
        submitted_proposals: submitted,
        win_rate: winRate,
        avg_qualification_score: avgQualificationScore,
        avg_win_probability: avgWinProbability,
        by_sector: bySector,
        by_status: byStatus,
        by_module: [], // TODO: Aggregate from solution designs
        recent_activity: rfps.slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        total_rfps: 0,
        active_rfps: 0,
        qualified_rfps: 0,
        submitted_proposals: 0,
        win_rate: 0,
        avg_qualification_score: 0,
        avg_win_probability: 0,
        by_sector: [],
        by_status: [],
        by_module: [],
        recent_activity: []
      };
    }
  }

  // Mock data fallback
  private static getMockRFPs(filters?: any): RFP[] {
    return [
      {
        id: '1',
        tenant_id: 'default-tenant',
        rfp_number: 'RFP-2024-001',
        title: 'Enterprise ERP System',
        description: 'Request for comprehensive ERP solution',
        client_name: 'ABC Corporation',
        client_industry: 'Manufacturing',
        sector: 'manufacturing',
        language: 'both',
        received_date: new Date().toISOString(),
        submission_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'solution_design',
        qualification_score: 75,
        win_probability: 65,
        tags: ['erp', 'manufacturing', 'enterprise'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

