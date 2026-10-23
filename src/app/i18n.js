import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import id from '../locales/id.json';

i18n.use(initReactI18next).init({
  lng: 'id',
  fallbackLng: 'id',
  resources: { id: { translation: id } },
  interpolation: { escapeValue: false },
});

export default i18n;
