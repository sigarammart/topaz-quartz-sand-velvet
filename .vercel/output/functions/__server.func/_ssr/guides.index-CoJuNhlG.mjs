import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { j as useCatalog } from "./router-BD5yDehu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guides.index-CoJuNhlG.js
var import_jsx_runtime = require_jsx_runtime();
function GuidesIndex() {
	const guides = useCatalog((s) => s.guides);
	const source = useCatalog((s) => s.source);
	const status = useCatalog((s) => s.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
			children: "Travel guide"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl font-semibold",
			children: "Stories, tips, and itineraries"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 max-w-xl text-sm text-muted-foreground",
			children: ["Written to help you move through Pondicherry with a little more sense and a little less queue.", source === "live" ? ` Live from xplorepondy.com · ${guides.length} guides.` : status === "loading" ? " Refreshing from the website…" : ""]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-4 md:grid-cols-2",
			children: guides.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/guides/$slug",
				params: { slug: g.slug },
				className: "overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/70",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: g.image,
					alt: "",
					className: "h-44 w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								g.topic,
								" · ",
								g.date,
								" · ",
								g.readTime,
								" read"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-xl font-semibold",
							children: g.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 line-clamp-3 text-sm text-muted-foreground",
							children: g.excerpt
						})
					]
				})]
			}, g.slug))
		})
	] });
}
//#endregion
export { GuidesIndex as component };
