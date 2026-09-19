import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogPortal, c as Slot, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, s as DialogTrigger, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { a as emptyFilterSearch, d as guides, h as nearbyListings, i as applySmartFilters, l as getListing, m as listings } from "./filters-CkhHKy69.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { D as House, F as CalendarDays, I as BookOpen, O as Heart, S as LogIn, _ as Menu, d as Search, i as TriangleAlert, j as Compass, r as UserRound, t as X } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wp-api-BTfliLEk.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var WP_APP_PASSWORD_URL = `https://xplorepondy.com/wp-admin/authorize-application.php?app_name=Xplore%20Pondy%20App`;
var fetchWpCatalog = createServerFn({ method: "GET" }).handler(createSsrRpc("477756e7cefca1867396576de0effcae7a736a380efcfb8eb58fa93d1e761c01"));
var fetchWpGuides = createServerFn({ method: "GET" }).handler(createSsrRpc("7cd7c0a381ad3e29843d22382f8ec260bef0c2e20f6459b0b2ea76d2e21f311e"));
var fetchWpListing = createServerFn({ method: "GET" }).validator(object({ slug: string().min(1) })).handler(createSsrRpc("0fced60923df03ce539d92ba12d50c784c29828aac2c08dfa377ae1591471838"));
var fetchWpGuide = createServerFn({ method: "GET" }).validator(object({ slug: string().min(1) })).handler(createSsrRpc("14e3126b610d9cd06fefe159d2efea7c4a8a8152dbc68fe01b7e9d7ef5a0fc71"));
var fetchWpAuthorContent = createServerFn({ method: "GET" }).validator(object({ authorId: number().int().positive() })).handler(createSsrRpc("7880f9b0675c46cd49fd6551949874d67562bc93ea6c8710abce27093b381ccc"));
var wpLogin = createServerFn({ method: "POST" }).validator(object({
	username: string().min(1),
	password: string().min(1)
})).handler(createSsrRpc("0acc350b17cb5a34bd70f601d25cdcc328d7c46c2765720cfab6bb6d97f9239e"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/utils-C_uf36nf.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-9HOMADMB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline: "border border-border bg-card text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-6",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary",
				children: "404"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl font-semibold",
				children: "That page isn’t on the map"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm text-muted-foreground",
				children: "The street may have been renamed. Try Explore, or go back to the promenade."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Back home"
				})
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function Logo({ className, mark = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-baseline gap-1.5 font-display tracking-tight", className),
		children: [mark && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "relative top-0.5 inline-flex size-6 items-center justify-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground",
			children: "XP"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-lg font-semibold text-foreground",
			children: ["Xplore ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-primary",
				children: "Pondy"
			})]
		})]
	});
}
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
function SheetContent({ className, children, side = "bottom", title, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-overlay/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex flex-col bg-card text-card-fg shadow-soft outline-none", side === "bottom" && "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t border-border p-5 pb-8", side === "right" && "inset-y-0 right-0 h-full w-[min(100%,22rem)] border-l border-border p-5", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display text-lg font-semibold tracking-tight",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
				className: "flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Close"
				})]
			})]
		}), children]
	})] });
}
function useHydrated() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setHydrated(true), []);
	return hydrated;
}
var loadStarted = 0;
var useCatalog = create((set, get) => ({
	items: listings,
	guides,
	source: "local",
	status: "idle",
	total: listings.length,
	error: null,
	ensure: async () => {
		const current = get();
		if (current.status === "loading" && Date.now() - loadStarted < 32e3) return;
		if (current.source === "live" && current.items.some((item) => typeof item.openNow === "boolean" || item.lat != null)) return;
		loadStarted = Date.now();
		set({ status: "loading" });
		const timeout = new Promise((_, reject) => {
			setTimeout(() => reject(/* @__PURE__ */ new Error("catalog-timeout")), 28e3);
		});
		try {
			const [result, guideResult] = await Promise.race([Promise.all([fetchWpCatalog(), fetchWpGuides().catch(() => ({ guides }))]), timeout]);
			set({
				items: result.listings,
				guides: guideResult.guides.length ? guideResult.guides : guides,
				source: "live",
				status: "ready",
				total: result.total,
				error: null
			});
		} catch {
			set({
				items: listings,
				guides,
				source: "local",
				status: "offline",
				error: "Could not reach xplorepondy.com. Showing the curated set."
			});
		}
	}
}));
function resolveListing(slug, items) {
	return items.find((l) => l.slug === slug) || items.find((l) => l.siteUrl.includes(`/${slug}/`)) || getListing(slug);
}
function catalogListing(slug, items) {
	return resolveListing(slug, items);
}
function catalogSearch(items, query, category, filters = {}) {
	const q = query.trim().toLowerCase();
	const scoped = items.filter((l) => {
		if (category !== "all" && l.category !== category) return false;
		if (!q) return true;
		return [
			l.name,
			l.kind,
			l.location,
			l.area,
			l.description,
			l.address ?? "",
			l.phone ?? "",
			...l.tags ?? [],
			...l.bestFor ?? [],
			...l.cafeTypes ?? [],
			...(l.taxonomies ?? []).flatMap((g) => [g.label, ...g.terms.map((t) => t.name)]),
			...(l.metaFacets ?? []).flatMap((g) => [g.label, ...g.terms.map((t) => t.name)]),
			...(l.metaGroups ?? []).flatMap((g) => [g.title, ...g.items.map((i) => i.label)])
		].join(" ").toLowerCase().includes(q);
	});
	return applySmartFilters(scoped, filters);
}
function catalogFeatured(items) {
	const marked = items.filter((l) => l.featured);
	if (marked.length >= 6) return marked.slice(0, 6);
	return [...marked, ...items.filter((l) => !l.featured)].slice(0, 6);
}
function catalogNearby(slug, items) {
	const current = catalogListing(slug, items);
	if (!current) return nearbyListings(slug);
	return items.filter((l) => l.slug !== slug && (l.area === current.area || l.category === current.category)).slice(0, 3);
}
function catalogGuide(slug, guides) {
	return guides.find((g) => g.slug === slug);
}
var useSession = create()(persist((set) => ({
	user: null,
	myListings: [],
	myTrips: [],
	method: null,
	lastUsername: "",
	setSession: ({ user, myListings, myTrips, method }) => set({
		user,
		myListings,
		myTrips,
		method,
		lastUsername: user.slug || user.name
	}),
	setLastUsername: (lastUsername) => set({ lastUsername }),
	clearSession: () => set({
		user: null,
		myListings: [],
		myTrips: [],
		method: null
	})
}), {
	name: "xplore-pondy-wp",
	partialize: (s) => ({
		user: s.user,
		myListings: s.myListings,
		myTrips: s.myTrips,
		method: s.method,
		lastUsername: s.lastUsername
	}),
	merge: (persisted, current) => {
		const p = persisted ?? {};
		return {
			...current,
			...p,
			myListings: p.myListings ?? [],
			myTrips: p.myTrips ?? [],
			lastUsername: p.lastUsername ?? ""
		};
	}
}));
var useTrip = create()(persist((set, get) => ({
	days: 3,
	title: "My Pondy trip",
	items: [],
	saved: [],
	inquiries: [],
	setDays: (n) => set((s) => ({
		days: Math.min(7, Math.max(1, n)),
		items: s.items.filter((i) => i.day <= Math.min(7, Math.max(1, n)))
	})),
	setTitle: (title) => set({ title }),
	addToDay: (slug, day) => set((s) => {
		if (s.items.some((i) => i.slug === slug && i.day === day)) return s;
		return { items: [...s.items, {
			slug,
			day
		}] };
	}),
	removeItem: (slug, day) => set((s) => ({ items: s.items.filter((i) => !(i.slug === slug && i.day === day)) })),
	moveItem: (slug, from, to) => set((s) => ({ items: s.items.map((i) => i.slug === slug && i.day === from ? {
		...i,
		day: to
	} : i) })),
	clearTrip: () => set({
		items: [],
		title: "My Pondy trip"
	}),
	loadTemplate: (title, days, items) => set({
		title,
		days,
		items
	}),
	toggleSaved: (slug) => set((s) => ({ saved: s.saved.includes(slug) ? s.saved.filter((x) => x !== slug) : [...s.saved, slug] })),
	isSaved: (slug) => get().saved.includes(slug),
	addInquiry: (inquiry) => set((s) => ({ inquiries: [inquiry, ...s.inquiries] }))
}), { name: "xplore-pondy-trip" }));
var NAV = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/explore",
		label: "Explore",
		icon: Compass
	},
	{
		to: "/guides",
		label: "Guides",
		icon: BookOpen
	},
	{
		to: "/trip",
		label: "Trip",
		icon: CalendarDays
	},
	{
		to: "/saved",
		label: "Saved",
		icon: Heart
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const hydrated = useHydrated();
	const savedCount = useTrip((s) => s.saved.length);
	const tripCount = useTrip((s) => s.items.length);
	const [open, setOpen] = (0, import_react.useState)(false);
	const savedBadge = hydrated ? savedCount : 0;
	const tripBadge = hydrated ? tripCount : 0;
	const user = useSession((s) => s.user);
	const ensureCatalog = useCatalog((s) => s.ensure);
	(0, import_react.useEffect)(() => {
		ensureCatalog();
	}, [ensureCatalog]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-14 max-w-6xl items-center gap-3 px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "ml-6 hidden items-center gap-1 md:flex",
							children: [NAV.map((item) => {
								const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: item.to,
									className: cn("rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", active && "bg-muted text-foreground"),
									children: item.label
								}, item.to);
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/events",
								className: cn("rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground", pathname.startsWith("/events") && "bg-muted text-foreground"),
								children: "Events"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									asChild: true,
									className: "md:hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/explore",
										"aria-label": "Search",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									asChild: true,
									className: "hidden md:inline-flex",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/plan",
										children: "Plan a trip"
									})
								}),
								hydrated && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/account",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: user.name.split(" ")[0]
										})]
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/login",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: "Sign in"
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
									open,
									onOpenChange: setOpen,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "md:hidden",
											"aria-label": "Menu",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
										side: "right",
										title: "Menu",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
											className: "flex flex-col gap-1",
											children: [[
												...NAV,
												{
													to: "/events",
													label: "Events",
													icon: CalendarDays
												},
												{
													to: "/plan",
													label: "Custom trip",
													icon: Compass
												},
												{
													to: user ? "/account" : "/login",
													label: user ? "Account" : "Sign in",
													icon: user ? UserRound : LogIn
												}
											].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: item.to,
												onClick: () => setOpen(false),
												className: "flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4 text-primary" }), item.label]
											}, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "https://xplorepondy.com",
												target: "_blank",
												rel: "noreferrer",
												className: "mt-4 flex h-12 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground",
												children: "Open xplorepondy.com"
											})]
										})
									})]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-12",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "hidden border-t border-border bg-card md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Companion to xplorepondy.com · Pondicherry travel planner" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://xplorepondy.com",
							className: "text-primary hover:underline",
							children: "Visit the website"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-5",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
						const count = item.to === "/saved" ? savedBadge : item.to === "/trip" ? tripBadge : 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground", active && "text-primary"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" }),
								item.label,
								count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute right-[18%] top-1.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-primary-foreground tabular-nums",
									children: count
								})
							]
						}) }, item.to);
					})
				})
			})
		]
	});
}
var styles_default = "/assets/styles-CnT68_sM.css";
var APP_NAME = "Xplore Pondy";
var Route$12 = createRootRoute({
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Explore Pondicherry like never before. Places, cafés, stays, events, and a trip planner — companion to xplorepondy.com."
			},
			{
				name: "theme-color",
				content: "#1A5F66"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				toastOptions: { className: "font-sans" }
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$11 = () => import("./routes-BFWXb2YC.mjs");
var Route$11 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./account-CHdvbmfh.mjs");
var Route$10 = createFileRoute("/account")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./events-Dm6z90VY.mjs");
var Route$9 = createFileRoute("/events")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./explore-CCiJugqp.mjs");
function parseView(value) {
	if (value === "list" || value === "grid" || value === "map") return value;
}
var Route$8 = createFileRoute("/explore")({
	validateSearch: (search) => {
		const next = {
			q: typeof search.q === "string" ? search.q : "",
			cat: typeof search.cat === "string" ? search.cat : "all",
			view: parseView(search.view)
		};
		for (const key of Object.keys(emptyFilterSearch())) if (typeof search[key] === "string" && search[key]) next[key] = search[key];
		return next;
	},
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./guides-CYAVPB4K.mjs");
var Route$7 = createFileRoute("/guides")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./login-CfojjfP2.mjs");
var Route$6 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./plan-BlD3jZ4U.mjs");
var Route$5 = createFileRoute("/plan")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./saved-CtcIgsat.mjs");
var Route$4 = createFileRoute("/saved")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./trip-BCxHQlmq.mjs");
var Route$3 = createFileRoute("/trip")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./guides.index-CGv7ymWk.mjs");
var Route$2 = createFileRoute("/guides/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./guides._slug-DxNSocZt.mjs");
var Route$1 = createFileRoute("/guides/$slug")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./place._slug-DPyYO_Fh.mjs");
var Route = createFileRoute("/place/$slug")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$11.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$12
});
var AccountRoute = Route$10.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => Route$12
});
var EventsRoute = Route$9.update({
	id: "/events",
	path: "/events",
	getParentRoute: () => Route$12
});
var ExploreRoute = Route$8.update({
	id: "/explore",
	path: "/explore",
	getParentRoute: () => Route$12
});
var GuidesRoute = Route$7.update({
	id: "/guides",
	path: "/guides",
	getParentRoute: () => Route$12
});
var LoginRoute = Route$6.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$12
});
var PlanRoute = Route$5.update({
	id: "/plan",
	path: "/plan",
	getParentRoute: () => Route$12
});
var SavedRoute = Route$4.update({
	id: "/saved",
	path: "/saved",
	getParentRoute: () => Route$12
});
var TripRoute = Route$3.update({
	id: "/trip",
	path: "/trip",
	getParentRoute: () => Route$12
});
var GuidesIndexRoute = Route$2.update({
	id: "/",
	path: "/",
	getParentRoute: () => GuidesRoute
});
var GuidesSlugRoute = Route$1.update({
	id: "/$slug",
	path: "/$slug",
	getParentRoute: () => GuidesRoute
});
var PlaceSlugRoute = Route.update({
	id: "/place/$slug",
	path: "/place/$slug",
	getParentRoute: () => Route$12
});
var GuidesRouteChildren = {
	GuidesSlugRoute,
	GuidesIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AccountRoute,
	EventsRoute,
	ExploreRoute,
	GuidesRoute: GuidesRoute._addFileChildren(GuidesRouteChildren),
	LoginRoute,
	PlanRoute,
	SavedRoute,
	TripRoute,
	PlaceSlugRoute
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultNotFoundComponent: NotFound
	});
}
//#endregion
export { fetchWpListing as C, fetchWpGuide as S, SheetTrigger as _, useTrip as a, WP_APP_PASSWORD_URL as b, catalogGuide as c, catalogSearch as d, resolveListing as f, SheetContent as g, Sheet as h, Route$8 as i, catalogListing as l, useHydrated as m, Route as n, useSession as o, useCatalog as p, Route$1 as r, catalogFeatured as s, router_exports as t, catalogNearby as u, Button as v, wpLogin as w, fetchWpAuthorContent as x, cn as y };
