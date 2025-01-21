import type { History } from 'history';
import { createBrowserHistory } from 'history';

export const history: History = createBrowserHistory({ basename: '/' });
