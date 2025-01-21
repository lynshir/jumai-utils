import { Button, Col, Popover, Row, Space, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import { RenderByCondition, egeniePcTheme } from 'jumai-common';
import { filterComponentFactory } from '../filterItems';
import type { NormalProgramme } from './normalProgramme';
import styles from './normalProgramme.module.less';
import { FilterItemsSetting } from '../filterItemsSetting/filterItemsSetting';

interface NormalProgrammeComponentProps {
  store: NormalProgramme;
  className?: string;
  style?: React.CSSProperties;
}

const gapXs = parseFloat(egeniePcTheme.spacing['egenie-spacing-xs']);
const gapXss = parseFloat(egeniePcTheme.spacing['egenie-spacing-xss']);

@observer
export class NormalProgrammeComponent extends React.Component<NormalProgrammeComponentProps> {
  render() {
    const {
      className = '',
      style = {},
      store,
    } = this.props;
    const {
      count,
      notCollapseData,
      filterItemsSettingStore,
    } = store;

    return (
      <>
        <div
          className={`${styles.content} ${styles.contentBase} ${className}`}
          style={style}
        >
          <Row
            gutter={[
              gapXs,
              gapXs,
            ]}
          >
            {
              notCollapseData.map((item) => (
                <Col
                  key={item.filterItem.field}
                  style={{ width: `${(item.itemCount / count) * 100}%` }}
                >
                  {filterComponentFactory(item.filterItem)}
                </Col>
              ))
            }
            <ButtonContainer store={store}/>
          </Row>
        </div>
        <FilterItemsSetting filterItemsSettingStore={filterItemsSettingStore}/>
      </>
    );
  }
}

@observer
class ButtonContainer extends React.Component<{ store: NormalProgramme; }> {
  render() {
    const {
      store: {
        count,
        button,
        reset,
        isSearch,
        handleSearch,
        showButton,
        notCollapseActualBtnCount,
        collapseData,
        filterItemsSettingStore,
      },
    } = this.props;
    return (
      <RenderByCondition show={showButton}>
        <Col
          className={styles.btn}
          style={{ width: `${(notCollapseActualBtnCount / count) * 100}%` }}
        >
          <RenderByCondition show={!button}>
            <Space size={gapXss}>
              {
                collapseData.length > 0 ? (
                  <Popover
                    arrowPointAtCenter
                    content={(
                      <Row
                        className={styles.collapseContainer}
                        gutter={[
                          gapXs,
                          gapXs,
                        ]}
                      >
                        {
                          collapseData.map((item) => (
                            <Col
                              key={item.filterItem.field}
                              style={{ width: '50%' }}
                            >
                              {filterComponentFactory(item.filterItem)}
                            </Col>
                          ))
                        }
                      </Row>
                    )}
                    overlayInnerStyle={{ width: 752 }}
                    placement="bottomRight"
                    title={null}
                    trigger="click"
                  >
                    <Button
                      style={{
                        paddingLeft: gapXss,
                        paddingRight: gapXss,
                      }}
                      type="text"
                    >
                      更多&nbsp;
                      <i className="icon-arrow_pulldown"/>
                    </Button>
                  </Popover>
                ) : null
              }
              {
                filterItemsSettingStore.showFilterItemsSetting ? (
                  <Tooltip
                    arrowPointAtCenter
                    placement="bottomRight"
                    title="查询项设置"
                  >
                    <Button
                      onClick={filterItemsSettingStore.handleOpen}
                      style={{
                        paddingLeft: gapXs,
                        paddingRight: gapXs,
                      }}
                      type="text"
                    >
                      <i
                        className="icon-sz01"
                        style={{ fontSize: 14 }}
                      />
                    </Button>
                  </Tooltip>
                ) : null
              }
              <Button
                onClick={reset}
                style={{
                  paddingLeft: gapXs,
                  paddingRight: gapXs,
                }}
              >
                重置
              </Button>
              <Button
                loading={isSearch}
                onClick={handleSearch}
                style={{
                  paddingLeft: gapXs,
                  paddingRight: gapXs,
                }}
                type="primary"
              >
                查询
              </Button>
            </Space>
          </RenderByCondition>
        </Col>
      </RenderByCondition>
    );
  }
}

