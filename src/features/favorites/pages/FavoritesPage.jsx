import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ReloadOutlined, RightOutlined, StarFilled } from '@ant-design/icons';
import { Pagination, StatePage, Table } from 'nexcomponent-ui';
import { W_btn_dft_m_ico01_left_01 } from 'nexcomponent-ui/dist/AI/Button/ButtonLeftMedium';
import { W_btn_dft_m_ico01_left_02 } from 'nexcomponent-ui/dist/AI/Button/ButtonLeftMedium';
import { useTranslation } from 'react-i18next';
import useFavorites from '../hooks/useFavorites';
import AvailabilityTag from '../components/AvailabilityTag';
import SkeletonRows from '../components/SkeletonRows';
import { formatDate, formatPrice } from '../../../helpers/format';
import emptyIllustration from '../../../assets/empty-favorites.svg';
import placeholder from '../../../assets/placeholder-item.svg';

function SortHeader({ children }) {
  return (
    <span className="sort-header">
      {children}
      <span className="sort-header__arrows" aria-hidden="true">▲▼</span>
    </span>
  );
}

export default function FavoritesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    page,
    pageSize,
    items,
    total,
    loading,
    error,
    actionError,
    changePage,
    changePageSize,
    retry,
    remove,
  } = useFavorites({ initialPage: 1, initialPageSize: 20 });
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [page, pageSize]);

  const openItem = (row) =>
    navigate(`/catalog/${row.item_id}`, { state: { item: row, favorited: true } });

  const columns = [
    {
      title: t('favorites.columns.image'),
        key: 'image',
        width: 72,
        className: 'col-image',
        render: (_, row) => (
          <img
            className="favorites-table__thumb"
            src={row.image_url || placeholder}
            alt={row.name || ''}
            width="40"
            height="40"
          />
        ),
      },
      {
        title: <SortHeader>{t('favorites.columns.name')}</SortHeader>,
        dataIndex: 'name',
        key: 'name',
        className: 'col-name',
        render: (value, row) => (
          <Link
            className="favorites-table__name"
            to={`/catalog/${row.item_id}`}
            state={{ item: row, favorited: true }}
          >
            {value}
          </Link>
        ),
      },
      {
        title: t('favorites.columns.category'),
        dataIndex: 'category',
        key: 'category',
        className: 'col-category',
      },
      {
        title: t('favorites.columns.price'),
        dataIndex: 'price',
        key: 'price',
        align: 'right',
        className: 'col-price',
        render: (value) => formatPrice(value),
      },
      {
        title: t('favorites.columns.availability'),
        dataIndex: 'available',
        key: 'availability',
        className: 'col-availability',
        render: (value) => <AvailabilityTag available={value !== false} />,
      },
      {
        title: <SortHeader>{t('favorites.columns.date')}</SortHeader>,
        dataIndex: 'favorited_at',
        key: 'date',
        className: 'col-date',
        render: (value) => formatDate(value),
      },
      {
        title: '',
        key: 'actions',
        className: 'col-actions',
        render: (_, row) => (
          <div className="row-actions">
            <Button
              type="text"
              aria-label={t('favorites.remove')}
              title={t('favorites.remove')}
              onClick={() => remove(row.item_id)}
            >
              <StarFilled style={{ fontSize: 20, color: '#13A1DC' }} />
            </Button>
            <Button
              type="text"
              aria-label={t('favorites.open')}
              title={t('favorites.open')}
              onClick={() => openItem(row)}
            >
              <RightOutlined style={{ fontSize: 16, color: '#424242' }} />
            </Button>
          </div>
        ),
    },
  ];

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <section className="page">
      <header className="page__header">
        <h1 className="page__title">{t('favorites.title')}</h1>
        <p className="page__subtitle">{t('favorites.subtitle')}</p>
      </header>

      {actionError && (
        <div className="inline-error" role="alert">
          {t('favorites.removeError')}
        </div>
      )}

      {error ? (
        <div className="inline-error inline-error--block" role="alert">
          <span>{t('favorites.loadError')}</span>
          <W_btn_dft_m_ico01_left_02
            label={t('favorites.retry')}
            prefixIcon={<ReloadOutlined />}
            mainColor="#13A1DC"
            secondaryColor="#13A1DC"
            onClick={retry}
          />
        </div>
      ) : !loading && total === 0 ? (
        <StatePage
          title={t('favorites.emptyTitle')}
          subTitle={t('favorites.emptyCopy')}
          image={emptyIllustration}
          extra={
            <W_btn_dft_m_ico01_left_01
              label={t('favorites.browseCatalog')}
              prefixIcon={<RightOutlined />}
              mainColor="#13A1DC"
              onClick={() => navigate('/catalog')}
            />
          }
        />
      ) : (
        <div className="favorites-table">
          <Table
            columns={columns}
            dataSource={items}
            rowKey="item_id"
            pagination={false}
            loading={false}
            emptyText={loading ? <SkeletonRows rows={6} /> : undefined}
            rowSelection={{
              selectedRowKeys: selected,
              onChange: setSelected,
              columnWidth: 48,
            }}
          />
          {!loading && total > 0 && (
            <div className="favorites-table__footer">
              <Pagination
                currentRow={`${start}-${end}`}
                total={total}
                currentPage={page}
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 50]}
                handleChangePage={changePage}
                handleChangePageSize={changePageSize}
                isPageSize
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
