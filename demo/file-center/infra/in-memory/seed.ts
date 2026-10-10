import { kindOf, ROOT_ID, typeOf } from '../../domain';
import type { Folder, MediaFile } from '../../domain';
import { localDateTime } from './store';

export { OWNERS, seed };

// The made-up media library: a tree of folders and their files. Stable (a seeded random generator); the dates are
// relative to today.

const OWNERS = ['Anna Schröder', 'Ben Carter', 'Claire Dubois', 'Daniel Fischer', 'Admin'] as const;

// A small seeded generator (mulberry32): the same seed, the same data.
function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// The storages without files of their own (id, name), directly in the root. A folder of the tree directly in the root
// is a storage too (the archive: its files are in it).
const STORAGES: readonly (readonly [string, string])[] = [['company', 'Company share'], ['media', 'Media library']];

// The folders (id, parent, name) and the files in each.
const TREE: readonly (readonly [string, string, string, readonly string[]])[] = [
  ['projects', 'company', 'Projects', ['Project overview.xlsx', 'Kick-off notes.docx']],
  ['website', 'projects', 'Website relaunch', [
    'Sitemap.pdf',
    'Wireframes.pdf',
    'Homepage draft.png',
    'Content plan.xlsx',
    'Style guide.pdf',
    'Hero banner.jpg',
    'Team photo.jpg',
    'SEO keywords.csv',
  ]],
  ['catalog', 'projects', 'Product catalog 2027', [
    'Catalog layout.pdf',
    'Price list.xlsx',
    'Product texts.docx',
    'Cover.png',
    'Print quote.pdf',
  ]],
  ['fair', 'projects', 'Trade fair Munich', [
    'Booth plan.pdf',
    'Booth rendering.png',
    'Guest list.xlsx',
    'Shipping checklist.docx',
    'Invitation.pdf',
    'Fair teaser.mp4',
  ]],
  ['marketing', 'company', 'Marketing', ['Marketing plan 2027.pptx', 'Budget.xlsx']],
  ['brand', 'marketing', 'Brand assets', ['Brand book.pdf', 'Color palette.png']],
  ['logos', 'brand', 'Logos', [
    'Logo.svg',
    'Logo white.svg',
    'Logo black.svg',
    'Logo.png',
    'Logo small.png',
    'Favicon.png',
    'Logo animation.mp4',
  ]],
  ['fonts', 'brand', 'Fonts', ['Fonts license.pdf', 'Fonts.zip']],
  ['campaigns', 'marketing', 'Campaigns', ['Campaign calendar.xlsx']],
  ['spring', 'campaigns', 'Spring 2026', [
    'Key visual.jpg',
    'Banner 728x90.png',
    'Banner 300x250.png',
    'Newsletter.pdf',
    'Results.xlsx',
    'Radio spot.mp3',
  ]],
  ['autumn', 'campaigns', 'Autumn 2026', [
    'Briefing.docx',
    'Moodboard.pdf',
    'Key visual draft.jpg',
    'Social posts.pptx',
    'Video storyboard.pdf',
  ]],
  ['social', 'marketing', 'Social media', [
    'Post January.jpg',
    'Post February.jpg',
    'Post March.jpg',
    'Story template.png',
    'Reel intro.mp4',
    'Reel outro.mp4',
    'Posting plan.xlsx',
  ]],
  ['photos', 'media', 'Photos', []],
  ['events', 'photos', 'Events', []],
  ['summer', 'events', 'Summer party 2026', [
    'Summer party 001.jpg',
    'Summer party 002.jpg',
    'Summer party 003.jpg',
    'Summer party 004.jpg',
    'Summer party 005.jpg',
    'Summer party 006.jpg',
    'Summer party 007.jpg',
    'Summer party 008.jpg',
    'Summer party 009.jpg',
    'Summer party 010.jpg',
    'Summer party 011.jpg',
    'Summer party 012.jpg',
    'Speech.m4a',
    'Highlights.mp4',
  ]],
  ['christmas', 'events', 'Christmas 2025', [
    'Christmas 001.jpg',
    'Christmas 002.jpg',
    'Christmas 003.jpg',
    'Christmas 004.jpg',
    'Christmas 005.jpg',
    'Christmas 006.jpg',
    'Group photo.jpg',
  ]],
  ['office', 'photos', 'Office', [
    'Reception.jpg',
    'Meeting room.jpg',
    'Kitchen.jpg',
    'Open space.jpg',
    'Building outside.jpg',
    'Roof terrace.jpg',
  ]],
  ['products', 'photos', 'Products', [
    'Chair front.png',
    'Chair side.png',
    'Desk.png',
    'Lamp.png',
    'Shelf.png',
    'Product shots raw.zip',
  ]],
  ['documents', 'company', 'Documents', ['Company profile.pdf', 'Org chart.pdf']],
  ['contracts', 'documents', 'Contracts', [
    'Agency contract.pdf',
    'Photographer contract.pdf',
    'Hosting contract.pdf',
    'NDA template.docx',
    'Image rights.pdf',
  ]],
  ['templates', 'documents', 'Templates', [
    'Letter template.docx',
    'Presentation template.pptx',
    'Invoice template.xlsx',
    'Email signature.png',
    'Press release template.docx',
  ]],
  ['reports', 'documents', 'Reports', [
    'Annual report 2025.pdf',
    'Quarterly report Q1.pdf',
    'Quarterly report Q2.pdf',
    'Quarterly report Q3.pdf',
    'Web analytics.csv',
    'Media coverage.xlsx',
  ]],
  ['videos', 'media', 'Videos', [
    'Image film.mp4',
    'Image film short.mp4',
    'CEO message.mov',
    'Tutorial setup.mp4',
    'Tutorial basics.mp4',
    'Customer interview.mp4',
    'Subtitles.txt',
  ]],
  ['audio', 'media', 'Audio', ['Podcast episode 1.mp3', 'Podcast episode 2.mp3', 'Jingle.wav', 'Hold music.mp3']],
  ['archive', ROOT_ID, 'Archive', ['Old website.zip', 'Photos 2023.zip', 'Photos 2024.zip', 'Campaigns 2025.tar']],
];

// A plausible size per kind, in bytes.
const SIZES: Readonly<Record<string, readonly [number, number]>> = {
  image: [180_000, 6_000_000],
  video: [20_000_000, 900_000_000],
  audio: [2_000_000, 60_000_000],
  document: [30_000, 4_000_000],
  spreadsheet: [15_000, 1_200_000],
  presentation: [400_000, 18_000_000],
  archive: [5_000_000, 1_500_000_000],
  other: [1_000, 80_000],
};

function seed(): { folders: Folder[]; files: MediaFile[] } {
  const random = createRandom(2026);
  const pick = <T>(values: readonly T[]): T => values[Math.floor(random() * values.length)] as T;
  const now = Date.now();
  const daysAgo = (from: number, to: number) =>
    localDateTime(new Date(now - (from + random() * (to - from)) * 24 * 60 * 60 * 1000));
  const root: Folder = { id: ROOT_ID, parentId: null, name: 'Files', created: daysAgo(900, 900), owner: 'Admin' };
  // Set up with the root (no random numbers taken: the rest stays as it was before the storages).
  const folders: Folder[] = [
    root,
    ...STORAGES.map(([id, name]): Folder => ({ ...root, id, parentId: ROOT_ID, name, storage: true })),
  ];
  const files: MediaFile[] = [];
  let next = 1;

  for (const [id, parentId, name, names] of TREE) {
    const owner = pick(OWNERS);

    folders.push({
      id,
      parentId,
      name,
      created: daysAgo(200, 700),
      owner,
      ...(parentId === ROOT_ID ? { storage: true as const } : {}),
    });

    for (const fileName of names) {
      const kind = kindOf(fileName);
      const [min, max] = SIZES[kind] ?? [1_000, 100_000];

      files.push({
        id: `f${next++}`,
        folderId: id,
        name: fileName,
        type: typeOf(fileName),
        kind,
        size: Math.round(min + random() * random() * (max - min)),
        modified: daysAgo(0, 180),
        // Mostly the folder's owner.
        owner: random() < 0.7 ? owner : pick(OWNERS),
      });
    }
  }

  // A few favorites (2026-10-08; no random numbers taken): two folders and every 15th file.
  return {
    folders: folders.map((folder) => (FAVORITE_FOLDERS.includes(folder.id) ? { ...folder, favorite: true } : folder)),
    files: files.map((file, index) => (index % 15 === 4 ? { ...file, favorite: true } : file)),
  };
}

const FAVORITE_FOLDERS: readonly string[] = ['logos', 'website'];
