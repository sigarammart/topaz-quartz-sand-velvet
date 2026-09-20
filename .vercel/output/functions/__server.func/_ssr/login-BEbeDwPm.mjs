import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as LockKeyhole, k as KeyRound } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { M as WP_APP_PASSWORD_URL, R as wpLogin, at as GROK_PROVIDERS, dt as useCurrentUserState, ft as Button, lt as signIn, nt as useHydrated, tt as useSession } from "./router-BD5yDehu.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { t as Label } from "./label-D9agDL_9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BEbeDwPm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.65Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.47 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4-3.09Z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.63l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
			})
		]
	});
}
function LoginPage() {
	const navigate = useNavigate();
	const hydrated = useHydrated();
	const { user: googleUser, isPending } = useCurrentUserState();
	const user = useSession((s) => s.user);
	const lastUsername = useSession((s) => s.lastUsername);
	const setSession = useSession((s) => s.setSession);
	const setLastUsername = useSession((s) => s.setLastUsername);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [oauthPending, setOauthPending] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (isPending) return;
		if (googleUser || hydrated && user) navigate({ to: "/account" });
	}, [
		hydrated,
		user,
		googleUser,
		isPending,
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/xplore-pondy-logo.webp",
				alt: "Xplore Pondy",
				className: "h-12 w-auto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary",
				children: "Sign in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold",
				children: "Welcome back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Google for a quick account. WordPress if you manage listings on xplorepondy.com."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-2",
				children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: p.idp === "google" ? "outline" : "ghost",
					size: "lg",
					className: "w-full bg-card",
					disabled: oauthPending != null,
					onClick: () => {
						setOauthPending(p.providerId);
						signIn(p.providerId, { callbackURL: "/account" }).catch(() => setOauthPending(null));
					},
					children: [p.idp === "google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}) : null, oauthPending === p.providerId ? "Opening Google…" : `Continue with ${p.label}`]
				}, p.providerId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "my-8 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
					"WordPress",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "space-y-4",
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, {}), pending ? "Checking WordPress…" : "Sign in with WordPress"]
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
				children: "Google sign-in is handled securely. WordPress credentials go only to xplorepondy.com."
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
