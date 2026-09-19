import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { O as Heart } from "../_libs/lucide-react.mjs";
import { a as useTrip, f as resolveListing, m as useHydrated, p as useCatalog, v as Button } from "./router-9HOMADMB.mjs";
import { t as ListingCard } from "./listing-card-C3q5qlQX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/saved-CtcIgsat.js
var import_jsx_runtime = require_jsx_runtime();
function SavedPage() {
	const hydrated = useHydrated();
	const saved = useTrip((s) => s.saved);
	const items = useCatalog((s) => s.items);
	const listings = hydrated ? saved.map((slug) => resolveListing(slug, items)).filter((l) => l != null) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
			children: "Saved"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl font-semibold",
			children: "Your Pondy shortlist"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: "Kept on this device. Add them to a trip whenever you’re ready."
		}),
		listings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-16 flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-8 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-sm text-sm text-muted-foreground",
					children: "Nothing saved yet. Tap the heart on a place, café, or stay while you browse."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/explore",
						children: "Start exploring"
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: listings.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, { listing: l }, l.slug))
		})
	] });
}
//#endregion
export { SavedPage as component };
