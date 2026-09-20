import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const listingSchema = z.object({
  slug: z.string(),
  name: z.string(),
  kind: z.string(),
  area: z.string(),
  category: z.string(),
  description: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  duration: z.string().optional(),
});

export const generateAiItinerary = createServerFn({ method: "POST" })
  .validator(
    z.object({
      days: z.number().min(1).max(7),
      tripType: z.string(),
      interests: z.array(z.string()),
      locationLabel: z.string(),
      items: z.array(z.object({ slug: z.string(), day: z.number() })),
      listings: z.array(listingSchema).max(40),
    }),
  )
  .handler(async ({ data }) => {
    const { polishItineraryWithGemini } = await import("./gemini.server");
    const result = await polishItineraryWithGemini(data);
    if (!result) return { ok: false as const };
    return { ok: true as const, days: result.days, items: result.items };
  });
