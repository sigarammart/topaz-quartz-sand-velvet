import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { A as Copy, F as CalendarDays, a as Trash2, g as Minus, p as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useTrip, f as resolveListing, m as useHydrated, p as useCatalog, v as Button } from "./router-9HOMADMB.mjs";
import { t as ListingCard } from "./listing-card-C3q5qlQX.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trip-BCxHQlmq.js
var import_jsx_runtime = require_jsx_runtime();
var templates = [
	{
		slug: "white-town-weekend",
		title: "White Town weekend",
		days: 2,
		blurb: "Heritage grid, promenade sunrises, bakeries, and one proper dinner.",
		image: "/images/french-quarter.jpg",
		items: [
			{
				slug: "promenade-beach",
				day: 1
			},
			{
				slug: "baker-street",
				day: 1
			},
			{
				slug: "sri-aurobindo-ashram",
				day: 1
			},
			{
				slug: "manakula-vinayagar",
				day: 1
			},
			{
				slug: "villa-shanti",
				day: 1
			},
			{
				slug: "our-lady-of-angels",
				day: 2
			},
			{
				slug: "white-town-cycle",
				day: 2
			},
			{
				slug: "le-cafe",
				day: 2
			},
			{
				slug: "sacred-heart-basilica",
				day: 2
			}
		]
	},
	{
		slug: "beaches-and-surf",
		title: "Beaches & surf",
		days: 2,
		blurb: "Serenity at dawn, Eden for a walk, a boat, and salt on everything.",
		image: "/images/surf.jpg",
		items: [
			{
				slug: "serenity-surf",
				day: 1
			},
			{
				slug: "serenity-beach",
				day: 1
			},
			{
				slug: "le-majestic-serenity",
				day: 1
			},
			{
				slug: "eden-beach",
				day: 2
			},
			{
				slug: "marina-rainbow",
				day: 2
			},
			{
				slug: "paradise-beach",
				day: 2
			}
		]
	},
	{
		slug: "soul-of-pondy",
		title: "Soul of Pondy",
		days: 3,
		blurb: "Auroville, the ashram, the French Quarter, and a slow third day.",
		image: "/images/matrimandir.jpg",
		items: [
			{
				slug: "promenade-beach",
				day: 1
			},
			{
				slug: "white-town-cycle",
				day: 1
			},
			{
				slug: "sri-aurobindo-ashram",
				day: 1
			},
			{
				slug: "baker-street",
				day: 1
			},
			{
				slug: "auroville-matrimandir",
				day: 2
			},
			{
				slug: "matrimandir-view",
				day: 2
			},
			{
				slug: "auroville",
				day: 2
			},
			{
				slug: "serenity-beach",
				day: 3
			},
			{
				slug: "le-cafe",
				day: 3
			},
			{
				slug: "cosy-pub",
				day: 3
			}
		]
	},
	{
		slug: "food-trail",
		title: "Pondy food trail",
		days: 2,
		blurb: "Tiffin halls, French pastry, Chettinad, and a late restopub.",
		image: "/images/cafe.jpg",
		items: [
			{
				slug: "surguru",
				day: 1
			},
			{
				slug: "baker-street",
				day: 1
			},
			{
				slug: "copper-kitchen",
				day: 1
			},
			{
				slug: "le-cafe",
				day: 1
			},
			{
				slug: "cafe-des-arts",
				day: 2
			},
			{
				slug: "coromandel-cafe",
				day: 2
			},
			{
				slug: "villa-shanti",
				day: 2
			},
			{
				slug: "way-to-fly",
				day: 2
			}
		]
	}
];
function TripPage() {
	const hydrated = useHydrated();
	const days = useTrip((s) => s.days);
	const title = useTrip((s) => s.title);
	const items = useTrip((s) => s.items);
	const setDays = useTrip((s) => s.setDays);
	const setTitle = useTrip((s) => s.setTitle);
	const removeItem = useTrip((s) => s.removeItem);
	const clearTrip = useTrip((s) => s.clearTrip);
	const loadTemplate = useTrip((s) => s.loadTemplate);
	const catalogItems = useCatalog((s) => s.items);
	const shownDays = hydrated ? days : 3;
	const shownItems = hydrated ? items : [];
	function copyPlan() {
		const lines = [`${title} · ${days} day${days > 1 ? "s" : ""}`, ""];
		for (let d = 1; d <= days; d++) {
			lines.push(`Day ${d}`);
			const dayItems = items.filter((i) => i.day === d);
			if (dayItems.length === 0) lines.push("  (open)");
			for (const it of dayItems) {
				const l = resolveListing(it.slug, catalogItems);
				lines.push(`  · ${l?.name ?? it.slug} (${l?.area ?? ""})`);
			}
			lines.push("");
		}
		navigator.clipboard.writeText(lines.join("\n"));
		toast.success("Itinerary copied");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
			children: "Trip planner"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl font-semibold",
			children: "Build your Pondy days"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted-foreground",
			children: "Saved on this device. Add places from Explore, or start from a template."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: hydrated ? title : "My Pondy trip",
					onChange: (e) => setTitle(e.target.value),
					"aria-label": "Trip title",
					className: "sm:max-w-xs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							onClick: () => setDays(shownDays - 1),
							"aria-label": "Fewer days",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-16 text-center text-sm font-medium tabular-nums",
							children: [shownDays, " days"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							onClick: () => setDays(shownDays + 1),
							"aria-label": "More days",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: copyPlan,
						disabled: shownItems.length === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Copy"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: clearTrip,
						disabled: shownItems.length === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Clear"]
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Start from a template"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: templates.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						loadTemplate(t.title, t.days, t.items);
						toast.success(`Loaded ${t.title}`);
					},
					className: "overflow-hidden rounded-xl bg-card text-left ring-1 ring-border/70 transition-transform hover:-translate-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: t.image,
						alt: "",
						className: "h-28 w-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-primary",
								children: [t.days, " days"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display font-semibold",
								children: t.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: t.blurb
							})
						]
					})]
				}, t.slug))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-10 space-y-8",
			children: Array.from({ length: shownDays }, (_, i) => i + 1).map((day) => {
				const dayItems = shownItems.filter((it) => it.day === day);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-4 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-xl font-semibold",
							children: ["Day ", day]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground tabular-nums",
							children: [dayItems.length, " stops"]
						})
					]
				}), dayItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "This day is open."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/explore",
							children: "Add a place"
						})
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: dayItems.map((it) => {
						const listing = resolveListing(it.slug, catalogItems);
						if (!listing) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
								listing,
								layout: "row"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removeItem(it.slug, day),
								className: "absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border hover:text-destructive",
								"aria-label": `Remove ${listing.name}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
							})]
						}, `${it.slug}-${day}`);
					})
				})] }, day);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10 rounded-2xl bg-primary p-6 text-primary-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-semibold",
					children: "Want this booked for you?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-lg text-sm text-primary-foreground/80",
					children: "Send the sketch to Xplore Pondy’s team — verified agents, custom days, 24×7 help."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					className: "mt-4 bg-card text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/plan",
						children: "Request a custom trip"
					})
				})
			]
		})
	] });
}
//#endregion
export { TripPage as component };
