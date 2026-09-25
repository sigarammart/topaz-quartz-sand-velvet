export const CATEGORIES = ["places", "activities", "food", "stay"] as const;
export type Category = (typeof CATEGORIES)[number];

export type ListingTaxTerm = {
  name: string;
  slug: string;
};

export type ListingTaxGroup = {
  key: string;
  label: string;
  terms: ListingTaxTerm[];
};

export type ListingStop = {
  time?: string;
  day?: string;
  title: string;
  description?: string;
};

export type ListingFaq = {
  question: string;
  answer: string;
};

export type ListingMetaItem = {
  label: string;
  included?: boolean;
};

export type ListingMetaGroup = {
  title: string;
  items: ListingMetaItem[];
  text?: string;
};

export type DayHours = {
  day: string;
  slots: string[];
};

export type Listing = {
  slug: string;
  name: string;
  category: Category;
  kind: string;
  rating: number;
  reviews: number;
  location: string;
  area: string;
  distance: string;
  hours: string;
  openNow?: boolean;
  weeklyHours?: DayHours[];
  description: string;
  tags: string[];
  bestFor: string[];
  image: string;
  siteUrl: string;
  wpId?: number;
  lat?: number;
  lng?: number;
  price?: string;
  mustTry?: string[];
  duration?: string;
  entry?: string;
  featured?: boolean;
  listingPackage?: number;
  phone?: string;
  website?: string;
  address?: string;
  friendlyAddress?: string;
  cafeTypes?: string[];
  accessibility?: string[];
  tripDays?: string;
  groupSize?: string;
  taxonomies?: ListingTaxGroup[];
  categorySlugs?: string[];
  itinerary?: ListingStop[];
  faqs?: ListingFaq[];
  menuImages?: string[];
  metaGroups?: ListingMetaGroup[];
  metaFacets?: ListingTaxGroup[];
  gallery?: string[];
};

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "img"; src: string; alt?: string }
  | { type: "tip"; label: string; text: string }
  | { type: "callout"; label: string; text: string };

export type GuideSection = {
  heading?: string;
  body: string;
  blocks?: GuideBlock[];
};

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  topic: string;
  categories?: string[];
  tags?: string[];
  siteUrl?: string;
  sections: GuideSection[];
};

export type PondyEvent = {
  slug: string;
  title: string;
  dateLabel: string;
  when: string;
  place: string;
  image: string;
  description: string;
  tags: string[];
};

export type TripTemplate = {
  slug: string;
  title: string;
  days: number;
  blurb: string;
  image: string;
  items: { slug: string; day: number }[];
};

export const CATEGORY_META: Record<
  Category,
  { label: string; kicker: string; description: string; image: string }
> = {
  places: {
    label: "Places to visit",
    kicker: "Top spots",
    description: "Beaches, White Town, temples, and the French Quarter.",
    image: "/images/french-quarter.jpg",
  },
  activities: {
    label: "Things to do",
    kicker: "Activities",
    description: "Scuba, surfing, boat rides, and slow heritage walks.",
    image: "/images/scuba.jpg",
  },
  food: {
    label: "Eat & drink",
    kicker: "Cafés & pubs",
    description: "French bakeries, filter coffee, Chettinad, and late nights.",
    image: "/images/cafe.jpg",
  },
  stay: {
    label: "Stay",
    kicker: "Hotels & homestays",
    description: "Heritage villas, beach inns, and city hotels.",
    image: "/images/hotel.jpg",
  },
};

export const SITE = {
  name: "Xplore Pondy",
  url: "https://xplorepondy.com",
  tagline: "Explore Puducherry like never before",
};
