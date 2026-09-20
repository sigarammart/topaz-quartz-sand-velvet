import { At as number, Pt as string, Tt as array, jt as object } from "../_libs/@better-auth/core+[...].mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-itinerary-BvtY6G18.js
var listingSchema = object({
	slug: string(),
	name: string(),
	kind: string(),
	area: string(),
	category: string(),
	description: string(),
	lat: number().optional(),
	lng: number().optional(),
	duration: string().optional()
});
var generateAiItinerary_createServerFn_handler = createServerRpc({
	id: "847664f5406769b758e74ccb18c54732afd22a07146573b8b24159f7aa747096",
	name: "generateAiItinerary",
	filename: "src/lib/ai-itinerary.ts"
}, (opts) => generateAiItinerary.__executeServer(opts));
var generateAiItinerary = createServerFn({ method: "POST" }).validator(object({
	days: number().min(1).max(7),
	tripType: string(),
	interests: array(string()),
	locationLabel: string(),
	items: array(object({
		slug: string(),
		day: number()
	})),
	listings: array(listingSchema).max(40)
})).handler(generateAiItinerary_createServerFn_handler, async ({ data }) => {
	const { polishItineraryWithGemini } = await import("./gemini.server--CAtPbdI.mjs");
	const result = await polishItineraryWithGemini(data);
	if (!result) return { ok: false };
	return {
		ok: true,
		days: result.days,
		items: result.items
	};
});
//#endregion
export { generateAiItinerary_createServerFn_handler };
