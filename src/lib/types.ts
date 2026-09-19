export const CATEGORIES = ["places", "activities", "food", "stay"] as const;
export type Category = (typeof CATEGORIES)[number];

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
  description: string;
  tags: string[];
  bestFor: string[];
  image: string;
  siteUrl: string;
  lat?: number;
  lng?: number;
  price?: string;
  mustTry?: string[];
  duration?: string;
  entry?: string;
  featured?: boolean;
};

export type GuideSection = {
  heading?: string;
  body: string;
};

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  topic: string;
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
