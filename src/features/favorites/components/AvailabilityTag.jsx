import { W_tag_dft_m_dft } from 'nexcomponent-ui/dist/AI/Tag/TagMedium';
import { useTranslation } from 'react-i18next';

const COLORS = {
  available: { bg: '#EEF8EA', text: '#2E7D14' },
  unavailable: { bg: '#FAE8E6', text: '#CB1801' },
};

export default function AvailabilityTag({ available }) {
  const { t } = useTranslation();
  const colors = available ? COLORS.available : COLORS.unavailable;
  return (
    <W_tag_dft_m_dft
      title={available ? t('favorites.available') : t('favorites.unavailable')}
      state="colored"
      color={colors.bg}
      fontColorProps={colors.text}
      ellipsis={false}
    />
  );
}
