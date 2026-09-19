import { i as __toESM } from "../_runtime.mjs";
import { t as events } from "./events-BM4iX4Cm.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { E as ArrowRight, T as BadgeCheck, b as Clock3, c as Search, p as MapPinned, s as Sparkles, y as Compass } from "../_libs/lucide-react.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as Button } from "./router-B0_otA2Y.mjs";
import { t as ListingCard } from "./listing-card-CY59uZ4l.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { t as featuredListings } from "./listings-Dhhe984p.mjs";
import { n as CATEGORY_META } from "./types-81kCn66h.mjs";
import { n as guides } from "./guides-_rwpUAUp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BNcl5v6S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PILLARS = [
	{
		icon: BadgeCheck,
		title: "Verified experts",
		body: "Trusted local agents, not a random WhatsApp list."
	},
	{
		icon: Sparkles,
		title: "100% custom",
		body: "Tailor the days, the pace, the food, the quiet."
	},
	{
		icon: Clock3,
		title: "24×7 assistance",
		body: "Someone to call when a ferry is full or a tide turns."
	},
	{
		icon: MapPinned,
		title: "Built for Pondy",
		body: "White Town to Auroville, mapped the way locals move."
	}
];
var THEMES = [
	{
		label: "French heritage",
		q: "heritage",
		image: "/images/french-quarter.jpg"
	},
	{
		label: "Beaches",
		q: "beach",
		image: "/images/beach.jpg"
	},
	{
		label: "Spiritual",
		q: "spiritual",
		image: "/images/matrimandir.jpg"
	},
	{
		label: "Cafés",
		q: "café",
		image: "/images/cafe.jpg"
	},
	{
		label: "Nightlife",
		q: "nightlife",
		image: "/images/nightlife.jpg"
	},
	{
		label: "Adventure",
		q: "scuba",
		image: "/images/scuba.jpg"
	}
];
function Home() {
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const featured = featuredListings().slice(0, 6);
	function onSearch(e) {
		e.preventDefault();
		navigate({
			to: "/explore",
			search: {
				q: q.trim(),
				cat: "all"
			}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden rounded-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/images/promenade.jpg",
						alt: "Promenade Beach at golden hour",
						className: "h-[28rem] w-full object-cover sm:h-[32rem]"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-overlay/45" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col justify-end p-6 sm:p-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.2em] text-hero-muted",
								children: "Pondicherry travel planner"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 max-w-xl font-display text-4xl font-semibold text-hero sm:text-5xl",
								children: "Explore Puducherry like never before"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 max-w-lg text-sm text-hero/85 sm:text-base",
								children: "Places, cafés, stays, and a trip you can actually follow — the companion to xplorepondy.com."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: onSearch,
								className: "mt-6 flex max-w-lg gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: q,
										onChange: (e) => setQ(e.target.value),
										placeholder: "Beaches, bakeries, Auroville…",
										className: "h-12 border-0 bg-card pl-10",
										"aria-label": "Search Pondicherry"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "lg",
									children: "Search"
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5 flex items-end justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
					children: "Explore"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl font-semibold",
					children: "Find Pondy your way"
				})] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: Object.keys(CATEGORY_META).map((key) => {
					const meta = CATEGORY_META[key];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/explore",
						search: {
							cat: key,
							q: ""
						},
						className: "group relative overflow-hidden rounded-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: meta.image,
								alt: "",
								className: "h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-44"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-overlay/45" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-x-0 bottom-0 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-medium uppercase tracking-wide text-hero-muted",
									children: meta.kicker
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-semibold text-hero",
									children: meta.label
								})]
							})
						]
					}, key);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: PILLARS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-card p-5 ring-1 ring-border/70",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(p.icon, { className: "size-5 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 font-display text-lg font-semibold",
							children: p.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: p.body
						})
					]
				}, p.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
					children: "Handpicked"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl font-semibold",
					children: "Do not miss these"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/explore",
					className: "flex items-center gap-1 text-sm font-medium text-primary",
					children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: featured.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, { listing: l }, l.slug))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
					children: "By mood"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl font-semibold",
					children: "Explore by theme"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-3 overflow-x-auto pb-2",
				children: THEMES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/explore",
					search: {
						q: t.q,
						cat: "all"
					},
					className: "relative w-40 shrink-0 overflow-hidden rounded-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: t.image,
							alt: "",
							className: "h-28 w-full object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-overlay/40" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-x-0 bottom-0 p-3 font-display text-sm font-semibold text-hero",
							children: t.label
						})
					]
				}, t.label))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
					children: "Guides"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl font-semibold",
					children: "Read before you ride"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/guides",
					className: "flex items-center gap-1 text-sm font-medium text-primary",
					children: ["All guides ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: guides.slice(0, 3).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/guides/$slug",
					params: { slug: g.slug },
					className: "overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: g.image,
						alt: "",
						className: "h-40 w-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									g.topic,
									" · ",
									g.readTime,
									" read"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-1 font-display text-lg font-semibold",
								children: g.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
								children: g.excerpt
							})
						]
					})]
				}, g.slug))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
					children: "Now"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl font-semibold",
					children: "What’s on"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/events",
					className: "flex items-center gap-1 text-sm font-medium text-primary",
					children: ["All events ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: events.slice(0, 4).map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/events",
					className: "flex gap-3 overflow-hidden rounded-xl bg-card p-2 ring-1 ring-border/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: ev.image,
						alt: "",
						className: "size-20 rounded-lg object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-primary",
								children: ev.dateLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display font-semibold",
								children: ev.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: ev.place
							})
						]
					})]
				}, ev.slug))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-6 md:flex-row md:items-center md:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70",
								children: "Custom trips"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-3xl font-semibold",
								children: "Tell us how you travel. We’ll shape Pondy around it."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-primary-foreground/80",
								children: "Verified agents, 100% custom itineraries, assistance around the clock — the same promise as xplorepondy.com, now in your pocket."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "secondary",
							size: "lg",
							className: "bg-card text-foreground hover:bg-card/90",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/plan",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, {}), "Plan a custom trip"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "lg",
							className: "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/trip",
								children: "Open my itinerary"
							})
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { Home as component };
