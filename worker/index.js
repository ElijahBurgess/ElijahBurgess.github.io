const GOOGLE_VERIFICATION_PATH = '/google43c3fa07e4f754c4.html';
const GOOGLE_VERIFICATION_BODY = 'google-site-verification: google43c3fa07e4f754c4.html';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === GOOGLE_VERIFICATION_PATH) {
      return new Response(request.method === 'HEAD' ? null : GOOGLE_VERIFICATION_BODY, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'X-Frame-Options': 'SAMEORIGIN',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
