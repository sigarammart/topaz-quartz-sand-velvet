import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { B as notFound, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as getGuide } from "./filters-CkhHKy69.mjs";
import { z as ArrowLeft } from "../_libs/lucide-react.mjs";
import { S as fetchWpGuide, c as catalogGuide, p as useCatalog, r as Route$1 } from "./router-9HOMADMB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guides._slug-DxNSocZt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GuidePage() {
	const { slug } = Route$1.useParams();
	const guides = useCatalog((s) => s.guides);
	const status = useCatalog((s) => s.status);
	const catalogHit = catalogGuide(slug, guides) ?? getGuide(slug);
	const [fetched, setFetched] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (catalogHit) {
			setFetched(null);
			return;
		}
		fetchWpGuide({ data: { slug } }).then((row) => {
			if (!cancelled) setFetched(row);
		});
		return () => {
			cancelled = true;
		};
	}, [slug, catalogHit]);
	const guide = catalogHit ?? fetched;
	if (!guide) {
		if (status === "loading" || status === "idle") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-16 text-center text-sm text-muted-foreground",
			children: "Loading guide…"
		});
		throw notFound();
	}
	const others = guides.filter((g) => g.slug !== slug).slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mx-auto max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/guides",
				className: "inline-flex items-center gap-1 text-sm font-medium text-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "All guides"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: guide.image,
				alt: "",
				className: "mt-4 h-56 w-full rounded-2xl object-cover sm:h-72"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-xs font-medium uppercase tracking-wide text-primary",
				children: [
					guide.topic,
					" · ",
					guide.readTime,
					" read"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl font-semibold",
				children: guide.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: guide.date
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-base text-muted-foreground",
				children: guide.excerpt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-6",
				children: guide.sections.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [s.heading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: s.heading
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 whitespace-pre-line text-base leading-relaxed text-foreground/90",
					children: s.body
				})] }, i))
			}),
			others.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12 border-t border-border pt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "Keep reading"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-3",
					children: others.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/guides/$slug",
						params: { slug: g.slug },
						className: "text-sm font-medium text-primary hover:underline",
						children: g.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							g.readTime,
							" · ",
							g.topic
						]
					})] }, g.slug))
				})]
			})
		]
	});
}
//#endregion
export { GuidePage as component };
