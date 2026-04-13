import type { NextConfig } from 'next';

const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages serves from /miniapp/ subpath
  basePath: isGitHubPages ? '/miniapp' : '',
  assetPrefix: isGitHubPages ? '/miniapp/' : '',
  // Trailing slash needed for static hosting on GitHub Pages
  trailingSlash: true,
};

export default nextConfig;
