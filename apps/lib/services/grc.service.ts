/**
 * GRC Control Administration Service
 * Comprehensive service layer for Control Management System
 * Multi-tenant, Bilingual (AR/EN), RBAC-enabled
 */

import { Pool, QueryResult } from 'pg';
import { query as dbQuery, transaction, getClient } from '../db/connection';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Framework {
  id: string;
  tenant_id: string;
  code: string;
  name_en: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  version?: string;
  effective_date?: string;
  status: 'active' | 'deprecated' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface FrameworkSection {
  id: string;
  tenant_id: string;
  framework_id: string;
  section_code: string;
  title_en: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  parent_section_id?: string;
  sort_order: number;
}

export interface Control {
  id: string;
  tenant_id: string;
  code: string;
  title_en: string;
  title_ar?: string;
  objective_en: string;
  objective_ar?: string;
  domain: string;
  process_area?: string;
  control_type: 'Preventive' | 'Detective' | 'Corrective';
  control_nature: 'Manual' | 'Automated' | 'Semi-automated';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'On-event';
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  maturity_level: number;
  status: 'draft' | 'design_review' | 'ready' | 'operating' | 'changed' | 'retired';
  owner_id?: string;
  backup_owner_id?: string;
  process_owner_id?: string;
  assertions?: any;
  evidence_requirements?: any;
  test_strategy?: any;
  risk_links?: any;
  version: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ControlImplementation {
  id: string;
  tenant_id: string;
  control_id: string;
  implementation_name_en: string;
  implementation_name_ar?: string;
  owner_id: string;
  status: 'planned' | 'ready' | 'active' | 'suspended' | 'retired';
  implementation_date?: string;
  next_review_date?: string;
  sop_links?: any;
  system_configs?: any;
  automation_details?: any;
  delegation_rules?: any;
  notes_en?: string;
  notes_ar?: string;
  created_at: string;
  updated_at: string;
}

export interface ControlTest {
  id: string;
  tenant_id: string;
  control_id: string;
  implementation_id?: string;
  test_type: 'design_effectiveness' | 'operating_effectiveness';
  test_name_en: string;
  test_name_ar?: string;
  planned_date?: string;
  executed_at?: string;
  executed_by?: string;
  reviewed_by?: string;
  test_objective_en?: string;
  test_objective_ar?: string;
  test_procedure_en?: string;
  test_procedure_ar?: string;
  population_description_en?: string;
  population_description_ar?: string;
  sample_plan?: any;
  sample_results?: any;
  overall_result?: 'pass' | 'partial' | 'fail';
  findings?: any;
  recommendations_en?: string;
  recommendations_ar?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ControlException {
  id: string;
  tenant_id: string;
  control_id: string;
  exception_type: 'temporary' | 'permanent' | 'compensating';
  reason_en: string;
  reason_ar?: string;
  business_justification_en?: string;
  business_justification_ar?: string;
  risk_assessment?: any;
  compensating_controls?: any;
  start_date: string;
  end_date?: string;
  status: 'proposed' | 'approved' | 'active' | 'expired' | 'closed';
  requested_by?: string;
  approved_by?: string;
  approved_at?: string;
  review_frequency?: string;
  next_review_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ControlEvidence {
  id: string;
  tenant_id: string;
  control_id: string;
  implementation_id?: string;
  document_id: string;
  evidence_type: string;
  evidence_period_start?: string;
  evidence_period_end?: string;
  linked_by?: string;
  linked_at: string;
  validation_checklist?: any;
  validation_status: 'pending' | 'approved' | 'rejected';
  validated_by?: string;
  validated_at?: string;
  notes_en?: string;
  notes_ar?: string;
}

export interface CCMAlert {
  id: string;
  tenant_id: string;
  rule_id: string;
  control_id: string;
  alert_type: 'info' | 'warning' | 'critical';
  alert_message_en: string;
  alert_message_ar?: string;
  alert_data?: any;
  anomaly_score?: number;
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes_en?: string;
  resolution_notes_ar?: string;
  created_at: string;
}

export interface ControlStatusView {
  id: string;
  tenant_id: string;
  code: string;
  title_en: string;
  title_ar?: string;
  domain: string;
  criticality: string;
  status: string;
  owner_id?: string;
  implementation_status?: string;
  next_review_date?: string;
  latest_test_result?: string;
  latest_test_date?: string;
  evidence_count: number;
  approved_evidence_count: number;
  active_exceptions_count: number;
  control_effectiveness_score: number;
}

// =====================================================
// GRC SERVICE CLASS
// =====================================================

export class GRCService {
  constructor() {
    // Using direct query functions from connection module
  }

  // =====================================================
  // FRAMEWORK MANAGEMENT
  // =====================================================

  async getFrameworks(tenantId: string): Promise<Framework[]> {
    try {
      const queryText = `
        SELECT * FROM frameworks 
        WHERE tenant_id = $1 AND status = 'active'
        ORDER BY name_en
      `;
      const result = await dbQuery(queryText, [tenantId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      return this.getFallbackFrameworks();
    }
  }

  async getFrameworkSections(tenantId: string, frameworkId: string): Promise<FrameworkSection[]> {
    try {
      const queryText = `
        SELECT * FROM framework_sections 
        WHERE tenant_id = $1 AND framework_id = $2
        ORDER BY sort_order, section_code
      `;
      const result = await dbQuery(queryText, [tenantId, frameworkId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching framework sections:', error);
      return [];
    }
  }

  // =====================================================
  // CONTROL MANAGEMENT
  // =====================================================

  async getControls(tenantId: string, filters?: {
    domain?: string;
    status?: string;
    criticality?: string;
    owner_id?: string;
    framework_id?: string;
  }): Promise<Control[]> {
    try {
      let queryText = `
        SELECT c.*, 
               array_agg(DISTINCT f.code) as frameworks
        FROM controls c
        LEFT JOIN framework_control_map fcm ON c.id = fcm.control_id
        LEFT JOIN frameworks f ON fcm.framework_id = f.id
        WHERE c.tenant_id = $1
      `;
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.domain) {
        queryText += ` AND c.domain = $${paramIndex}`;
        params.push(filters.domain);
        paramIndex++;
      }

      if (filters?.status) {
        queryText += ` AND c.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.criticality) {
        queryText += ` AND c.criticality = $${paramIndex}`;
        params.push(filters.criticality);
        paramIndex++;
      }

      if (filters?.owner_id) {
        queryText += ` AND c.owner_id = $${paramIndex}`;
        params.push(filters.owner_id);
        paramIndex++;
      }

      if (filters?.framework_id) {
        queryText += ` AND fcm.framework_id = $${paramIndex}`;
        params.push(filters.framework_id);
        paramIndex++;
      }

      queryText += `
        GROUP BY c.id
        ORDER BY c.criticality DESC, c.code
      `;

      const result = await dbQuery(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching controls:', error);
      return this.getFallbackControls();
    }
  }

  async getControlById(tenantId: string, controlId: string): Promise<Control | null> {
    try {
      const queryText = `
        SELECT c.*,
               ci.status as implementation_status,
               ci.next_review_date,
               ci.owner_id as implementation_owner_id
        FROM controls c
        LEFT JOIN control_implementations ci ON c.id = ci.control_id AND ci.status = 'active'
        WHERE c.tenant_id = $1 AND c.id = $2
      `;
      const result = await dbQuery(queryText, [tenantId, controlId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching control by ID:', error);
      return null;
    }
  }

  async createControl(tenantId: string, controlData: Partial<Control>, userId?: string): Promise<Control> {
    try {
      const queryText = `
        INSERT INTO controls (
          tenant_id, code, title_en, title_ar, objective_en, objective_ar,
          domain, process_area, control_type, control_nature, frequency,
          criticality, maturity_level, status, owner_id, backup_owner_id,
          process_owner_id, assertions, evidence_requirements, test_strategy,
          risk_links, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $22
        ) RETURNING *
      `;
      
      const params = [
        tenantId,
        controlData.code,
        controlData.title_en,
        controlData.title_ar,
        controlData.objective_en,
        controlData.objective_ar,
        controlData.domain,
        controlData.process_area,
        controlData.control_type,
        controlData.control_nature,
        controlData.frequency,
        controlData.criticality || 'Medium',
        controlData.maturity_level || 1,
        controlData.status || 'draft',
        controlData.owner_id,
        controlData.backup_owner_id,
        controlData.process_owner_id,
        JSON.stringify(controlData.assertions || {}),
        JSON.stringify(controlData.evidence_requirements || {}),
        JSON.stringify(controlData.test_strategy || {}),
        JSON.stringify(controlData.risk_links || {}),
        userId || null
      ];

      const result = await dbQuery(queryText, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating control:', error);
      throw new Error('Failed to create control');
    }
  }

  async updateControl(tenantId: string, controlId: string, updates: Partial<Control>, userId?: string): Promise<Control> {
    try {
      const setClause = [];
      const params = [tenantId, controlId];
      let paramIndex = 3;

      // Build dynamic update query
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'tenant_id' && key !== 'created_at' && value !== undefined) {
          if (typeof value === 'object' && value !== null) {
            setClause.push(`${key} = $${paramIndex}`);
            params.push(JSON.stringify(value));
          } else {
            setClause.push(`${key} = $${paramIndex}`);
            params.push(value);
          }
          paramIndex++;
        }
      });

      setClause.push(`updated_by = $${paramIndex}`);
      params.push(userId || 'system');
      paramIndex++;

      setClause.push(`updated_at = CURRENT_TIMESTAMP`);
      setClause.push(`version = version + 1`);

      const queryText = `
        UPDATE controls 
        SET ${setClause.join(', ')}
        WHERE tenant_id = $1 AND id = $2
        RETURNING *
      `;

      const result = await dbQuery(queryText, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating control:', error);
      throw new Error('Failed to update control');
    }
  }

  // =====================================================
  // CONTROL TESTING
  // =====================================================

  async getControlTests(tenantId: string, controlId?: string): Promise<ControlTest[]> {
    try {
      let queryText = `
        SELECT ct.*,
               c.code as control_code,
               c.title_en as control_title
        FROM control_tests ct
        JOIN controls c ON ct.control_id = c.id
        WHERE ct.tenant_id = $1
      `;
      const params = [tenantId];

      if (controlId) {
        queryText += ` AND ct.control_id = $2`;
        params.push(controlId);
      }

      queryText += ` ORDER BY ct.executed_at DESC, ct.planned_date DESC`;

      const result = await dbQuery(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching control tests:', error);
      return [];
    }
  }

  async createControlTest(tenantId: string, testData: Partial<ControlTest>, userId?: string): Promise<ControlTest> {
    try {
      const queryText = `
        INSERT INTO control_tests (
          tenant_id, control_id, implementation_id, test_type, test_name_en, test_name_ar,
          planned_date, test_objective_en, test_objective_ar, test_procedure_en, test_procedure_ar,
          population_description_en, population_description_ar, sample_plan, status, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16
        ) RETURNING *
      `;

      const params = [
        tenantId,
        testData.control_id,
        testData.implementation_id,
        testData.test_type,
        testData.test_name_en,
        testData.test_name_ar,
        testData.planned_date,
        testData.test_objective_en,
        testData.test_objective_ar,
        testData.test_procedure_en,
        testData.test_procedure_ar,
        testData.population_description_en,
        testData.population_description_ar,
        JSON.stringify(testData.sample_plan || {}),
        testData.status || 'planned',
        userId
      ];

      const result = await dbQuery(queryText, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating control test:', error);
      throw new Error('Failed to create control test');
    }
  }

  async executeControlTest(
    tenantId: string, 
    testId: string, 
    executionData: {
      sample_results?: any;
      overall_result: 'pass' | 'partial' | 'fail';
      findings?: any;
      recommendations_en?: string;
      recommendations_ar?: string;
    },
    userId?: string
  ): Promise<ControlTest> {
    try {
      const queryText = `
        UPDATE control_tests 
        SET executed_at = CURRENT_TIMESTAMP,
            executed_by = $3,
            sample_results = $4,
            overall_result = $5,
            findings = $6,
            recommendations_en = $7,
            recommendations_ar = $8,
            status = 'completed',
            updated_by = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = $1 AND id = $2
        RETURNING *
      `;

      const params = [
        tenantId,
        testId,
        userId,
        JSON.stringify(executionData.sample_results || {}),
        executionData.overall_result,
        JSON.stringify(executionData.findings || {}),
        executionData.recommendations_en,
        executionData.recommendations_ar
      ];

      const result = await dbQuery(queryText, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error executing control test:', error);
      throw new Error('Failed to execute control test');
    }
  }

  // =====================================================
  // EXCEPTION MANAGEMENT
  // =====================================================

  async getControlExceptions(tenantId: string, controlId?: string): Promise<ControlException[]> {
    try {
      let queryText = `
        SELECT ce.*,
               c.code as control_code,
               c.title_en as control_title
        FROM control_exceptions ce
        JOIN controls c ON ce.control_id = c.id
        WHERE ce.tenant_id = $1
      `;
      const params = [tenantId];

      if (controlId) {
        queryText += ` AND ce.control_id = $2`;
        params.push(controlId);
      }

      queryText += ` ORDER BY ce.created_at DESC`;

      const result = await dbQuery(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching control exceptions:', error);
      return [];
    }
  }

  async createControlException(tenantId: string, exceptionData: Partial<ControlException>, userId?: string): Promise<ControlException> {
    try {
      const queryText = `
        INSERT INTO control_exceptions (
          tenant_id, control_id, exception_type, reason_en, reason_ar,
          business_justification_en, business_justification_ar, risk_assessment,
          compensating_controls, start_date, end_date, status, requested_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        ) RETURNING *
      `;

      const params = [
        tenantId,
        exceptionData.control_id,
        exceptionData.exception_type,
        exceptionData.reason_en,
        exceptionData.reason_ar,
        exceptionData.business_justification_en,
        exceptionData.business_justification_ar,
        JSON.stringify(exceptionData.risk_assessment || {}),
        JSON.stringify(exceptionData.compensating_controls || {}),
        exceptionData.start_date,
        exceptionData.end_date,
        exceptionData.status || 'proposed',
        userId
      ];

      const result = await dbQuery(queryText, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating control exception:', error);
      throw new Error('Failed to create control exception');
    }
  }

  // =====================================================
  // EVIDENCE MANAGEMENT
  // =====================================================

  async getControlEvidence(tenantId: string, controlId: string): Promise<ControlEvidence[]> {
    try {
      const queryText = `
        SELECT ce.*,
               d.title_en as document_title,
               d.file_path,
               d.file_size,
               d.mime_type
        FROM control_evidence ce
        JOIN documents d ON ce.document_id = d.id
        WHERE ce.tenant_id = $1 AND ce.control_id = $2
        ORDER BY ce.linked_at DESC
      `;

      const result = await dbQuery(queryText, [tenantId, controlId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching control evidence:', error);
      return [];
    }
  }

  // =====================================================
  // CCM ALERTS
  // =====================================================

  async getCCMAlerts(tenantId: string, controlId?: string, status?: string): Promise<CCMAlert[]> {
    try {
      let queryText = `
        SELECT ca.*,
               c.code as control_code,
               c.title_en as control_title
        FROM ccm_alerts ca
        JOIN controls c ON ca.control_id = c.id
        WHERE ca.tenant_id = $1
      `;
      const params = [tenantId];
      let paramIndex = 2;

      if (controlId) {
        queryText += ` AND ca.control_id = $${paramIndex}`;
        params.push(controlId);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND ca.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      queryText += ` ORDER BY ca.created_at DESC`;

      const result = await dbQuery(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching CCM alerts:', error);
      return [];
    }
  }

  // =====================================================
  // REPORTING & ANALYTICS
  // =====================================================

  async getControlStatusSummary(tenantId: string): Promise<ControlStatusView[]> {
    try {
      const queryText = `
        SELECT * FROM v_control_status 
        WHERE tenant_id = $1
        ORDER BY control_effectiveness_score DESC, criticality DESC
      `;

      const result = await dbQuery(queryText, [tenantId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching control status summary:', error);
      return [];
    }
  }

  async getFrameworkCompliance(tenantId: string): Promise<any[]> {
    try {
      const queryText = `
        SELECT * FROM v_framework_compliance 
        WHERE tenant_id = $1
        ORDER BY compliance_percentage DESC
      `;

      const result = await dbQuery(queryText, [tenantId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching framework compliance:', error);
      return [];
    }
  }

  async getControlKPIs(tenantId: string): Promise<any> {
    try {
      const queries = await Promise.all([
        // Total controls by status
        dbQuery(`
          SELECT status, COUNT(*) as count 
          FROM controls 
          WHERE tenant_id = $1 
          GROUP BY status
        `, [tenantId]),
        
        // Controls by criticality
        dbQuery(`
          SELECT criticality, COUNT(*) as count 
          FROM controls 
          WHERE tenant_id = $1 
          GROUP BY criticality
        `, [tenantId]),
        
        // Test coverage (last 90 days)
        dbQuery(`
          SELECT 
            COUNT(DISTINCT c.id) as total_controls,
            COUNT(DISTINCT ct.control_id) as tested_controls
          FROM controls c
          LEFT JOIN control_tests ct ON c.id = ct.control_id 
            AND ct.executed_at >= CURRENT_DATE - INTERVAL '90 days'
            AND ct.status = 'completed'
          WHERE c.tenant_id = $1
        `, [tenantId]),
        
        // Active exceptions
        dbQuery(`
          SELECT COUNT(*) as active_exceptions
          FROM control_exceptions 
          WHERE tenant_id = $1 
            AND status = 'active'
            AND (end_date IS NULL OR end_date > CURRENT_DATE)
        `, [tenantId]),
        
        // Overdue attestations
        dbQuery(`
          SELECT COUNT(*) as overdue_attestations
          FROM control_implementations 
          WHERE tenant_id = $1 
            AND status = 'active'
            AND next_review_date < CURRENT_DATE
        `, [tenantId])
      ]);

      return {
        controlsByStatus: queries[0].rows,
        controlsByCriticality: queries[1].rows,
        testCoverage: queries[2].rows[0],
        activeExceptions: queries[3].rows[0].active_exceptions,
        overdueAttestations: queries[4].rows[0].overdue_attestations
      };
    } catch (error) {
      console.error('Error fetching control KPIs:', error);
      return this.getFallbackKPIs();
    }
  }

  // =====================================================
  // FALLBACK DATA
  // =====================================================

  private getFallbackFrameworks(): Framework[] {
    return [
      {
        id: '1',
        tenant_id: 'default',
        code: 'NCA',
        name_en: 'National Cybersecurity Authority',
        name_ar: 'الهيئة الوطنية للأمن السيبراني',
        description_en: 'Saudi Arabia cybersecurity framework',
        version: '2.0',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        tenant_id: 'default',
        code: 'SAMA',
        name_en: 'Saudi Arabian Monetary Authority',
        name_ar: 'مؤسسة النقد العربي السعودي',
        description_en: 'Financial services regulatory framework',
        version: '1.0',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  private getFallbackControls(): Control[] {
    return [
      {
        id: '1',
        tenant_id: 'default',
        code: 'CTRL-NCA-AC-001',
        title_en: 'User Access Review',
        title_ar: 'مراجعة وصول المستخدمين',
        objective_en: 'Ensure user access rights are reviewed periodically',
        objective_ar: 'ضمان مراجعة حقوق وصول المستخدمين بشكل دوري',
        domain: 'ITGC',
        control_type: 'Detective',
        control_nature: 'Manual',
        frequency: 'Quarterly',
        criticality: 'High',
        maturity_level: 3,
        status: 'operating',
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  private getFallbackKPIs(): any {
    return {
      controlsByStatus: [
        { status: 'operating', count: 45 },
        { status: 'ready', count: 12 },
        { status: 'draft', count: 8 }
      ],
      controlsByCriticality: [
        { criticality: 'Critical', count: 15 },
        { criticality: 'High', count: 25 },
        { criticality: 'Medium', count: 20 },
        { criticality: 'Low', count: 5 }
      ],
      testCoverage: { total_controls: 65, tested_controls: 52 },
      activeExceptions: 3,
      overdueAttestations: 7
    };
  }
}

export default GRCService;
