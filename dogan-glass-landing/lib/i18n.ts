export type Locale = "en" | "ar";

export const dict: Record<Locale, Record<string, string>> = {
  en: {
    title: "Dogan Business Insights",
    strap: "Vision & Execution — DoganConsult",
    cta_primary: "Get Started",
    cta_secondary: "View Dashboard",
    subtitle: "Saudi-grade enterprise analytics platform",
    dashboard_title: "Live Dashboard Preview",
    dashboard_kpi_1: "Total RFPs",
    dashboard_kpi_2: "Processing Time",
    dashboard_kpi_3: "Success Rate",
    dashboard_kpi_4: "Avg. Value",
    rotating_scene: "Scene",
    language: "العربية",
  },
  ar: {
    title: "رؤى دوجان للأعمال",
    strap: "الرؤية والتنفيذ — DoganConsult",
    cta_primary: "ابدأ الآن",
    cta_secondary: "عرض لوحة القيادة",
    subtitle: "منصّة تحليلات مؤسسية بمعايير سعودية",
    dashboard_title: "معاينة لوحة القيادة الحيّة",
    dashboard_kpi_1: "إجمالي طلبات العروض",
    dashboard_kpi_2: "زمن المعالجة",
    dashboard_kpi_3: "نسبة النجاح",
    dashboard_kpi_4: "القيمة المتوسطة",
    rotating_scene: "المشهد",
    language: "EN",
  },
};
