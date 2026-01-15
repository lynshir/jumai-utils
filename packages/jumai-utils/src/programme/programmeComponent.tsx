import { Anchor, Button, Collapse, Dropdown, Layout, Popover, Space, Tabs, Typography } from 'antd';
import classNames from 'classnames';
import { RenderByCondition } from 'jumai-common';
import { ENUM_FILTER_ITEM_TYPE, filterComponentFactory } from './filterItems';
import { observer } from 'mobx-react';
import React from 'react';
import { MainSubStructure } from '../egGrid';
import { DEFAULT_PROGRAMME, FILTER_ITEMS_COLLAPSE_PREFIX } from './constants';
import type { Programme } from './programme';
import styles from './programme.module.less';
import { ProgrammeTranslate } from './programmeTranslate';
import { FilterItemsSetting } from './filterItemsSetting/filterItemsSetting';
import { ProgrammeListSetting } from './programmeListSetting';
import _ from 'lodash';

interface ProgrammeProps {
  store: Programme;
  className?: string;
  style?: React.CSSProperties;
  summaryStatistic?: React.ReactNode;
  customTableRender?: React.ReactNode;
}

@observer
export class ProgrammeComponent extends React.Component<ProgrammeProps> {
  componentDidMount() {
    const {
      handleFilterItemsValueChangeObserver,
      clickPreventCloseScroll,
      clickCloseScroll,
    } = this.props.store.programmeInteractiveStore;

    handleFilterItemsValueChangeObserver();

    document.querySelector(`.${styles.scrollContainer}`)
      ?.addEventListener('click', clickPreventCloseScroll);
    window.addEventListener('click', clickCloseScroll, true);
  }

  componentWillUnmount() {
    const {
      handleFilterItemsValueChangeDisposer,
      clickPreventCloseScroll,
      clickCloseScroll,
    } = this.props.store.programmeInteractiveStore;

    if (handleFilterItemsValueChangeDisposer) {
      handleFilterItemsValueChangeDisposer();
    }

    document.querySelector(`.${styles.scrollContainer}`)
      ?.removeEventListener('click', clickPreventCloseScroll);
    window.removeEventListener('click', clickCloseScroll);
  }

  render() {
    const {
      className = '',
      style = {},
      summaryStatistic,
      customTableRender: CustomTableRender,
      store,
    } = this.props;
    const {
      programmeInteractiveStore: {
        scrollContainerRef,
        handleScroll,
        collapsed,
        handleCollapsed,
      },
      customTableRender,
      gridModel,
      filterItemsSettingStore,
      programmeListSettingStore,
    } = store;
    return (
      <>

        <Layout
          className={`${styles.container} ${className}`}
          style={style}
        >
          <Layout.Sider
            collapsed={collapsed}
            collapsedWidth={0}
            collapsible
            onCollapse={handleCollapsed}
            theme="light"
            trigger={<i className={collapsed ? 'icon-sq' : 'icon-zk'} />}
            width="300"
          >
            <div
              className={`${styles.filterContent} ${styles.filterContentBase}`}
              onScroll={handleScroll}
              ref={scrollContainerRef}
            >
              <FilterItemsComponent programme={store} />
            </div>
            <FilterItemsScroll programme={store} />
            <Footer programme={store} />
          </Layout.Sider>
          <Layout.Content>
            {summaryStatistic}
            <ProgrammeList programme={store} />
            <div className={styles.tableWrapper}>
              {_.isEmpty(customTableRender) ? <MainSubStructure store={gridModel} /> : CustomTableRender}
            </div>
          </Layout.Content>
        </Layout>
        <FilterItemsSetting filterItemsSettingStore={filterItemsSettingStore} />
        <ProgrammeListSetting programmeListSettingStore={programmeListSettingStore} />
      </>
    );
  }
}

const Footer = observer(({
  programme: {
    filterItems: { reset },
    filterItemsSettingStore,
    isSearch,
    handleSearch,
    activeProgrammeId,
    editProgramme,
    handleCreateProgramme,
  },
}: { programme: Programme; }) => {
  return (
    <div className={styles.footer}>
      <a onClick={filterItemsSettingStore.handleOpen}>
        <i className="icon-btn_sz" />
      </a>
      <Space size={4}>
        {
          activeProgrammeId === DEFAULT_PROGRAMME.id ? (
            <Button onClick={handleCreateProgramme}>
              生成方案
            </Button>
          ) : (
            <Dropdown.Button
              menu={{
                items: [
                  {
                    label: '更新方案',
                    key: '1',
                    onClick: editProgramme,
                  },
                ],
              }}
              onClick={handleCreateProgramme}
              placement="topCenter"
              trigger={['click']}
            >
              生成方案
            </Dropdown.Button>
          )
        }
        <Button onClick={reset}>
          重置
        </Button>
        <Button
          loading={isSearch}
          onClick={handleSearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
            }
          }}
          type="primary"
        >
          查询
        </Button>
      </Space>
    </div>
  );
});

const ProgrammeList = observer(({
  programme: {
    programmeList,
    activeProgrammeId,
    handleItemClick,
    handleItemDelete,
    programmeListSettingStore,
    programmeCountStore: {
      showProgrammeCount,
      programmeCount,
      getProgrammeCount,
      isProgrammeCountLoading,
    },
    filterItems,
  },
}: { programme: Programme; }) => {
  return (
    <div className={styles.programmeList}>
      <div className={styles.leftContainer}>
        <Tabs
          activeKey={activeProgrammeId}
          hideAdd
          items={[
            {
              closable: false,
              key: DEFAULT_PROGRAMME.id,
              label: (
                <section className={classNames(styles.programmeContentContainer, { [styles.active]: DEFAULT_PROGRAMME.id === activeProgrammeId })}>
                  <Typography.Text
                    ellipsis
                    title={DEFAULT_PROGRAMME.schemeName}
                  >
                    {DEFAULT_PROGRAMME.schemeName}
                  </Typography.Text>
                </section>
              ),
            },
          ].concat(programmeList.map((item) => {
            return {
              key: `${item.id}`,
              closable: !item.sysSetting,
              label: (
                <Popover
                  arrowPointAtCenter
                  content={(
                    <ProgrammeTranslate
                      filterItems={filterItems}
                      schemeValue={item.schemeValue}
                    />
                  )}
                  destroyTooltipOnHide
                  placement="bottom"
                >
                  <section className={classNames(styles.programmeContentContainer, { [styles.active]: `${item.id}` === activeProgrammeId })}>
                    <Typography.Text
                      ellipsis
                      title={item.schemeName}
                    >
                      {item.schemeName}
                    </Typography.Text>
                    <RenderByCondition show={showProgrammeCount}>
                      <span className={styles.programmeCount}>
                        {programmeCount[item.id] || 0}
                      </span>
                    </RenderByCondition>
                  </section>
                </Popover>
              ),
            };
          }))}
          onEdit={handleItemDelete}
          onTabClick={handleItemClick}
          size="small"
          type="editable-card"
        />
      </div>
      <div className={styles.rightContainer}>
        <Button
          loading={programmeListSettingStore.isLoading}
          onClick={programmeListSettingStore.handleOpen}
          type="text"
        >
          <i className="icon-sz01" />
        </Button>
        <RenderByCondition show={showProgrammeCount}>
          <Button
            loading={isProgrammeCountLoading}
            onClick={getProgrammeCount}
            type="text"
          >
            <i className="icon-cxsc" />
          </Button>
        </RenderByCondition>
      </div>
      <div className={styles.emptyBorder} />
    </div>
  );
});

const FilterItemsScroll = observer(({
  programme: {
    programmeInteractiveStore: {
      showScroll,
      scrollContainerRef,
    },
    filterItems: { actualData },
  },
}: { programme: Programme; }) => {
  return (
    <div
      className={styles.scrollContainer}
      style={showScroll ? {} : {
        height: 0,
        width: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div className={styles.scrollContent}>
        <Anchor getContainer={scrollContainerRef.current ? () => scrollContainerRef.current : undefined}>
          {
            actualData.map((item) => (
              <Anchor.Link
                href={`#${FILTER_ITEMS_COLLAPSE_PREFIX}${item.field}`}
                key={item.field}
                title={item.label}
              />
            ))
          }
        </Anchor>
      </div>
    </div>
  );
});

const FilterItemsComponent = observer(({ programme: { filterItems: { actualData } } }: { programme: Programme; }) => {
  return (
    <div className={styles.filterItemMainContainer}>
      {
        actualData.map((item) => {
          return (
            <div
              className={styles.filterItemContainer}
              id={`${FILTER_ITEMS_COLLAPSE_PREFIX}${item.field}`}
              key={item.field}
            >
              {
                item.type === ENUM_FILTER_ITEM_TYPE.radio || item.type === ENUM_FILTER_ITEM_TYPE.checkbox || item.type === ENUM_FILTER_ITEM_TYPE.patternSearch ? (
                  <Collapse
                    defaultActiveKey="1"
                    expandIconPosition="end"
                    ghost
                  >
                    <Collapse.Panel
                      header={(
                        <>
                          {
                            item.required ? (
                              <span style={{
                                color: '#ff4d4f',
                                paddingTop: 4,
                              }}
                              >
                                *
                              </span>
                            ) : null
                          }
                          <span>
                            {item.label}
                          </span>
                        </>
                      )}
                      key="1"
                    >
                      {filterComponentFactory(item)}
                    </Collapse.Panel>
                  </Collapse>
                ) : filterComponentFactory(item)
              }
            </div>
          );
        })
      }
    </div>
  );
});
