import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { B as notFound, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as getListing, o as exploreSearchForTerm, p as listingIsOpen } from "./filters-CkhHKy69.mjs";
import { B as Accessibility, M as Clock3, N as Check, O as Heart, P as CalendarPlus, b as MapPin, h as Navigation, k as ExternalLink, m as Phone, n as Users, o as Timer, s as Ticket, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as fetchWpListing, _ as SheetTrigger, a as useTrip, g as SheetContent, h as Sheet, l as catalogListing, m as useHydrated, n as Route, p as useCatalog, u as catalogNearby, v as Button, y as cn } from "./router-9HOMADMB.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
import { n as Stars, t as ListingCard } from "./listing-card-C3q5qlQX.mjs";
import { n as CATEGORY_META } from "./types-81kCn66h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/place._slug-DPyYO_Fh.js
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
function mergeListing(base, extra) {
	if (!extra) return base ?? null;
	if (!base) return extra;
	return {
		...base,
		...extra,
		description: extra.description || base.description,
		rating: extra.rating || base.rating,
		reviews: extra.reviews || base.reviews,
		hours: extra.hours || base.hours,
		openNow: extra.openNow ?? base.openNow,
		weeklyHours: extra.weeklyHours?.length ? extra.weeklyHours : base.weeklyHours,
		distance: extra.distance || base.distance,
		duration: extra.duration || base.duration,
		entry: extra.entry || base.entry,
		price: extra.price || base.price,
		phone: extra.phone || base.phone,
		address: extra.address || base.address,
		lat: extra.lat ?? base.lat,
		lng: extra.lng ?? base.lng,
		tags: extra.tags.length ? extra.tags : base.tags,
		bestFor: extra.bestFor.length ? extra.bestFor : base.bestFor,
		cafeTypes: extra.cafeTypes?.length ? extra.cafeTypes : base.cafeTypes,
		accessibility: extra.accessibility?.length ? extra.accessibility : base.accessibility,
		taxonomies: extra.taxonomies?.length ? extra.taxonomies : base.taxonomies,
		itinerary: extra.itinerary?.length ? extra.itinerary : base.itinerary,
		faqs: extra.faqs?.length ? extra.faqs : base.faqs,
		menuImages: extra.menuImages?.length ? extra.menuImages : base.menuImages,
		metaGroups: extra.metaGroups?.length ? extra.metaGroups : base.metaGroups,
		metaFacets: extra.metaFacets?.length ? extra.metaFacets : base.metaFacets,
		gallery: extra.gallery?.length ? extra.gallery : base.gallery,
		mustTry: extra.mustTry?.length ? extra.mustTry : base.mustTry,
		featured: extra.featured ?? base.featured
	};
}
function PlacePage() {
	const { slug } = Route.useParams();
	const items = useCatalog((s) => s.items);
	const status = useCatalog((s) => s.status);
	const catalogHit = catalogListing(slug, items) ?? getListing(slug);
	const [fetched, setFetched] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setFetched(void 0);
		fetchWpListing({ data: { slug } }).then((row) => {
			if (!cancelled) setFetched(row);
		});
		return () => {
			cancelled = true;
		};
	}, [slug]);
	const listing = mergeListing(catalogHit, fetched ?? null);
	if (!listing) {
		if (fetched === void 0 || status === "loading" || status === "idle") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-16 text-center text-sm text-muted-foreground",
			children: "Loading place…"
		});
		throw notFound();
	}
	const nearby = catalogNearby(listing.slug, items);
	const maps = listing.lat && listing.lng ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((listing.address || listing.name) + " Pondicherry")}`;
	const taxonomies = listing.taxonomies ?? [];
	const cafeTypes = listing.cafeTypes ?? [];
	const accessibility = listing.accessibility ?? [];
	const itinerary = listing.itinerary ?? [];
	const faqs = listing.faqs ?? [];
	const menuImages = listing.menuImages ?? [];
	const metaGroups = listing.metaGroups ?? [];
	const gallery = listing.gallery ?? [];
	const tel = listing.phone?.replace(/[^\d+]/g, "") ?? "";
	const metaTitles = new Set(metaGroups.map((g) => g.title.toLowerCase()));
	const showCafeTypes = cafeTypes.length > 0 && !metaTitles.has("cafe type");
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
						listing.rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: listing.rating }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [listing.reviews.toLocaleString(), " reviews"]
						})] }),
						listingIsOpen(listing) === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground",
							children: "Open now"
						}),
						listingIsOpen(listing) === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive",
							children: "Closed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), listing.address || listing.location]
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
			className: "mt-5 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToTrip, {
					slug: listing.slug,
					name: listing.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: maps,
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {}), "Directions"]
					})
				}),
				tel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `tel:${tel}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {}), "Call"]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-base leading-relaxed text-foreground/90",
			children: listing.description
		}),
		(listing.hours || listing.distance || listing.duration || listing.entry || listing.groupSize || listing.phone || listing.address) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4",
			children: [
				listing.hours && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Hours",
					value: listing.hours,
					icon: Clock3
				}),
				listing.distance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
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
				}),
				listing.groupSize && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Group size",
					value: listing.groupSize,
					icon: Users
				}),
				listing.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Phone",
					value: listing.phone,
					icon: Phone
				}),
				listing.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Address",
					value: listing.address,
					icon: MapPin
				})
			]
		}),
		(listing.weeklyHours?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Hours"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-border/70",
				children: listing.weeklyHours.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-3 px-3 py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: row.day
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-right text-muted-foreground",
						children: row.slots.join(", ")
					})]
				}, row.day))
			})]
		}),
		metaGroups.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 space-y-8",
			children: metaGroups.map((group) => {
				const scored = group.items.some((i) => i.included !== void 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: group.title
				}), scored ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2 sm:grid-cols-2",
					children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-2 rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/70",
						children: [item.included === false ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mt-0.5 size-4 shrink-0 text-destructive" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: item.included === false ? "text-muted-foreground" : "",
							children: item.label
						})]
					}, item.label))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: item.label }, item.label))
				})] }, group.title);
			})
		}),
		showCafeTypes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Cafe type"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: cafeTypes.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
			})]
		}),
		accessibility.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 font-display text-lg font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, { className: "size-4 text-primary" }), "Accessibility"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: accessibility.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-border/70",
					children: item
				}, item))
			})]
		}),
		taxonomies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Listing details"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-4",
				children: taxonomies.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground",
					children: group.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: group.terms.map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/explore",
						search: exploreSearchForTerm(group.key, term.slug),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "outline",
							children: term.name
						})
					}, term.slug))
				})] }, group.key))
			})]
		}),
		listing.bestFor.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Best for"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: listing.bestFor.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
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
		menuImages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Menu"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-3 overflow-x-auto pb-1",
				children: menuImages.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src,
					alt: "",
					className: "h-36 w-28 shrink-0 rounded-xl object-cover ring-1 ring-border/70"
				}, src))
			})]
		}),
		gallery.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Photos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4",
				children: gallery.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src,
					alt: "",
					className: "aspect-square w-full rounded-xl object-cover ring-1 ring-border/70"
				}, src))
			})]
		}),
		itinerary.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Itinerary"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 space-y-3",
				children: itinerary.map((stop, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl bg-card p-4 ring-1 ring-border/70",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-primary",
							children: [stop.day, stop.time].filter(Boolean).join(" · ") || `Stop ${i + 1}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display font-semibold",
							children: stop.title
						}),
						stop.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: stop.description
						})
					]
				}, `${stop.title}-${i}`))
			})]
		}),
		faqs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "FAQs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-3",
				children: faqs.map((faq) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-card p-4 ring-1 ring-border/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: faq.question
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: faq.answer
					})]
				}, faq.question))
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
