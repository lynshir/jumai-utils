import { Spin } from 'antd';
import { history, Locale, RenderRoutes } from 'jumai-common';
import React from 'react';
import ReactDOM from 'react-dom';
import './global.less';
import { routes } from './routes';
import NProgress from 'nprogress';

render();

function render() {
  NProgress.start();

  function Internal() {
    React.useLayoutEffect(() => {
      NProgress.done();
    }, []);

    return (
      <Locale>
        <RenderRoutes
          history={history}
          loading={<Spin size="large"/>}
          routes={routes}
        />
      </Locale>
    );
  }

  ReactDOM.render(
    <Internal/>,
    document.getElementById('root')
  );
}

if (process.env.NODE_ENV === 'development') {
  if (process.env.CLI_TOOL === 'vite') {
    // @ts-ignore
    import.meta.hot.accept();
  } else if (process.env.CLI_TOOL === 'webpack') {
    // @ts-ignore
    module.hot.accept(render);
  }
}
