/* ============================================================
   Curated photography — maps Photo `seed` strings to real images.
   Images are served straight from the Unsplash CDN to the browser
   (lazy-loaded), so our own server does no image processing.
   Any seed not listed here gracefully falls back to the gradient.
   ============================================================ */

const BASE = "https://images.unsplash.com/photo-";

// seed -> Unsplash photo id (all verified reachable)
const IMAGE_IDS: Record<string, string> = {
  // Weddings · Udaipur lakeside story
  "udaipur-lake-wedding": "1465495976277-4387d4b0b4c6",
  "udaipur-mandap-florals": "1606216794074-735e91aa2c92",
  "udaipur-sangeet-stage": "1464366400600-7168b8af9bc3",
  "udaipur-haldi-marigold": "1604017011826-d3b4c23f8914",
  "udaipur-reception-tablescape": "1519741497674-611481863552",
  "udaipur-couple-portrait": "1583939003579-730e3918a45a",
  "wedding-aisle-florals": "1532712938310-34cb3982ef74",

  // Corporate
  "corporate-launch-keynote": "1492684223066-81342ee5ff30",
  "corporate-stage-lights": "1511578314322-379afb476865",
  "corporate-registration-desk": "1505236858219-8359eb29e329",
  "corporate-gala-dinner": "1492366254240-43affaefc3e3",
  "corporate-press-wall": "1540575467063-178a50c2df87",
  "corporate-awards-stage": "1464366400600-7168b8af9bc3",
  "corporate-entertainment": "1519014816548-bf5fe059798b",

  // Social · anniversary
  "anniversary-garden-soiree": "1530023367847-a683933f4172",
  "social-table-setting": "1511285560929-80b456fea0bc",
  "anniversary-string-lights": "1530023367847-a683933f4172",
  "anniversary-cake-moment": "1519671482749-fd09be7ccebf",

  // Birthdays
  "birthday-balloon-arch": "1464349095431-e9a21285b5f3",
  "birthday-dessert-table": "1414235077428-338989a2e8c0",
  "birthday-play-zone": "1530103862676-de8c9debad1d",

  // Destination
  "destination-beach-ceremony": "1507504031003-b417219a0fde",
  "destination-palace-courtyard": "1535392432937-a27c36ec07b5",
  "destination-welcome-dinner": "1600891964599-f61ba0e24092",
  "destination-couple-sunset": "1469371670807-013ccf25f16a",

  // Team portraits
  "team-jasmine": "1494790108377-be9c29b29330",
  "team-kabir": "1500648767791-00dcc994a43e",
  "team-meher": "1438761681033-6461ffad8d80",
  "team-dev": "1507003211169-0a1dd7228f2d",

  // Auth brand panel
  "jasmine-auth-celebration-ballroom-candlelight": "1522413452208-996ff3f3e740",

  // Portal / generic
  "portal-event-cover": "1465495976277-4387d4b0b4c6",
  "aanya-vikram-lakeside-udaipur": "1583939003579-730e3918a45a",
  "marigold-ivory-mandap": "1606216794074-735e91aa2c92",
  "lakeside-sunset-ceremony": "1469371670807-013ccf25f16a",
  "candlelit-palace-dinner": "1492366254240-43affaefc3e3",
  "foil-invitation-suite": "1519741497674-611481863552",
  "blush-rose-centrepiece": "1532712938310-34cb3982ef74",
  "bridal-mehndi-detail": "1604017011826-d3b4c23f8914",
  "string-light-courtyard": "1530023367847-a683933f4172",
};

/** Resolve a seed to a sized Unsplash URL, or null if unmapped. */
export function imageUrl(seed: string, width = 1280): string | null {
  const id = IMAGE_IDS[seed];
  if (!id) return null;
  return `${BASE}${id}?auto=format&fit=crop&crop=entropy&q=70&w=${width}`;
}

export function hasImage(seed: string): boolean {
  return seed in IMAGE_IDS;
}
