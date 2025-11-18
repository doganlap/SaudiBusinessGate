export const redFlagsAgents = {
  async executeAgent(job: {
    jobId: string;
    jobType: string;
    tenantId: string;
    incidentId?: string;
    priority?: string;
    inputData?: any;
  }) {
    return {
      jobId: job.jobId,
      jobType: job.jobType,
      tenantId: job.tenantId,
      status: 'completed',
      result: `Executed ${job.jobType} for tenant ${job.tenantId}`,
      completedAt: new Date().toISOString(),
    };
  },
};