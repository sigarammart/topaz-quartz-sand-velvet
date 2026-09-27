import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { guides as localGuides } from "@/data/guides";
import { listings as localListings } from "@/data/listings";
import type { Category, Guide, GuideBlock, GuideSection, Listing, ListingFaq, ListingMetaGroup, ListingMetaItem, ListingStop, ListingTaxGroup, ListingTaxTerm } from "@/lib/types";
import { parseOpenHoursHtml } from "@/lib/hours";
import { bookmarkIdsFromUserMeta } from "@/lib/jet-store";
import { ARCHIVE_SLUGS, archiveCategory, categoryFromKindName } from "@/lib/listing-categories";
import { loadJetArchiveMeta, loadOpenNowSnapshot, type JetArchiveHit } from "@/lib/jet-archive";
import { contactFromListeoMeta, preferListeoAddress } from "@/lib/listeo";
import { cachedOriginText } from "@/lib/origin-cache";
import { loadListeoGeo, type ListeoGeo } from "@/lib/listeo-geo";
import { filterListingGroups, headingMatchesProfile, profileFromSlugs, profileKeys, type ListingFieldProfile } from "@/lib/listing-layouts";
import { extractOgImage, pickListingImage, uncropImage, uniqueImages } from "@/lib/media";
import { resolveListeoPaymentUrlFromOrder } from "@/lib/listeo-order-lookup";

export const WP_ORIGIN = "https://xplorepondy.com";
export const WP_APP_PASSWORD_URL = `${WP_ORIGIN}/wp-admin/authorize-application.php?app_name=Xplore%20Pondy%20App`;

export type ListeoBookingSlot = {
  id: string;
  start: string;
  end: string;
  available: boolean;
  availableCount?: number;
};

export type ListeoBookingDate = {
  value: string;
  slots: ListeoBookingSlot[];
};

// resolveListeoPaymentUrlFromOrder is imported from @/lib/listeo-order-lookup
// (no hard-fail on bridge_version string)

function stripBookingHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}
