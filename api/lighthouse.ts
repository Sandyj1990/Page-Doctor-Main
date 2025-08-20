import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = (req.query.url as string) || '';
    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing url' });
    }

    const isAWS = !!process.env.AWS_REGION;

    // Lazy import to reduce cold start
    const [{ default: lighthouse }, chromeLauncher] = await Promise.all([
      // @ts-ignore - lighthouse has no ESM default in some envs
      import('lighthouse'),
      isAWS ? import('chrome-aws-lambda') : import('chrome-launcher')
    ]);

    let chrome: any;
    let port: number | undefined;

    if (isAWS) {
      const chromeAWS = chromeLauncher as any;
      const executablePath = await chromeAWS.executablePath;
      chrome = await chromeAWS.puppeteer.launch({
        args: chromeAWS.args,
        defaultViewport: chromeAWS.defaultViewport,
        executablePath,
        headless: true,
      });
      // @ts-ignore puppeteer browser.wsEndpoint
      const browserWSEndpoint = await chrome.wsEndpoint();
      const { URL } = await import('url');
      port = Number(new URL(browserWSEndpoint).port);
    } else {
      const launcher = await (chromeLauncher as any).launch({ chromeFlags: ['--headless', '--no-sandbox'] });
      port = launcher.port;
      chrome = launcher;
    }

    const flags = { port, output: 'json', logLevel: 'error' } as any;
    const config = null; // default LH config

    const result = await (lighthouse as any)(url, flags, config);
    const lhr = result.lhr;

    // Close chrome
    if (isAWS) {
      await chrome.close();
    } else {
      await chrome.kill();
    }

    return res.status(200).json({ success: true, lighthouseResult: lhr });
  } catch (error: any) {
    console.error('Lighthouse run failed:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Lighthouse run failed' });
  }
} 