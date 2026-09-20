import { t as env } from "./env.server-wS9zOhV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gemini.server--CAtPbdI.js
var GEMINI_KEY = env("GEMINI_API_KEY") ?? "AQ.Ab8RN6I1OE04CybJ-6e7I4rJlxz46LSyEffmSPiBcxS0_8nD1w";
var MODELS = ["gemini-flash-latest", "gemini-3.6-flash"];
function extractJson(text) {
	const trimmed = text.trim();
	const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const body = (fenced ? fenced[1] : trimmed).trim();
	const start = body.indexOf("{");
	const end = body.lastIndexOf("}");
	if (start >= 0 && end > start) return body.slice(start, end + 1);
	return body;
}
async function polishItineraryWithGemini(input) {
	const allowed = new Set(input.listings.map((l) => l.slug));
	const listingLines = input.listings.map((l) => {
		const geo = l.lat != null && l.lng != null ? ` @${l.lat.toFixed(4)},${l.lng.toFixed(4)}` : "";
		return `- ${l.slug} | ${l.name} | ${l.kind} | ${l.area} | ${l.category}${geo} | ${(l.description || "").slice(0, 220)}`;
	}).join("\n");
	const placed = input.items.map((i) => `${i.slug} → day ${i.day}`).join(", ");
	const prompt = `You are a Pondicherry (Puducherry) local trip designer for Xplore Pondy.
Write a practical day-by-day itinerary using ONLY these listings. Never invent slugs.

Trip: ${input.days} day(s), ${input.tripType || "open"} trip, interests: ${input.interests.join(", ") || "general"}.
Area: ${input.locationLabel || "Pondicherry"}.
Current day assignments: ${placed || "unassigned — distribute evenly"}.

Listings:
${listingLines}

Rules:
- Keep each listing on the suggested day unless a swap clearly cuts travel.
- Start around 9:00 AM, finish by 8:00 PM. Leave lunch and tea gaps.
- Times like "9:30 AM". durationMin is minutes on-site.
- Blurbs: one short local tip (max 140 chars), not marketing fluff.
- intro: 1–2 sentences for the day's rhythm.
- title: "Day N · neighbourhood".

Return JSON only:
{"days":[{"day":1,"title":"","intro":"","stops":[{"slug":"","time":"9:00 AM","durationMin":75,"blurb":""}]}],"items":[{"slug":"","day":1}]}`;
	const body = JSON.stringify({
		contents: [{ parts: [{ text: prompt }] }],
		generationConfig: {
			responseMimeType: "application/json",
			temperature: .6
		}
	});
	for (const model of MODELS) try {
		const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body,
			signal: AbortSignal.timeout(28e3)
		});
		if (!res.ok) continue;
		const text = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text;
		if (!text) continue;
		const parsed = JSON.parse(extractJson(text));
		if (!Array.isArray(parsed.days) || parsed.days.length === 0) continue;
		const days = parsed.days.map((block) => ({
			day: Number(block.day) || 1,
			title: String(block.title || `Day ${block.day}`),
			intro: String(block.intro || ""),
			stops: (block.stops ?? []).filter((s) => s?.slug && allowed.has(s.slug)).map((s) => ({
				slug: s.slug,
				time: String(s.time || ""),
				durationMin: Math.min(240, Math.max(20, Number(s.durationMin) || 60)),
				blurb: String(s.blurb || "").slice(0, 180)
			}))
		})).filter((d) => d.stops.length > 0);
		if (!days.length) continue;
		return {
			days,
			items: Array.isArray(parsed.items) && parsed.items.length ? parsed.items.filter((i) => i?.slug && allowed.has(i.slug)).map((i) => ({
				slug: i.slug,
				day: Number(i.day) || 1
			})) : days.flatMap((d) => d.stops.map((s) => ({
				slug: s.slug,
				day: d.day
			})))
		};
	} catch {}
	return null;
}
//#endregion
export { polishItineraryWithGemini };
