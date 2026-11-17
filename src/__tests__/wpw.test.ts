import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  buildPostHierarchy,
  extractExcerpt,
  hash2019,
  hashWpw,
  parsePageRelativePath,
  parsePostRelativePath,
  RelativePathMetadata,
  TaxonomyRegistry,
  toKebabCase,
} from '../index.js';
import {
  createRemarkResolveImages,
  remarkLinksToFootnotes,
  remarkNumberedHeadings,
} from '../remark/index.js';

test('hash2019 and hashWpw compute exact expected suffixes on J-Space post', () => {
  const id = '2026-07-20-j-space-reveals-how-examples-shape-model-behavior';
  assert.equal(hash2019(id), 'fa92');
  assert.equal(hashWpw(id), '5bae');
});

test('RelativePathMetadata parses valid standalone, wrapped, localized, and timezone paths', () => {
  const standalone = RelativePathMetadata.make('1990-01-02-post-name.md');
  assert.ok(standalone);
  assert.equal(standalone.name, 'post-name');
  assert.deepEqual(standalone.createdTime, new Date('1990-01-02'));
  assert.equal(standalone.masterID, hashWpw('1990-01-02-post-name'));
  assert.equal(standalone.legacyHash2019, hash2019('1990-01-02-post-name'));
  assert.equal(standalone.filename, '1990-01-02-post-name.md');
  assert.equal(standalone.locale, null);
  assert.equal(standalone.representsPostMaster, true);
  assert.equal(standalone.isLocalized, false);

  const dateTime = RelativePathMetadata.make('1990-01-02T04_03_02-post-name.md');
  assert.ok(dateTime);
  assert.deepEqual(dateTime.createdTime, new Date('1990-01-02T04:03:02'));
  assert.equal(dateTime.masterID, hashWpw('1990-01-02T04:03:02-post-name'));

  const zh = RelativePathMetadata.make('1990-01-02-post-name/zh/index.md');
  assert.ok(zh);
  assert.equal(zh.locale, 'zh');
  assert.equal(zh.isLocalized, true);
  assert.equal(zh.representsPostMaster, false);
  assert.equal(zh.masterID, hashWpw('1990-01-02-post-name'));

  const zhHans = RelativePathMetadata.make(
    '2026-07-20-j-space-reveals-how-examples-shape-model-behavior/zh-Hans/index.md',
  );
  assert.ok(zhHans);
  assert.equal(zhHans.locale, 'zh-Hans');
  assert.equal(zhHans.masterID, '5bae');
  assert.equal(zhHans.legacyHash2019, 'fa92');
  assert.equal(
    zhHans.blogSlug,
    '/post/2026/07/j-space-reveals-how-examples-shape-model-behavior-fa92',
  );
  assert.equal(
    zhHans.wmpSlug,
    'j-space-reveals-how-examples-shape-model-behavior-5bae/zh-Hans',
  );

  const tzColon = RelativePathMetadata.make(
    '1990-01-02T04_03_02+08_00-post-name/index.md',
  );
  assert.ok(tzColon);
  assert.deepEqual(tzColon.createdTime, new Date('1990-01-02T04:03:02+08:00'));

  const tzCompact = RelativePathMetadata.make(
    '1990-01-02T04_03_02+0800-post-name/index.md',
  );
  assert.ok(tzCompact);
  assert.deepEqual(tzCompact.createdTime, new Date('1990-01-02T04:03:02+0800'));
});

test('RelativePathMetadata rejects malformed dates and non-index scratch files', () => {
  const invalidPaths = [
    '19-01-02-post-name.md',
    '1990-1-02-post-name.md',
    '1990-01-2-post-name/index.md',
    '1990-01-02T4_33_22-post-name/index.md',
    '1990-01-02T04_3_22-post-name/index.md',
    '1990-01-02T04_03_2-post-name/index.md',
    '1990-01-02+0800-post-name/index.md',
    '2025-08-31-the-cupertino-ghost-in-the-machine/index_raw.md',
    '2025-08-31-the-cupertino-ghost-in-the-machine/zh-Hans/index_raw.md',
  ];

  for (const invalid of invalidPaths) {
    assert.equal(
      RelativePathMetadata.make(invalid),
      null,
      `Expected null for ${invalid}`,
    );
  }
});

test('parsePageRelativePath handles standalone and localized pages', () => {
  const profile = parsePageRelativePath('profile/index.mdx');
  assert.equal(profile.slug, '/profile');
  assert.equal(profile.isLocalized, false);

  const l10nProfile = parsePageRelativePath('profile/zh-Hans/index.md');
  assert.equal(l10nProfile.slug, '/profile');
  assert.equal(l10nProfile.lang, 'zh-Hans');
  assert.equal(l10nProfile.isLocalized, true);
});

test('TaxonomyRegistry enforces kebab-case collision checks and counts posts', () => {
  const reg = new TaxonomyRegistry();
  const swift1 = reg.registerTag('SwiftUI');
  const swift2 = reg.registerTag('SwiftUI');
  assert.equal(swift1.kebabName, 'swift-ui');
  assert.equal(swift2.counts, 2);

  assert.throws(
    () => reg.registerTag('Swift UI'),
    /shares? the same kebab name: swift-ui/,
  );

  reg.registerCategory('Programming');
  assert.throws(
    () => reg.registerCategory('programming'),
    /shares? the same kebabName: programming/,
  );

  assert.equal(toKebabCase('Objective-C'), 'objective-c');
});

test('buildPostHierarchy clusters locales, creates imaginary master for l10n-only posts, and filters scratch files', () => {
  const hierarchy = buildPostHierarchy([
    {
      id: '2026-07-20-j-space-reveals-how-examples-shape-model-behavior/index.md',
      data: {
        title: 'J-Space Reveals How Examples Shape Model Behavior',
        category: 'Programming',
        tags: ['AI', 'Prompting'],
      },
      entry: 'en-entry',
    },
    {
      id: '2026-07-20-j-space-reveals-how-examples-shape-model-behavior/zh-Hans/index.md',
      data: {
        title: 'J-Space 揭示示例如何塑造模型行为',
        category: 'Programming',
        tags: ['AI'],
      },
      entry: 'zh-entry',
    },
    {
      id: '2024-01-10-chinese-only-note/zh-Hans/index.md',
      data: {
        title: '仅中文笔记',
        tags: ['Notes'],
      },
      entry: 'zh-only',
    },
    {
      id: '2025-08-31-the-cupertino-ghost-in-the-machine/zh-Hans/index_raw.md',
      data: { title: 'Raw Backup' },
      entry: 'ignored-raw',
    },
  ]);

  assert.equal(hierarchy.masters.length, 2);

  const jSpace = hierarchy.masters.find(m => m.masterId === '5bae');
  assert.ok(jSpace);
  assert.equal(jSpace.legacyHash2019, 'fa92');
  assert.equal(jSpace.canonicalPost.isImaginaryMaster, false);
  assert.equal(jSpace.canonicalPost.canPublishOnWMP, false);
  assert.equal(jSpace.localizedPosts.get('zh-Hans')?.canPublishOnWMP, true);
  assert.equal(
    jSpace.localizedPosts.get('zh-Hans')?.wmpSlug,
    'j-space-reveals-how-examples-shape-model-behavior-5bae/zh-Hans',
  );

  const l10nOnly = hierarchy.masters.find(m => m.name === 'chinese-only-note');
  assert.ok(l10nOnly);
  assert.equal(l10nOnly.canonicalPost.isImaginaryMaster, true);
  assert.equal(l10nOnly.canonicalPost.isPublished, false);
  assert.equal(l10nOnly.localizedPosts.get('zh-Hans')?.title, '仅中文笔记');

  // AI appeared on both EN and ZH posts => counts === 2
  assert.equal(hierarchy.taxonomies.getTag('AI')?.counts, 2);
});

test('remarkNumberedHeadings and remarkLinksToFootnotes transform AST deterministically', () => {
  const tree: any = {
    type: 'root',
    children: [
      { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Intro' }] },
      { type: 'heading', depth: 3, children: [{ type: 'text', value: 'Part A' }] },
      { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Conclusion' }] },
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://example.com/paper',
            children: [{ type: 'text', value: 'Paper' }],
          },
        ],
      },
    ],
  };

  remarkNumberedHeadings()(tree);
  assert.equal(tree.children[0].data.hProperties['data-heading-number'], '1');
  assert.equal(tree.children[1].data.hProperties['data-heading-number'], '1.1');
  assert.equal(tree.children[2].data.hProperties['data-heading-number'], '2');

  remarkLinksToFootnotes()(tree);
  assert.equal(tree.children[3].children[0].value, 'Paper');
  assert.equal(tree.children[3].children[1].data.hName, 'sup');
  assert.equal(tree.children[4].data.hProperties['data-wmp-link-footnotes'], '1');
});

test('extractExcerpt strips frontmatter and prunes at word boundary', () => {
  const md = `---\ntitle: Hello\n---\n\nAlpha beta gamma delta epsilon zeta.`;
  assert.equal(extractExcerpt(md, 20), 'Alpha beta gamma…');
});

test('createRemarkResolveImages resolves @2x/@3x assets across base and parent directories', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wpw-img-test-'));
  const zhDir = path.join(tmpDir, 'zh-Hans');
  fs.mkdirSync(zhDir, { recursive: true });

  // 1x1 PNG bytes
  const png1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  );
  fs.writeFileSync(path.join(tmpDir, 'diagram@2x.png'), png1x1);

  const tree: any = {
    type: 'root',
    children: [
      {
        type: 'code',
        lang: 'swift',
        meta: 'path=Example.swift version=6.0',
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            url: 'diagram.png',
            title: 'System Diagram',
          },
        ],
      },
    ],
  };

  const transform = createRemarkResolveImages({ maxWidth: 712 })();
  await transform(tree, { history: [path.join(zhDir, 'index.md')] });

  assert.equal(
    tree.children[0].data.hProperties['data-meta'],
    'path=Example.swift version=6.0',
  );
  assert.equal(tree.children[0].data.hProperties['data-lang'], 'swift');
  assert.equal(tree.children[1].children[0].url, '../diagram@2x.png');
  assert.equal(
    tree.children[1].children[0].data.hProperties['data-caption'],
    'System Diagram',
  );

  fs.rmSync(tmpDir, { recursive: true, force: true });
});
