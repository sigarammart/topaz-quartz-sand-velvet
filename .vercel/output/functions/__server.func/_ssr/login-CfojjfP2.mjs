import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { C as LockKeyhole, E as KeyRound } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as WP_APP_PASSWORD_URL, m as useHydrated, o as useSession, v as Button, w as wpLogin } from "./router-9HOMADMB.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { t as Label } from "./label-D9agDL_9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CfojjfP2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const hydrated = useHydrated();
	const user = useSession((s) => s.user);
	const lastUsername = useSession((s) => s.lastUsername);
	const setSession = useSession((s) => s.setSession);
	const setLastUsername = useSession((s) => s.setLastUsername);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (hydrated && user) navigate({ to: "/account" });
	}, [
		hydrated,
		user,
		navigate
	]);
	async function onSubmit(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const username = String(form.get("username") ?? "").trim();
		const password = String(form.get("password") ?? "");
		setPending(true);
		setError(null);
		setLastUsername(username);
		try {
			const result = await wpLogin({ data: {
				username,
				password
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setSession({
				user: result.user,
				myListings: result.myListings,
				myTrips: result.myTrips,
				method: result.method
			});
			toast.success(`Signed in as ${result.user.name}`);
			navigate({ to: "/account" });
		} catch {
			setError("Could not reach WordPress. Check the connection and try again.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
				children: "WordPress account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold",
				children: "Sign in to Xplore Pondy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Same username as xplorepondy.com. Directory browsing stays open without an account — sign in to see your listings and saved trips."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mt-8 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "username",
							children: "WordPress username"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "username",
							name: "username",
							autoComplete: "username",
							required: true,
							defaultValue: hydrated ? lastUsername : "",
							placeholder: "your-wp-username"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "password",
							children: "Application password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "password",
							name: "password",
							type: "password",
							autoComplete: "current-password",
							required: true,
							placeholder: "xxxx xxxx xxxx xxxx xxxx xxxx"
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						className: "w-full",
						size: "lg",
						disabled: pending,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, {}), pending ? "Checking WordPress…" : "Sign in"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-xl bg-card p-5 ring-1 ring-border/70",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-sm font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4 text-primary" }), "How to get an application password"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sign in to the xplorepondy.com WordPress dashboard." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Open Users → Profile, then scroll to Application Passwords." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Create one named “Xplore Pondy App” and paste it here." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: WP_APP_PASSWORD_URL,
						target: "_blank",
						rel: "noreferrer",
						className: "mt-4 inline-flex text-sm font-medium text-primary hover:underline",
						children: "Create one on xplorepondy.com"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-xs text-muted-foreground",
				children: "Credentials go only to your WordPress site to verify the account. This app does not store the password."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-center text-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-muted-foreground hover:text-foreground",
					children: "Continue without signing in"
				})
			})
		]
	});
}
//#endregion
export { LoginPage as component };
