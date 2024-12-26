import React from 'react';
import Store from './store';

const Component = () => {
  const store = React.useMemo(() => new Store(), []);
  return (
    <div>
      <div>
        test
      </div>
    </div>
  );
};

export default Component;
