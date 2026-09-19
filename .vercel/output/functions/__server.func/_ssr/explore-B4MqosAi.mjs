import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Search } from "../_libs/lucide-react.mjs";
import { i as Route$7 } from "./router-B0_otA2Y.mjs";
import { t as ListingCard } from "./listing-card-CY59uZ4l.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { i as searchListings } from "./listings-Dhhe984p.mjs";
import { n as CATEGORY_META, t as CATEGORIES } from "./types-81kCn66h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-B4MqosAi.js
var import_jsx_runtime = require_jsx_runtime();
function isCategory(v) {
	return !!v && CATEGORIES.includes(v);
}
function Explore() {
	const { q = "", cat = "all" } = Route$7.useSearch();
	const navigate = Route$7.useNavigate();
	const category = isCategory(cat) ? cat : "all";
	const queried = searchListings(q);
	const results = category === "all" ? queried : queried.filter((l) => l.category === category);
	const meta = isCategory(category) ? CATEGORY_META[category] : null;
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
						cat: key
					}) }),
					className: cn("h-10 shrink-0 rounded-full px-4 text-sm font-medium ring-1 ring-border transition-colors", active ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground hover:bg-muted"),
					children: label
				}, key);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-5 text-sm text-muted-foreground tabular-nums",
			children: [
				results.length,
				" ",
				results.length === 1 ? "place" : "places"
			]
		}),
		results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-10 text-center text-sm text-muted-foreground",
			children: "Nothing matches. Try a broader word — beach, café, temple."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: results.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, { listing: l }, l.slug))
		})
	] });
}
//#endregion
export { Explore as component };
