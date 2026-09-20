import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as Compass, f as Smartphone, n as WifiOff, x as MapPinned } from "../_libs/lucide-react.mjs";
import { et as AndroidInstallGuide, ft as Button } from "./router-BD5yDehu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/get-app-Bndo8BZV.js
var import_jsx_runtime = require_jsx_runtime();
function GetAppPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
				children: "Android app"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold",
				children: "Xplore Pondy on your phone"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Same listings, trip form, and map — installed like an app from Chrome. No Play Store wait."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 overflow-hidden rounded-2xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/images/promenade.jpg",
					alt: "",
					className: "h-40 w-full object-cover"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AndroidInstallGuide, { className: "mt-6" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-8 space-y-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "mt-0.5 size-4 text-primary" }), "Opens full-screen from the home screen"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPinned, { className: "mt-0.5 size-4 text-primary" }), "Near-me distance, map pins, and your trip days stay on the device"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "mt-0.5 size-4 text-primary" }), "Saved places and the itinerary work even if the signal drops"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "mt-0.5 size-4 text-primary" }), "Live catalog still syncs from xplorepondy.com"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				className: "mt-8 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Back to explore"
				})
			})
		]
	});
}
//#endregion
export { GetAppPage as component };
