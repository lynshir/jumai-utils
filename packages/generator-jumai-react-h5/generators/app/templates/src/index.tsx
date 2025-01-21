import 'amfe-flexible';
import './global.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { routes } from './routes';
import { RenderRoutes, history } from './utils';

function render() {
  ReactDOM.render(
    <RenderRoutes
      history={history}
      loading=""
      routes={routes}
    />,
    document.getElementById('root')
  );
}

render();

if (process.env.NODE_ENV === 'development') {
  if (process.env.CLI_TOOL === 'vite') {
    // @ts-ignore
    import.meta.hot.accept();
  } else if (process.env.CLI_TOOL === 'webpack') {
    // @ts-ignore
    module.hot.accept(render);
  }
}

