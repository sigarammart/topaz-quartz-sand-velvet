import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TripFormWizard } from "./trip-form-wizard-CAd4SgBz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-BNNM1_G-.js
var import_jsx_runtime = require_jsx_runtime();
function PlanPage() {
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TripFormWizard, { afterSave: () => void navigate({ to: "/trip" }) });
}
//#endregion
export { PlanPage as component };
