// Caching disabled for analytics; using direct fetch only

// Types for external data
export interface TrafficData {
	monthlyVisits: number;
	monthlyVisitsChange: number;
	averageVisitDuration: number;
	pagesPerVisit: number;
	bounceRate: number;
	topCountries: Array<{
		country: string;
		percentage: number;
	}>;
	trafficSources: {
		direct: number;
		search: number;
		social: number;
		referral: number;
		email: number;
		ads: number;
	};
}

export interface SEOMetrics {
	domainAuthority: number;
	pageAuthority: number;
	totalBacklinks: number;
	referringDomains: number;
	organicKeywords: number;
	organicTraffic: number;
	organicTrafficValue: number;
	topKeywords: Array<{
		keyword: string;
		position: number;
		searchVolume: number;
		difficulty: number;
		url: string;
	}>;
}

export interface TopPages {
	pages: Array<{
		url: string;
		title: string;
		visits: number;
		percentage: number;
		avgTimeOnPage: number;
		bounceRate: number;
	}>;
}

export interface BacklinkData {
	totalBacklinks: number;
	referringDomains: number;
	domainRating: number;
	topBacklinks: Array<{
		sourceUrl: string;
		sourceDomain: string;
		targetUrl: string;
		anchorText: string;
		domainRating: number;
		traffic: number;
		linkType: 'dofollow' | 'nofollow';
		firstSeen: string;
	}>;
	topReferringDomains: Array<{
		domain: string;
		backlinks: number;
		domainRating: number;
		traffic: number;
	}>;
}

export interface DomainAnalytics {
	domain: string;
	lastUpdated: string;
	traffic: TrafficData;
	seo: SEOMetrics;
	topPages: TopPages;
	backlinks: BacklinkData;
	competitorAnalysis?: {
		competitors: Array<{
			domain: string;
			similarityScore: number;
			monthlyVisits: number;
			domainAuthority: number;
		}>;
	};
}

export interface ExternalDataConfig {
	lighthouse?: {
		enabled: boolean;
		endpoint: string;
	};
}

class ExternalDataService {
	private config: ExternalDataConfig;

	constructor() {
		this.config = {
			lighthouse: {
				enabled: false, // Disabled until lighthouse package is properly installed
				endpoint: '/api/lighthouse'
			}
		};
	}

	/**
	 * Get comprehensive domain analytics using open-source providers (Lighthouse for performance)
	 */
	async getDomainAnalytics(domain: string): Promise<{
		success: boolean;
		data?: DomainAnalytics;
		error?: string;
	}> {
		try {
			console.log('🚀 Getting domain analytics for:', domain);

			const trafficData = await this.getTrafficData(domain);
			const seoMetrics = this.getDefaultSEOMetrics();
			const topPages = this.getDefaultTopPages();
			const backlinkData = this.getDefaultBacklinkData();

			return {
				success: true,
				data: {
					domain,
					traffic: trafficData,
					seo: seoMetrics,
					topPages,
					backlinks: backlinkData,
					competitorAnalysis: { competitors: [] },
					lastUpdated: new Date().toISOString()
				}
			};
		} catch (error) {
			console.error('❌ Domain analytics failed:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}

	/**
	 * Traffic data placeholder (no paid traffic provider)
	 */
	private async getTrafficData(_domain: string): Promise<TrafficData> {
		return this.getDefaultTrafficData();
	}

	/**
	 * Run Lighthouse via local API and return core metrics (with error handling)
	 */
	async runLighthouse(domain: string): Promise<{
		lhr?: any;
		metrics?: {
			firstContentfulPaint?: number;
			largestContentfulPaint?: number;
			totalBlockingTime?: number;
			cumulativeLayoutShift?: number;
			speedIndex?: number;
			interactive?: number;
		};
	} | null> {
		try {
			if (!this.config.lighthouse?.enabled) {
				console.log('ℹ️ Lighthouse disabled in configuration');
				return null;
			}

			const url = domain.startsWith('http') ? domain : `https://${domain}`;
			const endpoint = `${this.config.lighthouse.endpoint}?url=${encodeURIComponent(url)}`;
			
			console.log('🔍 Attempting Lighthouse API call...');
			const resp = await fetch(endpoint, { 
				method: 'GET'
			});

			if (!resp.ok) {
				console.warn(`Lighthouse API returned ${resp.status} - skipping Lighthouse data`);
				return null;
			}

			const json = await resp.json();
			if (json.error) {
				console.warn('Lighthouse API error:', json.error);
				return null;
			}

			const lhr = json?.lighthouseResult;
			if (!lhr) {
				console.warn('No Lighthouse result found');
				return null;
			}

			const audits = lhr.audits || {};
			const metrics = {
				firstContentfulPaint: audits['first-contentful-paint']?.numericValue,
				largestContentfulPaint: audits['largest-contentful-paint']?.numericValue,
				totalBlockingTime: audits['total-blocking-time']?.numericValue,
				cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue,
				speedIndex: audits['speed-index']?.numericValue,
				interactive: audits['interactive']?.numericValue
			};

			console.log('✅ Lighthouse data retrieved successfully');
			return { lhr, metrics };
		} catch (e) {
			console.warn('⚠️ Lighthouse unavailable (this is OK - Phase 1 will still work):', e.message);
			return null;
		}
	}

	/**
	 * SEO metrics: defaults only (no Ahrefs/Moz/SEMrush)
	 */
	private getSEOMetrics(_domain: string): SEOMetrics {
		return this.getDefaultSEOMetrics();
	}

	/**
	 * Top pages: defaults only
	 */
	private async getTopPages(_domain: string): Promise<TopPages> {
		return this.getDefaultTopPages();
	}

	/**
	 * Backlinks: defaults only
	 */
	private async getBacklinkData(_domain: string): Promise<BacklinkData> {
		return this.getDefaultBacklinkData();
	}

	/**
	 * Default fallback data
	 */
	private getDefaultTrafficData(): TrafficData {
		return {
			monthlyVisits: 0,
			monthlyVisitsChange: 0,
			averageVisitDuration: 0,
			pagesPerVisit: 0,
			bounceRate: 0,
			topCountries: [],
			trafficSources: { direct: 0, search: 0, social: 0, referral: 0, email: 0, ads: 0 }
		};
	}

	private getDefaultSEOMetrics(): SEOMetrics {
		return {
			domainAuthority: 0,
			pageAuthority: 0,
			totalBacklinks: 0,
			referringDomains: 0,
			organicKeywords: 0,
			organicTraffic: 0,
			organicTrafficValue: 0,
			topKeywords: []
		};
	}

	private getDefaultTopPages(): TopPages {
		return { pages: [] };
	}

	private getDefaultBacklinkData(): BacklinkData {
		return {
			totalBacklinks: 0,
			referringDomains: 0,
			domainRating: 0,
			topBacklinks: [],
			topReferringDomains: []
		};
	}

	/**
	 * Caching methods - disabled (no-op)
	 */
	private async getCachedDomainData(_domain: string): Promise<DomainAnalytics | null> {
		return null;
	}

	private async cacheDomainData(_domain: string, _analytics: DomainAnalytics): Promise<void> {
		return;
	}

	/**
	 * Providers status (Lighthouse only)
	 */
	getProvidersStatus() {
		return {
			lighthouse: {
				name: 'Lighthouse (Local API)',
				enabled: this.config.lighthouse?.enabled || false,
				features: ['Performance', 'Web Vitals']
			}
		};
	}
}

export const externalDataService = new ExternalDataService();
export default externalDataService; 