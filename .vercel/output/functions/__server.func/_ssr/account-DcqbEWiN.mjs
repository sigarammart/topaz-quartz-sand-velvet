import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as LogOut, P as ExternalLink, h as RefreshCw } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as fetchWpAuthorContent, dt as useCurrentUserState, ft as Button, it as hasGateSessionMarker, nt as useHydrated, o as useTrip, rt as RedirectToSignIn, tt as useSession, ut as signOut } from "./router-BD5yDehu.mjs";
import { n as ListingCard } from "./listing-card-CBSP8lVI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-DcqbEWiN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	const hydrated = useHydrated();
	const navigate = useNavigate();
	const { user: googleUser, isPending } = useCurrentUserState();
	const user = useSession((s) => s.user);
	const myListings = useSession((s) => s.myListings);
	const myTrips = useSession((s) => s.myTrips);
	const method = useSession((s) => s.method);
	const setSession = useSession((s) => s.setSession);
	const clearSession = useSession((s) => s.clearSession);
	const tripTitle = useTrip((s) => s.title);
	const tripStarted = useTrip((s) => s.started);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = typeof document !== "undefined" && hasGateSessionMarker();
	if (isPending || !hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-16 text-center text-sm text-muted-foreground",
		children: "Loading account…"
	});
	if (!googleUser && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const name = googleUser?.displayName ?? user?.name ?? "Traveller";
	const email = googleUser?.primaryEmail ?? user?.email;
	const avatar = googleUser?.profileImageUrl ?? user?.avatar;
	async function refresh() {
		if (!user) return;
		setRefreshing(true);
		try {
			const result = await fetchWpAuthorContent({ data: { authorId: user.id } });
			setSession({
				user,
				myListings: result.myListings,
				myTrips: result.myTrips,
				method: method ?? "application-password"
			});
			toast.success("Account updated from WordPress");
		} catch {
			toast.error("Could not refresh from WordPress");
		} finally {
			setRefreshing(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
			children: "Account"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: avatar,
					alt: "",
					className: "size-16 rounded-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground",
					children: name.slice(0, 1).toUpperCase()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-semibold",
						children: name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [googleUser ? "Signed in with Google" : `@${user?.slug}`, email ? ` · ${email}` : ""]
					}),
					user?.roles && user.roles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs uppercase tracking-wide text-primary",
						children: user.roles.join(" · ")
					})
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => void refresh(),
					disabled: refreshing,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: refreshing ? "animate-spin" : "" }), "Refresh"]
				}), !gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					disabled: signingOut,
					onClick: () => {
						setSigningOut(true);
						clearSession();
						if (googleUser) signOut().then(() => navigate({ to: "/" })).catch(() => setSigningOut(false));
						else navigate({ to: "/" });
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {}), signingOut ? "Signing out…" : "Sign out"]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 rounded-xl bg-card p-5 ring-1 ring-border/70",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: googleUser ? "Google account" : "Connected to xplorepondy.com"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: googleUser ? "Your trips and saved places stay on this device and follow this Google sign-in." : `Signed in with ${method === "application-password" ? "an application password" : "your WordPress login"}.`
				}),
				tripStarted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4",
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/trip",
						children: tripTitle || "Open current trip"
					})
				})
			]
		}),
		user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "Your listings"
			}), myListings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "No listings are attached to this WordPress user. Published directory listings still appear under Explore for everyone."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: myListings.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, { listing: l }, l.slug))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-semibold",
				children: "Your WordPress trips"
			}), myTrips.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "No trips on the website yet. Build one here, or on xplorepondy.com."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: myTrips.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: t.url,
					target: "_blank",
					rel: "noreferrer",
					className: "flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-border/70 hover:bg-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: t.title
					}), t.date && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: t.date
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 shrink-0 text-primary" })]
				}) }, t.slug))
			})]
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-10 text-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/explore",
				className: "font-medium text-primary hover:underline",
				children: "Browse the live directory"
			})
		})
	] });
}
//#endregion
export { AccountPage as component };
