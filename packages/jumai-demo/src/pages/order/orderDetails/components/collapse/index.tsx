import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Typography } from 'antd';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { ReactNode } from 'react';
import styles from './index.less';
import store from './model';

const { Panel } = Collapse;
interface CollapseInterface {
  title: string;
  ghost?: boolean;
  titleButton?: React.ReactNode;
}

@observer
export default class extends Component<CollapseInterface> {
  constructor(props) {
    super(props);
  }

  public store = new store();

  public renderPanelHeader = (): ReactNode => {
    const { activeKey } = this.store;
    return (
      <div className={styles.renderPanelHeader}>
        <span className={styles.rectangular}/>
        <Typography.Text className={styles.title}>
          {this.props.title}
        </Typography.Text>
        {
          activeKey && activeKey.length ? <UpOutlined className={styles.iconStyle}/>
            : <DownOutlined className={styles.iconStyle}/>
        }
        <div className={styles.titleButton}>
          {this.props.titleButton}
        </div>
      </div>
    );
  };

  render() {
    const {
      id,
      onChange,
      activeKey,
    } = this.store;
    return (
      <Collapse
        activeKey={activeKey}
        bordered={false}
        className={styles.collapse}
        ghost={this.props?.ghost}
        onChange={onChange}
      >
        <Panel
          className={styles.panel}
          header={this.renderPanelHeader()}
          key={id}
          showArrow={false}
        >
          {this.props.children}
        </Panel>
      </Collapse>
    );
  }
}
