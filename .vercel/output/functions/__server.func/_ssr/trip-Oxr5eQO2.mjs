import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, i as DialogDescription, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { At as number, Pt as string, Tt as array, jt as object } from "../_libs/@better-auth/core+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as createServerFn } from "./ssr.mjs";
import { H as Check, K as BookOpen, M as GripVertical, N as FileText, R as Clock, S as MapPin, d as Sparkles, r as WandSparkles, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as useGeo, N as WP_ORIGIN, S as travelLeg, c as TRIP_BUDGETS, f as TRIP_TYPES, ft as Button, g as interestLabel, h as formatTripDates, i as Route$4, j as useCatalog, k as resolveListing, nt as useHydrated, o as useTrip, ot as ANNA_SALAI, u as TRIP_LOCATIONS, v as listingMatchesInterest, y as orderByNearest, z as createSsrRpc } from "./router-BD5yDehu.mjs";
import { t as ListingMap } from "./listing-map-DoFefY9W.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { t as TripFormWizard } from "./trip-form-wizard-CAd4SgBz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trip-Oxr5eQO2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useAddDayModal() {
	const [pending, setPending] = (0, import_react.useState)(null);
	const pendingRef = (0, import_react.useRef)(null);
	pendingRef.current = pending;
	return {
		pending,
		isOpen: pending != null,
		open: (payload) => setPending(payload),
		close: () => setPending(null),
		confirm: (day) => {
			const payload = pendingRef.current;
			setPending(null);
			return payload ? {
				...payload,
				day
			} : null;
		}
	};
}
function AddDayModal({ pending, days, onClose, onChoose }) {
	const open = pending != null;
	const moving = pending?.currentDay != null;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}
			const n = Number(e.key);
			if (n >= 1 && n <= days) {
				e.preventDefault();
				onChoose(n);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		open,
		days,
		onClose,
		onChoose
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => {
			if (!next) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-overlay/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			"aria-modal": "true",
			className: "fixed left-1/2 top-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-5 shadow-soft outline-none",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display text-lg font-semibold",
					children: moving ? "Move to which day?" : "Add to which day?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
					className: "mt-1 text-sm text-muted-foreground",
					children: [pending?.name, moving ? ` · currently day ${pending.currentDay}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-col gap-2",
					children: Array.from({ length: days }, (_, i) => i + 1).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: d === pending?.currentDay ? "secondary" : "default",
						className: "h-11 w-full",
						onClick: () => onChoose(d),
						children: [
							moving ? "Move to" : "Add to",
							" day ",
							d
						]
					}, d))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 h-10 w-full text-sm text-muted-foreground hover:text-foreground",
					onClick: onClose,
					children: "Cancel"
				})
			]
		})] })
	});
}
var PANES = [
	{
		id: "locations",
		label: "Locations",
		icon: MapPin
	},
	{
		id: "itinerary",
		label: "Itinerary",
		icon: FileText
	},
	{
		id: "map",
		label: "Map",
		icon: BookOpen
	}
];
function TripPaneBar({ pane, onChange, badge }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden",
		"aria-label": "Trip views",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid grid-cols-3 items-center gap-2 px-3 py-2",
			role: "tablist",
			children: PANES.map((item) => {
				const active = pane === item.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "tab",
					id: `trip-pane-${item.id}`,
					"aria-label": item.id === "itinerary" && badge > 0 ? `${item.label}, ${badge} places` : item.label,
					"aria-selected": active,
					"aria-controls": `trip-panel-${item.id}`,
					onClick: () => onChange(item.id),
					className: cn("relative flex h-12 w-full items-center justify-center rounded-2xl text-xs font-semibold transition-colors", active ? "flex-row gap-2 bg-primary text-primary-foreground" : "flex-col gap-0.5 text-muted-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" }), item.id === "itinerary" && badge > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: "absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold leading-none text-hero",
							children: badge > 99 ? "99+" : badge
						}) : null]
					}), item.label]
				}) }, item.id);
			})
		})
	});
}
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
})).handler(createSsrRpc("847664f5406769b758e74ccb18c54732afd22a07146573b8b24159f7aa747096"));
function durationFor(listing) {
	const raw = listing.duration?.match(/(\d+)\s*(h|hr|hour|min)/i);
	if (raw) {
		const n = Number(raw[1]);
		if (/min/i.test(raw[2])) return Math.min(240, Math.max(30, n));
		return Math.min(240, Math.max(45, n * 60));
	}
	if (listing.category === "food") return 75;
	if (listing.category === "activities") return 120;
	if (listing.category === "stay") return 40;
	return 70;
}
function formatClock(minutes) {
	const clamped = Math.max(420, Math.min(1320, minutes));
	const h = Math.floor(clamped / 60);
	const m = clamped % 60;
	const ampm = h >= 12 ? "PM" : "AM";
	return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}
function firstSentence(text) {
	const clean = text.replace(/\s+/g, " ").trim();
	if (!clean) return "";
	const m = clean.match(/^[^.!?]{20,180}[.!?]/);
	return (m ? m[0] : clean.slice(0, 140)).trim();
}
function dayIntro(day, listings, polish, ctx) {
	const names = listings.map((l) => l.name).slice(0, 3);
	if (!polish) return `Day ${day} — ${names.join(", ")}${listings.length > 3 ? " and more" : ""}.`;
	const vibe = ctx.interests.slice(0, 2).map(interestLabel).join(" and ") || ctx.tripType || "Pondy";
	if (day === 1) return `Ease into ${ctx.location || "Pondicherry"} with ${vibe.toLowerCase()}. Start unhurried, keep the scooter close, and leave room for a long lunch.`;
	return `Day ${day} stretches a little further — ${names[0] ? `begin at ${names[0]}` : "keep moving"} and let the gaps between stops stay slow.`;
}
function stopBlurb(listing, polish) {
	if (!polish) return listing.kind || listing.area || listing.location;
	return firstSentence(listing.description) || `${listing.kind} in ${listing.area || listing.location}.`;
}
function attachTravel(days, listings, origin = ANNA_SALAI) {
	const bySlug = new Map(listings.map((l) => [l.slug, l]));
	return days.map((block) => {
		let prev;
		const stops = block.stops.map((stop) => {
			const listing = bySlug.get(stop.slug);
			const travel = listing ? prev ? travelLeg(prev, listing) : travelLeg(origin, listing) : void 0;
			if (listing) prev = listing;
			return {
				...stop,
				travel: travel && travel.minutes > 3 ? travel : void 0
			};
		});
		return {
			...block,
			stops
		};
	});
}
function buildTripItinerary({ items, listings, days, polish, origin = ANNA_SALAI, tripType, interests, locationLabel }) {
	const bySlug = new Map(listings.map((l) => [l.slug, l]));
	const resolved = items.map((i) => ({
		...i,
		listing: bySlug.get(i.slug)
	})).filter((i) => i.listing);
	const nextItems = [];
	const out = [];
	for (let d = 1; d <= days; d++) {
		const group = resolved.filter((i) => i.day === d).map((i) => i.listing);
		const leftover = resolved.filter((i) => i.day !== d && !nextItems.some((n) => n.slug === i.slug));
		const pool = group.length ? group : d === 1 ? leftover.map((i) => i.listing).slice(0, 3) : [];
		const ordered = orderByNearest(pool, origin);
		ordered.forEach((l) => nextItems.push({
			slug: l.slug,
			day: d
		}));
		let cursor = 540;
		let prev;
		const stops = [];
		for (const listing of ordered) {
			const travel = prev ? travelLeg(prev, listing) : travelLeg(origin, listing);
			if (travel && travel.minutes > 3) cursor += travel.minutes;
			const durationMin = durationFor(listing);
			stops.push({
				slug: listing.slug,
				time: formatClock(cursor),
				durationMin,
				blurb: stopBlurb(listing, polish),
				travel: travel && travel.minutes > 3 ? travel : void 0
			});
			cursor += durationMin + 15;
			prev = listing;
		}
		out.push({
			day: d,
			title: ordered[0] ? `Day ${d} · ${ordered[0].area || locationLabel}` : `Day ${d}`,
			intro: dayIntro(d, ordered, polish, {
				tripType,
				interests,
				location: locationLabel
			}),
			stops
		});
	}
	const used = new Set(nextItems.map((i) => i.slug));
	for (const row of resolved) if (!used.has(row.slug)) nextItems.push({
		slug: row.slug,
		day: row.day
	});
	return {
		days: out,
		items: nextItems
	};
}
function travelLabel(km) {
	return km < 1 ? `${Math.round(km * 1e3)} m` : `${km.toFixed(1)} km`;
}
function TripPage() {
	const hydrated = useHydrated();
	const { tab: tabParam } = Route$4.useSearch();
	const catalog = useCatalog((s) => s.items);
	const started = useTrip((s) => s.started);
	const title = useTrip((s) => s.title);
	const code = useTrip((s) => s.code);
	const days = useTrip((s) => s.days);
	const locations = useTrip((s) => s.locations);
	const budget = useTrip((s) => s.budget);
	const tripType = useTrip((s) => s.tripType);
	const start = useTrip((s) => s.start);
	const end = useTrip((s) => s.end);
	const interests = useTrip((s) => s.interests);
	const items = useTrip((s) => s.items);
	const tempTrip = useTrip((s) => s.tempTrip);
	const wpUrl = useTrip((s) => s.wpUrl);
	const addToDay = useTrip((s) => s.addToDay);
	const removeItem = useTrip((s) => s.removeItem);
	const reorderDay = useTrip((s) => s.reorderDay);
	const itinerary = useTrip((s) => s.itinerary);
	const itineraryPolished = useTrip((s) => s.itineraryPolished);
	const setItinerary = useTrip((s) => s.setItinerary);
	const origin = useGeo((s) => s.origin) ?? ANNA_SALAI;
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [day, setDay] = (0, import_react.useState)(1);
	const [tab, setTab] = (0, import_react.useState)(tabParam ?? "interests");
	const [chip, setChip] = (0, import_react.useState)(interests[0] ?? "");
	const [q, setQ] = (0, import_react.useState)("");
	const [selectedSlug, setSelectedSlug] = (0, import_react.useState)();
	const [drag, setDrag] = (0, import_react.useState)(null);
	const [pane, setPane] = (0, import_react.useState)("locations");
	const addDay = useAddDayModal();
	const seeded = (0, import_react.useRef)(false);
	const tabSeeded = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (tabParam) {
			setTab(tabParam);
			tabSeeded.current = true;
			return;
		}
		if (tabSeeded.current || !hydrated) return;
		tabSeeded.current = true;
		if (tempTrip.length > 0) setTab("saved");
	}, [
		hydrated,
		tabParam,
		tempTrip.length
	]);
	(0, import_react.useEffect)(() => {
		if (seeded.current || !hydrated || items.length > 0 || catalog.length < 8 || interests.length === 0) return;
		const picks = [];
		const used = /* @__PURE__ */ new Set();
		let d = 1;
		for (const slug of interests) {
			const matches = catalog.filter((l) => listingMatchesInterest(l, slug) && !used.has(l.slug)).slice(0, 2);
			for (const listing of matches) {
				used.add(listing.slug);
				picks.push({
					slug: listing.slug,
					day: d
				});
				d = d >= days ? 1 : d + 1;
			}
		}
		if (picks.length) {
			seeded.current = true;
			useTrip.setState({ items: picks });
		}
	}, [
		hydrated,
		catalog.length,
		interests,
		items.length,
		days
	]);
	const interestChips = interests.length ? interests : [
		"cafes",
		"activities",
		"beaches"
	];
	const activeChip = chip || interestChips[0];
	const locationLabel = locations.map((s) => TRIP_LOCATIONS.find((l) => l.slug === s)?.label ?? s).join(", ") || "Pondicherry";
	const pool = (0, import_react.useMemo)(() => {
		if (tab === "saved") {
			const rows = [...tempTrip].reverse().map((slug) => resolveListing(slug, catalog)).filter((l) => !!l);
			if (!q.trim()) return rows;
			const needle = q.toLowerCase();
			return rows.filter((l) => `${l.name} ${l.kind} ${l.location}`.toLowerCase().includes(needle));
		}
		let rows = catalog;
		if (tab === "interests") rows = catalog.filter((l) => listingMatchesInterest(l, activeChip));
		if (q.trim()) {
			const needle = q.toLowerCase();
			rows = rows.filter((l) => `${l.name} ${l.kind} ${l.location}`.toLowerCase().includes(needle));
		}
		return rows.slice(0, 24);
	}, [
		catalog,
		tab,
		tempTrip,
		activeChip,
		q
	]);
	const dayItems = items.filter((i) => i.day === day);
	const dayListings = dayItems.map((i) => resolveListing(i.slug, catalog)).filter(Boolean);
	function applyLocalItinerary(polish) {
		const built = buildTripItinerary({
			items,
			listings: catalog,
			days,
			polish,
			origin,
			tripType,
			interests,
			locationLabel
		});
		setItinerary(built.days, built.items, polish);
	}
	async function runItinerary(polish) {
		const chosen = items.map((i) => resolveListing(i.slug, catalog)).filter((l) => !!l);
		if (chosen.length === 0) {
			toast.error("Add listings first");
			return;
		}
		setBusy(polish ? "ai" : "generate");
		if (!polish) {
			window.setTimeout(() => {
				applyLocalItinerary(false);
				setBusy(null);
				setPane("itinerary");
				toast.success("Itinerary created");
			}, 250);
			return;
		}
		try {
			const slim = chosen.slice(0, 40).map((l) => ({
				slug: l.slug,
				name: l.name,
				kind: l.kind,
				area: l.area,
				category: l.category,
				description: (l.description || "").slice(0, 280),
				...Number.isFinite(l.lat) ? { lat: l.lat } : {},
				...Number.isFinite(l.lng) ? { lng: l.lng } : {},
				...l.duration ? { duration: l.duration } : {}
			}));
			const result = await generateAiItinerary({ data: {
				days,
				tripType,
				interests,
				locationLabel,
				items,
				listings: slim
			} });
			if (result.ok && result.days.length) {
				setItinerary(attachTravel(result.days, catalog, origin), result.items, true);
				toast.success("AI itinerary ready");
			} else {
				applyLocalItinerary(true);
				toast.message("AI was busy — local itinerary ready");
			}
		} catch {
			applyLocalItinerary(true);
			toast.message("AI was busy — local itinerary ready");
		} finally {
			setBusy(null);
			setPane("itinerary");
		}
	}
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-16 text-center text-sm text-muted-foreground",
		children: "Loading trip…"
	});
	if (!started && items.length === 0 && tempTrip.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TripFormWizard, {});
	const budgetLabel = TRIP_BUDGETS.find((b) => b.slug === budget)?.label ?? budget;
	const typeLabel = TRIP_TYPES.find((t) => t.slug === tripType)?.label ?? tripType;
	const dateLabel = formatTripDates(start, end);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: cn("relative overflow-hidden rounded-2xl", pane === "map" ? "max-lg:hidden" : "block"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/images/lighthouse.jpg",
						alt: "",
						className: "h-40 w-full object-cover sm:h-48"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute right-3 top-3 z-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							asChild: true,
							className: "bg-card/95 shadow-soft",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/plan",
								children: "Edit selection"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-0 p-4 sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-xl font-semibold leading-snug sm:text-2xl",
								children: title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaChip, {
										label: "Size",
										value: typeLabel || "Open"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaChip, {
										label: "Budget",
										value: budgetLabel || "Any"
									}),
									code ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaChip, {
										label: "Code",
										value: code
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaChip, {
										label: "Location",
										value: locationLabel || "Pondicherry"
									})
								]
							}),
							dateLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: ["Date: ", dateLabel]
							}) : null
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)_minmax(0,0.9fr)] lg:items-stretch", pane === "map" && "max-lg:mt-0"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "trip-panel-locations",
						role: "tabpanel",
						"aria-labelledby": "trip-pane-locations",
						className: cn("min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-border/70 sm:p-4 lg:max-h-[calc(100dvh-10rem)]", pane === "locations" ? "flex" : "hidden lg:flex"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										["interests", "Chosen interests"],
										["saved", tempTrip.length ? `Saved (${tempTrip.length})` : "Saved"],
										["all", "Categories"]
									].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setTab(key),
										className: cn("h-9 rounded-full px-3 text-xs font-semibold ring-1", tab === key ? "bg-primary text-primary-foreground ring-primary" : "bg-background ring-border"),
										children: label
									}, key))
								}),
								tab === "interests" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: interestChips.map((slug) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setChip(slug),
										className: cn("h-8 rounded-full px-3 text-xs font-medium ring-1", activeChip === slug ? "bg-accent text-accent-foreground ring-accent" : "ring-border"),
										children: interestLabel(slug)
									}, slug))
								}),
								tab === "saved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-muted-foreground",
									children: "Saved from listing cards. Tap Add to put a place on a day."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: q,
									onChange: (e) => setQ(e.target.value),
									placeholder: tab === "saved" ? "Search saved…" : "Search listings…",
									className: "mt-3 h-10",
									"aria-label": "Search trip listings"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 min-h-0 flex-1 overflow-y-auto pr-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
								children: pool.map((listing) => {
									const assigned = items.find((i) => i.slug === listing.slug);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "flex min-w-0 flex-col overflow-hidden rounded-xl bg-background ring-1 ring-border/70",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/place/$slug",
											params: { slug: listing.slug },
											className: "block",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: listing.image,
												alt: "",
												className: "aspect-[4/3] w-full object-cover"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 flex-1 flex-col gap-2 p-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-xs font-semibold leading-snug",
													children: listing.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-[11px] text-muted-foreground",
													children: listing.kind
												})]
											}), assigned ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-auto flex gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground",
													onClick: () => removeItem(listing.slug, assigned.day),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), "Remove"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground",
													onClick: () => addDay.open({
														slug: listing.slug,
														name: listing.name,
														currentDay: assigned.day
													}),
													children: ["Day ", assigned.day]
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "mt-auto inline-flex h-8 w-full items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground",
												onClick: () => addDay.open({
													slug: listing.slug,
													name: listing.name
												}),
												children: "+ Add"
											})]
										})]
									}, listing.slug);
								})
							}), pool.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "py-8 text-center text-sm text-muted-foreground",
								children: tab === "saved" ? "Save listings from cards to see them here." : "No listings match."
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "trip-panel-itinerary",
						role: "tabpanel",
						"aria-labelledby": "trip-pane-itinerary",
						className: cn("min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-border/70 sm:p-4 lg:max-h-[calc(100dvh-10rem)]", pane === "itinerary" ? "flex" : "hidden lg:flex"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-lg font-semibold",
									children: "Itinerary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1",
									children: Array.from({ length: days }, (_, i) => i + 1).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setDay(d),
										className: cn("flex size-8 items-center justify-center rounded-full text-xs font-semibold ring-1", day === d ? "bg-primary text-primary-foreground ring-primary" : "ring-border"),
										children: d
									}, d))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									"Day ",
									day,
									" · drag to reorder"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1",
								children: dayListings.map((listing, index) => {
									if (!listing) return null;
									const prev = dayListings[index - 1];
									const leg = index > 0 ? travelLeg(prev, listing) : null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [leg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mb-1 pl-10 text-[11px] text-muted-foreground",
										children: [
											leg.minutes,
											" min · ",
											travelLabel(leg.km)
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										draggable: true,
										onDragStart: () => setDrag(listing.slug),
										onDragOver: (e) => e.preventDefault(),
										onDrop: () => {
											if (!drag || drag === listing.slug) return;
											const slugs = dayItems.map((i) => i.slug);
											const from = slugs.indexOf(drag);
											const to = slugs.indexOf(listing.slug);
											if (from < 0 || to < 0) return;
											slugs.splice(from, 1);
											slugs.splice(to, 0, drag);
											reorderDay(day, slugs);
											setDrag(null);
										},
										className: cn("flex cursor-grab gap-2 rounded-xl bg-background p-2 ring-1 ring-border/70 active:cursor-grabbing", drag === listing.slug && "opacity-60", selectedSlug === listing.slug && "ring-primary"),
										onClick: () => setSelectedSlug(listing.slug),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
												children: index + 1
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: listing.image,
												alt: "",
												className: "size-14 rounded-lg object-cover"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-start gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "truncate text-sm font-semibold",
																children: listing.name
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "ml-auto size-4 shrink-0 text-muted-foreground" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																className: "text-muted-foreground hover:text-destructive",
																onClick: () => removeItem(listing.slug, day),
																"aria-label": `Remove ${listing.name}`,
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] uppercase tracking-wide text-primary",
														children: listing.kind
													}),
													listing.rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "mt-0.5 text-[11px] text-muted-foreground",
														children: [
															listing.rating.toFixed(1),
															" (",
															listing.reviews.toLocaleString(),
															")"
														]
													})
												]
											})
										]
									})] }, listing.slug);
								})
							}),
							dayListings.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-8 text-center text-sm text-muted-foreground",
								children: [
									"Add listings from Saved for Day ",
									day,
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/plan",
											children: "Edit selection"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										disabled: busy != null,
										onClick: () => void runItinerary(false),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "size-3.5" }), busy === "generate" ? "Generating…" : itinerary ? "Regenerate itinerary" : "Generate itinerary"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										size: "sm",
										disabled: busy != null,
										onClick: () => void runItinerary(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), busy === "ai" ? "Writing with AI…" : "AI generator"]
									})
								]
							}),
							busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted-foreground",
								children: busy === "ai" ? "Asking Gemini to shape the days…" : "Generating itinerary… please wait."
							}),
							itinerary && itinerary.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 rounded-xl bg-background p-3 ring-1 ring-border/70",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "font-display text-base font-semibold",
										children: ["Your itinerary", itineraryPolished ? " · AI" : ""]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Here is your day-by-day plan based on selected listings."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 space-y-4",
										children: itinerary.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-semibold",
												children: block.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: block.intro
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
												className: "mt-2 space-y-2",
												children: block.stops.map((stop) => {
													const listing = resolveListing(stop.slug, catalog);
													if (!listing) return null;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
														className: "rounded-lg bg-card px-3 py-2 ring-1 ring-border/60",
														children: [
															stop.travel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-[11px] text-muted-foreground",
																children: [
																	stop.travel.minutes,
																	" min · ",
																	travelLabel(stop.travel.km)
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "flex items-center gap-2 text-sm font-medium",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5 text-primary" }),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "tabular-nums",
																		children: stop.time
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "truncate",
																		children: listing.name
																	})
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-0.5 text-xs text-muted-foreground",
																children: stop.blurb
															})
														]
													}, `${block.day}-${stop.slug}`);
												})
											})
										] }, block.day))
									})
								]
							}),
							wpUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: wpUrl,
								className: "mt-3 block text-xs text-primary hover:underline",
								target: "_blank",
								rel: "noreferrer",
								children: ["Open on ", WP_ORIGIN.replace("https://", "")]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						id: "trip-panel-map",
						role: "tabpanel",
						"aria-labelledby": "trip-pane-map",
						className: cn("min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-0 ring-1 ring-border/70 lg:max-h-[calc(100dvh-10rem)]", pane === "map" ? "flex max-lg:min-h-[calc(100dvh-8.5rem)]" : "hidden lg:flex"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingMap, {
							listings: dayListings.filter((l) => !!l),
							selected: selectedSlug,
							onSelect: setSelectedSlug,
							className: "h-full min-h-[22rem] rounded-none ring-0 sm:h-full"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TripPaneBar, {
				pane,
				onChange: setPane,
				badge: items.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddDayModal, {
				pending: addDay.pending,
				days,
				onClose: addDay.close,
				onChoose: (d) => {
					const payload = addDay.confirm(d);
					if (!payload) return;
					addToDay(payload.slug, d);
					setDay(d);
					toast.success(`${payload.currentDay ? "Moved" : "Added"} to day ${d}`);
				}
			})
		]
	});
}
function MetaChip({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-[11px] ring-1 ring-border/70",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: value
		})]
	});
}
//#endregion
export { TripPage as component };
