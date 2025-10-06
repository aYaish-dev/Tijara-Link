export type SupplierProfile = {
  companyId: string;
  name: string;
  location: string;
  focus: string[];
  responseTime: string;
  description: string;
  capabilities: string[];
  compliance: string[];
  markets: string[];
  highlights: string;
};

export const SUPPLIER_PROFILES: SupplierProfile[] = [
  {
    companyId: "00000000-0000-0000-0000-000000000002",
    name: "Bosporus Materials Cooperative",
    location: "Istanbul, Türkiye",
    focus: ["Construction", "Cement", "Steel"],
    responseTime: "< 4h",
    description:
      "Specialised in large-scale construction materials with bonded warehouse options and bilingual trade teams.",
    capabilities: ["Bulk cement bagging", "Rebar cutting & bending", "On-dock QC inspections"],
    compliance: ["ISO 9001", "REACH", "EUR.1 certified"],
    markets: ["GCC", "Levant", "North Africa"],
    highlights: "Manages bonded warehouse capacity across Marmara ports for rapid cross-docking.",
  },
  {
    companyId: "demo-agri-001",
    name: "Maghreb Agro Collective",
    location: "Casablanca, Morocco",
    focus: ["Agri Commodities", "Fresh Produce", "Cold Chain"],
    responseTime: "Same day",
    description:
      "Exporting citrus, olives, and pulses with HACCP certified packing facilities across three ports.",
    capabilities: ["Controlled-atmosphere storage", "24/7 QC lab", "Multi-temperature fleet"],
    compliance: ["HACCP", "GlobalG.A.P.", "IFS Logistics"],
    markets: ["EU", "Gulf", "West Africa"],
    highlights: "Runs origin consolidation hubs that integrate directly with TijaraLink escrow milestones.",
  },
  {
    companyId: "demo-textile-001",
    name: "Levant Textile Guild",
    location: "Amman, Jordan",
    focus: ["Technical Textiles", "Protective Gear"],
    responseTime: "< 8h",
    description:
      "Provides ISO 9001 compliant manufacturing with short production runs and digital QC reporting.",
    capabilities: ["Laser cutting", "RF welding", "Custom embroidery"],
    compliance: ["ISO 9001", "CE Mark", "Wrap Gold"],
    markets: ["EU", "North America", "MENA"],
    highlights: "Digital QA stack integrates with TijaraLink review workflows for instant buyer sign-off.",
  },
];
