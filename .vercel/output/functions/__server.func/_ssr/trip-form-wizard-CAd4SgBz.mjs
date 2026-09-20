import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { L as fetchWpUserTrips, _ as jetformPageComplete, b as seedFromWpTitle, c as TRIP_BUDGETS, d as TRIP_MONTHS, f as TRIP_TYPES, ft as Button, l as TRIP_INTERESTS, m as daysBetween, o as useTrip, p as buildTripTitle, s as JETFORM_PAGES, u as TRIP_LOCATIONS, x as todayISO } from "./router-BD5yDehu.mjs";
import { t as Input } from "./input-C1XZAsxU.mjs";
import { t as Label } from "./label-D9agDL_9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trip-form-wizard-CAd4SgBz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
function Choice({ type, name, value, checked, onChange, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors", checked ? "border-primary bg-accent text-foreground" : "border-border bg-card hover:bg-muted/60"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type,
			name,
			value,
			checked,
			onChange,
			className: "size-3.5 accent-primary"
		}), children]
	});
}
function TripFormWizard({ afterSave }) {
	const applyPlan = useTrip((s) => s.applyPlan);
	const current = useTrip((s) => s);
	const [step, setStep] = (0, import_react.useState)(0);
	const [fromPlace, setFromPlace] = (0, import_react.useState)(current.started ? current.fromPlace : "");
	const [locations, setLocations] = (0, import_react.useState)(current.started ? current.locations : []);
	const [budget, setBudget] = (0, import_react.useState)(current.started ? current.budget : "");
	const [datesKnown, setDatesKnown] = (0, import_react.useState)(current.datesKnown);
	const [start, setStart] = (0, import_react.useState)(current.start);
	const [end, setEnd] = (0, import_react.useState)(current.end);
	const [months, setMonths] = (0, import_react.useState)(current.months);
	const [days, setDays] = (0, import_react.useState)(current.days || 2);
	const [tripType, setTripType] = (0, import_react.useState)(current.started ? current.tripType : "");
	const [interests, setInterests] = (0, import_react.useState)(current.started ? current.interests : []);
	const [notes, setNotes] = (0, import_react.useState)(current.notes);
	const [wpTrips, setWpTrips] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		fetchWpUserTrips().then((r) => setWpTrips(r.trips)).catch(() => void 0);
	}, []);
	const canNext = jetformPageComplete(step, {
		fromPlace,
		locations,
		datesKnown,
		start,
		end,
		months,
		days,
		tripType,
		interests
	});
	const computedDays = datesKnown ? daysBetween(start, end) || days : days;
	const liveTitle = (0, import_react.useMemo)(() => buildTripTitle({
		locations,
		budget,
		tripType,
		days: computedDays,
		interests
	}), [
		locations,
		budget,
		tripType,
		computedDays,
		interests
	]);
	function toggle(list, value) {
		return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
	}
	function save() {
		applyPlan({
			fromPlace,
			locations,
			budget,
			tripType,
			datesKnown,
			start,
			end,
			months,
			days: computedDays,
			interests,
			notes,
			title: liveTitle
		});
		afterSave?.();
	}
	function openWp(trip) {
		const seed = seedFromWpTitle(trip.title);
		applyPlan({
			...seed,
			fromPlace: fromPlace || "Anna Salai, Puducherry",
			datesKnown: true,
			start,
			end,
			months: [],
			notes: "",
			wpId: trip.id,
			wpUrl: trip.url,
			code: trip.id ? String(trip.id) : void 0,
			title: trip.title
		});
		afterSave?.();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "-mx-4 rounded-[1.75rem] bg-[#dff6ea] px-3 py-6 sm:mx-0 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-center text-sm text-muted-foreground",
			children: "Custom days, listings you pick, then an itinerary — start here."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl rounded-2xl bg-card p-5 shadow-soft sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mb-6 flex items-start",
					children: JETFORM_PAGES.map((page, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("flex items-start", i < JETFORM_PAGES.length - 1 && "flex-1"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								if (i <= step) setStep(i);
							},
							className: "flex w-14 flex-col items-center sm:w-16",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold", i === step && "border-[#1aa56a] bg-card text-[#1aa56a]", i < step && "border-[#1aa56a] bg-[#1aa56a] text-white", i > step && "border-border text-muted-foreground"),
								children: i + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("mt-1 text-center text-[11px] font-medium", i === step ? "text-[#1aa56a]" : "text-muted-foreground"),
								children: page.label
							})]
						}), i < JETFORM_PAGES.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-4 h-0.5 flex-1", i < step ? "bg-[#1aa56a]" : "bg-border") })]
					}, page.key))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md bg-[#7ed9b8] px-4 py-3 text-center text-sm font-semibold text-foreground sm:text-base",
					children: JETFORM_PAGES[step].title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-6",
					children: [
						step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "user_location",
									children: ["Going from ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-destructive",
										children: "*"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "user_location",
									name: "user_location",
									value: fromPlace,
									onChange: (e) => setFromPlace(e.target.value),
									placeholder: "Enter a location"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("legend", {
								className: "mb-2 text-sm font-medium",
								children: ["Going to ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: TRIP_LOCATIONS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
									type: "checkbox",
									name: "trip_location[]",
									value: l.slug,
									checked: locations.includes(l.slug),
									onChange: () => setLocations(toggle(locations, l.slug)),
									children: l.label
								}, l.slug))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "mb-2 text-sm font-medium",
								children: "Trip budget"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: TRIP_BUDGETS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
									type: "radio",
									name: "trip_budget",
									value: b.slug,
									checked: budget === b.slug,
									onChange: () => setBudget(b.slug),
									children: b.label
								}, b.slug))
							})] })
						] }),
						step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("legend", {
							className: "mb-2 text-sm font-medium",
							children: ["Choose date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								type: "radio",
								name: "trips_dates",
								value: "dates_known",
								checked: datesKnown,
								onChange: () => setDatesKnown(true),
								children: "I know the dates"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								type: "radio",
								name: "trips_dates",
								value: "dates_unknown",
								checked: !datesKnown,
								onChange: () => {
									setDatesKnown(false);
									setStart("");
									setEnd("");
								},
								children: "I don't know the dates"
							})]
						})] }), datesKnown ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "trip_start",
									children: ["Trip start date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-destructive",
										children: "*"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "trip_start",
									type: "date",
									min: todayISO(),
									value: start,
									onChange: (e) => {
										setStart(e.target.value);
										if (end && end < e.target.value) setEnd(e.target.value);
									}
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: "trip_end",
									children: ["Trip end date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-destructive",
										children: "*"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "trip_end",
									type: "date",
									min: start || todayISO(),
									value: end,
									onChange: (e) => setEnd(e.target.value)
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("legend", {
							className: "mb-2 text-sm font-medium",
							children: ["When are you going? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: TRIP_MONTHS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								type: "checkbox",
								name: "when_are_you_going[]",
								value: m,
								checked: months.includes(m),
								onChange: () => setMonths(toggle(months, m)),
								children: m
							}, m))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "trip_days",
								children: ["No. of days ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-destructive",
									children: "*"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "trip_days",
								type: "number",
								min: 1,
								max: 7,
								value: days,
								onChange: (e) => setDays(Math.min(7, Math.max(1, Number(e.target.value) || 1)))
							})]
						})] })] }),
						step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("legend", {
							className: "mb-2 text-sm font-medium",
							children: ["Trip type ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: TRIP_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								type: "radio",
								name: "trip_type",
								value: t.slug,
								checked: tripType === t.slug,
								onChange: () => setTripType(t.slug),
								children: t.label
							}, t.slug))
						})] }),
						step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("legend", {
							className: "mb-2 text-sm font-medium",
							children: ["Share what you love to explore ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: TRIP_INTERESTS.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								type: "checkbox",
								name: "trip_interest[]",
								value: i.slug,
								checked: interests.includes(i.slug),
								onChange: () => setInterests(toggle(interests, i.slug)),
								children: i.label
							}, i.slug))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "add_infos",
								children: "Anything else"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "add_infos",
								value: notes,
								onChange: (e) => setNotes(e.target.value),
								rows: 3
							})]
						})] }),
						step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Our AI trip planner builds a route from the listings you pick next. Forget the usual traveller scramble — start from this sketch."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-xl bg-muted/70 px-4 py-3 text-sm font-medium",
									children: liveTitle
								}),
								wpTrips.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: "Latest trips on xplorepondy.com"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-2",
									children: wpTrips.slice(0, 5).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => openWp(t),
										className: "w-full rounded-lg px-3 py-2 text-left text-sm ring-1 ring-border hover:ring-primary",
										children: [t.title, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-0.5 block text-xs text-muted-foreground",
											children: [
												t.id ? `#${t.id}` : "",
												" · ",
												t.date
											]
										})]
									}) }, t.slug))
								})] })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: step === 0,
						onClick: () => setStep((s) => s - 1),
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [!canNext && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs text-muted-foreground",
							children: "Please fill all required fields"
						}), step < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "bg-foreground text-background hover:bg-foreground/90",
							disabled: !canNext,
							onClick: () => setStep((s) => s + 1),
							children: "Next"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "bg-foreground text-background hover:bg-foreground/90",
							onClick: save,
							children: "Choose listings"
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
export { TripFormWizard as t };
