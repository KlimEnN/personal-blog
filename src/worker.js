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

    return env.ASSETS.fetch(request);
  },
};
