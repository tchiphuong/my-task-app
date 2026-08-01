import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationVi from "./locales/vi/common.json";

const resources = {
  vi: {
    translation: translationVi,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi",
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
