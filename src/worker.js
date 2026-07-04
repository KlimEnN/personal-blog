const LANDING_HTML = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Андрій Клименко</title>
  <meta name="description" content="Head of Product &amp; Growth. Пишу про продукт, лідерство та AI.">
  <meta property="og:title" content="Андрій Клименко">
  <meta property="og:description" content="Head of Product &amp; Growth. Пишу про продукт, лідерство та AI.">
  <meta property="og:image" content="https://klymenko.space/andrii-klymenko.jpg">
  <meta property="og:url" content="https://klymenko.space/">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://klymenko.space/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #FAFAF8;
      --card: #FFFFFF;
      --ink: #1A1A1C;
      --secondary: #6A6A6F;
      --accent: #6457F8;
      --border: rgba(8, 8, 8, 0.08);
      --shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      --shadow-hover: 0 6px 24px rgba(0, 0, 0, 0.1);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0F0F11;
        --card: #1A1A1C;
        --ink: #F0F0EE;
        --secondary: #A0A0A5;
        --border: rgba(255, 255, 255, 0.08);
        --shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
        --shadow-hover: 0 6px 24px rgba(0, 0, 0, 0.5);
      }
    }

    html, body {
      height: 100%;
      background: var(--bg);
      color: var(--ink);
      font-family: 'Manrope', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .card {
      width: 100%;
      max-width: 340px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 36px;
    }

    .profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      text-align: center;
    }

    .avatar {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }

    .name {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--ink);
      line-height: 1.2;
    }

    .role {
      font-size: 14px;
      color: var(--secondary);
      font-weight: 500;
      margin-top: 4px;
    }

    .links {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .link {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px 20px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      text-decoration: none;
      color: var(--ink);
      font-size: 15px;
      font-weight: 600;
      box-shadow: var(--shadow);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .link:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
    }

    .link.primary {
      background: var(--accent);
      color: #ffffff;
      border-color: transparent;
    }

    .link.primary:hover {
      box-shadow: 0 6px 24px rgba(100, 87, 248, 0.4);
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="profile">
        <img class="avatar" src="/andrii-klymenko.jpg" alt="Андрій Клименко" width="84" height="84" loading="eager">
        <div>
          <div class="name">Андрій Клименко</div>
          <div class="role">Head of Product &amp; Growth</div>
        </div>
      </div>

      <div class="links">
        <a class="link primary" href="https://blog.klymenko.space">Блог</a>
        <a class="link" href="https://www.linkedin.com/in/%D0%B0%D0%BD%D0%B4%D1%80%D1%96%D0%B9-%D0%BA-32404bb7/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a class="link" href="https://app.notion.com/p/aklim/0fe17e85a0054bffbc74c39c98a9c6c5?source=copy_link" target="_blank" rel="noopener noreferrer">CV / Резюме</a>
        <a class="link" href="https://github.com/KlimEnN" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const host = request.headers.get('host') || '';
    const url = new URL(request.url);

    if (
      (host === 'klymenko.space' || host === 'www.klymenko.space') &&
      url.pathname === '/'
    ) {
      return new Response(LANDING_HTML, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600',
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
