import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as emptyFilterSearch, f as joinCsv, g as optionsForFilter, i as applySmartFilters, p as listingIsOpen, r as activeFilterCount, s as filtersFromSearch, t as FILTER_GROUPS, u as groupsForCategory, v as toggleValue } from "./filters-CkhHKy69.mjs";
import { T as LayoutList, d as Search, t as X, u as SlidersHorizontal, v as Map$1, w as LayoutGrid } from "../_libs/lucide-react.mjs";
import { _ as SheetTrigger, d as catalogSearch, g as SheetContent, h as Sheet, i as Route$8, p as useCatalog, v as Button, y as cn } from "./router-9HOMADMB.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
import { t as ListingCard } from "./listing-card-C3q5qlQX.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { n as CATEGORY_META, t as CATEGORIES } from "./types-81kCn66h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-CCiJugqp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PONDICHERRY = {
	lat: 11.934,
	lng: 79.832
};
var TILE = 256;
function project(lat, lng, zoom) {
	const n = 2 ** zoom;
	const x = (lng + 180) / 360 * n;
	const rad = lat * Math.PI / 180;
	return {
		x,
		y: (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n
	};
}
function unproject(x, y, zoom) {
	const n = 2 ** zoom;
	const lng = x / n * 360 - 180;
	const m = Math.PI * (1 - 2 * y / n);
	return {
		lat: 180 / Math.PI * Math.atan(Math.sinh(m)),
		lng
	};
}
function fit(pins, width, height) {
	if (!pins.length) return {
		...PONDICHERRY,
		zoom: 13
	};
	const lats = pins.map((p) => p.lat);
	const lngs = pins.map((p) => p.lng);
	const mid = {
		lat: (Math.min(...lats) + Math.max(...lats)) / 2,
		lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
	};
	for (let zoom = 16; zoom >= 11; zoom--) {
		const a = project(Math.min(...lats), Math.min(...lngs), zoom);
		const b = project(Math.max(...lats), Math.max(...lngs), zoom);
		const w = Math.abs(b.x - a.x) * TILE;
		const h = Math.abs(b.y - a.y) * TILE;
		if (w < width - 80 && h < height - 80) return {
			...mid,
			zoom
		};
	}
	return {
		...mid,
		zoom: 12
	};
}
function ListingMap({ listings, selected, onSelect }) {
	const root = (0, import_react.useRef)(null);
	const [size, setSize] = (0, import_react.useState)({
		w: 640,
		h: 420
	});
	const pins = (0, import_react.useMemo)(() => listings.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng)), [listings]);
	const fitted = (0, import_react.useMemo)(() => fit(pins, size.w, size.h), [
		pins,
		size.w,
		size.h
	]);
	const [view, setView] = (0, import_react.useState)(fitted);
	const drag = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = root.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			const rect = el.getBoundingClientRect();
			setSize({
				w: Math.max(1, rect.width),
				h: Math.max(1, rect.height)
			});
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		setView(fitted);
	}, [
		fitted.lat,
		fitted.lng,
		fitted.zoom,
		pins.length
	]);
	const tiles = (0, import_react.useMemo)(() => {
		const center = project(view.lat, view.lng, view.zoom);
		const originX = center.x * TILE - size.w / 2;
		const originY = center.y * TILE - size.h / 2;
		const minX = Math.floor(originX / TILE);
		const minY = Math.floor(originY / TILE);
		const maxX = Math.floor((originX + size.w) / TILE);
		const maxY = Math.floor((originY + size.h) / TILE);
		const n = 2 ** view.zoom;
		const out = [];
		for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) {
			const tx = (x % n + n) % n;
			if (y < 0 || y >= n) continue;
			out.push({
				key: `${view.zoom}-${tx}-${y}`,
				x: tx,
				y,
				left: x * TILE - originX,
				top: y * TILE - originY
			});
		}
		return {
			originX,
			originY,
			items: out,
			center
		};
	}, [view, size]);
	function panBy(dx, dy) {
		setView((v) => {
			const center = project(v.lat, v.lng, v.zoom);
			return {
				...v,
				...unproject(center.x - dx / TILE, center.y - dy / TILE, v.zoom)
			};
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: root,
		className: "relative h-[22rem] overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:h-[28rem]",
		onPointerDown: (e) => {
			e.currentTarget.setPointerCapture(e.pointerId);
			drag.current = {
				x: e.clientX,
				y: e.clientY
			};
		},
		onPointerMove: (e) => {
			if (!drag.current) return;
			const dx = e.clientX - drag.current.x;
			const dy = e.clientY - drag.current.y;
			drag.current = {
				x: e.clientX,
				y: e.clientY
			};
			panBy(dx, dy);
		},
		onPointerUp: () => {
			drag.current = null;
		},
		onPointerCancel: () => {
			drag.current = null;
		},
		children: [
			tiles.items.map((tile) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				alt: "",
				draggable: false,
				src: `https://tile.openstreetmap.org/${view.zoom}/${tile.x}/${tile.y}.png`,
				className: "pointer-events-none absolute size-[256px] max-w-none select-none",
				style: {
					left: tile.left,
					top: tile.top
				}
			}, tile.key)),
			pins.map((listing, index) => {
				const p = project(listing.lat, listing.lng, view.zoom);
				const left = p.x * TILE - tiles.originX;
				const top = p.y * TILE - tiles.originY;
				const active = selected === listing.slug;
				const open = listingIsOpen(listing);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: (e) => {
						e.stopPropagation();
						onSelect(listing.slug);
					},
					className: cn("absolute z-10 flex size-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full text-[11px] font-semibold shadow-soft ring-2 transition-transform", active ? "z-20 scale-110 bg-primary text-primary-foreground ring-background" : "bg-card text-foreground ring-background", open === true && !active && "ring-primary/50", open === false && !active && "opacity-80"),
					style: {
						left,
						top
					},
					title: listing.name,
					"aria-label": listing.name,
					children: index + 1
				}, listing.slug);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-3 top-3 z-20 flex flex-col overflow-hidden rounded-xl bg-card/95 shadow-soft ring-1 ring-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 items-center justify-center text-lg leading-none hover:bg-muted",
					onClick: () => setView((v) => ({
						...v,
						zoom: Math.min(16, v.zoom + 1)
					})),
					"aria-label": "Zoom in",
					children: "+"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 items-center justify-center text-lg leading-none hover:bg-muted",
					onClick: () => setView((v) => ({
						...v,
						zoom: Math.max(11, v.zoom - 1)
					})),
					"aria-label": "Zoom out",
					children: "−"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute bottom-2 left-3 z-20 rounded-md bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground",
				children: "© OpenStreetMap · JetEngine pins"
			}),
			pins.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm text-muted-foreground",
				children: "No mapped listings in this set yet."
			})
		]
	});
}
function SmartFiltersBar({ items, category, filters, onChange }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [expanded, setExpanded] = (0, import_react.useState)({});
	const typeOptions = (0, import_react.useMemo)(() => {
		const withoutType = applySmartFilters(items, {
			...filters,
			type: void 0
		});
		const group = FILTER_GROUPS.find((g) => g.param === "type");
		return group ? optionsForFilter(withoutType, group) : [];
	}, [items, filters]);
	const extraGroups = (0, import_react.useMemo)(() => {
		return groupsForCategory(category).map((group) => {
			const without = applySmartFilters(items, {
				...filters,
				[group.param]: void 0
			});
			return {
				group,
				options: optionsForFilter(without, group)
			};
		}).filter((row) => row.options.length >= 2);
	}, [
		items,
		category,
		filters
	]);
	const selectedType = filters.type ?? [];
	const extraCount = activeFilterCount({
		...filters,
		type: void 0,
		open: void 0
	});
	const totalCount = activeFilterCount(filters);
	const openCount = (0, import_react.useMemo)(() => {
		return applySmartFilters(items, {
			...filters,
			open: void 0
		}).filter((row) => listingIsOpen(row) === true).length;
	}, [items, filters]);
	const openActive = (filters.open ?? []).includes("1");
	function setGroup(param, values) {
		onChange({ [param]: joinCsv(values) });
	}
	function clearAll() {
		const cleared = {};
		for (const key of Object.keys(filters)) cleared[key] = void 0;
		onChange(cleared);
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 space-y-3",
		children: [
			typeOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-nowrap gap-2 overflow-x-auto pb-1",
				children: typeOptions.map((option) => {
					const active = selectedType.includes(option.slug);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setGroup("type", toggleValue(selectedType, option.slug)),
						className: cn("h-10 shrink-0 rounded-full px-3.5 text-sm ring-1 transition-colors", active ? "bg-accent text-accent-foreground ring-primary/30" : "bg-card text-foreground ring-border hover:bg-muted"),
						children: [option.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1.5 tabular-nums text-muted-foreground",
							children: option.count
						})]
					}, option.slug);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onChange({ open: openActive ? void 0 : "1" }),
						className: cn("h-10 rounded-full px-3.5 text-sm ring-1 transition-colors", openActive ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-border hover:bg-muted"),
						children: ["Open now", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("ml-1.5 tabular-nums", openActive ? "text-primary-foreground/80" : "text-muted-foreground"),
							children: openCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
						open,
						onOpenChange: setOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "h-10 gap-2 rounded-full px-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4" }),
									"Filters",
									extraCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground",
										children: extraCount
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
							side: "bottom",
							title: "Smart filters",
							className: "gap-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "JetEngine meta keys from the directory — cafe type, amenities, atmosphere, and more."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1",
									children: extraGroups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "No extra facets for this set yet. Try another category."
									}) : extraGroups.map(({ group, options }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterGroupBlock, {
										group,
										options,
										selected: filters[group.param] ?? [],
										expanded: expanded[group.param] ?? false,
										onExpand: () => setExpanded((prev) => ({
											...prev,
											[group.param]: !prev[group.param]
										})),
										onToggle: (slug) => setGroup(group.param, toggleValue(filters[group.param] ?? [], slug))
									}, group.param))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex gap-2 border-t border-border pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										className: "flex-1",
										onClick: clearAll,
										disabled: totalCount === 0,
										children: "Clear"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "flex-1",
										onClick: () => setOpen(false),
										children: "Show results"
									})]
								})
							]
						})]
					}),
					totalCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: clearAll,
						className: "h-10 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground",
						children: "Clear all"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveFilterChips, {
				filters,
				typeOptions,
				extraGroups,
				onRemove: (param, slug) => setGroup(param, toggleValue(filters[param] ?? [], slug))
			})
		]
	});
}
function FilterGroupBlock({ group, options, selected, expanded, onExpand, onToggle }) {
	const visible = expanded ? options : options.slice(0, 12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground",
			children: group.label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex flex-wrap gap-2",
			children: visible.map((option) => {
				const active = selected.includes(option.slug);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onToggle(option.slug),
					className: cn("min-h-10 rounded-full px-3 text-sm ring-1 transition-colors", active ? "bg-primary text-primary-foreground ring-primary" : "bg-background text-foreground ring-border hover:bg-muted"),
					children: [option.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("ml-1.5 tabular-nums", active ? "text-primary-foreground/80" : "text-muted-foreground"),
						children: option.count
					})]
				}, option.slug);
			})
		}),
		options.length > 12 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onExpand,
			className: "mt-2 text-sm font-medium text-primary hover:underline",
			children: expanded ? "Show fewer" : `Show all ${options.length}`
		})
	] });
}
function ActiveFilterChips({ filters, typeOptions, extraGroups, onRemove }) {
	const lookup = /* @__PURE__ */ new Map();
	for (const option of typeOptions) lookup.set(`type:${option.slug}`, option.name);
	for (const { group, options } of extraGroups) for (const option of options) lookup.set(`${group.param}:${option.slug}`, option.name);
	const chips = [];
	for (const [param, slugs] of Object.entries(filters)) for (const slug of slugs ?? []) chips.push({
		param,
		slug,
		name: param === "open" ? "Open now" : lookup.get(`${param}:${slug}`) ?? slug.replace(/-/g, " ")
	});
	if (!chips.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: chips.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			tone: "outline",
			className: "gap-1 pr-1",
			children: [chip.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onRemove(chip.param, chip.slug),
				className: "flex size-6 items-center justify-center rounded-full hover:bg-muted",
				"aria-label": `Remove ${chip.name}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
			})]
		}, `${chip.param}:${chip.slug}`))
	});
}
var PAGE_SIZE = 24;
function isCategory(v) {
	return !!v && CATEGORIES.includes(v);
}
function Explore() {
	const search = Route$8.useSearch();
	const { q = "", cat = "all" } = search;
	const navigate = Route$8.useNavigate();
	const items = useCatalog((s) => s.items);
	const source = useCatalog((s) => s.source);
	const status = useCatalog((s) => s.status);
	const total = useCatalog((s) => s.total);
	const category = isCategory(cat) ? cat : "all";
	const filters = (0, import_react.useMemo)(() => filtersFromSearch(search), [search]);
	const scoped = (0, import_react.useMemo)(() => items.filter((l) => category === "all" ? true : l.category === category), [items, category]);
	const results = catalogSearch(items, q, category, filters);
	const meta = isCategory(category) ? CATEGORY_META[category] : null;
	const [visible, setVisible] = (0, import_react.useState)(PAGE_SIZE);
	const [selected, setSelected] = (0, import_react.useState)();
	const view = search.view ?? "list";
	(0, import_react.useEffect)(() => {
		setVisible(PAGE_SIZE);
		setSelected(void 0);
	}, [
		q,
		category,
		items.length,
		search.type,
		search.feat,
		search.amen,
		search.open,
		search.view
	]);
	const shown = view === "map" ? results : results.slice(0, visible);
	const mappedCount = results.filter((l) => l.lat != null && l.lng != null).length;
	function setView(next) {
		navigate({ search: (prev) => ({
			...prev,
			view: next === "list" ? void 0 : next
		}) });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
			children: "Explore"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl font-semibold",
			children: meta ? meta.label : "All of Pondy"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted-foreground",
			children: meta ? meta.description : "Beaches, the French Quarter, dives, bakeries, pubs, and a bed for the night."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: status === "loading" ? "Refreshing from xplorepondy.com…" : source === "live" ? `Live from xplorepondy.com · ${total.toLocaleString()} listings` : status === "offline" ? "WordPress unreachable · showing the curated set" : "Loading the directory…"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => void navigate({ search: (prev) => ({
					...prev,
					q: e.target.value
				}) }),
				placeholder: "Search places, food, stays…",
				className: "h-12 pl-10",
				"aria-label": "Filter listings"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-2 overflow-x-auto pb-1",
			children: ["all", ...CATEGORIES].map((key) => {
				const label = key === "all" ? "All" : CATEGORY_META[key].label;
				const active = category === key || key === "all" && !isCategory(cat);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void navigate({ search: (prev) => ({
						...prev,
						...emptyFilterSearch(),
						cat: key
					}) }),
					className: cn("h-10 shrink-0 rounded-full px-4 text-sm font-medium ring-1 ring-border transition-colors", active ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground hover:bg-muted"),
					children: label
				}, key);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmartFiltersBar, {
			items: scoped,
			category,
			filters,
			onChange: (patch) => void navigate({ search: (prev) => ({
				...prev,
				...patch
			}) })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground tabular-nums",
				children: [
					results.length,
					" ",
					results.length === 1 ? "place" : "places",
					view === "map" && mappedCount > 0 ? ` · ${mappedCount} on the map` : ""
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex overflow-hidden rounded-full ring-1 ring-border",
				children: [
					[
						"list",
						LayoutList,
						"List"
					],
					[
						"grid",
						LayoutGrid,
						"Grid"
					],
					[
						"map",
						Map$1,
						"Map"
					]
				].map(([key, Icon, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setView(key),
					className: cn("flex h-10 items-center gap-1.5 px-3 text-sm transition-colors", view === key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"),
					"aria-pressed": view === key,
					"aria-label": label,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: label
					})]
				}, key))
			})]
		}),
		results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-10 text-center text-sm text-muted-foreground",
			children: status === "loading" ? "Fetching listings…" : "Nothing matches. Clear a filter or try a broader word."
		}) : view === "map" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingMap, {
				listings: results,
				selected,
				onSelect: setSelected
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1",
				children: results.slice(0, 60).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					onMouseEnter: () => setSelected(l.slug),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
						listing: l,
						layout: "row",
						active: selected === l.slug
					})
				}, l.slug))
			})]
		}) : view === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: shown.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
				listing: l,
				layout: "grid"
			}, l.slug))
		}), visible < results.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: () => setVisible((v) => v + PAGE_SIZE),
				children: [
					"Load more · ",
					results.length - visible,
					" left"
				]
			})
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-col gap-2",
			children: shown.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
				listing: l,
				layout: "row"
			}, l.slug))
		}), visible < results.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: () => setVisible((v) => v + PAGE_SIZE),
				children: [
					"Load more · ",
					results.length - visible,
					" left"
				]
			})
		})] })
	] });
}
//#endregion
export { Explore as component };
