import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as listingIsOpen } from "./hours-BdXwVY0q.mjs";
import { D as LayoutGrid, E as LocateFixed, O as LayoutList, b as Map$1, m as Search, p as SlidersHorizontal, t as X } from "../_libs/lucide-react.mjs";
import { A as sortListings, B as FILTER_GROUPS, C as useGeo, G as filtersFromSearch, H as applySmartFilters, J as optionsForFilter, K as groupsForCategory, O as catalogSearch, Q as SheetTrigger, U as emptyFilterSearch, V as activeFilterCount, X as Sheet, Y as toggleValue, Z as SheetContent, a as Route$10, ft as Button, j as useCatalog, q as joinCsv } from "./router-BD5yDehu.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
import { n as ListingCard } from "./listing-card-CBSP8lVI.mjs";
import { n as listingPinNumbers, t as ListingMap } from "./listing-map-DoFefY9W.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { n as CATEGORY_META, t as CATEGORIES } from "./types-81kCn66h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-kS2JQSLd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
		}).filter((row) => row.options.length >= 2 || row.options.length === 1 && row.options[0].count < items.length);
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
		className: "mt-3 space-y-2.5",
		children: [
			typeOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-nowrap gap-1.5 overflow-x-auto pb-1",
				children: typeOptions.map((option) => {
					const active = selectedType.includes(option.slug);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setGroup("type", toggleValue(selectedType, option.slug)),
						className: cn("h-8 shrink-0 rounded-full px-3 text-xs ring-1 transition-colors", active ? "bg-accent text-accent-foreground ring-primary/30" : "bg-card text-foreground ring-border hover:bg-muted"),
						children: [option.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 tabular-nums text-muted-foreground",
							children: option.count
						})]
					}, option.slug);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onChange({ open: openActive ? void 0 : "1" }),
						className: cn("h-8 rounded-full px-3 text-xs ring-1 transition-colors", openActive ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-border hover:bg-muted"),
						children: ["Open now", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("ml-1 tabular-nums", openActive ? "text-primary-foreground/80" : "text-muted-foreground"),
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
								className: "h-8 gap-1.5 rounded-full px-3 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-3.5" }),
									"Filters",
									extraCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-primary px-1.5 text-[10px] font-semibold tabular-nums text-primary-foreground",
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
									className: "text-xs text-muted-foreground",
									children: "Type, area, amenities, and listing features from the Pondicherry directory."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1",
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
			className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
			children: group.label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5 flex flex-wrap gap-1.5",
			children: visible.map((option) => {
				const active = selected.includes(option.slug);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onToggle(option.slug),
					className: cn("min-h-8 rounded-full px-2.5 text-xs ring-1 transition-colors", active ? "bg-primary text-primary-foreground ring-primary" : "bg-background text-foreground ring-border hover:bg-muted"),
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
function hereToLatLng(value) {
	if (!value) return null;
	const [lat, lng] = value.split(",").map(Number);
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	return {
		lat,
		lng
	};
}
function isCategory(v) {
	return !!v && CATEGORIES.includes(v);
}
function Explore() {
	const search = Route$10.useSearch();
	const { q = "", cat = "all" } = search;
	const navigate = Route$10.useNavigate();
	const items = useCatalog((s) => s.items);
	const source = useCatalog((s) => s.source);
	const status = useCatalog((s) => s.status);
	const total = useCatalog((s) => s.total);
	const category = isCategory(cat) ? cat : "all";
	const filters = (0, import_react.useMemo)(() => filtersFromSearch(search), [search]);
	const origin = useGeo((s) => s.origin);
	const geoStatus = useGeo((s) => s.status);
	const nearMe = useGeo((s) => s.nearMe);
	const locate = useGeo((s) => s.locate);
	const clearGeo = useGeo((s) => s.clear);
	const scoped = (0, import_react.useMemo)(() => items.filter((l) => category === "all" ? true : l.category === category), [items, category]);
	const results = (0, import_react.useMemo)(() => {
		const rows = catalogSearch(items, q, category, filters);
		return sortListings(rows, {
			origin,
			nearMe
		});
	}, [
		items,
		q,
		category,
		filters,
		origin,
		nearMe
	]);
	const meta = isCategory(category) ? CATEGORY_META[category] : null;
	const [visible, setVisible] = (0, import_react.useState)(PAGE_SIZE);
	const [selected, setSelected] = (0, import_react.useState)();
	const view = search.view ?? "list";
	const hoverLock = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const fromUrl = hereToLatLng(search.here);
		if (fromUrl) useGeo.setState({
			origin: fromUrl,
			source: "gps",
			status: "ready",
			nearMe: true
		});
	}, [search.here]);
	const shown = view === "map" ? results : results.slice(0, visible);
	const mappedCount = results.filter((l) => l.lat != null && l.lng != null).length;
	const pinNumbers = (0, import_react.useMemo)(() => listingPinNumbers(results), [results]);
	const mapList = (0, import_react.useMemo)(() => {
		const rows = results.filter((l) => l.lat != null && l.lng != null);
		if (selected && !rows.slice(0, 80).some((l) => l.slug === selected)) {
			const extra = rows.find((l) => l.slug === selected);
			return extra ? [extra, ...rows.slice(0, 79)] : rows.slice(0, 80);
		}
		return rows.slice(0, 80);
	}, [results, selected]);
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
		search.area,
		search.theme,
		search.open
	]);
	(0, import_react.useEffect)(() => {
		if (!selected) return;
		hoverLock.current = Date.now();
		document.getElementById(`listing-card-${selected}`)?.scrollIntoView({
			behavior: "smooth",
			block: "nearest"
		});
	}, [selected]);
	function setView(next) {
		navigate({ search: (prev) => ({
			...prev,
			view: next === "list" ? void 0 : next
		}) });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
			children: "Explore"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-0.5 font-display text-2xl font-semibold",
			children: meta ? meta.label : "All of Pondy"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 max-w-xl text-sm text-muted-foreground",
			children: meta ? meta.description : "Beaches, the French Quarter, dives, bakeries, pubs, and a bed for the night."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: status === "loading" ? "Refreshing from xplorepondy.com…" : source === "live" ? `Live from xplorepondy.com · ${total.toLocaleString()} listings` : status === "offline" ? "WordPress unreachable · showing the curated set" : "Loading the directory…"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => void navigate({ search: (prev) => ({
					...prev,
					q: e.target.value
				}) }),
				placeholder: "Search places, food, stays…",
				className: "h-10 pl-10",
				"aria-label": "Filter listings"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex gap-1.5 overflow-x-auto pb-1",
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
					className: cn("h-8 shrink-0 rounded-full px-3 text-xs font-medium ring-1 ring-border transition-colors", active ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground hover:bg-muted"),
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
			className: "mt-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground tabular-nums",
				children: [
					results.length,
					" ",
					results.length === 1 ? "place" : "places",
					nearMe ? " · nearest first" : " · featured first",
					view === "map" && mappedCount > 0 ? ` · ${mappedCount} on the map` : ""
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => nearMe ? clearGeo() : locate(),
					className: cn("flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs ring-1 transition-colors", nearMe ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-border hover:bg-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: geoStatus === "asking" && nearMe ? "Locating…" : "Near me" })]
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
						className: cn("flex h-8 items-center gap-1.5 px-2.5 text-xs transition-colors", view === key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"),
						"aria-pressed": view === key,
						"aria-label": label,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: label
						})]
					}, key))
				})]
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
				children: mapList.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					onMouseEnter: () => {
						if (Date.now() - hoverLock.current < 600) return;
						setSelected(l.slug);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
						listing: l,
						layout: "row",
						active: selected === l.slug,
						pin: pinNumbers.get(l.slug),
						cardId: `listing-card-${l.slug}`
					})
				}, l.slug))
			})]
		}) : view === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3",
			children: shown.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
				listing: l,
				layout: "grid",
				pin: pinNumbers.get(l.slug)
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
				layout: "row",
				pin: pinNumbers.get(l.slug)
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
