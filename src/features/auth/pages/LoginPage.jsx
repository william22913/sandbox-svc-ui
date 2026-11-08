import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { W_btn_dft_m_ico00_dft_01 } from 'nexcomponent-ui/dist/AI/Button/Medium';

/**
 * Stand-in for the product's existing login page. The backend owns auth; this
 * page only preserves REQ-012's return path. Any `redirect` value that is not
 * a local path is discarded (no open redirects).
 */
export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = params.get('redirect');
  const target = requested && requested.startsWith('/') && !requested.startsWith('//')
    ? requested
    : '/favorites';

  const signIn = () => {
    window.localStorage.setItem('sandbox.auth', '1');
    navigate(target, { replace: true });
  };

  return (
    <main className="login">
      <div className="login__card">
        <h1>{t('login.title')}</h1>
        <p>{t('login.subtitle')}</p>
        <W_btn_dft_m_ico00_dft_01
          label={t('login.action')}
          mainColor="#13A1DC"
          onClick={signIn}
        />
        <p className="login__note">{t('login.stubNote')}</p>
      </div>
    </main>
  );
}
