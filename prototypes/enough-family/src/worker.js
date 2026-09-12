// Isolated prototype: no accounts, database, image-upload endpoint or feed scraper.
const SECURITY = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'none'; script-src 'self' https://cdn.jsdelivr.net 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self' https://cdn.jsdelivr.net https://tessdata.projectnaptha.com; worker-src blob: https://cdn.jsdelivr.net; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
};
export default {
  async fetch(request, env) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('No upload endpoint. Method not allowed.', {
        status: 405, headers: { ...SECURITY, Allow: 'GET, HEAD' }
      });
    }
    const url = new URL(request.url);
    let response;
    if (url.pathname === '/health') {
      response = Response.json({
        status: 'ok', version: '0.2.0',
        blocking: false, instagramAccess: false, storedPlans: false,
        recommendations: 'deterministic', clinicalValidation: false
      });
    } else {
      response = await env.ASSETS.fetch(request);
    }
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY)) headers.set(key, value);
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status, statusText: response.statusText, headers
    });
  }
};
