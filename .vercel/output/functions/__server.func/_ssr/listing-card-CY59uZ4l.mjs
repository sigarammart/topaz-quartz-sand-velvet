import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
import { m as MapPin, o as Star } from "../_libs/lucide-react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listing-card-CY59uZ4l.js
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
function ListingCard({ listing, layout = "grid" }) {
	if (layout === "row") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/place/$slug",
		params: { slug: listing.slug },
		className: "flex gap-3 rounded-xl bg-card p-2 pr-3 shadow-soft ring-1 ring-border/70 transition-transform duration-150 hover:-translate-y-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: listing.image,
			alt: "",
			className: "size-24 shrink-0 rounded-lg object-cover"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 py-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wide text-primary",
					children: listing.kind
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "truncate font-display text-base font-semibold",
					children: listing.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 shrink-0" }), listing.area]
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
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: listing.image,
				alt: "",
				className: "size-full object-cover transition-transform duration-500 group-hover:scale-105"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				className: "absolute left-3 top-3 bg-card/90 text-foreground backdrop-blur-sm",
				children: listing.kind
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-1.5 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-semibold leading-snug",
					children: listing.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
