import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as listingIsOpen } from "./hours-BdXwVY0q.mjs";
import { G as CalendarCheck, S as MapPin, U as CalendarPlus, u as Star } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as useGeo, ct as listingDistanceKm, ft as Button, j as useCatalog, nt as useHydrated, o as useTrip, st as formatDistance } from "./router-BD5yDehu.mjs";
import { n as listingCover } from "./media-Cl4fnsUk.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listing-card-CBSP8lVI.js
var import_jsx_runtime = require_jsx_runtime();
function AddToTrip({ slug, name, wpId, variant = "full", className }) {
	const hydrated = useHydrated();
	const navigate = useNavigate();
	const on = useTrip((s) => s.tempTrip.includes(slug));
	const toggle = useTrip((s) => s.toggleTempTrip);
	const catalogId = useCatalog((s) => s.items.find((l) => l.slug === slug)?.wpId);
	const mappedId = useTrip((s) => s.wpIdsBySlug?.[slug]);
	const active = hydrated && on;
	function onClick(e) {
		e?.preventDefault();
		e?.stopPropagation();
		if (toggle(slug, wpId ?? catalogId ?? mappedId)) toast.success(`Saved ${name} for your trip`, {
			description: "It’s in Trip → Saved. Tap Add there to put it on a day.",
			action: {
				label: "Open Saved",
				onClick: () => {
					navigate({
						to: "/trip",
						search: { tab: "saved" }
					});
				}
			}
		});
		else toast.success(`Removed ${name} from the trip list`);
	}
	if (variant === "icon") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": active,
		"aria-label": active ? `Remove ${name} from trip list` : `Add ${name} to trip`,
		onClick,
		className: cn("flex size-11 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft ring-1 ring-border/70 backdrop-blur-sm transition-colors hover:bg-card", active && "bg-primary text-primary-foreground ring-primary", className),
		children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "size-4" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		className: cn("flex-1", className),
		onClick: () => onClick(),
		children: [active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {}), active ? "In trip list" : "Add to trip"]
	});
}
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
function PlaceLine({ listing }) {
	const origin = useGeo((s) => s.origin);
	const fromGps = useGeo((s) => s.source === "gps");
	const km = listingDistanceKm(origin, listing);
	const place = listing.area || listing.location;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "flex items-center gap-1 truncate text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "truncate",
			children: [km != null ? formatDistance(km, fromGps) : place, km != null && place ? ` · ${place}` : ""]
		})]
	});
}
function PinMark({ n, active = false, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("absolute z-10 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums shadow-soft ring-2 ring-background", active ? "bg-primary text-primary-foreground" : "bg-card text-foreground", className),
		children: n
	});
}
function Cover({ listing, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: listingCover(listing),
		alt: listing.name,
		className: cn("object-cover", className),
		loading: "lazy",
		decoding: "async"
	});
}
function ListingCard({ listing, layout = "grid", active = false, pin, cardId }) {
	if (layout === "row") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		id: cardId,
		className: cn("relative flex gap-2.5 rounded-xl bg-card p-1.5 pr-2.5 shadow-soft ring-1 transition-transform duration-150 hover:-translate-y-0.5", active ? "ring-primary" : "ring-border/70"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/place/$slug",
			params: { slug: listing.slug },
			className: "flex min-w-0 flex-1 gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative h-[4.75rem] w-[6.25rem] shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-28",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
					listing,
					className: "size-full"
				}), pin != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinMark, {
					n: pin,
					active,
					className: "left-1 top-1"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 py-0.5 pr-9",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-[11px] font-medium uppercase tracking-wide text-primary",
							children: [listing.featured ? "Featured · " : "", listing.kind]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenStatus, {
							listing,
							compact: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "truncate text-sm font-semibold leading-snug",
						children: listing.name
					}),
					listing.rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-0.5 flex items-center gap-1.5 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: listing.rating }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px]",
							children: [
								"(",
								listing.reviews.toLocaleString(),
								")"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceLine, { listing })
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToTrip, {
			slug: listing.slug,
			name: listing.name,
			wpId: listing.wpId,
			variant: "icon",
			className: "absolute right-1.5 top-1/2 z-10 size-8 -translate-y-1/2"
		})]
	});
	const compact = layout === "compact";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-soft ring-1 ring-border/70 transition-transform duration-150 hover:-translate-y-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			id: `listing-card-${listing.slug}`,
			to: "/place/$slug",
			params: { slug: listing.slug },
			className: "flex flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[4/3]"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, {
						listing,
						className: "size-full transition-transform duration-500 group-hover:scale-105"
					}),
					pin != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinMark, {
						n: pin,
						active,
						className: "left-2 top-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: cn("absolute top-2 bg-card/90 text-[11px] text-foreground backdrop-blur-sm", pin != null ? "left-9" : "left-2"),
						children: listing.featured ? `Featured · ${listing.kind}` : listing.kind
					}),
					!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute right-2 top-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenStatus, {
							listing,
							compact: true
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex flex-1 flex-col gap-0.5", compact ? "p-2.5 pr-10" : "p-3 pr-12"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: cn("font-semibold leading-snug", compact ? "text-sm" : "text-base"),
						children: listing.name
					}),
					listing.rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: listing.rating }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px]",
							children: [
								"(",
								listing.reviews.toLocaleString(),
								")"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceLine, { listing })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToTrip, {
			slug: listing.slug,
			name: listing.name,
			wpId: listing.wpId,
			variant: "icon",
			className: cn("absolute z-10", compact ? "bottom-2 right-2 size-8" : "bottom-2.5 right-2.5 size-9")
		})]
	});
}
//#endregion
export { ListingCard as n, Stars as r, AddToTrip as t };
