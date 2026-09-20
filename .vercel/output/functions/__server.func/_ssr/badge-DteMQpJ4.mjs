import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-DteMQpJ4.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "muted", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tone === "muted" && "bg-muted text-muted-foreground", tone === "primary" && "bg-primary text-primary-foreground", tone === "outline" && "border border-border text-foreground", className),
		...props
	});
}
//#endregion
export { Badge as t };
