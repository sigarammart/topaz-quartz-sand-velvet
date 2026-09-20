import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as listingIsOpen } from "./hours-BdXwVY0q.mjs";
import { $ as useTheme, C as useGeo } from "./router-BD5yDehu.mjs";
import { n as ListingCard } from "./listing-card-CBSP8lVI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listing-map-DoFefY9W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function listingPinNumbers(listings) {
	const map = /* @__PURE__ */ new Map();
	let n = 1;
	for (const listing of listings) if (Number.isFinite(listing.lat) && Number.isFinite(listing.lng)) map.set(listing.slug, n++);
	return map;
}
/** Browser Maps JS key — restrict by HTTP referrer in Google Cloud. */
var GOOGLE_MAPS_KEY = "AIzaSyDmg7R_HkimYT2rDsGUozY4MzSfOUTMNGk";
var loading = null;
var authFailed = false;
function googleMapsApi() {
	if (typeof window === "undefined" || authFailed) return null;
	return window.google?.maps ?? null;
}
function loadGoogleMaps() {
	if (typeof window === "undefined") return Promise.resolve(false);
	if (authFailed) return Promise.resolve(false);
	if (window.google?.maps) return Promise.resolve(true);
	if (loading) return loading;
	loading = new Promise((resolve) => {
		let settled = false;
		const finish = (ok) => {
			if (settled) return;
			settled = true;
			resolve(ok && !authFailed);
		};
		const prev = window.gm_authFailure;
		window.gm_authFailure = () => {
			authFailed = true;
			try {
				prev?.();
			} catch {}
			finish(false);
		};
		const existing = document.querySelector("script[data-xp-gmaps]");
		if (existing) {
			existing.addEventListener("load", () => finish(!!window.google?.maps));
			existing.addEventListener("error", () => finish(false));
			window.setTimeout(() => finish(!!window.google?.maps), 12e3);
			return;
		}
		const script = document.createElement("script");
		script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&v=weekly&loading=async`;
		script.async = true;
		script.defer = true;
		script.dataset.xpGmaps = "1";
		script.onload = () => finish(!!window.google?.maps);
		script.onerror = () => finish(false);
		document.head.appendChild(script);
		window.setTimeout(() => finish(!!window.google?.maps), 12e3);
	});
	return loading;
}
var GOOGLE_MAP_DARK = [
	{
		elementType: "geometry",
		stylers: [{ color: "#1b2527" }]
	},
	{
		elementType: "labels.text.stroke",
		stylers: [{ color: "#1b2527" }]
	},
	{
		elementType: "labels.text.fill",
		stylers: [{ color: "#9aa5a2" }]
	},
	{
		featureType: "administrative",
		elementType: "geometry",
		stylers: [{ visibility: "off" }]
	},
	{
		featureType: "poi",
		stylers: [{ visibility: "off" }]
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#2a383a" }]
	},
	{
		featureType: "road",
		elementType: "labels.text.fill",
		stylers: [{ color: "#8a9693" }]
	},
	{
		featureType: "transit",
		stylers: [{ visibility: "off" }]
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#0b1213" }]
	}
];
var GOOGLE_MAP_LIGHT = [
	{
		featureType: "poi",
		stylers: [{ visibility: "off" }]
	},
	{
		featureType: "transit",
		stylers: [{ visibility: "off" }]
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#c5dce0" }]
	}
];
var PONDICHERRY$1 = {
	lat: 11.934,
	lng: 79.832
};
function pinIcon(g, fill, stroke) {
	return {
		path: g.SymbolPath.CIRCLE,
		scale: 12,
		fillColor: fill,
		fillOpacity: 1,
		strokeColor: stroke,
		strokeWeight: 2
	};
}
function GoogleListingMap({ listings, selected, onSelect, className }) {
	const host = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const markers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const youMarker = (0, import_react.useRef)(null);
	const dark = useTheme((s) => s.mode) !== "light";
	const you = useGeo((s) => s.source === "gps" ? s.origin : null);
	const pinNumbers = (0, import_react.useMemo)(() => listingPinNumbers(listings), [listings]);
	const pins = (0, import_react.useMemo)(() => listings.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng)), [listings]);
	const active = pins.find((l) => l.slug === selected);
	const onSelectRef = (0, import_react.useRef)(onSelect);
	onSelectRef.current = onSelect;
	(0, import_react.useEffect)(() => {
		const el = host.current;
		const g = googleMapsApi();
		if (!el || !g) return;
		const map = new g.Map(el, {
			center: PONDICHERRY$1,
			zoom: 13,
			disableDefaultUI: true,
			gestureHandling: "greedy",
			keyboardShortcuts: false,
			clickableIcons: false,
			styles: dark ? GOOGLE_MAP_DARK : GOOGLE_MAP_LIGHT,
			backgroundColor: dark ? "#1b2527" : "#ebe4d6",
			...g.ColorScheme ? { colorScheme: dark ? g.ColorScheme.DARK : g.ColorScheme.LIGHT } : {},
			...g.RenderingType ? { renderingType: g.RenderingType.RASTER } : {}
		});
		mapRef.current = map;
		const click = () => onSelectRef.current(void 0);
		map.addListener("click", click);
		return () => {
			g.event.clearInstanceListeners(map);
			markers.current.forEach((m) => m.setMap(null));
			markers.current.clear();
			youMarker.current?.setMap(null);
			youMarker.current = null;
			mapRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const g = googleMapsApi();
		mapRef.current?.setOptions({
			styles: dark ? GOOGLE_MAP_DARK : GOOGLE_MAP_LIGHT,
			...g?.ColorScheme ? { colorScheme: dark ? g.ColorScheme.DARK : g.ColorScheme.LIGHT } : {}
		});
	}, [dark]);
	(0, import_react.useEffect)(() => {
		const g = googleMapsApi();
		const map = mapRef.current;
		if (!g || !map) return;
		const fill = dark ? "#efe8dc" : "#1c1914";
		const fillActive = dark ? "#4db8bf" : "#1a5f66";
		const stroke = dark ? "#0b1213" : "#fffbf5";
		const keep = new Set(pins.map((p) => p.slug));
		for (const [slug, marker] of markers.current) if (!keep.has(slug)) {
			marker.setMap(null);
			markers.current.delete(slug);
		}
		for (const listing of pins) {
			const n = String(pinNumbers.get(listing.slug) ?? "");
			const isActive = listing.slug === selected;
			let marker = markers.current.get(listing.slug);
			if (!marker) {
				marker = new g.Marker({
					position: {
						lat: listing.lat,
						lng: listing.lng
					},
					map,
					title: listing.name
				});
				marker.addListener("click", () => onSelectRef.current(listing.slug));
				markers.current.set(listing.slug, marker);
			} else marker.setPosition({
				lat: listing.lat,
				lng: listing.lng
			});
			marker.setIcon(pinIcon(g, isActive ? fillActive : fill, stroke));
			marker.setLabel({
				text: n,
				color: isActive ? dark ? "#0b1213" : "#f7f4ec" : dark ? "#0b1213" : "#f7f4ec",
				fontSize: "11px",
				fontWeight: "700"
			});
			marker.setZIndex(isActive ? 20 : 10);
		}
		if (you) {
			if (!youMarker.current) youMarker.current = new g.Marker({
				position: you,
				map,
				title: "You",
				zIndex: 30
			});
			else youMarker.current.setPosition(you);
			youMarker.current.setIcon({
				path: g.SymbolPath.CIRCLE,
				scale: 7,
				fillColor: fillActive,
				fillOpacity: 1,
				strokeColor: stroke,
				strokeWeight: 3
			});
			youMarker.current.setMap(map);
		} else youMarker.current?.setMap(null);
	}, [
		pins,
		pinNumbers,
		selected,
		dark,
		you?.lat,
		you?.lng
	]);
	(0, import_react.useEffect)(() => {
		const g = googleMapsApi();
		const map = mapRef.current;
		if (!g || !map) return;
		if (selected && active) {
			map.panTo({
				lat: active.lat,
				lng: active.lng
			});
			return;
		}
		if (!pins.length) {
			map.setCenter(PONDICHERRY$1);
			map.setZoom(13);
			return;
		}
		if (pins.length === 1) {
			map.setCenter({
				lat: pins[0].lat,
				lng: pins[0].lng
			});
			map.setZoom(15);
			return;
		}
		const bounds = new g.LatLngBounds();
		for (const p of pins) bounds.extend({
			lat: p.lat,
			lng: p.lng
		});
		if (you) bounds.extend(you);
		map.fitBounds(bounds, 48);
	}, [
		pins,
		selected,
		active?.slug,
		you?.lat,
		you?.lng
	]);
	function bumpZoom(delta) {
		const map = mapRef.current;
		if (!map) return;
		const z = map.getZoom() ?? 13;
		map.setZoom(Math.min(18, Math.max(10, z + delta)));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative h-[22rem] overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:h-[28rem]", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: host,
				className: "absolute inset-0"
			}),
			active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-3 bottom-8 z-30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
					listing: active,
					layout: "row",
					active: true,
					pin: pinNumbers.get(active.slug)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-3 top-3 z-40 flex flex-col overflow-hidden rounded-xl bg-card/95 shadow-soft ring-1 ring-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 items-center justify-center text-lg leading-none hover:bg-muted",
					onClick: () => bumpZoom(1),
					"aria-label": "Zoom in",
					children: "+"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 items-center justify-center text-lg leading-none hover:bg-muted",
					onClick: () => bumpZoom(-1),
					"aria-label": "Zoom out",
					children: "−"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute bottom-2 left-3 z-20 rounded-md bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground",
				children: "© Google"
			}),
			pins.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm text-muted-foreground",
				children: "No mapped listings in this set yet."
			})
		]
	});
}
var PONDICHERRY = {
	lat: 11.934,
	lng: 79.832
};
var TILE = 256;
var MIN_ZOOM = 10;
var MAX_ZOOM = 18;
function project(lat, lng, zoom) {
	const n = 2 ** zoom;
	const x = (lng + 180) / 360 * n;
	const rad = lat * Math.PI / 180;
	return {
		x,
		y: (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n
	};
}
function unproject(x, y, zoom) {
	const n = 2 ** zoom;
	const lng = x / n * 360 - 180;
	const m = Math.PI * (1 - 2 * y / n);
	return {
		lat: 180 / Math.PI * Math.atan(Math.sinh(m)),
		lng
	};
}
function clampZoom(z) {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}
function zoomAround(view, nextZoom, sx, sy, size) {
	const z = clampZoom(nextZoom);
	const center = project(view.lat, view.lng, view.zoom);
	const originX = center.x * TILE - size.w / 2;
	const originY = center.y * TILE - size.h / 2;
	const tileX = (originX + sx) / TILE;
	const tileY = (originY + sy) / TILE;
	const k = 2 ** (z - view.zoom);
	return {
		...unproject(tileX * k - (sx - size.w / 2) / TILE, tileY * k - (sy - size.h / 2) / TILE, z),
		zoom: z
	};
}
function panView(view, dx, dy) {
	const center = project(view.lat, view.lng, view.zoom);
	return {
		...view,
		...unproject(center.x - dx / TILE, center.y - dy / TILE, view.zoom)
	};
}
function pointerDistance(a, b) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}
function fit(pins, width, height) {
	if (!pins.length) return {
		...PONDICHERRY,
		zoom: 13
	};
	const lats = pins.map((p) => p.lat);
	const lngs = pins.map((p) => p.lng);
	const mid = {
		lat: (Math.min(...lats) + Math.max(...lats)) / 2,
		lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
	};
	for (let zoom = 16; zoom >= MIN_ZOOM; zoom--) {
		const a = project(Math.min(...lats), Math.min(...lngs), zoom);
		const b = project(Math.max(...lats), Math.max(...lngs), zoom);
		const w = Math.abs(b.x - a.x) * TILE;
		const h = Math.abs(b.y - a.y) * TILE;
		if (w < width - 80 && h < height - 80) return {
			...mid,
			zoom
		};
	}
	return {
		...mid,
		zoom: MIN_ZOOM
	};
}
function ListingMap(props) {
	const [engine, setEngine] = (0, import_react.useState)("pending");
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		loadGoogleMaps().then((ok) => {
			if (!cancelled) setEngine(ok ? "google" : "osm");
		});
		return () => {
			cancelled = true;
		};
	}, []);
	if (engine === "google") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleListingMap, { ...props });
	if (engine === "osm") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OsmListingMap, { ...props });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative h-[22rem] overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:h-[28rem]", props.className),
		"aria-busy": "true",
		"aria-label": "Loading map",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "absolute inset-0 flex items-center justify-center text-sm text-muted-foreground",
			children: "Loading map…"
		})
	});
}
function OsmListingMap({ listings, selected, onSelect, className }) {
	const root = (0, import_react.useRef)(null);
	const dark = useTheme((s) => s.mode) !== "light";
	const [size, setSize] = (0, import_react.useState)({
		w: 640,
		h: 420
	});
	const pinNumbers = (0, import_react.useMemo)(() => listingPinNumbers(listings), [listings]);
	const pins = (0, import_react.useMemo)(() => listings.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng)), [listings]);
	const you = useGeo((s) => s.source === "gps" ? s.origin : null);
	const fitted = (0, import_react.useMemo)(() => fit(you ? [...pins, you] : pins, size.w, size.h), [
		pins,
		size.w,
		size.h,
		you?.lat,
		you?.lng
	]);
	const [view, setView] = (0, import_react.useState)(fitted);
	const viewRef = (0, import_react.useRef)(view);
	viewRef.current = view;
	const sizeRef = (0, import_react.useRef)(size);
	sizeRef.current = size;
	const drag = (0, import_react.useRef)(null);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pinch = (0, import_react.useRef)(null);
	const userView = (0, import_react.useRef)(false);
	const prevPinCount = (0, import_react.useRef)(-1);
	const active = pins.find((l) => l.slug === selected);
	(0, import_react.useEffect)(() => {
		const el = root.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			const rect = el.getBoundingClientRect();
			setSize({
				w: Math.max(1, rect.width),
				h: Math.max(1, rect.height)
			});
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		if (size.w < 80) return;
		if (prevPinCount.current !== pins.length) {
			prevPinCount.current = pins.length;
			userView.current = false;
		}
		if (userView.current) return;
		setView(fitted);
	}, [
		fitted,
		pins.length,
		size.w
	]);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		setView((v) => {
			const p = project(active.lat, active.lng, v.zoom);
			const shifted = unproject(p.x, p.y + sizeRef.current.h * .22 / TILE, v.zoom);
			return {
				lat: shifted.lat,
				lng: shifted.lng,
				zoom: v.zoom
			};
		});
	}, [active?.slug]);
	(0, import_react.useEffect)(() => {
		const el = root.current;
		if (!el) return;
		const onWheel = (e) => {
			e.preventDefault();
			userView.current = true;
			const rect = el.getBoundingClientRect();
			const factor = e.ctrlKey || e.metaKey ? .012 : .003;
			setView((v) => zoomAround(v, v.zoom - e.deltaY * factor, e.clientX - rect.left, e.clientY - rect.top, sizeRef.current));
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, []);
	const tileZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.floor(view.zoom)));
	const tileScale = 2 ** (view.zoom - tileZoom);
	const tiles = (0, import_react.useMemo)(() => {
		const center = project(view.lat, view.lng, tileZoom);
		const originX = center.x * TILE - size.w / 2;
		const originY = center.y * TILE - size.h / 2;
		const minX = Math.floor(originX / TILE) - 1;
		const minY = Math.floor(originY / TILE) - 1;
		const maxX = Math.floor((originX + size.w) / TILE) + 1;
		const maxY = Math.floor((originY + size.h) / TILE) + 1;
		const n = 2 ** tileZoom;
		const out = [];
		for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) {
			const tx = (x % n + n) % n;
			if (y < 0 || y >= n) continue;
			out.push({
				key: `${tileZoom}-${tx}-${y}`,
				x: tx,
				y,
				left: x * TILE - originX,
				top: y * TILE - originY
			});
		}
		return {
			originX,
			originY,
			items: out
		};
	}, [
		view.lat,
		view.lng,
		tileZoom,
		size
	]);
	function bumpZoom(delta) {
		userView.current = true;
		setView((v) => zoomAround(v, v.zoom + delta, size.w / 2, size.h / 2, size));
	}
	function localPoint(e) {
		const rect = root.current?.getBoundingClientRect();
		const clientX = e.clientX ?? e.x ?? 0;
		const clientY = e.clientY ?? e.y ?? 0;
		if (!rect) return {
			x: size.w / 2,
			y: size.h / 2
		};
		return {
			x: clientX - rect.left,
			y: clientY - rect.top
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: root,
		className: cn("relative h-[22rem] touch-none overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:h-[28rem]", className),
		style: { touchAction: "none" },
		onPointerDown: (e) => {
			if (e.pointerType === "mouse") try {
				e.currentTarget.setPointerCapture(e.pointerId);
			} catch {}
			pointers.current.set(e.pointerId, {
				x: e.clientX,
				y: e.clientY
			});
			if (pointers.current.size >= 2) {
				const pts = [...pointers.current.values()];
				const dist = pointerDistance(pts[0], pts[1]);
				const a = localPoint(pts[0]);
				const b = localPoint(pts[1]);
				pinch.current = {
					dist,
					view: viewRef.current,
					x: (a.x + b.x) / 2,
					y: (a.y + b.y) / 2
				};
				drag.current = null;
				return;
			}
			drag.current = {
				x: e.clientX,
				y: e.clientY,
				moved: false
			};
		},
		onPointerMove: (e) => {
			if (!pointers.current.has(e.pointerId) && !drag.current) return;
			pointers.current.set(e.pointerId, {
				x: e.clientX,
				y: e.clientY
			});
			if (pinch.current && pointers.current.size >= 2) {
				const pts = [...pointers.current.values()];
				const dist = pointerDistance(pts[0], pts[1]);
				const a = localPoint(pts[0]);
				const b = localPoint(pts[1]);
				const mid = {
					x: (a.x + b.x) / 2,
					y: (a.y + b.y) / 2
				};
				userView.current = true;
				const zoomed = zoomAround(pinch.current.view, pinch.current.view.zoom + Math.log2(dist / pinch.current.dist), pinch.current.x, pinch.current.y, sizeRef.current);
				setView(panView(zoomed, mid.x - pinch.current.x, mid.y - pinch.current.y));
				return;
			}
			if (!drag.current) return;
			const dx = e.clientX - drag.current.x;
			const dy = e.clientY - drag.current.y;
			if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.current.moved = true;
			drag.current = {
				x: e.clientX,
				y: e.clientY,
				moved: drag.current.moved
			};
			if (drag.current.moved) userView.current = true;
			setView((v) => panView(v, dx, dy));
		},
		onPointerUp: (e) => {
			pointers.current.delete(e.pointerId);
			if (pointers.current.size < 2) pinch.current = null;
			if (pointers.current.size === 1) {
				const leftover = [...pointers.current.values()][0];
				drag.current = {
					x: leftover.x,
					y: leftover.y,
					moved: true
				};
			} else if (pointers.current.size === 0) {
				if (drag.current && !drag.current.moved) onSelect(void 0);
				drag.current = null;
			}
		},
		onPointerCancel: (e) => {
			pointers.current.delete(e.pointerId);
			pinch.current = null;
			drag.current = null;
		},
		onDoubleClick: (e) => {
			userView.current = true;
			const pt = localPoint(e);
			setView((v) => zoomAround(v, v.zoom + 1, pt.x, pt.y, size));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 origin-center",
				style: { transform: tileScale === 1 ? void 0 : `scale(${tileScale})` },
				children: tiles.items.map((tile) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					alt: "",
					draggable: false,
					src: dark ? `https://basemaps.cartocdn.com/dark_all/${tileZoom}/${tile.x}/${tile.y}.png` : `https://basemaps.cartocdn.com/rastertiles/voyager/${tileZoom}/${tile.x}/${tile.y}.png`,
					className: "pointer-events-none absolute size-[256px] max-w-none select-none outline-none",
					style: {
						left: tile.left,
						top: tile.top
					}
				}, tile.key))
			}),
			pins.map((listing) => {
				const p = project(listing.lat, listing.lng, view.zoom);
				const center = project(view.lat, view.lng, view.zoom);
				const left = p.x * TILE - (center.x * TILE - size.w / 2);
				const top = p.y * TILE - (center.y * TILE - size.h / 2);
				const isActive = selected === listing.slug;
				const open = listingIsOpen(listing);
				const n = pinNumbers.get(listing.slug) ?? 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onPointerDown: (e) => e.stopPropagation(),
					onPointerUp: (e) => e.stopPropagation(),
					onClick: (e) => {
						e.stopPropagation();
						onSelect(listing.slug);
					},
					className: cn("absolute z-10 flex size-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full text-[11px] font-semibold tabular-nums shadow-soft ring-2 transition-transform", isActive ? "z-20 scale-110 bg-primary text-primary-foreground ring-background" : "bg-card text-foreground ring-background", open === true && !isActive && "ring-primary/50", open === false && !isActive && "opacity-80"),
					style: {
						left,
						top
					},
					title: listing.name,
					"aria-label": `${n}. ${listing.name}`,
					children: n
				}, listing.slug);
			}),
			you && (() => {
				const p = project(you.lat, you.lng, view.zoom);
				const center = project(view.lat, view.lng, view.zoom);
				const left = p.x * TILE - (center.x * TILE - size.w / 2);
				const top = p.y * TILE - (center.y * TILE - size.h / 2);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute z-20 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/30",
					style: {
						left,
						top
					},
					title: "You",
					"aria-label": "Your location"
				});
			})(),
			active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-3 bottom-8 z-30",
				onPointerDown: (e) => e.stopPropagation(),
				onPointerUp: (e) => e.stopPropagation(),
				onClick: (e) => e.stopPropagation(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
					listing: active,
					layout: "row",
					active: true,
					pin: pinNumbers.get(active.slug)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-3 top-3 z-40 flex flex-col overflow-hidden rounded-xl bg-card/95 shadow-soft ring-1 ring-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 items-center justify-center text-lg leading-none hover:bg-muted disabled:opacity-40",
					disabled: view.zoom >= 17.95,
					onPointerDown: (e) => e.stopPropagation(),
					onPointerUp: (e) => e.stopPropagation(),
					onClick: (e) => {
						e.stopPropagation();
						bumpZoom(1);
					},
					"aria-label": "Zoom in",
					children: "+"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-10 items-center justify-center text-lg leading-none hover:bg-muted disabled:opacity-40",
					disabled: view.zoom <= 10.05,
					onPointerDown: (e) => e.stopPropagation(),
					onPointerUp: (e) => e.stopPropagation(),
					onClick: (e) => {
						e.stopPropagation();
						bumpZoom(-1);
					},
					"aria-label": "Zoom out",
					children: "−"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute bottom-2 left-3 z-20 rounded-md bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground",
				children: "© OpenStreetMap · CARTO"
			}),
			pins.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm text-muted-foreground",
				children: "No mapped listings in this set yet."
			})
		]
	});
}
//#endregion
export { listingPinNumbers as n, ListingMap as t };
