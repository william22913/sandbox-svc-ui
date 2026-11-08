import { ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';
import nexI18n from 'nexcomponent-ui/dist/config/i18nConfig';
import './i18n';

// The library's pagination reads its own i18n instance. Point it at Indonesian
// and use the UI map's lowercase "dari" in the footer.
nexI18n.addResourceBundle('id', 'COMMON', { OF: 'dari' }, true, true);
nexI18n.changeLanguage('id');

export default function AppProviders({ children }) {
  return <ConfigProvider locale={idID}>{children}</ConfigProvider>;
}
