import { Steps } from 'antd';
import { observer } from 'mobx-react';
import { nanoid } from 'nanoid';
import React, { Component } from 'react';
import styles from './index.less';

const { Step } = Steps;
interface propsInterface {
  selectedData?: string[];
}

@observer
export default class extends Component<propsInterface> {
  constructor(props) {
    super(props);
  }

  private stepsGroup = [
    '下单',
    '付款',
    '审核',
    '打印',
    '验货',
  ];

  render() {
    return (
      <div className={styles.page}>
        <Steps>
          {this.stepsGroup.map((_item, index) => {
            const { selectedData } = this.props;
            const isTime = selectedData && selectedData[index];
            return (
              <Step
                description={isTime ? selectedData[index] : ''}
                key={nanoid()}
                status={isTime ? 'finish' : 'wait'}
                title={_item}
              />
            );
          })}
        </Steps>
      </div>
    );
  }
}
