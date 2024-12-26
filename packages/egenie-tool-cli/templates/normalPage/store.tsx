import { observable, action } from 'mobx';
import { request } from 'egenie-utils';

class Store {
  @observable public visible = false;
}

export default Store;
