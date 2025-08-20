/**
 * REST API Endpoints for Page Doctor Widget
 * 
 * These endpoints can be used to integrate Page Doctor functionality
 * into external applications via standard HTTP requests.
 */

import { PageDoctorAPI, AuditRequest, ApiResponse, WidgetAuditResult } from './marketplace';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400'
};

/**
 * API Response helper
 */
function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Handle CORS preflight requests
 */
function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

/**
 * Page Doctor API Endpoints
 */
export class PageDoctorEndpoints {
  
  /**
   * POST /api/audit
   * Run a website audit
   */
  static async audit(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    if (request.method !== 'POST') {
      return jsonResponse({
        success: false,
        error: 'Method not allowed',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 405);
    }

    try {
      const auditRequest: AuditRequest = await request.json();
      const result = await PageDoctorAPI.runAudit(auditRequest);
      return jsonResponse(result);
    } catch (error) {
      return jsonResponse({
        success: false,
        error: 'Invalid request body',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 400);
    }
  }

  /**
   * GET /api/navigation?url=<url>
   * Get website navigation structure
   */
  static async navigation(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    if (request.method !== 'GET') {
      return jsonResponse({
        success: false,
        error: 'Method not allowed',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 405);
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return jsonResponse({
        success: false,
        error: 'URL parameter is required',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 400);
    }

    try {
      const result = await PageDoctorAPI.getNavigationStructure(targetUrl);
      return jsonResponse(result);
    } catch (error) {
      return jsonResponse({
        success: false,
        error: 'Failed to get navigation structure',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 500);
    }
  }

  /**
   * GET /api/discover?url=<url>&limit=<limit>
   * Discover website URLs
   */
  static async discover(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    if (request.method !== 'GET') {
      return jsonResponse({
        success: false,
        error: 'Method not allowed',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 405);
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (!targetUrl) {
      return jsonResponse({
        success: false,
        error: 'URL parameter is required',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 400);
    }

    try {
      const result = await PageDoctorAPI.discoverUrls(targetUrl, limit);
      return jsonResponse(result);
    } catch (error) {
      return jsonResponse({
        success: false,
        error: 'Failed to discover URLs',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 500);
    }
  }

  /**
   * GET /api/status
   * Get API status and version info
   */
  static async status(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    const result = PageDoctorAPI.getStatus();
    return jsonResponse(result);
  }

  /**
   * Route dispatcher for API endpoints
   */
  static async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      switch (pathname) {
        case '/api/audit':
          return await this.audit(request);
        
        case '/api/navigation':
          return await this.navigation(request);
        
        case '/api/discover':
          return await this.discover(request);
        
        case '/api/status':
          return await this.status(request);
        
        default:
          return jsonResponse({
            success: false,
            error: 'Endpoint not found',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }, 404);
      }
    } catch (error) {
      console.error('API error:', error);
      return jsonResponse({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }, 500);
    }
  }
}

/**
 * Client-side API helpers for frontend integration
 */
export class PageDoctorClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl = '/api', apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    return await response.json();
  }

  /**
   * Run an audit
   */
  async runAudit(auditRequest: AuditRequest): Promise<ApiResponse<WidgetAuditResult>> {
    return this.request('/audit', {
      method: 'POST',
      body: JSON.stringify(auditRequest)
    });
  }

  /**
   * Get navigation structure
   */
  async getNavigation(url: string): Promise<ApiResponse<any[]>> {
    return this.request(`/navigation?url=${encodeURIComponent(url)}`);
  }

  /**
   * Discover URLs
   */
  async discoverUrls(url: string, limit = 10): Promise<ApiResponse<string[]>> {
    return this.request(`/discover?url=${encodeURIComponent(url)}&limit=${limit}`);
  }

  /**
   * Get API status
   */
  async getStatus(): Promise<ApiResponse<any>> {
    return this.request('/status');
  }
}

// Export a default client instance
export const pageDoctorClient = new PageDoctorClient();

export default PageDoctorEndpoints; 