import React from 'react';
import { observer } from 'mobx-react';
import { SearchListStructure } from 'egenie-utils';
import { Store } from './store';

const Component = observer(() => {
  const store = React.useMemo(() => new Store(), []);
  return (
    <div>
      <SearchListStructure store={store.searchListStore}/>
    </div>
  );
});

export default Component;
