import { i as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as CalendarPlus, _ as ExternalLink, a as Ticket, b as Clock3, g as Heart, i as Timer, m as MapPin, u as Navigation } from "../_libs/lucide-react.mjs";
import { v as Link, z as notFound } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useTrip, c as SheetContent, l as SheetTrigger, n as Route, o as useHydrated, s as Sheet, u as Button } from "./router-B0_otA2Y.mjs";
import { n as Stars, t as ListingCard } from "./listing-card-CY59uZ4l.mjs";
import { n as getListing, r as nearbyListings } from "./listings-Dhhe984p.mjs";
import { n as CATEGORY_META } from "./types-81kCn66h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/place._slug-2mdfZXo6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AddToTrip({ slug, name }) {
	const days = useTrip((s) => s.days);
	const addToDay = useTrip((s) => s.addToDay);
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {}), "Add to trip"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			title: `Add ${name}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-sm text-muted-foreground",
				children: "Choose a day in your itinerary."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: Array.from({ length: days }, (_, i) => i + 1).map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => {
						addToDay(slug, day);
						toast.success(`Added to day ${day}`);
						setOpen(false);
					},
					children: ["Day ", day]
				}, day))
			})]
		})]
	});
}
function SaveButton({ slug, name, className }) {
	const hydrated = useHydrated();
	const saved = useTrip((s) => s.saved.includes(slug));
	const toggle = useTrip((s) => s.toggleSaved);
	const on = hydrated && saved;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": on,
		"aria-label": on ? `Remove ${name} from saved` : `Save ${name}`,
		onClick: (e) => {
			e.preventDefault();
			e.stopPropagation();
			toggle(slug);
			toast.success(on ? `Removed ${name}` : `Saved ${name}`);
		},
		className: cn("flex size-11 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft ring-1 ring-border/70 backdrop-blur-sm transition-colors", on && "text-destructive", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", on && "fill-destructive") })
	});
}
function PlacePage() {
	const { slug } = Route.useParams();
	const listing = getListing(slug);
	if (!listing) throw notFound();
	const nearby = nearbyListings(listing.slug);
	const maps = listing.lat && listing.lng ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.name + " Pondicherry")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative overflow-hidden rounded-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: listing.image,
				alt: "",
				className: "h-64 w-full object-cover sm:h-80"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveButton, {
				slug: listing.slug,
				name: listing.name,
				className: "absolute right-4 top-4"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					search: {
						cat: listing.category,
						q: ""
					},
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
					children: CATEGORY_META[listing.category].label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-semibold",
					children: listing.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: listing.rating }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [listing.reviews.toLocaleString(), " reviews"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), listing.location]
						})
					]
				}),
				listing.price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm font-medium text-foreground",
					children: listing.price
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToTrip, {
				slug: listing.slug,
				name: listing.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: maps,
					target: "_blank",
					rel: "noreferrer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {}), "Directions"]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-base leading-relaxed text-foreground/90",
			children: listing.description
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Hours",
					value: listing.hours,
					icon: Clock3
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Distance",
					value: listing.distance,
					icon: MapPin
				}),
				listing.duration && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Time needed",
					value: listing.duration,
					icon: Timer
				}),
				listing.entry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Entry",
					value: listing.entry,
					icon: Ticket
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Best for"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: listing.bestFor.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Known for"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: listing.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "outline",
					children: t
				}, t))
			})]
		}),
		listing.mustTry && listing.mustTry.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-xl bg-card p-5 ring-1 ring-border/70",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Must try"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground",
				children: listing.mustTry.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: m }, m))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: listing.siteUrl,
			target: "_blank",
			rel: "noreferrer",
			className: "mt-6 flex h-12 items-center justify-center gap-2 rounded-md text-sm font-medium text-primary hover:underline",
			children: ["View on xplorepondy.com", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
		}),
		nearby.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "Nearby & related"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-3",
				children: nearby.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, { listing: l }, l.slug))
			})]
		})
	] });
}
function Info({ label, value, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-3 ring-1 ring-border/70",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
			className: "flex items-center gap-1.5 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 text-sm font-medium",
			children: value
		})]
	});
}
//#endregion
export { PlacePage as component };
