// Sandbox service for demo functionality
export const quickAccessSandbox = async () => {
  try {
    // Simulate sandbox creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock session data
    return {
      id: 'demo-session-' + Date.now(),
      url: '/dashboard',
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      type: 'demo'
    };
  } catch (error) {
    console.error('Sandbox creation error:', error);
    throw new Error('Failed to create sandbox session');
  }
};

export const createSandboxSession = async (config = {}) => {
  try {
    // Simulate sandbox session creation with config
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: 'sandbox-' + Date.now(),
      url: '/dashboard',
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      type: 'sandbox',
      config
    };
  } catch (error) {
    console.error('Sandbox session creation error:', error);
    throw new Error('Failed to create sandbox session');
  }
};