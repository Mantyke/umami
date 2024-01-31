import { ReactNode, useMemo, useState } from 'react';
import { Loading, Icon, Text, SearchField } from 'react-basics';
import classNames from 'classnames';
import { percentFilter } from 'lib/filters';
import { useDateRange } from 'components/hooks';
import { useNavigation } from 'components/hooks';
import ErrorMessage from 'components/common/ErrorMessage';
import LinkButton from 'components/common/LinkButton';
import ListTable, { ListTableProps } from './ListTable';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import Icons from 'components/icons';
import { useMessages } from 'components/hooks';
import { useLocale } from 'components/hooks';
import useFormat from 'components//hooks/useFormat';
import styles from './MetricsTable.module.css';
import useWebsiteMetrics from 'components/hooks/queries/useWebsiteMetrics';

export interface MetricsTableProps extends ListTableProps {
  websiteId: string;
  domainName: string;
  type?: string;
  className?: string;
  dataFilter?: (data: any) => any;
  limit?: number;
  delay?: number;
  onDataLoad?: (data: any) => void;
  onSearch?: (search: string) => void;
  allowSearch?: boolean;
  children?: ReactNode;
}

export function MetricsTable({
  websiteId,
  type,
  className,
  dataFilter,
  limit,
  onDataLoad,
  delay = null,
  allowSearch = false,
  children,
  ...props
}: MetricsTableProps) {
  const [search, setSearch] = useState('');
  const { formatValue } = useFormat();
  const [{ startDate, endDate }] = useDateRange(websiteId);
  const {
    renderUrl,
    query: { url, referrer, title, os, browser, device, country, region, city },
  } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const { dir } = useLocale();

  const { data, isLoading, isFetched, error } = useWebsiteMetrics(
    websiteId,
    {
      type,
      startAt: +startDate,
      endAt: +endDate,
      url,
      referrer,
      os,
      title,
      browser,
      device,
      country,
      region,
      city,
    },
    { retryDelay: delay || DEFAULT_ANIMATION_DURATION },
  );

  const filteredData = useMemo(() => {
    if (data) {
      let items = data as any[];

      if (dataFilter) {
        if (Array.isArray(dataFilter)) {
          items = dataFilter.reduce((arr, filter) => {
            return filter(arr);
          }, items);
        } else {
          items = dataFilter(data);
        }
      }

      if (search) {
        items = items.filter(({ x, ...data }) => {
          const value = formatValue(x, type, data);

          return value.toLowerCase().includes(search.toLowerCase());
        });
      }

      items = percentFilter(items);

      if (limit) {
        items = items.slice(0, limit - 1);
      }

      return items;
    }
    return [];
  }, [data, dataFilter, search, limit, formatValue, type]);

  return (
    <div className={classNames(styles.container, className)}>
      {error && <ErrorMessage />}
      <div className={styles.actions}>
        {allowSearch && (
          <SearchField
            className={styles.search}
            value={search}
            onSearch={setSearch}
            autoFocus={true}
          />
        )}
        {children}
      </div>
      {data && !error && (
        <ListTable {...(props as ListTableProps)} data={filteredData} className={className} />
      )}
      {!data && isLoading && !isFetched && <Loading icon="dots" />}
      <div className={styles.footer}>
        {data && !error && limit && (
          <LinkButton href={renderUrl({ view: type })} variant="quiet">
            <Text>{formatMessage(labels.more)}</Text>
            <Icon size="sm" rotate={dir === 'rtl' ? 180 : 0}>
              <Icons.ArrowRight />
            </Icon>
          </LinkButton>
        )}
      </div>
    </div>
  );
}

export default MetricsTable;
