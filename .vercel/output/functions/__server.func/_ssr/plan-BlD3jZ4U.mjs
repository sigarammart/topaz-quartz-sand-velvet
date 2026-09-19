import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { N as Check } from "../_libs/lucide-react.mjs";
import { a as useTrip, f as resolveListing, p as useCatalog, v as Button, y as cn } from "./router-9HOMADMB.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { t as Label } from "./label-D9agDL_9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-BlD3jZ4U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
var INTERESTS = [
	"French Quarter",
	"Beaches",
	"Auroville",
	"Food",
	"Nightlife",
	"Family",
	"Surf & dive",
	"Spiritual"
];
function PlanPage() {
	const addInquiry = useTrip((s) => s.addInquiry);
	const items = useTrip((s) => s.items);
	const tripTitle = useTrip((s) => s.title);
	const [sent, setSent] = (0, import_react.useState)(false);
	const [picked, setPicked] = (0, import_react.useState)([]);
	const catalogItems = useCatalog((s) => s.items);
	function toggle(tag) {
		setPicked((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);
	}
	function onSubmit(e) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		addInquiry({
			id: crypto.randomUUID(),
			name: String(data.get("name") ?? ""),
			email: String(data.get("email") ?? ""),
			dates: String(data.get("dates") ?? ""),
			travellers: String(data.get("travellers") ?? ""),
			interests: picked.join(", "),
			message: String(data.get("message") ?? ""),
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		setSent(true);
	}
	if (sent) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-3xl font-semibold",
				children: "We’ve got your sketch"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "Your request is saved on this device. For a booked, agent-led trip, send the same notes through xplorepondy.com — that’s where the team picks up."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "https://xplorepondy.com/trips/",
						target: "_blank",
						rel: "noreferrer",
						children: "Continue on xplorepondy.com"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/trip",
						children: "Back to itinerary"
					})
				})]
			})
		]
	});
	const fromTrip = items.map((i) => resolveListing(i.slug, catalogItems)?.name).filter(Boolean).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
				children: "Custom trip"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold",
				children: "Tell us how you want Pondy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Verified travel agents, 100% custom days, assistance around the clock. Sketch it here, then finish with the team on the website."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mt-8 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							name: "name",
							required: true,
							autoComplete: "name"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							name: "email",
							type: "email",
							required: true,
							autoComplete: "email"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "dates",
								children: "Travel dates"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "dates",
								name: "dates",
								placeholder: "e.g. 12–15 Oct",
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "travellers",
								children: "Travellers"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "travellers",
								name: "travellers",
								placeholder: "2 adults",
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-sm font-medium",
						children: "Interests"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: INTERESTS.map((tag) => {
							const on = picked.includes(tag);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => toggle(tag),
								className: on ? "h-9 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground" : "h-9 rounded-full bg-card px-3 text-sm font-medium ring-1 ring-border",
								children: tag
							}, tag);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "message",
							children: "Anything else"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "message",
							name: "message",
							placeholder: fromTrip.length ? `I’m already looking at: ${fromTrip.join(", ")}` : "Pace, budget, must-sees…"
						})]
					}),
					items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Your current sketch “",
							tripTitle,
							"” has ",
							items.length,
							" stops — mention it in the note if you want it used."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						size: "lg",
						children: "Send request"
					})
				]
			})
		]
	});
}
//#endregion
export { PlanPage as component };
