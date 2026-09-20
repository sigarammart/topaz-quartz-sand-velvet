import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { V as notFound, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as listingIsOpen, n as getListing } from "./hours-BdXwVY0q.mjs";
import { B as ChevronRight, H as Check, P as ExternalLink, S as MapPin, V as ChevronLeft, X as Accessibility, _ as Navigation, c as Ticket, g as Phone, i as Users, j as Heart, s as Timer, t as X, z as Clock3 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as useGeo, D as catalogNearby, E as catalogListing, I as fetchWpListing, W as exploreSearchForTerm, ct as listingDistanceKm, ft as Button, j as useCatalog, n as Route$1, nt as useHydrated, o as useTrip, st as formatDistance } from "./router-BD5yDehu.mjs";
import { o as uniqueImages, r as listingPhotos } from "./media-Cl4fnsUk.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
import { n as ListingCard, r as Stars, t as AddToTrip } from "./listing-card-CBSP8lVI.mjs";
import { n as CATEGORY_META } from "./types-81kCn66h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/place._slug-QFyezQwI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PhotoGallery({ images, name, className, layout = "grid" }) {
	const photos = (0, import_react.useMemo)(() => uniqueImages(images), [images]);
	const [index, setIndex] = (0, import_react.useState)(null);
	const current = index != null ? photos[index] : void 0;
	(0, import_react.useEffect)(() => {
		if (index == null) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => {
			if (e.key === "Escape") setIndex(null);
			if (e.key === "ArrowRight") setIndex((i) => i == null ? i : (i + 1) % photos.length);
			if (e.key === "ArrowLeft") setIndex((i) => i == null ? i : (i - 1 + photos.length) % photos.length);
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [index, photos.length]);
	if (!photos.length) return null;
	const extra = Math.max(0, photos.length - (layout === "hero" ? 5 : 5));
	const thumbs = photos.slice(1, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className,
		children: [
			layout === "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Gallery"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "text-xs font-medium text-primary hover:underline",
					onClick: () => setIndex(0),
					children: [
						photos.length,
						" photo",
						photos.length === 1 ? "" : "s"
					]
				})]
			}),
			layout === "hero" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("grid gap-1 overflow-hidden rounded-2xl", thumbs.length ? "grid-cols-3 sm:grid-cols-4 sm:grid-rows-2" : "grid-cols-1"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setIndex(0),
					className: cn("relative overflow-hidden bg-muted", thumbs.length ? "col-span-3 row-span-1 aspect-[16/10] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[18rem]" : "aspect-[16/9] sm:min-h-[18rem]"),
					"aria-label": `View ${name} photos`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: photos[0],
						alt: name,
						className: "size-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute bottom-2 right-2 rounded-full bg-overlay/70 px-2.5 py-1 text-[11px] font-medium text-hero",
						children: [
							photos.length,
							" photo",
							photos.length === 1 ? "" : "s"
						]
					})]
				}), thumbs.map((src, i) => {
					const n = i + 1;
					const last = n === thumbs.length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setIndex(n),
						className: "relative hidden overflow-hidden bg-muted sm:block sm:min-h-[8.75rem]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							alt: `${name} photo ${n + 1}`,
							className: "size-full object-cover"
						}), last && extra > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute inset-0 flex items-center justify-center bg-overlay/55 text-sm font-semibold text-hero",
							children: ["+", extra]
						})]
					}, src);
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-4 grid-rows-2 gap-1.5 sm:h-56",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setIndex(0),
					className: "relative col-span-2 row-span-2 overflow-hidden rounded-xl bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: photos[0],
						alt: `${name} photo 1`,
						className: "size-full object-cover"
					})
				}), thumbs.map((src, i) => {
					const n = i + 1;
					const last = n === thumbs.length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setIndex(n),
						className: "relative overflow-hidden rounded-lg bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							alt: `${name} photo ${n + 1}`,
							className: "size-full object-cover"
						}), last && extra > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute inset-0 flex items-center justify-center bg-overlay/55 text-sm font-semibold text-hero",
							children: ["+", extra]
						})]
					}, src);
				})]
			}),
			current && index != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-50 flex flex-col bg-overlay/92",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Photo slideshow",
				onClick: () => setIndex(null),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-hero",
							children: [
								index + 1,
								" / ",
								photos.length
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-10 items-center justify-center rounded-full text-hero hover:bg-hero/10",
							onClick: () => setIndex(null),
							"aria-label": "Close gallery",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex min-h-0 flex-1 items-center justify-center px-12 py-4",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: current,
							alt: "",
							className: "max-h-full max-w-full rounded-lg object-contain shadow-soft"
						}), photos.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute left-2 flex size-10 items-center justify-center rounded-full bg-card/80 text-foreground",
							onClick: () => setIndex((index - 1 + photos.length) % photos.length),
							"aria-label": "Previous photo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute right-2 flex size-10 items-center justify-center rounded-full bg-card/80 text-foreground",
							onClick: () => setIndex((index + 1) % photos.length),
							"aria-label": "Next photo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
						})] })]
					}),
					photos.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1.5 overflow-x-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
						onClick: (e) => e.stopPropagation(),
						children: photos.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setIndex(i),
							className: cn("size-12 shrink-0 overflow-hidden rounded-md ring-2", i === index ? "ring-primary" : "ring-transparent opacity-70"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src,
								alt: "",
								className: "size-full object-cover"
							})
						}, src))
					})
				]
			})
		]
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
		featured: extra.featured ?? base.featured,
		image: extra.image || base.image
	};
}
function PlacePage() {
	const { slug } = Route$1.useParams();
	const items = useCatalog((s) => s.items);
	const status = useCatalog((s) => s.status);
	const catalogHit = catalogListing(slug, items) ?? getListing(slug);
	const [fetched, setFetched] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setFetched(void 0);
		fetchWpListing({ data: {
			slug,
			url: catalogHit?.siteUrl
		} }).then((row) => {
			if (!cancelled) setFetched(row);
		});
		return () => {
			cancelled = true;
		};
	}, [slug, catalogHit?.siteUrl]);
	const listing = mergeListing(catalogHit, fetched ?? null);
	const origin = useGeo((s) => s.origin);
	const fromGps = useGeo((s) => s.source === "gps");
	if (!listing) {
		if (fetched === void 0 || status === "loading" || status === "idle") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-16 text-center text-sm text-muted-foreground",
			children: "Loading place…"
		});
		throw notFound();
	}
	const km = listingDistanceKm(origin, listing);
	const nearby = catalogNearby(listing.slug, items);
	const maps = listing.lat && listing.lng ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((listing.address || listing.name) + " Pondicherry")}`;
	const embed = listing.lat && listing.lng ? `https://www.google.com/maps?q=${listing.lat},${listing.lng}&z=16&output=embed` : "";
	const taxonomies = listing.taxonomies ?? [];
	const cafeTypes = listing.cafeTypes ?? [];
	const accessibility = listing.accessibility ?? [];
	const itinerary = listing.itinerary ?? [];
	const faqs = listing.faqs ?? [];
	const menuImages = listing.menuImages ?? [];
	const metaGroups = listing.metaGroups ?? [];
	const photos = listingPhotos(listing);
	const tel = listing.phone?.replace(/[^\d+]/g, "") ?? "";
	const metaTitles = new Set(metaGroups.map((g) => g.title.toLowerCase()));
	const showCafeTypes = cafeTypes.length > 0 && !metaTitles.has("cafe type");
	const open = listingIsOpen(listing);
	const where = listing.address || listing.location;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGallery, {
			images: photos,
			name: listing.name,
			layout: "hero"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 lg:mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/explore",
					search: {
						cat: listing.category,
						q: ""
					},
					className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
					children: [CATEGORY_META[listing.category].label, listing.kind ? ` · ${listing.kind}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-semibold leading-tight sm:text-[1.7rem]",
						children: listing.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveButton, {
						slug: listing.slug,
						name: listing.name,
						className: "shrink-0 lg:hidden"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
					children: [
						listing.rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { value: listing.rating }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums",
								children: [listing.reviews.toLocaleString(), " reviews"]
							})]
						}),
						open === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground",
							children: "Open now"
						}),
						open === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive",
							children: "Closed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
								km != null ? formatDistance(km, fromGps) : where,
								km != null && where ? ` · ${where}` : ""
							]
						})
					]
				}),
				listing.price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-sm font-medium",
					children: listing.price
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2 lg:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToTrip, {
							slug: listing.slug,
							name: listing.name,
							wpId: listing.wpId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							asChild: true,
							className: "h-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: maps,
								target: "_blank",
								rel: "noreferrer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {}), "Directions"]
							})
						}),
						tel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							asChild: true,
							className: "h-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `tel:${tel}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {}), "Call"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: listing.siteUrl,
							target: "_blank",
							rel: "noreferrer",
							className: "flex h-10 items-center gap-1.5 px-2 text-xs font-medium text-primary hover:underline",
							children: ["Website", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-relaxed text-foreground/90",
					children: listing.description
				}),
				(listing.hours || listing.duration || listing.entry || listing.groupSize) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
					children: [
						listing.hours && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
							label: "Hours",
							value: listing.hours,
							icon: Clock3
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
						})
					]
				}),
				(listing.weeklyHours?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Hours"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-border overflow-hidden rounded-xl bg-card text-sm ring-1 ring-border/70",
						children: listing.weeklyHours.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-baseline justify-between gap-3 px-3 py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: row.day
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-right text-xs text-muted-foreground",
								children: row.slots.join(", ")
							})]
						}, row.day))
					})]
				}),
				metaGroups.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 space-y-5",
					children: metaGroups.map((group) => {
						const scored = group.items.some((i) => i.included !== void 0);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: group.title
						}), scored ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 grid gap-1.5 sm:grid-cols-2",
							children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2 rounded-lg bg-card px-2.5 py-1.5 text-sm ring-1 ring-border/70",
								children: [item.included === false ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mt-0.5 size-3.5 shrink-0 text-destructive" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: item.included === false ? "text-muted-foreground" : "",
									children: item.label
								})]
							}, item.label))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-1.5",
							children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "text-[11px]",
								children: item.label
							}, item.label))
						})] }, group.title);
					})
				}),
				showCafeTypes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Cafe type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: cafeTypes.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: "text-[11px]",
							children: t
						}, t))
					})]
				}),
				accessibility.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-sm font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, { className: "size-3.5 text-primary" }), "Accessibility"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 grid gap-1.5 sm:grid-cols-2",
						children: accessibility.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-lg bg-card px-2.5 py-1.5 text-sm ring-1 ring-border/70",
							children: item
						}, item))
					})]
				}),
				taxonomies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Listing details"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-3",
						children: taxonomies.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
							children: group.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1.5 flex flex-wrap gap-1.5",
							children: group.terms.map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/explore",
								search: exploreSearchForTerm(group.key, term.slug),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "outline",
									className: "text-[11px]",
									children: term.name
								})
							}, term.slug))
						})] }, group.key))
					})]
				}),
				listing.bestFor.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Best for"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: listing.bestFor.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: "text-[11px]",
							children: t
						}, t))
					})]
				}),
				listing.mustTry && listing.mustTry.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 rounded-xl bg-card p-4 ring-1 ring-border/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Must try"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground",
						children: listing.mustTry.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: m }, m))
					})]
				}),
				menuImages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Menu"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex gap-2 overflow-x-auto pb-1",
						children: menuImages.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							alt: "",
							className: "h-32 w-24 shrink-0 rounded-lg object-cover ring-1 ring-border/70"
						}, src))
					})]
				}),
				itinerary.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Itinerary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-2 space-y-2",
						children: itinerary.map((stop, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl bg-card p-3 ring-1 ring-border/70",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-medium uppercase tracking-wide text-primary",
									children: [stop.day, stop.time].filter(Boolean).join(" · ") || `Stop ${i + 1}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-sm font-semibold",
									children: stop.title
								}),
								stop.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: stop.description
								})
							]
						}, `${stop.title}-${i}`))
					})]
				}),
				faqs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "FAQs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 space-y-2",
						children: faqs.map((faq) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-card p-3 ring-1 ring-border/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: faq.question
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: faq.answer
							})]
						}, faq.question))
					})]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "mt-5 space-y-3 lg:sticky lg:top-20 lg:mt-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border/70 lg:block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
								children: "Plan this stop"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-sm font-semibold",
								children: listing.name
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveButton, {
								slug: listing.slug,
								name: listing.name
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToTrip, {
									slug: listing.slug,
									name: listing.name,
									wpId: listing.wpId
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									asChild: true,
									className: "h-10 w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: maps,
										target: "_blank",
										rel: "noreferrer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, {}), "Directions"]
									})
								}),
								tel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									asChild: true,
									className: "h-10 w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: `tel:${tel}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {}), listing.phone]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: listing.siteUrl,
									target: "_blank",
									rel: "noreferrer",
									className: "flex h-9 items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline",
									children: ["View on xplorepondy.com", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
								})
							]
						}),
						(listing.hours || where) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 space-y-1.5 border-t border-border pt-3 text-xs",
							children: [listing.hours && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "mt-0.5 size-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Hours"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: listing.hours
								})] })]
							}), where && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: where
								})] })]
							})]
						})
					]
				}), embed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-2xl ring-1 ring-border/70",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						title: `Map of ${listing.name}`,
						src: embed,
						className: "h-48 w-full lg:h-52",
						loading: "lazy",
						referrerPolicy: "no-referrer-when-downgrade"
					})
				})]
			})]
		}),
		nearby.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Nearby & related"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-3",
				children: nearby.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
					listing: l,
					layout: "compact"
				}, l.slug))
			})]
		})
	] });
}
function Info({ label, value, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-2.5 ring-1 ring-border/70",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
			className: "flex items-center gap-1.5 text-[11px] text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-0.5 text-xs font-medium",
			children: value
		})]
	});
}
//#endregion
export { PlacePage as component };
