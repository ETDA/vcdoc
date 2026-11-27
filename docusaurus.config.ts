import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {docusaurusVersions} from './versions.meta.mjs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Thai VC ARF',
  tagline: 'Thai Verifiable Credentials Architecture and Reference Framework',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://ETDA.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/vcdoc/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'ETDA', // Usually your GitHub org/user name.
  projectName: 'vcdoc', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  // ARF source files contain references to material outside this site.
  onBrokenLinks: 'warn',

  // Version history pages and the per-pair deltas (see versions.meta.mjs).
  plugins: ['./plugins/version-delta/index.mjs'],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    // Offline local search (no Algolia account needed) — works on GitHub Pages
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        // docs are served at the site root (routeBasePath: '/')
        docsRouteBasePath: '/',
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        // NOTE: 'th' triggers a lunr tokenizer bug (token.update is not a function),
        // so we index with 'en'. Thai text is still searchable (whitespace-tokenized).
        language: ['en'],
        // Frozen versions repeat the current text; index only the working draft
        // so one document does not show up once per version.
        ignoreFiles: [/^\/2\.0-draft-/],
      },
    ],
  ],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'th',
    locales: ['th'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Serve docs at the site root so the homepage IS the content
          routeBasePath: '/',
          lastVersion: 'current',
          versions: docusaurusVersions(),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/ETDA/vcdoc/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/thai-vc-arf-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Thai VC ARF',
      logo: {
        alt: 'Thai VC ARF Logo',
        src: 'img/favicon.ico',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Thai VC ARF',
        },
        {
          to: '/en/thai-vc-arf/minimal-interoperability-reference',
          label: 'VC stack (EN)',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          to: '/versions',
          label: 'ประวัติเวอร์ชัน',
          position: 'right',
        },
        {
          href: 'https://github.com/ETDA/vcdoc/issues',
          label: 'Issues',
          position: 'right',
        },
        {
          href: 'https://github.com/ETDA/vcdoc',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Thai VC ARF',
              to: '/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/ETDA/vcdoc',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ETDA. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
