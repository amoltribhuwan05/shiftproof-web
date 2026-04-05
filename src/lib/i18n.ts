export type Locale = "en" | "hi";

// ─── English ──────────────────────────────────────────────────────────────────

const en: Record<string, string> = {
  // Nav
  "nav.overview":     "Overview",
  "nav.properties":   "Properties",
  "nav.tenants":      "Tenants",
  "nav.payments":     "Payments",
  "nav.maintenance":  "Maintenance",
  "nav.reports":      "Reports",
  "nav.back":         "Back to site",
  "nav.owner_badge":  "Owner",

  // Topbar
  "topbar.title":           "Dashboard Overview",
  "topbar.date":            "Saturday, 5 April 2026",
  "topbar.search":          "Search…",
  "topbar.notif_title":     "Notifications",
  "topbar.view_all_alerts": "View all alerts",
  "topbar.export":          "Export",
  "topbar.add_property":    "Add Property",
  "topbar.7d":              "7 Days",
  "topbar.30d":             "30 Days",
  "topbar.90d":             "90 Days",
  "topbar.n_new":           "{n} new",

  // Profile
  "profile.name":       "Rajesh Kumar",
  "profile.sub":        "{n} properties · {beds} beds",

  // Greeting
  "greeting.text":      "Good morning, Rajesh 👋",
  "greeting.sub":       "Here's what's happening across your properties today.",
  "greeting.month":     "April 2026",

  // Insights
  "insights.label":              "Auto Insights",
  "insights.revenue_up":         "Revenue up {pct}%",
  "insights.revenue_down":       "Revenue down {pct}%",
  "insights.revenue_desc":       "₹{curr}k this month vs ₹{prev}k last month",
  "insights.overdue_title":      "{n} tenants overdue",
  "insights.overdue_desc":       "Sonia Mehta is 8 days overdue · Take action now",
  "insights.occ_up":             "Occupancy up {n}pp",
  "insights.occ_down":           "Occupancy down {n}pp",
  "insights.occ_desc":           "{curr}% this month vs {prev}% · {vacant} beds vacant",
  "insights.lease_title":        "1 lease expiring soon",
  "insights.lease_desc":         "Amit Patel · Royal Residency · 29 days left",
  "insights.maint_title":        "2 high-priority tickets",
  "insights.maint_desc":         "AC + plumbing unresolved · Est. cost ₹{cost}k",
  "insights.cta.reminders":      "Send Reminders",
  "insights.cta.renew":          "Renew Lease",
  "insights.cta.assign":         "Assign",

  // KPIs
  "kpi.revenue":          "Monthly Revenue",
  "kpi.occupancy":        "Occupancy Rate",
  "kpi.collection":       "Collection Rate",
  "kpi.pending":          "Pending Rent",
  "kpi.n_occupied":       "{occupied} occupied",
  "kpi.n_vacant":         "{vacant} vacant",
  "kpi.paid_month":       "{n} paid this month",
  "kpi.overdue_one":      "1 overdue",
  "kpi.pending_label":    "pending",
  "kpi.overdue_label":    "overdue",
  "kpi.n_pending":        "{n} pending",
  "kpi.vs_last":          "vs last month",

  // Chart
  "chart.title":          "Revenue Overview",
  "chart.sub":            "Monthly rent · All properties",
  "chart.prev":           "Prev month",
  "chart.current":        "Current",
  "chart.glance":         "This Month at a Glance",
  "chart.bed_occ":        "Bed Occupancy",
  "chart.collected":      "Rent Collected",
  "chart.of_due":         "of ₹{n}k due",

  // Financial
  "fin.gross":            "Gross Revenue",
  "fin.gross_sub":        "Total rent collected",
  "fin.maint":            "Maintenance Cost",
  "fin.maint_sub":        "{n} issues resolved",
  "fin.net":              "Net Revenue",
  "fin.net_sub":          "After maintenance deductions",
  "fin.per_bed":          "Revenue / Bed",
  "fin.per_bed_sub":      "Across {n} occupied beds",

  // Alerts
  "alerts.title":         "Alerts",
  "alerts.n_active":      "{n} active",
  "alerts.view_all":      "View all alerts",
  "alerts.group.all":     "All",
  "alerts.group.financial":    "Financial",
  "alerts.group.maintenance":  "Maintenance",
  "alerts.group.lease":        "Lease",

  // Properties
  "props.title":          "Property Comparison",
  "props.top":            "Top performer",
  "props.manage":         "Manage all",
  "props.rank":           "Rank",
  "props.property":       "Property",
  "props.occupancy":      "Occupancy",
  "props.revenue":        "Revenue",
  "props.rev_bed":        "Rev / Bed",
  "props.maint":          "Maint. Cost",

  // Transactions
  "tx.title":             "Rent Transactions",
  "tx.send_reminder":     "Send Reminder ({n})",
  "tx.all":               "All",
  "tx.paid":              "Paid",
  "tx.pending":           "Pending",
  "tx.overdue":           "Overdue",
  "tx.tenant":            "Tenant",
  "tx.property_room":     "Property · Room",
  "tx.amount":            "Amount",
  "tx.date":              "Date",
  "tx.overdue_col":       "Overdue",
  "tx.status":            "Status",
  "tx.n_days_overdue":    "{n}d overdue",

  // Maintenance
  "maint.title":          "Maintenance Tickets",
  "maint.n_open":         "{n} open",
  "maint.n_resolved":     "{n} resolved",
  "maint.analytics":      "Maintenance Analytics",
  "maint.total_cost":     "Total Cost (this month)",
  "maint.avg_time":       "Avg Resolution Time",
  "maint.target":         "Target: < 2 days",
  "maint.categories":     "Issues by Category",
  "maint.free":           "Free",
  "maint.resolved_badge": "Resolved",
  "maint.show_resolved":  "Show resolved ({n})",
  "maint.hide_resolved":  "Hide resolved",
  "maint.up_vs_last":     "↑ ₹{n} vs last month",

  // Tenants
  "tenants.title":        "Tenants",
  "tenants.add":          "Add Tenant",
  "tenants.tenant":       "Tenant",
  "tenants.lease_end":    "Lease End",
  "tenants.last3":        "Last 3 Months",
  "tenants.risk":         "Risk",
  "tenants.status":       "Status",
  "tenants.renew_soon":   "Renew soon",
  "tenants.show_all":     "Show all {n} tenants",
  "tenants.collapse":     "Show less",

  // Activity
  "activity.title":       "Activity",
  "activity.all":         "All",
  "activity.summary":     "Today's summary",
  "activity.summary_text":"5 payments received · 1 new issue · 1 onboarding",
  "activity.show_all":    "Show all",
  "activity.collapse":    "Show less",

  // Status / Risk
  "status.paid":          "Paid",
  "status.pending":       "Pending",
  "status.overdue":       "Overdue",
  "risk.late":            "Late Payer",
  "risk.expiring":        "Lease Expiring",
  "priority.high":        "High",
  "priority.medium":      "Medium",
  "priority.low":         "Low",

  // Alert titles + descriptions
  "alert.a1.title":  "Rent overdue > 7 days",
  "alert.a1.desc":   "Sonia Mehta · Royal Residency · ₹9,500",
  "alert.a2.title":  "2 payments pending",
  "alert.a2.desc":   "Neha Gupta + Kiran Rao · ₹18,500 total",
  "alert.a3.title":  "2 high-priority tickets",
  "alert.a3.desc":   "AC failure + Tap leak · Est. cost ₹3,000",
  "alert.a4.title":  "Avg resolution > 3 days",
  "alert.a4.desc":   "4 open tickets since last week",
  "alert.a5.title":  "Lease expiring in 29 days",
  "alert.a5.desc":   "Amit Patel · Royal Residency · Room 2A",
  "alert.a6.title":  "3 leases due within 90 days",
  "alert.a6.desc":   "Neha Gupta, Kiran Rao, Sonia Mehta",
  "alert.action.reminder": "Send Reminder",
  "alert.action.view":     "View",
  "alert.action.assign":   "Assign",
  "alert.action.review":   "Review",
  "alert.action.renew":    "Renew",
  "alert.action.plan":     "Plan",

  // Activity feed text + relative time
  "act.paid":       "{name} paid ₹{amount} for {month}",
  "act.maint_req":  "New maintenance request at {property} ({issue})",
  "act.onboarded":  "{name} onboarded at {property}",
  "act.overdue":    "{name} — rent overdue by {days} days",
  "act.repaired":   "{item} repaired at {property} (Room {room})",
  "act.lease_due":  "{name} lease renewal due in {days} days",
  "time.2h":        "2 hours ago",
  "time.5h":        "5 hours ago",
  "time.yesterday": "Yesterday",
  "time.2d":        "2 days ago",
  "time.3d":        "3 days ago",
  "time.4d":        "4 days ago",
};

// ─── Hindi ────────────────────────────────────────────────────────────────────
// Natural Hinglish — English technical terms kept where Indians use them in speech

const hi: Record<string, string> = {
  // Nav
  "nav.overview":     "Overview",
  "nav.properties":   "Properties",
  "nav.tenants":      "किरायेदार",
  "nav.payments":     "Payments",
  "nav.maintenance":  "Maintenance",
  "nav.reports":      "Reports",
  "nav.back":         "Site पर वापस जाएँ",
  "nav.owner_badge":  "Owner",

  // Topbar
  "topbar.title":           "Dashboard Overview",
  "topbar.date":            "शनिवार, 5 अप्रैल 2026",
  "topbar.search":          "खोजें…",
  "topbar.notif_title":     "Notifications",
  "topbar.view_all_alerts": "सभी Alerts देखें",
  "topbar.export":          "Export",
  "topbar.add_property":    "Property जोड़ें",
  "topbar.7d":              "7 दिन",
  "topbar.30d":             "30 दिन",
  "topbar.90d":             "90 दिन",
  "topbar.n_new":           "{n} नए",

  // Profile
  "profile.name":       "राजेश कुमार",
  "profile.sub":        "{n} Properties · {beds} Beds",

  // Greeting
  "greeting.text":      "सुप्रभात, राजेश 👋",
  "greeting.sub":       "आज आपकी Properties में क्या हो रहा है।",
  "greeting.month":     "अप्रैल 2026",

  // Insights
  "insights.label":              "Auto Insights",
  "insights.revenue_up":         "Income {pct}% बढ़ी",
  "insights.revenue_down":       "Income {pct}% घटी",
  "insights.revenue_desc":       "इस महीने ₹{curr}k vs पिछले महीने ₹{prev}k",
  "insights.overdue_title":      "{n} किरायेदारों का किराया बकाया",
  "insights.overdue_desc":       "Sonia Mehta का 8 दिन से किराया बकाया · अभी Action लें",
  "insights.occ_up":             "Occupancy {n}% बढ़ी",
  "insights.occ_down":           "Occupancy {n}% घटी",
  "insights.occ_desc":           "इस महीने {curr}% vs पिछले महीने {prev}% · {vacant} Beds खाली",
  "insights.lease_title":        "1 Lease जल्द समाप्त होगी",
  "insights.lease_desc":         "Amit Patel · Royal Residency · 29 दिन बाकी",
  "insights.maint_title":        "2 High Priority Tickets pending हैं",
  "insights.maint_desc":         "AC + Plumbing अनसुलझा · Est. Cost ₹{cost}k",
  "insights.cta.reminders":      "Reminder भेजें",
  "insights.cta.renew":          "Lease Renew करें",
  "insights.cta.assign":         "Assign करें",

  // KPIs
  "kpi.revenue":          "Monthly Income",
  "kpi.occupancy":        "Occupancy Rate",
  "kpi.collection":       "Collection Rate",
  "kpi.pending":          "बकाया किराया",
  "kpi.n_occupied":       "{occupied} Occupied",
  "kpi.n_vacant":         "{vacant} खाली",
  "kpi.paid_month":       "{n} ने इस महीने Pay किया",
  "kpi.overdue_one":      "1 Overdue",
  "kpi.pending_label":    "Pending",
  "kpi.overdue_label":    "Overdue",
  "kpi.n_pending":        "{n} Pending",
  "kpi.vs_last":          "पिछले महीने से",

  // Chart
  "chart.title":          "Income Overview",
  "chart.sub":            "Monthly Rent · सभी Properties",
  "chart.prev":           "पिछला महीना",
  "chart.current":        "इस महीना",
  "chart.glance":         "इस महीने की झलक",
  "chart.bed_occ":        "Bed Occupancy",
  "chart.collected":      "Rent Collected",
  "chart.of_due":         "₹{n}k देय में से",

  // Financial
  "fin.gross":            "Gross Income",
  "fin.gross_sub":        "कुल Rent Collected",
  "fin.maint":            "Maintenance Cost",
  "fin.maint_sub":        "{n} Issues Resolved",
  "fin.net":              "Net Income",
  "fin.net_sub":          "Maintenance काटने के बाद",
  "fin.per_bed":          "Per Bed Income",
  "fin.per_bed_sub":      "{n} Occupied Beds में से",

  // Alerts
  "alerts.title":         "Alerts",
  "alerts.n_active":      "{n} Active",
  "alerts.view_all":      "सभी Alerts देखें",
  "alerts.group.all":     "सभी",
  "alerts.group.financial":    "Financial",
  "alerts.group.maintenance":  "Maintenance",
  "alerts.group.lease":        "Lease",

  // Properties
  "props.title":          "Property Comparison",
  "props.top":            "Top Performer",
  "props.manage":         "सभी Manage करें",
  "props.rank":           "Rank",
  "props.property":       "Property",
  "props.occupancy":      "Occupancy",
  "props.revenue":        "Income",
  "props.rev_bed":        "Income/Bed",
  "props.maint":          "Maint. Cost",

  // Transactions
  "tx.title":             "Rent Transactions",
  "tx.send_reminder":     "Reminder भेजें ({n})",
  "tx.all":               "सभी",
  "tx.paid":              "Paid",
  "tx.pending":           "Pending",
  "tx.overdue":           "Overdue",
  "tx.tenant":            "किरायेदार",
  "tx.property_room":     "Property · Room",
  "tx.amount":            "Amount",
  "tx.date":              "तारीख",
  "tx.overdue_col":       "Overdue",
  "tx.status":            "Status",
  "tx.n_days_overdue":    "{n} दिन Overdue",

  // Maintenance
  "maint.title":          "Maintenance Tickets",
  "maint.n_open":         "{n} Open",
  "maint.n_resolved":     "{n} Resolved",
  "maint.analytics":      "Maintenance Analytics",
  "maint.total_cost":     "कुल लागत (इस महीने)",
  "maint.avg_time":       "Avg. Resolution Time",
  "maint.target":         "Target: < 2 दिन",
  "maint.categories":     "Category-wise Issues",
  "maint.free":           "Free",
  "maint.resolved_badge": "Resolved",
  "maint.show_resolved":  "Resolved Tickets दिखाएँ ({n})",
  "maint.hide_resolved":  "Resolved Tickets छुपाएँ",
  "maint.up_vs_last":     "↑ ₹{n} पिछले महीने से",

  // Tenants
  "tenants.title":        "किरायेदार",
  "tenants.add":          "किरायेदार जोड़ें",
  "tenants.tenant":       "किरायेदार",
  "tenants.lease_end":    "Lease End",
  "tenants.last3":        "पिछले 3 महीने",
  "tenants.risk":         "Risk",
  "tenants.status":       "Status",
  "tenants.renew_soon":   "जल्द Renew करें",
  "tenants.show_all":     "सभी {n} किरायेदार दिखाएँ",
  "tenants.collapse":     "कम दिखाएँ",

  // Activity
  "activity.title":       "Activity",
  "activity.all":         "सभी",
  "activity.summary":     "आज का Summary",
  "activity.summary_text":"5 Payments मिले · 1 नई Problem · 1 नया किरायेदार",
  "activity.show_all":    "सभी दिखाएँ",
  "activity.collapse":    "कम दिखाएँ",

  // Status / Risk
  "status.paid":          "Paid",
  "status.pending":       "Pending",
  "status.overdue":       "Overdue",
  "risk.late":            "Late Payer",
  "risk.expiring":        "Lease Expiring",
  "priority.high":        "High",
  "priority.medium":      "Medium",
  "priority.low":         "Low",

  // Alert titles + descriptions
  "alert.a1.title":  "किराया 7+ दिन से Overdue",
  "alert.a1.desc":   "Sonia Mehta · Royal Residency · ₹9,500",
  "alert.a2.title":  "2 Payments Pending हैं",
  "alert.a2.desc":   "Neha Gupta + Kiran Rao · कुल ₹18,500",
  "alert.a3.title":  "2 High Priority Tickets",
  "alert.a3.desc":   "AC खराब + Tap Leak · अनुमानित लागत ₹3,000",
  "alert.a4.title":  "Avg Resolution 3 दिन से ज़्यादा",
  "alert.a4.desc":   "पिछले हफ्ते से 4 Tickets खुले हैं",
  "alert.a5.title":  "Lease 29 दिन में समाप्त होगी",
  "alert.a5.desc":   "Amit Patel · Royal Residency · Room 2A",
  "alert.a6.title":  "90 दिनों में 3 Leases Due",
  "alert.a6.desc":   "Neha Gupta, Kiran Rao, Sonia Mehta",
  "alert.action.reminder": "Reminder भेजें",
  "alert.action.view":     "देखें",
  "alert.action.assign":   "Assign करें",
  "alert.action.review":   "Review करें",
  "alert.action.renew":    "Renew करें",
  "alert.action.plan":     "Plan करें",

  // Activity feed text + relative time
  "act.paid":       "{name} ने {month} का ₹{amount} Pay किया",
  "act.maint_req":  "{property} में नई Maintenance Request ({issue})",
  "act.onboarded":  "{name} का {property} में Onboarding हुआ",
  "act.overdue":    "{name} का {days} दिन से किराया बकाया है",
  "act.repaired":   "{property} में {item} ठीक किया (Room {room})",
  "act.lease_due":  "{name} की Lease {days} दिन में Renew होगी",
  "time.2h":        "2 घंटे पहले",
  "time.5h":        "5 घंटे पहले",
  "time.yesterday": "कल",
  "time.2d":        "2 दिन पहले",
  "time.3d":        "3 दिन पहले",
  "time.4d":        "4 दिन पहले",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function createT(locale: Locale) {
  const dict = locale === "hi" ? hi : en;
  return function t(key: string, vars?: Record<string, string | number>): string {
    let s = dict[key] ?? en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return s;
  };
}

/** Indian number formatting: 1,84,000 */
export function fmtINR(n: number, locale: Locale = "en"): string {
  const fmt = new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN");
  return `₹${fmt.format(Math.round(n))}`;
}

/** Compact: ₹184k or ₹1.8L */
export function fmtK(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Math.round(n / 1000)}k`;
}
