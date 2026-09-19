import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { p as listingIsOpen } from "./filters-CkhHKy69.mjs";
import { b as MapPin, c as Star } from "../_libs/lucide-react.mjs";
import { y as cn } from "./router-9HOMADMB.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listing-card-C3q5qlQX.js
var import_jsx_runtime = require_jsx_runtime();
function Stars({ value, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 tabular-nums", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3.5 fill-star text-star" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-medium",
			children: value.toFixed(1)
		})]
	});
}
function OpenStatus({ listing, compact = false }) {
	const open = listingIsOpen(listing);
	if (open === void 0 && !listing.hours) return null;
	const label = open === true ? "Open now" : open === false ? listing.hours || "Closed" : listing.hours;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("truncate rounded-full px-2 py-0.5 text-[11px] font-semibold", open === true && "bg-accent text-accent-foreground", open === false && "bg-destructive/10 text-destructive", open === void 0 && "bg-card/90 text-muted-foreground", compact && "max-w-[11rem]"),
		children: label
	});
}
function ListingCard({ listing, layout = "grid", active = false }) {
	if (layout === "row") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/place/$slug",
		params: { slug: listing.slug },
		className: cn("flex gap-3 rounded-xl bg-card p-2 pr-3 shadow-soft ring-1 transition-transform duration-150 hover:-translate-y-0.5", active ? "ring-primary" : "ring-border/70"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: listing.image,
			alt: "",
			className: "size-24 shrink-0 rounded-lg object-cover"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1 py-0.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-primary",
						children: listing.kind
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenStatus, {
						listing,
						compact: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "truncate font-display text-base font-semibold",
					children: listing.name
				}),
				listing.rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-center gap-2 text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: listing.rating }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs",
						children: [
							"(",
							listing.reviews.toLocaleString(),
							")"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 shrink-0" }), listing.area || listing.location]
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/place/$slug",
		params: { slug: listing.slug },
		className: "group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/70 transition-transform duration-150 hover:-translate-y-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: listing.image,
					alt: "",
					className: "size-full object-cover transition-transform duration-500 group-hover:scale-105"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: "absolute left-3 top-3 bg-card/90 text-foreground backdrop-blur-sm",
					children: listing.kind
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute right-3 top-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenStatus, {
						listing,
						compact: true
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-1.5 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-semibold leading-snug",
					children: listing.name
				}),
				listing.rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: listing.rating }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs",
						children: [
							"(",
							listing.reviews.toLocaleString(),
							")"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-1 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: listing.location
					})]
				})
			]
		})]
	});
}
//#endregion
export { Stars as n, ListingCard as t };
