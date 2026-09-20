//#region node_modules/.nitro/vite/services/ssr/assets/media-Cl4fnsUk.js
/** Prefer the original WP upload over Listeo crops like `-399x397.jpg`. */
function uncropImage(url) {
	if (!url) return "";
	return url.replace(/-\d{2,4}x\d{2,4}(?=\.[a-zA-Z]+$)/, "");
}
function isRemoteImage(url) {
	return !!url && /^https?:\/\//i.test(url) && /wp-content\/uploads|upload\.wikimedia\.org/i.test(url);
}
function isLocalFallback(url) {
	return !!url && url.startsWith("/images/");
}
function pickListingImage(...urls) {
	const cleaned = urls.map((url) => uncropImage(url?.trim() ?? "")).filter(Boolean);
	const remote = cleaned.find((url) => isRemoteImage(url));
	if (remote) return remote;
	return cleaned.find((url) => !isLocalFallback(url)) ?? cleaned[0] ?? "";
}
function uniqueImages(...groups) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const group of groups) for (const raw of group ?? []) {
		const url = uncropImage(raw);
		if (!url || seen.has(url)) continue;
		seen.add(url);
		out.push(url);
	}
	return out;
}
var LOCAL_GALLERY = {
	"promenade-beach": [
		"/images/promenade.jpg",
		"/images/lighthouse.jpg",
		"/images/beach.jpg"
	],
	"eden-beach": ["/images/beach.jpg", "/images/promenade.jpg"],
	"paradise-beach": ["/images/beach.jpg", "/images/surf.jpg"],
	"serenity-beach": ["/images/surf.jpg", "/images/beach.jpg"],
	"old-lighthouse": ["/images/lighthouse.jpg", "/images/promenade.jpg"],
	"gandhi-statue": ["/images/promenade.jpg", "/images/lighthouse.jpg"],
	"aayi-mandapam": ["/images/french-quarter.jpg", "/images/church.jpg"],
	"sri-aurobindo-ashram": ["/images/french-quarter.jpg", "/images/church.jpg"],
	"sacred-heart-basilica": ["/images/basilica.jpg", "/images/church.jpg"],
	"our-lady-of-angels": ["/images/church.jpg", "/images/french-quarter.jpg"],
	"immaculate-conception": ["/images/church.jpg", "/images/basilica.jpg"],
	"manakula-vinayagar": ["/images/temple.jpg", "/images/french-quarter.jpg"],
	"matrimandir-view": ["/images/matrimandir.jpg"],
	"auroville-matrimandir": ["/images/matrimandir.jpg"],
	auroville: ["/images/matrimandir.jpg"],
	"le-cafe": ["/images/promenade.jpg", "/images/cafe.jpg"],
	"baker-street": ["/images/cafe.jpg", "/images/french-quarter.jpg"],
	"coromandel-cafe": ["/images/cafe.jpg", "/images/hotel.jpg"],
	"cafe-des-arts": ["/images/cafe.jpg", "/images/french-quarter.jpg"],
	"villa-shanti": ["/images/hotel.jpg", "/images/french-quarter.jpg"]
};
function listingPhotos(listing) {
	return uniqueImages([listing.image], listing.gallery, listing.menuImages, LOCAL_GALLERY[listing.slug]);
}
function listingCover(listing) {
	return pickListingImage(...listingPhotos(listing)) || listing.image;
}
function extractOgImage(html) {
	const url = uncropImage((html.match(/property=["']og:image["']\s+content=["']([^"']+)/i) || html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i))?.[1] ?? "");
	return /^https?:\/\//i.test(url) ? url : "";
}
//#endregion
export { uncropImage as a, pickListingImage as i, listingCover as n, uniqueImages as o, listingPhotos as r, extractOgImage as t };
