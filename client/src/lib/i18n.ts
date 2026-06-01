/* ================================================================
   SDC HR Solutions — i18n Translation Engine
   Provides zero-hardcoded UI translation infrastructure.
   ================================================================ */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      brand: "SDC HR Solutions",
      brand_tagline: "Precision HR & Workforce Intelligence",
      dashboard: "Dashboard",
      employees: "Employees",
      onboarding: "Onboarding",
      letters: "Letters",
      attendance: "Attendance",
      leaves: "Leaves",
      payroll: "Payroll",
      settlement: "Settlement",
      reports: "Reports",
      config: "Config",
      logout: "Logout",
      profile: "Profile",
      welcome: "Welcome back",
      notifications: "Notifications",
      mark_all_read: "Mark all as read",
      no_notifications: "All caught up! No new notifications.",
      upgrade_notice: "Upgrade to Pro Tier",
      feature_locked: "This module is a premium Tier 2 feature. Upgrade your subscription to unlock.",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      approve: "Approve",
      reject: "Reject",
      edit: "Edit",
      add_new: "Add New",
      actions: "Actions",
      status: "Status",
      search: "Search...",
      all: "All",
      active: "Active",
      inactive: "Inactive",
      loading: "Loading SDC HRMS..."
    }
  },
  ur: {
    translation: {
      brand: "ایس ڈی سی ایچ آر سلوشنز",
      brand_tagline: "ایچ آر اور افرادی قوت کی ذہانت",
      dashboard: "ڈیش بورڈ",
      employees: "ملازمین",
      onboarding: "آن بورڈنگ",
      letters: "خطوط",
      attendance: "حاضری",
      leaves: "رخصتیں",
      payroll: "تنخواہیں",
      settlement: "تصفیہ",
      reports: "رپورٹس",
      config: "ترتیبات",
      logout: "لاگ آؤٹ",
      profile: "پروفائل",
      welcome: "خوش آمدید",
      notifications: "اطلاعات",
      mark_all_read: "سب کو پڑھا ہوا نشان زد کریں",
      no_notifications: "کوئی نئی اطلاع نہیں ہے۔",
      upgrade_notice: "پرو ٹیر میں اپ گریڈ کریں",
      feature_locked: "یہ ماڈیول ایک پریمیم خصوصیت ہے۔ کھولنے کے لیے اپ گریڈ کریں۔",
      cancel: "منسوخ کریں",
      save: "محفوظ کریں",
      delete: "حذف کریں",
      approve: "منظور کریں",
      reject: "مسترد کریں",
      edit: "ترمیم کریں",
      add_new: "نیا شامل کریں",
      actions: "اقدامات",
      status: "حیثیت",
      search: "تلاش کریں...",
      all: "سب",
      active: "فعال",
      inactive: "غیر فعال",
      loading: "لوڈ ہو رہا ہے..."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
export { i18n };
