export default {
  async fetch(request, env) {
    const host = request.headers.get('host') || '';
    const url = new URL(request.url);

    // 301 redirect: blog.klymenko.space → klymenko.space
    if (host === 'blog.klymenko.space' || host === 'www.blog.klymenko.space') {
      const target = `https://klymenko.space${url.pathname}${url.search}`;
      return Response.redirect(target, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
