export default {
  async fetch(request, env) {
    const host = request.headers.get('host') || '';
    const url = new URL(request.url);

    // 301: всі варіанти → https://klymenko.space
    if (
      host === 'blog.klymenko.space' ||
      host === 'www.blog.klymenko.space' ||
      host === 'www.klymenko.space'
    ) {
      return Response.redirect(`https://klymenko.space${url.pathname}${url.search}`, 301);
    }

    // HTTP → HTTPS
    if (url.protocol === 'http:') {
      return Response.redirect(`https://klymenko.space${url.pathname}${url.search}`, 301);
    }

    // API: GET /api/stats/:slug
    const statsMatch = url.pathname.match(/^\/api\/stats\/([^/]+)\/?$/);
    if (statsMatch && request.method === 'GET') {
      const slug = statsMatch[1];
      const [views, likes] = await Promise.all([
        env.BLOG_STATS.get(`views:${slug}`),
        env.BLOG_STATS.get(`likes:${slug}`),
      ]);
      return new Response(
        JSON.stringify({ views: parseInt(views || '0'), likes: parseInt(likes || '0') }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // API: POST /api/view/:slug — client-side view beacon
    const viewMatch = url.pathname.match(/^\/api\/view\/([^/]+)\/?$/);
    if (viewMatch && request.method === 'POST') {
      const slug = viewMatch[1];
      const current = parseInt((await env.BLOG_STATS.get(`views:${slug}`)) || '0');
      await env.BLOG_STATS.put(`views:${slug}`, String(current + 1));
      return new Response(
        JSON.stringify({ views: current + 1 }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // API: POST /api/like/:slug
    const likeMatch = url.pathname.match(/^\/api\/like\/([^/]+)\/?$/);
    if (likeMatch && request.method === 'POST') {
      const slug = likeMatch[1];
      const current = parseInt((await env.BLOG_STATS.get(`likes:${slug}`)) || '0');
      const next = current + 1;
      await env.BLOG_STATS.put(`likes:${slug}`, String(next));
      return new Response(
        JSON.stringify({ likes: next }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return env.ASSETS.fetch(request);
  },
};
