import { observable, action } from 'mobx';
import { request } from 'jumai-utils';

class Store {
  @observable public visible = false;
}

export default Store;
