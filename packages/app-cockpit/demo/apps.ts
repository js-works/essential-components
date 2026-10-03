import type { AppCockpit } from '../src';

export { FEW, GROUPS, MANY, SOME };

// The apps of the demo: all are the same element (`demo-app`), told apart by their attributes.
const app = (title: string, description: string, group?: string): AppCockpit.MiniApp => {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    id,
    title,
    description,
    ...(group === undefined ? {} : { group }),
    element: 'demo-app',
    attributes: { 'app-title': title, description },
  };
};

const ICONS = {
  calendar:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
  mail:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
  folder:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/></svg>',
};

// Few apps: no groups, every app with an icon.
const FEW: readonly AppCockpit.MiniApp[] = [
  { ...app('Calendar', 'Meetings, rooms and holidays'), icon: ICONS.calendar },
  { ...app('Mail', 'The shared mailboxes of the office'), icon: ICONS.mail },
  { ...app('Documents', 'Contracts, templates and letters'), icon: ICONS.folder },
];

// The groups of the 100 apps, each with its subgroups (the second level of the tree).
const AREAS: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> = {
  Finance: {
    Accounting: ['General Ledger', 'Accounts Payable', 'Accounts Receivable', 'Bank Reconciliation', 'Asset Register'],
    Controlling: ['Budget Planner', 'Cost Centers', 'Forecasts', 'Cash Flow'],
    Payments: ['Invoices', 'Payment Runs', 'Payment Approvals', 'Dunning', 'Credit Limits'],
    Reporting: ['Financial Statements', 'VAT Reports', 'Tax Returns', 'Expense Reports'],
  },
  'Human Resources': {
    People: ['Employees', 'Org Chart', 'Job Descriptions', 'Skills Matrix'],
    Lifecycle: ['Recruiting', 'Onboarding', 'Appraisals', 'Offboarding'],
    'Pay and benefits': ['Payroll', 'Benefits', 'Company Cars', 'Certificates'],
    Time: ['Absences', 'Time Tracking', 'Trainings', 'Travel Requests'],
  },
  Sales: {
    Pipeline: ['Leads', 'Opportunities', 'Quotes', 'Sales Forecast'],
    Orders: ['Orders', 'Returns', 'Contracts', 'Price Lists', 'Discounts'],
    Customers: ['Customers', 'Territories', 'Visit Planner', 'Partner Portal'],
    Analysis: ['Sales Reports', 'Commissions', 'Campaign Results', 'Product Catalog'],
  },
  Marketing: {
    Campaigns: ['Campaigns', 'Newsletter', 'Landing Pages', 'Ad Budgets'],
    Content: ['Content Calendar', 'Brand Assets', 'Media Library', 'Press Releases'],
    Events: ['Events', 'Trade Fairs', 'Sponsoring', 'Social Media'],
    Insights: ['Web Analytics', 'SEO Monitor', 'Surveys', 'Customer Insights'],
  },
  Purchasing: {
    Suppliers: ['Suppliers', 'Supplier Ratings', 'Supplier Portal', 'Supplier Audits'],
    Buying: ['Purchase Requests', 'Purchase Orders', 'Catalog Shopping', 'Approvals'],
    Sourcing: ['Tenders', 'Price Comparison', 'Framework Contracts', 'Samples'],
    Receiving: ['Goods Receipt', 'Delivery Dates', 'Claims', 'Import Duties'],
  },
  Logistics: {
    Warehouse: ['Warehouse', 'Stock Levels', 'Inventory Count', 'Transfers'],
    Shipping: ['Shipments', 'Carriers', 'Delivery Notes', 'Customs'],
    Operations: ['Picking Lists', 'Packaging', 'Dock Scheduling', 'Hazardous Goods'],
    Tracking: ['Batch Tracking', 'Serial Numbers', 'Fleet', 'Routes'],
  },
  Production: {
    Planning: ['Work Orders', 'Capacity Planning', 'Shift Planner', 'Line Balancing'],
    Engineering: ['Bills of Materials', 'Routings', 'Tooling', 'Changeovers'],
    'Shop floor': ['Shop Floor', 'Machine Status', 'Energy Monitor', 'Production Reports'],
    Maintenance: ['Maintenance', 'Spare Parts', 'Quality Checks', 'Scrap Reports'],
  },
  Quality: {
    Audits: ['Audits', 'Customer Audits', 'Certifications', 'Risk Assessments'],
    Issues: ['Complaints', 'Corrective Actions', 'Deviations', 'Lessons Learned'],
    Testing: ['Inspection Plans', 'Test Reports', 'Measuring Devices', 'Calibration'],
    System: ['Quality Manual', 'Process Maps', 'Key Figures', 'Document Control', 'Management Review'],
  },
  'IT Services': {
    Support: ['Service Desk', 'Incidents', 'Knowledge Base', 'Status Page', 'Remote Help'],
    Assets: ['Asset Inventory', 'Licenses', 'Mobile Devices', 'Printers'],
    Access: ['User Accounts', 'Access Rights', 'Phone Directory', 'Security Alerts'],
    Operations: ['Change Requests', 'Releases', 'Backups', 'Network Monitor'],
  },
  Legal: {
    Contracts: ['Contract Repository', 'NDAs', 'Signatures', 'Deadlines', 'Document Templates'],
    Corporate: ['Board Resolutions', 'Shareholdings', 'Power of Attorney', 'Insurance Policies'],
    'IP and disputes': ['Trademarks', 'Patents', 'Litigation', 'Legal Requests'],
    Compliance: ['Data Protection', 'Compliance Cases', 'Policies', 'Whistleblowing'],
  },
  Facilities: {
    Workplace: ['Room Booking', 'Desk Sharing', 'Visitors', 'Parking'],
    Services: ['Cleaning', 'Canteen Menu', 'Office Supplies', 'Mailroom', 'Shared Mailboxes'],
    Building: ['Repairs', 'Keys', 'Moves', 'Floor Plans'],
    Safety: ['Safety Inspections', 'Fire Drills', 'Energy Usage', 'Waste'],
  },
  Management: {
    Steering: ['Dashboard', 'KPIs', 'Targets', 'Strategy Map'],
    Governance: ['Board Meetings', 'Risk Register', 'Annual Report', 'Investor Relations'],
    Change: ['Projects', 'Portfolio', 'Org Development', 'Sustainability'],
    Communication: ['Announcements', 'Intranet News', 'Town Halls', 'Employee Feedback', 'Calendar'],
  },
};

const DESCRIPTIONS = [
  'Overview, search and reports',
  'Create, check and approve',
  'Everything in one list',
  'Plan, track and export',
  'Shared by the whole team',
];

// 100 apps in twelve groups, each with subgroups (the second level); every app has a group (no "Other"). Taken from
// the lists above evenly: the first apps of every subgroup, one round after the other, until there are 100 (so every
// subgroup keeps some); in the order of the lists.
// No app icons: nobody has useful icons for 100 apps (the groups and subgroups have some).
const ALL: readonly AppCockpit.MiniApp[] = Object.entries(AREAS).flatMap(([group, subgroups]) =>
  Object.entries(subgroups).flatMap(([subgroup, titles]) =>
    titles.map((title, index) => ({ ...app(title, DESCRIPTIONS[index % DESCRIPTIONS.length] ?? '', group), subgroup }))
  )
);

const MANY: readonly AppCockpit.MiniApp[] = (() => {
  const bySubgroup = new Map<string, AppCockpit.MiniApp[]>();

  for (const entry of ALL) {
    const key = `${entry.group}/${entry.subgroup}`;

    bySubgroup.set(key, [...(bySubgroup.get(key) ?? []), entry]);
  }

  const lists = [...bySubgroup.values()];
  const chosen = new Set<AppCockpit.MiniApp>();

  for (let round = 0; chosen.size < 100 && lists.some((list) => list.length > round); round++) {
    for (const list of lists) {
      const entry = list[round];

      if (entry !== undefined && chosen.size < 100) {
        chosen.add(entry);
      }
    }
  }

  return ALL.filter((entry) => chosen.has(entry));
})();

// 30 apps: the most that still have all their groups open by default.
const SOME: readonly AppCockpit.MiniApp[] = MANY.slice(0, 30);

// The icons of the groups of the 100 apps and of their subgroups (after Tabler icons, MIT).
const svg = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const GROUP_ICONS: Readonly<Record<string, string>> = {
  'Finance': svg(
    '<circle cx="12" cy="12" r="9"/><path d="M14.8 9a2 2 0 0 0-1.8-1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1-1.8-1M12 7v10"/>',
  ),
  'Human Resources': svg(
    '<circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"/>',
  ),
  'Sales': svg('<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>'),
  'Marketing': svg(
    '<path d="M18 8a3 3 0 0 1 0 6"/><path d="M10 8v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-5"/><path d="M12 8h0l4.524-3.77A.9.9 0 0 1 18 4.922v12.156a.9.9 0 0 1-1.476.692L12 14H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h8"/>',
  ),
  'Purchasing': svg(
    '<circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><path d="M17 17H6V3H4M6 5l14 1-1 7H6"/>',
  ),
  'Logistics': svg(
    '<circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6M13 6h5l3 5v6h-2M13 11h8"/>',
  ),
  'Production': svg('<path d="M3 21h18M5 21V9l5 3V9l5 3V4h4v17M9 17h1M14 17h1"/>'),
  'Quality': svg(
    '<path d="M5 7.2A2.2 2.2 0 0 1 7.2 5h1a2.2 2.2 0 0 0 1.55-.64l.7-.7a2.2 2.2 0 0 1 3.12 0l.7.7c.41.41.97.64 1.55.64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58.23 1.14.64 1.55l.7.7a2.2 2.2 0 0 1 0 3.12l-.7.7a2.2 2.2 0 0 0-.64 1.55v1a2.2 2.2 0 0 1-2.2 2.2h-1a2.2 2.2 0 0 0-1.55.64l-.7.7a2.2 2.2 0 0 1-3.12 0l-.7-.7a2.2 2.2 0 0 0-1.55-.64h-1a2.2 2.2 0 0 1-2.2-2.2v-1a2.2 2.2 0 0 0-.64-1.55l-.7-.7a2.2 2.2 0 0 1 0-3.12l.7-.7A2.2 2.2 0 0 0 5 8.2v-1"/><path d="m9 12 2 2 4-4"/>',
  ),
  'IT Services': svg('<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M7 20h10M9 16v4M15 16v4"/>'),
  'Legal': svg('<path d="M7 20h10M6 6l6-1 6 1M12 3v17M9 12 6 6l-3 6a3 3 0 0 0 6 0M21 12l-3-6-3 6a3 3 0 0 0 6 0"/>'),
  'Facilities': svg('<path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>'),
  'Management': svg('<path d="M3 4h18M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4M12 16v4M9 20h6M8 12l3-3 2 2 3-3"/>'),
};

// The icons of the subgroups, by name (a name may be in several groups, e.g. "Operations").
const SUBGROUP_ICONS: Readonly<Record<string, string>> = {
  Accounting: svg(
    '<path d="M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6v13M12 6v13M21 6v13"/>',
  ),
  Controlling: svg(
    '<path d="M10 3.2A9 9 0 1 0 20.8 14a1 1 0 0 0-1-1H13a2 2 0 0 1-2-2V4a.9.9 0 0 0-1-.8"/><path d="M15 3.5A9 9 0 0 1 20.5 9H16a1 1 0 0 1-1-1z"/>',
  ),
  Payments: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h.01M11 15h2"/>'),
  Reporting: svg(
    '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM9 17v-4M12 17v-2M15 17v-6"/>',
  ),
  People: svg(
    '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17a4 4 0 0 1 8 0"/>',
  ),
  Lifecycle: svg('<path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"/>'),
  'Pay and benefits': svg(
    '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C9 3 11 5 12 8c1-3 3-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  ),
  Time: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
  Pipeline: svg('<path d="M4 4h16v2.2a2 2 0 0 1-.6 1.4L15 12v7l-6 2v-8.5L4.5 7.5A2 2 0 0 1 4 6.2z"/>'),
  Orders: svg('<path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2M9 7h6M9 11h6M13 15h2"/>'),
  Customers: svg('<path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6"/>'),
  Analysis: svg('<path d="M3 20h18M7 16v-6M12 16V5M17 16V8"/>'),
  Campaigns: svg('<circle cx="12" cy="12" r="1"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="9"/>'),
  Content: svg('<path d="M4 20h4L18.5 9.5a2.8 2.8 0 0 0-4-4L4 16v4M13.5 6.5l4 4"/>'),
  Events: svg('<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16M8 15h2v2H8z"/>'),
  Insights: svg(
    '<path d="M3 12h1M12 3v1M20 12h1M5.6 5.6l.7.7M18.4 5.6l-.7.7M9 16a5 5 0 1 1 6 0 3.5 3.5 0 0 0-1 3 2 2 0 0 1-4 0 3.5 3.5 0 0 0-1-3M9.7 17h4.6"/>',
  ),
  Suppliers: svg(
    '<path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>',
  ),
  Buying: svg(
    '<path d="M6.3 9h11.4a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 16.4 21H7.6a2 2 0 0 1-2-1.7l-1.3-8A2 2 0 0 1 6.3 9zM9 11V6a3 3 0 0 1 6 0v5"/>',
  ),
  Sourcing: svg('<circle cx="10" cy="10" r="7"/><path d="m21 21-6-6"/>'),
  Receiving: svg('<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5M16 5.25l-8 4.5"/>'),
  Warehouse: svg('<path d="M3 21V8l9-4 9 4v13M7 21v-8h10v8M7 17h10"/>'),
  Shipping: svg('<path d="M10 14 21 3M21 3l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1z"/>'),
  Operations: svg(
    '<circle cx="12" cy="12" r="3"/><path d="M10.3 4.3c.4-1.8 3-1.8 3.4 0a1.7 1.7 0 0 0 2.6 1.1c1.5-.9 3.3.8 2.4 2.4a1.7 1.7 0 0 0 1 2.5c1.8.4 1.8 3 0 3.4a1.7 1.7 0 0 0-1 2.6c.9 1.5-.9 3.3-2.4 2.4a1.7 1.7 0 0 0-2.6 1c-.4 1.8-3 1.8-3.4 0a1.7 1.7 0 0 0-2.5-1c-1.6.9-3.3-.9-2.4-2.4a1.7 1.7 0 0 0-1.1-2.6c-1.8-.4-1.8-3 0-3.4a1.7 1.7 0 0 0 1.1-2.5c-.9-1.6.8-3.3 2.4-2.4 1 .6 2.3.1 2.5-1.1z"/>',
  ),
  Tracking: svg(
    '<circle cx="12" cy="11" r="3"/><path d="M17.7 16.7 13.4 21a2 2 0 0 1-2.8 0l-4.3-4.3a8 8 0 1 1 11.4 0z"/>',
  ),
  Planning: svg('<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>'),
  Engineering: svg('<path d="M7 10h3V7L6.5 3.5a6 6 0 0 1 8 8l6 6a2.1 2.1 0 0 1-3 3l-6-6a6 6 0 0 1-8-8z"/>'),
  'Shop floor': svg('<circle cx="12" cy="13" r="8"/><path d="M12 13l3-3M8 13a4 4 0 0 1 4-4"/>'),
  Maintenance: svg('<path d="m11.4 12.6-7 7a1.4 1.4 0 0 1-2-2l7-7M15 15.5 8.5 9 13 4.5l6.5 6.5z"/>'),
  Audits: svg(
    '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="m9 14 2 2 4-4"/>',
  ),
  Issues: svg(
    '<path d="M12 9v4M12 16h.01M10.4 3.9 2.3 18a1.9 1.9 0 0 0 1.6 2.8h16.2a1.9 1.9 0 0 0 1.6-2.8L13.6 3.9a1.9 1.9 0 0 0-3.2 0z"/>',
  ),
  Testing: svg('<path d="M9 3h6M10 9h4M10 3v6l-4.5 8.5A2.4 2.4 0 0 0 7.7 21h8.6a2.4 2.4 0 0 0 2.2-3.5L14 9V3"/>'),
  System: svg('<path d="M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5"/>'),
  Support: svg(
    '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="9"/><path d="m15 15 3.35 3.35M9 15l-3.35 3.35M5.65 5.65 9 9M18.35 5.65 15 9"/>',
  ),
  Assets: svg('<rect x="5" y="5" width="14" height="10" rx="1"/><path d="M3 19h18"/>'),
  Access: svg('<circle cx="8" cy="15" r="4"/><path d="m10.85 12.15 8.65-8.65M18 5l2 2M15 8l2 2"/>'),
  Contracts: svg(
    '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM9 9h1M9 13h6M9 17h6"/>',
  ),
  Corporate: svg(
    '<path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>',
  ),
  'IP and disputes': svg('<path d="m13 10-7.5 7.5a2.1 2.1 0 0 0 3 3L16 13M16 16l6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>'),
  Compliance: svg('<path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3"/>'),
  Workplace: svg(
    '<path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>',
  ),
  Services: svg(
    '<path d="M8 3a2.4 2.4 0 0 0-1 2 2.4 2.4 0 0 0 1 2M12 3a2.4 2.4 0 0 0-1 2 2.4 2.4 0 0 0 1 2M3 10h14v5a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6zM16.75 16.5A3 3 0 0 0 21 13.5V12a2 2 0 0 0-2-2h-2"/>',
  ),
  Building: svg('<path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/>'),
  Safety: svg(
    '<path d="M12 10.94C14 8 13 4 12 3c0 3.04-1.77 4.74-3 6-1.22 1.26-2 3.24-2 5a5 5 0 1 0 10 0c0-1.53-1.06-3.94-2-5-1.79 3-2.8 3-3 1.94z"/>',
  ),
  Steering: svg('<circle cx="12" cy="12" r="9"/><path d="m8 16 2-6 6-2-2 6z"/>'),
  Governance: svg('<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>'),
  Change: svg(
    '<path d="M4 13a8 8 0 0 1 7 7 6 6 0 0 0 3-5 9 9 0 0 0 6-8 3 3 0 0 0-3-3 9 9 0 0 0-8 6 6 6 0 0 0-5 3"/><path d="M7 14a6 6 0 0 0-3 6 6 6 0 0 0 6-3"/><circle cx="15" cy="9" r="1"/>',
  ),
  Communication: svg(
    '<path d="M8 9h8M8 13h6M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"/>',
  ),
};

// The groups of the 100 apps with their icons, and the icons of their subgroups.
const GROUPS: readonly AppCockpit.Group[] = Object.entries(AREAS).map(([name, subgroups]) => ({
  name,
  ...(GROUP_ICONS[name] === undefined ? {} : { icon: GROUP_ICONS[name] }),
  subgroups: Object.keys(subgroups).map((subgroup) => ({
    name: subgroup,
    ...(SUBGROUP_ICONS[subgroup] === undefined ? {} : { icon: SUBGROUP_ICONS[subgroup] }),
  })),
}));
