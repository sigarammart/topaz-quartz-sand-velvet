import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as MapPin } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-DteMQpJ4.mjs";
import { t as events } from "./events-BM4iX4Cm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events-Dm6z90VY.js
var import_jsx_runtime = require_jsx_runtime();
function EventsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
			children: "Events"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl font-semibold",
			children: "What’s happening in Pondy"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted-foreground",
			children: "Recurring rituals and the festivals that still shape the calendar — from promenade evenings to Pongal."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 space-y-4",
			children: events.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/70 sm:flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: ev.image,
					alt: "",
					className: "h-44 w-full object-cover sm:h-auto sm:w-56"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-wide text-primary",
							children: ev.dateLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-xl font-semibold",
							children: ev.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 flex items-center gap-1 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
								ev.place,
								" · ",
								ev.when
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-foreground/90",
							children: ev.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: ev.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
						})
					]
				})]
			}, ev.slug))
		})
	] });
}
//#endregion
export { EventsPage as component };
