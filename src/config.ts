export const licensePresets = {
  'cc-by-4.0': {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  'cc-by-sa-4.0': {
    name: 'CC BY-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  'cc-by-nc-4.0': {
    name: 'CC BY-NC 4.0',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
  },
  'cc-by-nc-sa-4.0': {
    name: 'CC BY-NC-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
  'cc0': {
    name: 'CC0 1.0',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  'all-rights-reserved': {
    name: 'All Rights Reserved',
    url: null as string | null,
  },
} as const;

export type LicensePreset = keyof typeof licensePresets;

export const siteConfig = {
  name: 'LCZBlog',
  siteUrl: 'https://example.com',
  defaultLang: 'zh-cn',
  description: {
    'zh-cn': '立足中国，服务全球互联网的垃圾文字贩子。',
    'en-us': 'A trash word peddler based in China, serving the global internet.',
  },
  /** Set to null to hide license notice in footer */
  license: 'cc-by-nc-sa-4.0' as LicensePreset | null,
  countrySpecificOptions: {
    china: {
      miitIcp: {
        /** ICP record number shown only in the Simplified Chinese footer. */
        recordNumber: '渝ICP备2020010307号-2' as string | null,
      },
      mpsBeian: {
        /** Public security record text, e.g. "京公网安备 11000000000000号". */
        recordNumber: '渝公网安备50011702500718号' as string | null,
      },
    },
  },
  author: {
    name: 'Caozhi Li',
    avatar: '/avtr.jpeg',
    bio: {
      'zh-cn': '「行千里，致广大。」',
      'en-us': '「行千里，致广大。」',
    },
    links: {
      github: 'https://github.com/zaochih',
      /** Twitter/X handle without @, e.g. 'zaochih'. Set to null to omit. */
      twitter: 'zaochih' as string | null,
    },
  },
  comments: {
    provider: 'giscus',
    enabled: true,
    repo: 'zaochih/astroblog',
    repoId: 'R_kgDOSCecoA',
    category: 'Comments',
    categoryId: 'DIC_kwDOSCecoM4C8sfm',
    privacyUrl: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
  },
} as const;
