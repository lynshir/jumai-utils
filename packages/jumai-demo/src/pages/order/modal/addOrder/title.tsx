import { observer } from 'mobx-react';
import React from 'react';

interface Iprops {
  text: string;
}

const wrapper = { display: 'flex' };

const columCe = { alignItems: 'center' };

// const flexBe = { justifyContent: 'space-between' };

const rectangular = {
  width: '4px',
  height: '14px',
  background: '#1978FF',
};
const titleStyle = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  marginLeft: '7px',
};

const Title = observer((props: Iprops): JSX.Element => {
  return (
    <div style={{ ...wrapper }}>
      <div style={{
        ...wrapper,
        ...columCe,
      }}
      >
        <div style={rectangular}/>
        <div style={titleStyle}>
          {props.text}
        </div>
      </div>
    </div>
  );
});

export default Title;
