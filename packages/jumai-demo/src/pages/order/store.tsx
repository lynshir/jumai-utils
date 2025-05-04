
import { Button, Checkbox, Descriptions, message, Modal } from 'antd';
import { renderModal, objToDict, getStaticResourceUrl } from 'jumai-common';
import { BatchReport,
  EgGridModel,
  ExportStore,
  ImgFormatter,
  ImportModel,
  MainSubStructureModel,
  Programme,
  request } from 'jumai-utils';
import type { BaseData, BatchReportData, PaginationData,
  IObj } from 'jumai-utils';
import _ from 'lodash';
import { action, observable, runInAction, toJS } from 'mobx';
import moment from 'moment';
import qs from 'qs';
import React from 'react';
import { api, syncConfirm } from '../../utils';
import { columns } from '../base/columns';
import { updateTime } from '../base/commonFn';
import CourierQueryStore from '../base/courierQuery/courierQueryStore';
import MemoStore from '../base/memo/memoStore';
import { filterItems } from '../base/orderFilterItems';
import ProductDetailStore from '../base/productDetail/productDetailStore';
import { ProductSettingModel } from '../base/productSetting/model';
import RemarkStore from '../base/remark/remarkStore';
import ResultStore from '../base/result/resultStore';
import FreeSplitStore from '../base/skuBreakUp/model';
import SuspendStore from '../base/suspend/suspendStore';
import ExportOrderModel from '../components/exportOrder/model';
import { buttons } from './constant/buttons';
import styles from './index.less';
import type { csRes, IOperationRes, IShop, IWarehouse, MainTableList, Platform, OperatorListItem } from './interface';
import OrderStore from './modal/addOrder/addOrderStore';
import AddProductStore from './modal/addProduct/addProductStore';
import BulkExchangeStore from './modal/bulkExchange/model';
import ByPercentageSplitStore from './modal/byPercentageSplit/byPercentageSplitStore';
import BySkuSplitStore from './modal/bySkuSplit/bySkuSplitStore';
import ByWeightModel from './modal/byWeight/model';
import DetailSplitStore from './modal/detailSplit/store';
import ExchangeProductStore from './modal/exchangeProduct/exchangeProductStore';
import ForcedMergersModel from './modal/forcedMergers/model';
import { ManualDownloadOrderModel } from './modal/manualDownloadOrder/model';
import ModifyRemarkStore from './modal/modifyOrderRemark/modifyRemarkStore';
import ModifyReceiverInfoStore from './modal/modifyReceiverInfo/store';
import ModifyWareCourierStore from './modal/modifyWareCourier/modifyWareCourierStore';
import { PreShipmentModel } from './modal/preShipment/model';
import ReRunBatchStore from './modal/reRunBatch/reRunBatchStore';
import SetGroupStore from './modal/setGroup/setGroupStore';
import SetMemoStore from './modal/setMemo/setMemoStore';
import DropShippingTipStore from './modal/dropShippingTip/store';
import OrderDetailsModel from './orderDetails/model';
import InvalidGoodsModel from './components/invalidGoods/model';
import ReplaceProductStore from './components/replaceProductDrawer/store';
import MatchDropshipProductStore from './components/matchDropshipProductDrawer/store';
import type { FlagItem } from '../../utils';
import CryptographicCheckModel from './components/cryptographicCheck/model';
import DropShippingAfterTipsStore from './modal/dropShppingAfterTip/store';
import SetValueAddedServiceStore from './components/setValueAddedService/store';
import { Observer } from 'mobx-react';

export class Store {
  constructor() {
    request({
      url: getStaticResourceUrl('pc/ts/jumai-ts-oms/flagData.json'),
      withCredentials: false,
    })
      .then((data) => {
        this.flagData = data as Store['flagData'];
        this.programme.filterItems.addDict({
          'seller_flags-1-10': [
            {
              label: '无旗帜',
              value: '0',
            },
          ].concat(Object.values(data)),
        });
      });
    this.initDict();
  }

  @observable public flagData: FlagItem[] = [];

  @observable public wareHouseDict;// 用于重算订单取主master

  @observable public timer = null;// 计算加急订单timer

  @observable public spinning = false;

  @observable public shopList = [];

  @observable public egGridModel: EgGridModel;

  @observable public egGridModelSafeReturn: EgGridModel;

  @observable public resultStore = new ResultStore({ parent: this });

  @observable public cryptographicCheckModel = new CryptographicCheckModel(this);

  @observable public byWeightModel = new ByWeightModel();

  @observable public invalidGoodsModel = new InvalidGoodsModel(this);

  @observable public importModel = new ImportModel();

  @observable public forcedMergersModel = new ForcedMergersModel({ parent: this });

  @observable public orderDetailsModel = new OrderDetailsModel({ parent: this });

  @observable public suspendStore = new SuspendStore({ parent: this });

  public remarkStore = new RemarkStore({ parent: this });

  @observable public detailSplitStore = new DetailSplitStore({ parent: this });

  @observable public exportOrderModel = new ExportOrderModel(this);

  @observable public memoStore = new MemoStore({ parent: this });

  @observable public orderStore = new OrderStore({ parent: this });

  @observable public courierQueryStore = new CourierQueryStore();

  @observable public productDetailStore = new ProductDetailStore({ parent: this });

  @observable public addProductStore = new AddProductStore({ parent: this });

  @observable public exchangeProductStore = new ExchangeProductStore({ parent: this });

  @observable public modifyWareCourierStore = new ModifyWareCourierStore({ parent: this });

  @observable public modifyRemarkStore = new ModifyRemarkStore({ parent: this });

  @observable public setGroupStore = new SetGroupStore({ parent: this });

  @observable public setMemoStore = new SetMemoStore({ parent: this });

  @observable public reRunBatchStore = new ReRunBatchStore({ parent: this });

  @observable public bySkuSplitStore = new BySkuSplitStore({ parent: this });

  @observable public byPercentageStore = new ByPercentageSplitStore({ parent: this });

  @observable public freeSplitStore = new FreeSplitStore(this);

  @observable public modifyReceiverInfoStore = new ModifyReceiverInfoStore({ parent: this });

  @observable public preShipmentModel = new PreShipmentModel({ parent: this });

  @observable public exportStore = new ExportStore({ parent: this });

  @observable public bulkExchangeStore = new BulkExchangeStore(this);

  @observable public manualDownloadOrderModel = new ManualDownloadOrderModel({ parent: this });

  @observable public productSettingModel = new ProductSettingModel({ parent: this });

  public dropShippingTipStore = new DropShippingTipStore({ parent: this });

  public replaceProductStore = new ReplaceProductStore();

  public matchDropshipProductStore = new MatchDropshipProductStore();

  public dropShippingAfterTipsStore = new DropShippingAfterTipsStore(this);

  @observable public setValueAddedServiceStore = new SetValueAddedServiceStore();

  // 是否开启代发服务
  public isProxySend = false;

  // 平台列表
  @observable public platformList: Platform[] = [];

  @observable public visible = false;

  @observable public mergeReturnOutMerge = false;

  @observable public productDisplay = ''; // 商品展示内容

  @observable public operatorList = [];

  @action
  public getVendor = async() => {
    const req = await request<PaginationData<{ vendor_name: string;vendor_id: number; }>>({
      method: 'POST',
      url: '/api/baseinfo/rest/vendor/pagedIdAndName',
      data: {
        page: 1,
        pageSize: 10000,
      },
    });
    try {
      const vendorList = req?.data?.list?.map((item) => {
        return {
          label: item.vendor_name,
          value: `${item.vendor_id}`,
        };
      });
      this.programme.filterItems.addDict({ 'vendor_id-4-5': vendorList });
    } catch (e) {
      console.log(e);
    }
  };

  // 初始化店铺和仓库接口,标签
  @action public initDict = async() => {
    this.egGridModel = new EgGridModel({
      primaryKeyField: 'goodsSkuId',
      rows: [],
      columns: [
        {
          name: '图片',
          key: 'picUrl',
          width: 35,
          formatter: ({ row }) => {
            return (
              <ImgFormatter
                height={28}
                value={row.picUrl}
                width={28}
              />
            );
          },
        },
        {
          name: 'SKU编码',
          key: 'goodsSkuNo',
        },
        {
          name: '颜色',
          key: 'color',
          width: 80,
        },
        {
          name: '尺码',
          key: 'size',
          width: 80,

        },
        {
          name: '单价',
          key: 'price',
          width: 80,
          formatter: ({ row }) => {
            return (
              <span>
                ¥
                {row.price?.toFixed(2)}
              </span>
            );
          },
        },
        {
          name: '代发数量',
          key: 'num',
          width: 85,
        },
        {
          name: '商品金额',
          key: 'totalPrice',
          width: 120,
          formatter: ({ row }) => {
            return (
              <span>
                ¥
                {row.totalPrice?.toFixed(2)}
              </span>
            );
          },
        },
        {
          name: '退货规则',
          key: 'returnable',
          formatter: ({ row }) => {
            const rulesEnu = {
              '0': () => {
                return (
                  <span className={styles.salesReturn}>
                    不支持退货
                  </span>
                );
              },
              '1': () => {
                return (
                  <span className={styles.salesReturn}>
                    {Number(row.returnRate)}
                    %支持退货
                  </span>
                );
              },
              '2': () => {
                return (
                  <span className={`${styles.salesReturn} ${styles.returnService}`}>
                    不支持退货，可购买无忧退货
                  </span>
                );
              },
            };
            return rulesEnu[row.returnable]();
          },
        },
      ].map((item) => {
        return {
          draggable: true,
          resizable: true,
          ...item,
        };
      }),
      showPagination: false,
      showCheckBox: false,
      showPager: false,
      api: {},
    });

    this.getShop();
    this.getVendor();
    this.getPlatformType();

    // 获取运营列表
    request<BaseData<OperatorListItem[]>>({
      url: '/api/baseinfo/rest/productOperation/queryOperator',
      method: 'get',
    }).then((res) => {
      this.operatorList = res.data.map((item) => {
        return {
          label: item.userName,
          value: item.operatorId,
        };
      });
      this.programme.filterItems.addDict({ operatorId: this.operatorList });
    });

    // 初始化仓库
    request<BaseData<IWarehouse[]>>({ url: api.getOriginWarehouseList }).then((warehouseRes) => {
      this.wareHouseDict = warehouseRes.data;// 用于重算订单取主master
      const modifiedWarehouseDict = this.arrToOptions(warehouseRes.data, 'warehouseId', 'warehouseName');
      console.log(modifiedWarehouseDict);

      this.programme.filterItems.addDict({ 'warehouse_id-4-13': modifiedWarehouseDict });
    });

    // 初始化标签(新增标签查询条件需要)
    const allLabelsRes = await request<BaseData<Record<string, unknown>>>({ url: api.getAllLabels });
    const labelOptions = this.objToOptions(allLabelsRes.data);
    const nullOptions = [
      {
        label: '标签为空',
        value: 'SEARCH_FOR_IS_NULL',
      },
      {
        label: '标签非空',
        value: 'SEARCH_FOR_IS_NOT_NULL',
      },
    ];

    // labelOptions.unshift(...nullOptions);
    this.programme.filterItems.addDict({
      'trade_memo-1-10': [
        ...nullOptions,
        ...labelOptions,
      ],
      'trade_memo_exclude-1-10': labelOptions,
    });

    // 获取当前商品展示方式
    this.getShowImageConfig();

    // 获取是否开启代发服务
    this.getProxySendStatus();

    this.getPlatformList();
  };

  @action
  public getShop = async() => {
    // 初始化店铺
    request<BaseData<IShop[]>>({ url: api.getOriginShopList }).then((shopRes) => {
      const modifiedShopDict = this.arrToOptions(shopRes.data, 'shopId', 'shopName');
      this.shopList = modifiedShopDict;
    });
    const req = await request<BaseData<any[]>>({ url: '/api/baseinfo/rest/shop/query/enabledShopPlatformTypeLeaves' });
    const shopList = this.toTree(req.data);
    this.programme.filterItems.updateFilterItem([
      {
        type: 'treeSelect',
        field: 'shop_id-4-10',
        treeData: shopList,
      },
    ]);
  };

  // 转化树形
  @action
  public toTree = (data: any[]): any[] => {
    function tree(_id?: string) {
      const arr = [];
      data.filter((item) => {
        return (!_id && !item.pid) || item.pid === _id;
      }).forEach((item) => {
        arr.push({
          value: item.id,
          label: item.name,
          title:
            (
              <Observer>
                {() => {
                  return (
                    <div className={styles.treeTitle}>
                      {!item.pid ? (
                        <img
                          src={item.iconUrl}
                          style={{ width: 20 }}
                        />
                      ) : undefined}
                      {item.name}
                    </div>
                  );
                }}
              </Observer>
            ),
          key: item.id,
          children: tree(item.id),
        });
      });
      return arr;
    }
    return tree();
  };

  @action
  public getPlatformType = async() => {
    const req = await request<BaseData<{[key: number]: string; }>>({
      method: 'GET',
      url: '/api/baseinfo/rest/dict/findDictsMapByType/platform_type',
    });
    this.programme.filterItems.updateFilterItem([
      {
        field: 'real_platform_type-4-10',
        data: req.data ? objToDict(req.data) : [],
      },
    ]);
  };

  // 处理仓库和店铺权限接口返回数据映射
  private arrToOptions = (data, key, val) => {
    return data.map((item) => ({
      label: item[val],
      value: `${item[key]}`,
    }));
  };

  private objToOptions = (data: Record<string, unknown>): any[] => {
    return Object.keys(data).map((item) => {
      return {
        label: data[item],
        value: data[item],
      };
    });
  };

  // 未选择订单提醒
  private noSelectWaring = () => {
    Modal.warning({
      title: '提示',
      content: '请选择要处理的订单！',
    });
  };

  // 未选择订单检查
  private noSelectCheck = () => {
    const { selectedIds = new Set() } = this.mainGridModel.gridModel;
    if (!selectedIds.size) {
      this.noSelectWaring();
      return false;
    }
    return true;
  };

  // 处理按钮操作(重新匹配商品)
  @action public mateProduct = () => {
    const { selectedIds = new Set() } = this.mainGridModel.gridModel;
    const ids = Array.from(selectedIds).toString();
    if (!ids) {
      this.noSelectWaring();
      return;
    }
    request({
      url: '/api/oms/rest/match/rematchSku',
      method: 'POST',
      data: { ids },
    }).then((res: IObj) => {
      const { failed, total, successed, operationName, list } = res.data;
      if (failed === 0) {
        Modal.success({
          title: '操作成功',
          content: `${operationName}成功，共${total}条`,
        });
        this.resetTable();
        return;
      }
      this.handleShowFailDialog(res);
    });
  };

  // 处理按钮操作(解挂 作废 反作废 继续发货 匹配无效商品 审核 设置黑名单 取消黑名单)
  @action public handleButtonOperation = async(operationType: string, id?: number, callback?: () => void) => {
    // 操作请求
    const operationRequest = () => {
      if (this.spinning) {
        return;
      }
      if (!id) {
        this.spinning = true;
      }
      const ids = id?.toString() ?? Array.from(selectedIds).toString();
      const data = operationType === 'beforeUncheckOrders' ? { saleOrderIds: ids.split(',') } : (operationType === 'matchSku' ? qs.stringify({ orderIDs: ids }) : { ids });
      request<BaseData<IOperationRes>>({
        url: operationType === 'checkOrders' ? '/api/saleorder/rest/order/checkOrder' : api[operationType],
        method: 'POST',
        headers: { contentType: operationType === 'matchSku' || operationType === 'beforeUncheckOrders' ? 'application/x-www-form-urlencoded;charset=UTF-8' : 'application/json;charset=UTF-8' },
        data: operationType === 'checkOrders' ? { ids: Array.from(selectedIds) } : data,
        timeout: 1000 * 60 * 1.5,
      }).then((res) => {
        const { failed, total, successed, operationName, list } = res.data;
        if (failed === 0) {
          // 反审核的话继续调uncheckOrders接口
          if (operationType === 'beforeUncheckOrders') {
            request<BaseData<IOperationRes>>({
              url: api.uncheckOrders,
              method: 'POST',
              data: { saleOrderIds: ids.split(',') },
            }).then((res) => {
              const { failed, total, successed, operationName, list } = res.data;
              if (failed === 0) {
                Modal.success({
                  title: '操作成功',
                  content: `${operationName}成功，共${total}条`,
                });
                callback && callback();
                this.resetTable();
                return;
              }
              this.handleShowFailDialog(res);
            });
            return;
          }

          Modal.success({
            title: '操作成功',
            content: id ? `${operationName}成功` : `${operationName}成功，共${total}条`,
          });
          callback && callback();
          this.resetTable();
          return;
        }

        // 反审核的话多一个继续反审核按钮 无法直接调用batchReport组件
        if (operationType === 'beforeUncheckOrders') {
          this.resultStore.uncheckFlag = operationType === 'beforeUncheckOrders';
          this.resultStore.resData = {
            operationName,
            failed,
            total,
            successed,
          };
          this.resultStore.failedGrid.rows = list;

          // 记录表格内容用于复制
          let temp = '';
          list.forEach((item, index) => {
            const eachItem = `${(index + 1)}  ${item.saleOrderNo}  ${item.reason}
  `;
            temp += eachItem;
          });
          this.resultStore.resultText = temp;
          this.resultStore.showResultModal(ids, callback);
        } else {
          this.handleShowFailDialog(res);
        }

        callback && callback();

        // 反审核失败的情况下不重置表格
        if (!id) {
          !(operationType === 'beforeUncheckOrders') && this.resetTable();
        }
      })
        .finally(() => {
          runInAction(() => {
            this.spinning = false;
          });
        });
    };

    // 勾选验证
    const { selectedIds = new Set() } = this.mainGridModel.gridModel;
    if (!selectedIds.size && !id) {
      this.noSelectWaring();
      return;
    }

    // 作废或反作废需要确认
    if (operationType.includes('invalidate')) {
      Modal.confirm({
        title: '提示',
        content: `确认要${operationType === 'invalidateOrders' ? '作废' : '反作废'}订单吗？`,
        onOk: () => {
          operationRequest();
        },
      });
      return;
    }

    // 审核/反审核不支持代发订单
    if (operationType.includes('checkOrders')) {
      const { selectRows } = this.mainGridModel.gridModel;
      if (selectRows.length && selectRows.some((item) => [
        1,
        2,
      ].includes(item.proxySendStatus))) {
        message.warning('选中的订单中包含代发订单，请重新选择。');
        return;
      }
    }
    if (operationType === 'beforeUncheckOrders') {
      const selectRows = toJS(this.mainGridModel.gridModel.selectRows);
      if (selectRows.some((item) => item.isChecked === 0)) {
        message.warning('选中的订单中包含未审核，请重新选择!');
        return;
      }
      const req = await request<BaseData<boolean>>({
        method: 'GET',
        url: '/api/saleorder/rest/config/get/unCheckVerifyCode',
      });
      if (selectRows.some((item) => item.courierPrintMarkState === 2) && req.data) {
        this.cryptographicCheckModel.onOpen(operationRequest);
        return;
      }
    }
    operationRequest();
  };

  // 处理合并
  @action public handleCombineOrders = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    if (this.spinning) {
      return;
    }
    this.spinning = true;
    const selectedArray = Array.from(this.mainGridModel.gridModel.selectedIds);
    request<BaseData>({
      url: api.combine,
      method: 'POST',
      data: { ids: selectedArray },
    }).then((res) => {
      message.success(res.data);
      this.resetTable();
    })
      .finally(() => {
        runInAction(() => {
          this.spinning = false;
        });
      });
  };

  // 处理批量重新拿货
  @action public handleBatchOutOfStock = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    const condition = this.disposeAuthorName(this.programme.filterItems.params);
    if ((condition['sku_purchase_state-4-21'] && condition['sku_purchase_state-4-21'] === '1') || (condition['purchase_state-4-13'] && condition['purchase_state-4-13'] === '2')) {
      const ids = Array.from(this.mainGridModel.gridModel.selectedIds).toString();
      const data = { ids };
      request<BaseData>({
        url: api.batchOutOfStock, // 旧页面代码/api/oms/rest/reu？但页面url是该地址
        method: 'POST',
        data,
      }).then((res) => {
        message.success('批量重新拿货成功！');
        this.resetTable();
      });
    } else {
      message.error('请先勾选：采购状态[已拿货]或整单拿货[采购完成]');
    }
  };

  // 处理生成采购订单
  @action public handleGeneratePmsOrder = (): void => {
    const selectedArray = Array.from(this.mainGridModel.gridModel.selectedIds);
    const condition = this.disposeAuthorName(this.programme.filterItems.params);
    if (!selectedArray.length && condition['purchase_order_no-7-21-4'] !== 'false') {
      message.warn('根据条件生成采购单时，必须勾选条件「生成采购单」为 「未采购订单」！');
      return;
    }

    const params = this.programme.filterItems.translateParams;
    const conditionText = params.map((item) => {
      return [...item.split(':')];
    });

    Modal.confirm({
      title: '提示',
      width: 416,
      content: (
        <>
          <p>
            {
              selectedArray.length ? '确定生成采购单?' : ' 是否根据如下条件生成采购单？'
            }
          </p>
          {
            !selectedArray.length && (
              <Descriptions
                bordered
                column={1}
                size="small"
              >
                {conditionText.map((v) => {
                  return (
                    <Descriptions.Item
                      key={v[0]}
                      label={v[0]}
                    >
                      {v[1]}
                    </Descriptions.Item>
                  );
                })}
              </Descriptions>
            )
          }
        </>
      ),
      onOk: () => {
        const vo = `vo=${ JSON.stringify(condition)}`;
        const data = selectedArray.length ? `mainIds=${selectedArray.join(',')}&${vo}` : vo;
        return request<BaseData>({
          url: api.generatePurchaseOrder,
          method: 'POST',
          data,
        }).then((res) => {
          message.success(res.data);
          this.resetTable();
        });
      },
    });
  };

  // 复制订单编号/买家昵称
  public copyText = (e): void => {
    const targetText = e.currentTarget.previousElementSibling.innerText;
    const temp = document.createElement('input');
    document.body.appendChild(temp);
    temp.setAttribute('value', targetText);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    message.success('复制成功');
  };

  public copyMutilColumnsText = (e, field): void => {
    e.stopPropagation();
    const selectedRows = this.mainGridModel.gridModel.selectRows;
    if (selectedRows.length === 0) {
      message.warning('请先选择订单');
      return;
    }
    const temp = document.createElement('textarea');
    const values = selectedRows.map(row => _.get(row, field)).filter(value => value).join('\n');
    if (!values) {
      message.warning('选中的记录中没有可复制的数据');
      return;
    }
    document.body.appendChild(temp);
    temp.value = values;
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    message.success('复制成功');
  };

  // reset主表
  @action public resetTable = (clearSelectedIds = true): void => {
    this.mainGridModel.gridModel.loading = true;
    setTimeout(() => {
      try {
        this.mainGridModel.gridModel.onRefresh();
        if (clearSelectedIds) {
          this.mainGridModel.gridModel.selectedIds = new Set();
        }
      } catch (e) {
        console.error(e);
        this.mainGridModel.gridModel.loading = false;
      }
    }, 1100);
  };

  // 新建订单/复制新建
  @action public handleOpenOrderModal = (amFlag: boolean): void => {
    // 复制新建
    if (amFlag) {
      // 是否选择订单
      if (!this.noSelectCheck()) {
        return;
      }

      // 是否只选择单条订单
      const { selectedIds = new Set() } = this.mainGridModel.gridModel;
      if (selectedIds.size > 1) {
        Modal.warning({ title: '只能选择单条订单！' });
        return;
      }
      const saleOrderId = Number(Array.from(selectedIds)[0]);

      this.orderStore.openOrderModal(amFlag, saleOrderId);
      return;
    }
    this.orderStore.openOrderModal(amFlag);
  };

  @action public handleOpenImportAddModal = (): void => {
    this.importModel.openModal(
      { sheetName: 'sale_order' }
    );
  };

  // 处理挂起订单
  @action public handleSuspend = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    this.suspendStore.showSuspendReasonModal();
  };

  // 处理导出（新版）
  @action public handleExport = (isSummary: number): any => {
    const selectedIds = Array.from(this.mainGridModel.gridModel.selectedIds);
    const params: any = this.disposeAuthorName(this.programme.filterItems.params);
    const queryParamShow = this.programme.filterItems.translateParams;
    let sheetName = ''; // 导出文件名
    let sheetType = ''; // 导出类型

    // 商品汇总导出不可以选择已打印状态订单
    if ((isSummary === 2 || isSummary === 4) && params['courier_print_mark_state-4-14'] === '2') {
      return message.warning('请选择未打印订单');
    }

    // 商品汇总导出默认打印状态为未打印
    if (isSummary === 2) {
      params['courier_print_mark_state-4-14'] = '1';
      sheetName = '商品汇总导出（仅限未打印）';
      sheetType = 'sale_order_detail_item';
    } else {
      sheetName = '订单导出';
      sheetType = 'sale_order_detail';
    }
    if (isSummary === 4) {
      params['courier_print_mark_state-4-14'] = '1';
      sheetName = '按供应商导出（仅限未打印）';
      sheetType = 'sale_order_vendor_sum';
    }

    // 处理平台单号和快递单号的批量查询
    let platOrderNo = params['origin_platform_order_code-4-20'];
    let courierNo = params['courier_order_no-4-14'];
    let numIid = params['num_iid-4-20'];
    if (numIid) {
      numIid = numIid.split(' ').filter((item) => item.length)
        .join(',');
      params['num_iid-4-20'] = numIid;
    }
    if (platOrderNo) {
      platOrderNo = platOrderNo.split(' ')
        .filter((item) => item.length)
        .join(',')
        .replace(/-S\d/gm, '');
      params['origin_platform_order_code-4-20'] = platOrderNo;
    }

    if (courierNo) {
      courierNo = courierNo.split(' ')
        .filter((item) => item.length)
        .join(',');
      params['courier_order_no-4-14'] = courierNo;
    }
    const reg = new RegExp(/[=|{|}]+/g);
    if (params['courier_order_no-4-14'] && reg.test(params['courier_order_no-4-14'])) {
      return message.error('快递单号格式错误！');
    }
    if (selectedIds.length === 0) {
      Modal.confirm({
        title: '提示',
        content: '未选择数据将导出全部数据?',
        onOk: () => {
          if (isSummary === 3) {
            this.exportOrderModel.changeVisible(true, '', params, queryParamShow.join(' '), sheetName, sheetType, 0);
            return;
          }
          this.exportStore.onShow(sheetName, sheetType, '', params, queryParamShow.join(' '), {}); // ids不传即代表导出全部数据
        },
      });
      return;
    }
    if (isSummary === 3) {
      this.exportOrderModel.changeVisible(true, selectedIds.join(','), params, queryParamShow.join(' '), sheetName, sheetType, 0);
      return;
    }
    this.exportStore.onShow(sheetName, sheetType, selectedIds.join(','), {}, queryParamShow.join(' '), {});
  };

  // 处理平台预发货
  @action public handlePreShipment = (): void => {
    const { selectRows } = this.mainGridModel.gridModel;

    // if (selectRows.length && selectRows.some((item) => item.proxySendStatus)) {
    //   message.warning('请选择无需代发订单');
    //   return;
    // }
    this.preShipmentModel.showPreShipmentModal();
  };

  // 处理上传备注
  @action public handleUploadRemark = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    this.remarkStore.openRemarkModal();
  };

  // 处理设置分组
  @action public handleSetGroup = (): void => {
    this.setGroupStore.openGroupModal();
  };

  // 明细汇总预览
  @action public handleDetailPreview = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    const ids = Array.from(this.mainGridModel.gridModel.selectedIds).join(',');
    sessionStorage.setItem('previewIds', ids);
    window.open(`${window.location.origin}/jumai-ts-oms/detailPreview`);
  };

  public onCopy = (): void => {
    message.success('复制成功');
  };

  // 主表更新快递/仓库（type true为快递 false为仓库）
  @action public handleChangeCourierOrWarehouse = (flag, option, row): void => {
    const data = { orderId: row.saleOrderId };
    flag ? Object.assign(data, { courierId: Number(option.key) }) : Object.assign(data, { warehouseId: Number(option.key) });
    request<BaseData>({
      url: flag ? api.updateCourierId : api.updateWarehouseId,
      method: 'POST',
      data,
    }).then((res) => {
      message.success('操作成功');
      this.resetTable();
    });
  };

  // 已阅
  @action public updateReadMark = (id, type): void => {
    const data = {
      id,
      type,
    };

    request<BaseData>({
      url: '/api/saleorder/rest/memo/updateReadMark',
      method: 'POST',
      data,
    }).then((res) => {
      this.resetTable(false);
    });
  };

  // 打开添加商品弹窗
  @action public handleAddProduct = (moreFlag?: boolean): void => {
    // 勾选验证
    const { selectRows } = this.mainGridModel.gridModel;
    if (!selectRows.length) {
      this.noSelectWaring();
      return;
    }

    if (!moreFlag && selectRows.length > 1) {
      Modal.warning({
        title: '提示',
        content: '只能选择单条订单！',
      });
      return;
    }

    if (moreFlag && selectRows.length === 1) {
      Modal.warning({
        title: '提示',
        content: '请选择多条订单',
      });
      return;
    }

    for (let i = 0; i < selectRows.length; i++) {
      const row = selectRows[i];
      if (row.is_suspended_code === 1) {
        message.error(`订单编号[ ${row.saleOrderNo} ]已挂起`);
        return;
      }
      if (row.is_checked_code === 1) {
        message.error(`订单编号[ ${row.saleOrderNo} ]已审核`);
        return;
      }
      if (row.agent_deliver === 1) {
        message.error('代发订单不能添加商品');
        return;
      }
    }

    this.addProductStore.openAddProductModal();
  };

  // 打开标签设置弹窗
  @action public handleMemoSet = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    this.setMemoStore.openMemoModal();
  };

  // 打开修改仓库快递弹窗
  @action public handleOpenModidfyWareCourier = (): void => {
    const isProxySend = this.mainGridModel.gridModel.selectRows.every((item) => !item.proxySendStatus || item.proxySendStatus === 3);
    if (!isProxySend) {
      message.error('勾选订单中存在代发订单，无法进行批量操作！！！');
      return;
    }
    if (!this.noSelectCheck()) {
      return;
    }
    this.modifyWareCourierStore.openModal();
  };

  // 打开客服备注/订单备注/便签弹窗
  @action public handleOpenModifyRemark = (key: string): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    this.modifyRemarkStore.openModal(key);
  };

  // 打开重算订单弹窗
  @action public handleOpenReRunModal = (): void => {
    this.reRunBatchStore.openModal();
  };

  // 按分录拆分
  @action public handleDetailSplit = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    this.detailSplitStore.openModal();
  };

  // 缺货拆分
  @action public handleLackSplit = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }

    Modal.confirm({
      title: '提示',
      content: '缺货订单将被拆分，确认吗？',
      onOk: () => {
        request<BatchReportData>({
          url: '/api/saleorder/rest/split/splitByOutOfStock',
          method: 'POST',
          data: { ids: Array.from(this.mainGridModel.gridModel.selectedIds) },
        }).then((res) => {
          this.handleShowFailDialog(res);
          this.resetTable();
        });
      },
    });
  };

  @action
  public handleByWeightSplit = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    const isCourierPrintMarkState = this.mainGridModel.gridModel.selectRows.every((item) => {
      return item.courierPrintMarkState === 1;
    });
    if (!isCourierPrintMarkState) {
      message.warning('只能勾选未打印验货的订单进行操作');
      return;
    }
    this.byWeightModel?.onShow(Array.from(this.mainGridModel.gridModel.selectedIds));
  };

  // 拿货拆分
  @action public handlePurchaseSplit = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }

    Modal.confirm({
      title: '提示',
      content: '订单将会被按拿货状态进行拆分,确认吗？',
      onOk: () => {
        return request<BatchReportData>({
          url: '/api/saleorder/rest/split/purchaseSplit',
          method: 'POST',
          data: { ids: Array.from(this.mainGridModel.gridModel.selectedIds) },
        }).then((res) => {
          this.handleShowFailDialog(res);
          this.resetTable();
        });
      },
    });
  };

  // 自由拆分
  @action public handleFreeSplit = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    const selectedArray = Array.from(this.mainGridModel.gridModel.selectedIds);
    if (selectedArray.length > 1) {
      Modal.warning({
        title: '提示',
        content: '只能选择单条订单！',
      });
      return;
    }
    const corderId = selectedArray[0];
    this.freeSplitStore.getTopGridRow(corderId);
  };

  // bySku拆分
  @action public handleBySkuSplit = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    const orderIds = Array.from(this.mainGridModel.gridModel.selectedIds).toString();
    this.bySkuSplitStore.openModal(orderIds);
  };

  // 按供应商拆分
  @action
  public handleSupplierSplit = async() => {
    if (!this.noSelectCheck()) {
      return;
    }

    // 只能拆分未打印、未验货、未挂起的订单
    const checkPassed = this.mainGridModel.gridModel.selectRows.every((item) => {
      const isPrinted = item.courierPrintMarkState !== 1;
      const isChecked = Boolean(item.checkedTime);
      const isSuspended = item.isSuspended === 1;
      return !isPrinted && !isChecked && !isSuspended;
    });
    if (!checkPassed) {
      message.warning('只能勾选未打印、未验货、未挂起的订单进行操作');
      return;
    }
    try {
      await syncConfirm({ title: '是否确认将选中的订单按照供应商进行拆分？' });
      this.spinning = true;
      const ids = Array.from(this.mainGridModel.gridModel.selectedIds);
      await request<BaseData>({
        url: '/api/saleorder/rest/split/splitByVendor',
        method: 'POST',
        data: { ids },
      });
      message.success('操作成功');
      this.resetTable();
    } finally {
      this.spinning = false;
    }
  };

  /**
   * 预售拆分
   */
  @action
  public handleSplitPreSaleSku = async() => {
    const ids = Array.from(this.mainGridModel.gridModel.selectedIds);
    if (!ids.length) {
      message.error('请选择操作订单！');
      return;
    }
    const req = await request<BatchReportData>({
      method: 'POST',
      url: '/api/saleorder/rest/split/splitPreSaleSku',
      data: { ids },
    });
    renderModal(
      <BatchReport
        {...req.data}
        columns={[
          {
            title: '订单编号',
            dataIndex: 'saleOrderNo',
          },
          {
            title: '失败原因',
            dataIndex: 'reason',
          },
        ]}
      />
    );
  };

  // 按退款商品拆分
  @action
  public handleRefoundProductSplit = async() => {
    if (!this.noSelectCheck()) {
      return;
    }

    // 只能拆分未打印、未验货、未挂起的订单
    const checkPassed = this.mainGridModel.gridModel.selectRows.every((item) => {
      const isPrinted = item.courierPrintMarkState !== 1;
      const isChecked = Boolean(item.checkedTime);
      const isSuspended = item.isSuspended === 1;
      return !isPrinted && !isChecked && !isSuspended;
    });
    if (!checkPassed) {
      message.warning('只能勾选未打印、未验货、未挂起的订单进行操作');
      return;
    }
    try {
      await syncConfirm({ title: '是否确认将选中的订单中退款成功的商品拆分成独立子订单？' });
      this.spinning = true;
      const ids = Array.from(this.mainGridModel.gridModel.selectedIds);
      await request<BaseData>({
        url: '/api/saleorder/rest/split/splitTerminateDetail',
        method: 'POST',
        data: { ids },
      });
      message.success('操作成功');
      this.resetTable();
    } finally {
      this.spinning = false;
    }
  };

  // 按比例拆分
  @action public handlePercentageSplit = (): void => {
    if (!this.noSelectCheck()) {
      return;
    }
    const orderIds = Array.from(this.mainGridModel.gridModel.selectedIds).toString();
    this.byPercentageStore.openModal(orderIds);
  };

  // 拆分/合并订单还原 flag为true为拆分订单 false为合并
  @action public combineSplitReturn = async(flag: boolean, orderID: number) => {
    const data = { orderID };
    const queryRes = await request<BaseData<csRes[]>>({
      url: api.splitCombineQuery,
      method: 'POST',
      data: { ids: orderID },
    });
    if (!queryRes.data.length) {
      message.error('无数据，无法显示原平台单！');
      return;
    }
    Modal.confirm({
      title: flag ? '拆分订单还原' : '合并订单还原',
      icon: null,
      content: flag ? (
        <Descriptions
          bordered
          column={1}
          size="small"
        >

          <Descriptions.Item
            label="平台单号"
          >
            {queryRes.data.map((item) => `${item.platformOrderCode}
            `)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <>
          <Descriptions
            bordered
            column={1}
            size="small"
          >

            <Descriptions.Item
              label="平台单号"
            >
              {queryRes.data.map((item) => `${item.platformOrderCode}
            `)}
            </Descriptions.Item>
          </Descriptions>
          <Checkbox
            defaultChecked={this.mergeReturnOutMerge}
            onChange={(e) => {
              this.mergeReturnOutMerge = e.target.checked;
            }}
            style={{ marginTop: 12 }}
          >
            合并还原后不可再次合并
          </Checkbox>
        </>
      ),
      okText: '还原',
      onOk: () => {
        return request<BaseData>({
          url: flag ? api.splitReturn : api.combineReturn,
          method: 'POST',
          data: flag ? { id: orderID } : {
            saleOrderId: orderID,
            mergeReturnOutMerge: this.mergeReturnOutMerge,
          },
        }).then((res) => {
          console.log(res);
          message.success(res.data);
          this.resetTable();
        })
          .catch((e) => {
            console.log(e);
          })
          .finally(() => {
            runInAction(() => {
              this.mergeReturnOutMerge = false;
            });
          });
      },
      onCancel: () => {
        runInAction(() => {
          this.mergeReturnOutMerge = false;
        });
      },
    });
  };

  // 优先发货
  @action public priorityDelivery = () => {
    if (!this.noSelectCheck()) {
      return;
    }
    const selectRows = Array.from(this.mainGridModel.gridModel.selectRows);

    if (selectRows.length && selectRows.some((item) => item.proxySendStatus && Number(item.proxySendStatus) !== 2)) {
      message.warning('请选择无需代发或已代发订单');
      this.spinning = false;
      return;
    }
    if (this.spinning) {
      return;
    }
    this.spinning = true;

    // 判断是否打印或验货
    if (selectRows.some((item) => (item.courierPrintMarkState === 2 || item.isSuspended || item.orderType === 6))) {
      Modal.warning({
        title: '提示',
        content: '只能选择未打印和未挂起的有效订单',
      });
      this.spinning = false;
      return;
    }

    const ids = Array.from(this.mainGridModel.gridModel.selectedIds).join(',');

    // 发起请求
    request<BaseData>({
      url: '/api/oms/rest/logistics/priority',
      method: 'POST',
      data: { ids },
    }).then((res) => {
      this.resetTable();
      message.success('操作成功');
    })
      .finally(() => {
        runInAction(() => {
          this.spinning = false;
        });
      });
  };

  // 整单优先发货
  @action public allPriorityDelivery = () => {
    if (!this.noSelectCheck()) {
      return;
    }
    const selectRows = Array.from(this.mainGridModel.gridModel.selectRows);

    if (selectRows.length && selectRows.some((item) => item.proxySendStatus)) {
      message.warning('请选择无需代发订单');
      return;
    }
    if (this.spinning) {
      return;
    }
    this.spinning = true;
    const ids = Array.from(this.mainGridModel.gridModel.selectedIds).join(',');
    request<BaseData>({
      url: '/api/saleorder/rest/order/whole/logistics/priority',
      method: 'POST',
      data: { ids },
    }).then((res) => {
      this.resetTable();
      message.success('操作成功');
    })
      .finally(() => {
        runInAction(() => {
          this.spinning = false;
        });
      });
  };

  /**
   * 清空格子
   */
  @action
  public emptySquares = (): any => {
    if (!this.visible) {
      const { selectRows } = this.programme.gridModel.gridModel;
      if (selectRows.length === 0) {
        return message.error('请勾选未打印订单！');
      }
      const isPrint = this.mainGridModel.gridModel.selectRows.every((item) => item.courierPrintMarkState === 1);
      if (!isPrint) {
        return message.error('只能勾选未打印订单！');
      }
    }
    this.visible = !this.visible;
  };

  @action
  public onOk = async() => {
    await request<BaseData<string | undefined>>({
      method: 'POST',
      url: '/api/saleorder/rest/cellNo/clearCellNo',
      data: { saleOrderIds: Array.from(this.programme.gridModel.gridModel.selectedIds) },
    });
    message.success('操作成功');
    this.emptySquares();
    this.resetTable();
  };

  /**
   * 强制合并
   */
  @action public forcedMergers = () => {
    const { selectRows } = this.programme.gridModel.gridModel;
    try {
      if (selectRows.length <= 1) {
        message.error('请至少选择两条订单进行强制合并');
        return;
      }
      const {
        warehouseId,
        shopId,
      } = selectRows[0];
      const isConditions = selectRows.every((item) => {
        return item.isInvalidated === 0 && item.isChecked === 0 && item.warehouseId === warehouseId && item.shopId === shopId;
      });
      if (!isConditions) {
        message.error('强制合并订单必须是(未审核、同仓库、同店铺、非无效商品)');
        return;
      }
      const data = toJS(selectRows)
        .map((item, index) => {
          return {
            shopId: item.shopId,
            serialNumber: index + 1,
            saleOrderId: item.saleOrderId,
            platformType: item.platformType,
            platformOrderCode: item.platformOrderCode,
            buyerNick: item.buyerVo?.buyerNick,
            receiverName: item.receiverVo?.receiverName,
            receiverMobile: item.receiverVo?.receiverMobile,
            receiverState: item.receiverVo?.receiverState,
            receiverCity: item.receiverVo?.receiverCity,
            receiverDistrict: item.receiverVo?.receiverDistrict,
            receiverAddress: item.receiverVo?.receiverAddress,
          };
        });

      this.forcedMergersModel.onOpen(data);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * 代发
   */
  public handleWholesale = () => {
    const selectRows = this.mainGridModel.gridModel.selectRows;
    const queryParams = this.programme.filterItems.params;
    this.dropShippingTipStore.toggleDropModal(true, selectRows, queryParams);
  };

  private handleShowFailDialog = (data): void => {
    renderModal(
      <BatchReport
        {...data.data}
        columns={[
          {
            title: '订单编号',
            dataIndex: 'saleOrderNo',
          },
          {
            title: '失败原因',
            dataIndex: 'reason',
          },
        ]}
      />
    );
  };

  /**
   * 剩余发货时间
   */
  @action
  public remainingDeliveryTime = (row) => {
    // 已打印的不显示剩余发货时间
    if (row.courierVo?.courierPrintMarkState !== 1) {
      return '';
    }
    if (moment(row.deadlineLogisticsTime).valueOf() - moment().valueOf() > 0) {
      return this.dateFormat(moment(row.deadlineLogisticsTime).valueOf() - moment().valueOf());
    }

    if (moment(row.deadlineLogisticsTime).valueOf() - moment().valueOf() < 0) {
      return (
        <span style={{ color: 'red' }}>
          已超时
          {this.dateFormat(moment().valueOf() - moment(row.deadlineLogisticsTime).valueOf())}
        </span>
      );
    }
    return '0时0分';
  };

  @action
  public onCancel = (): void => {
    const selectedRows = this.programme.gridModel.gridModel.selectRows;
    if (!selectedRows.length) {
      message.error('至少勾选一条未代发状态的订单');
      return;
    }

    if (selectedRows.every((item) => item.proxySendStatus === 1 || item.proxySendStatus === 2)) {
      Modal.confirm({
        title: '提示',
        content: '是否确认将选中的订单取消代发？',
        okText: '确定',
        cancelText: '取消',
        onOk: async() => {
          try {
            const ids = Array.from(this.programme.gridModel.gridModel.selectedIds);
            const req = await request<BatchReportData>({
              method: 'POST',
              url: '/api/saleorder/rest/proxySend/cancel',
              data: { ids: ids.map((id) => `${id}`) },
            });
            renderModal(
              <BatchReport
                columns={[
                  {
                    title: '订单编号',
                    dataIndex: 'saleOrderNo',
                  },
                  {
                    title: '取消代发结果',
                    dataIndex: 'reason',
                  },
                ]}
                {...req.data}
              />);
            await this.programme.handleSearch();
          } catch (e) {
            console.log(e);
          }
        },
      });
    } else {
      message.error('只能对未代发或已代发的订单进行操作!');
    }
  };

  // 时分秒换算
  @action
  public dateFormat = (micro_second) => {
  // 总秒数
    const second = Math.floor(micro_second / 1000);

    // 天数
    const day = Math.floor(second / 3600 / 24);

    // 小时
    const hr = Math.floor(second / 3600 % 24);

    // 分钟
    const min = Math.floor(second / 60 % 60);

    // 秒
    const sec = Math.floor(second % 60);
    return `${day > 0 ? `${day}天` : '' }${ hr }小时${ min }分钟`;
  };

  @action
  public onWangWangLink = async(saleOrderId: number, shopId: number) => {
    const req = await request<BaseData<any>>({
      method: 'GET',
      url: '/api/saleorder/rest/receiver/getBuyerOpenUid',
      params: {
        saleOrderId,
        shopId,
      },
    });

    this.mainGridModel.gridModel.rows = this.mainGridModel.gridModel.rows.map((item) => {
      if (item.saleOrderId === saleOrderId) {
        item.appKey = req.data.appKey;
        item.bizDomain = req.data.bizDomain;
        item.encryptuid = req.data.buyerOpenUid;

        // item.buyerNick = req.data.sellerNick;
      }

      return item;
    });
    setTimeout(() => {
      const newWindow: any = window;
      newWindow?.Light?.init();
    });
  };

  // 获取图片或sku展示配置
  @action
  public getShowImageConfig = async() => {
    const req = await request<BaseData<string>>({
      url: '/api/oms/rest/config/getShowImageConfig',
      method: 'post',
    });
    this.productDisplay = req.data;
  };

  // 主表内容
  public mainGridModel = new MainSubStructureModel({
    buttons: buttons(this),
    pageId: '505',
    btnExtraRight: (
      <Button onClick={() => {
        Modal.confirm({
          title: '提示',
          content: '确认切换到聚麦经典版吗？',
          onOk: () => {
            try {
              window.top.egenie.toggleVersion(505, 1);
            } catch (e) {
              console.log(e);
            }
          },
        });
      }}
      >
        切换
      </Button>
    ),
    grid: {
      primaryKeyField: 'saleOrderId',
      columns: columns(this, true).map((item) => {
        return {
          draggable: true,
          resizable: true,
          ...item,
        };
      }),
      rows: [],
      forceRowClick: false,
      showCheckBox: true,
      sortByLocal: false,
      showNormalEmpty: true,
      pageSize: 50,
      setColumnsDisplay: true,
      gridIdForColumnConfig: 'tsOrderDealMainTable',
      sumColumns: [
        {
          decimal: 2,
          key: 'payment',
          name: '实付金额:',
          tag: 'price',
          rule: (row) => {
            return Number(row.saleOrderFinanceVo?.payment);
          },
        },
        {
          key: 'totalNum',
          name: '总件数:',
          tag: 'number',
        },
      ],
      onSelectSum: true,
    },
    api: {
      onQuery: async(params) => {
        await new Promise((resolve, reject) => {
          setTimeout(() => resolve(true), 1100);
        });

        // 处理平台单号和快递单号的批量查询
        params.filterParams = params.filterParams ?? {};
        let platOrderNo = params.filterParams['origin_platform_order_code-4-20'];
        let courierNo = params.filterParams['courier_order_no-4-14'];
        let numIid = params['num_iid-4-20'];
        if (numIid) {
          numIid = numIid.split(' ').filter((item) => item.length)
            .join(',');
          params['num_iid-4-20'] = numIid;
        }
        if (platOrderNo) {
          platOrderNo = platOrderNo.split(' ').filter((item) => item.length)
            .join(',')
            .replace(/-S\d/gm, '');
          params.filterParams['origin_platform_order_code-4-20'] = platOrderNo;
        }
        if (params.filterParams['buyer_nick-14-12'] && params.filterParams['buyer_nick-14-12'].split(' ').length > 1) {
          params.filterParams['buyer_nick-14-12'] = params.filterParams['buyer_nick-14-12'].split(' ').filter((item) => item)
            .join(',');
        }

        if (courierNo) {
          courierNo = courierNo.split(' ').filter((item) => item.length)
            .join(',');
          params.filterParams['courier_order_no-4-14'] = courierNo;
        }
        const reg = new RegExp(/[=|{|}]+/g);
        if (params.filterParams['courier_order_no-4-14'] && reg.test(params.filterParams['courier_order_no-4-14'])) {
          return new Promise(() => {
            this.programme.isSearch = false;
            this.mainGridModel.gridModel.loading = false;
            return message.error('快递单号格式错误！');
          });
        }
        console.log('params.filterParams....', qs.stringify(params.filterParams));
        const vo = JSON.stringify(this.disposeAuthorName(params.filterParams)) || {};

        return request<PaginationData<MainTableList>>({
          method: 'POST',
          url: api.querySaleOrderList,
          data: qs.stringify({
            ...(_.omit(params, ['filterParams'])), // 后端架构暂时改不了，沿用之前的请求
            vo,
          }),
        }).then((res) => {
          res.data.list = updateTime(res.data.list, true, this);
          return { data: res.data };
        });
      },
    },
    hiddenSubTable: true,
  });

  public programme = new Programme({
    gridModel: this.mainGridModel,
    fieldMap: {
      order_type: 'order_type-4-10',
      blacklist_type: 'blacklist_type-4-1',
      purchase_state_type: 'purchase_state-4-13',
      courier_print_mark_state: 'courier_print_mark_state-4-14',
      sku_purchase_state_type: 'sku_purchase_state-4-21',
      origin_type: 'origin_type-4-10',
      pay_type: 'pay_type-4-1',
      cn_service: 'cn_service-4-17',
      trade_from: 'trade_from-4-10',
      trade_memo: 'trade_memo-1-10',
      system_order_state: [
        'tmser_spu_code-4-20',
        'distribution_state-4-13',
      ],
      courier: 'courier_id-4-14',
      wms_order_state: 'wms_order_state-4-13',
    },
    filterItems: [
      ...filterItems(this, true),
      {
        type: 'select',
        field: 'real_platform_type-4-10',
        label: '原始来源平台',
      },
    ],
    moduleName: 'OMSOrdersNew',
    showProgrammeCount: true,
    dictList: 'order_type,blacklist_type,purchase_state_type,courier_print_mark_state,sku_purchase_state_type,origin_type,pay_type,cn_service,trade_from,system_order_state,trade_memo',
    itemList: 'dts_status_adapter,courier,wms_order_state',
  });

  public disposeAuthorName = (filterParams: {[key: string]: any; }): {[key: string]: any; } => {
    const params = toJS(filterParams);
    if (params['author_name-14-10'] || [
      'SEARCH_FOR_IS_NULL',
      'SEARCH_FOR_IS_NOT_NULL',
    ].some((item) => item === params['author_name-14-10_type'])) {
      const type = params['author_name-14-10_type'];
      if (type === '0' || type === '1') {
        params['author_name-14-10'] = `${type === '0' ? 'CONTAIN' : 'NOT_CONTAIN'};${ params['author_name-14-10']}`;
      } else {
        params['author_name-14-10'] = params['author_name-14-10_type'];
      }
      delete params['author_name-14-10_type'];
    } else {
      delete params['author_name-14-10_type'];
      delete params['author_name-14-10'];
    }
    return params;
  };

  // 获取是否开启代发服务
  private getProxySendStatus = () => {
    request<BaseData<boolean>>({
      url: '/api/saleorder/rest/config/get/proxySend',
      method: 'GET',
    }).then((resposne) => {
      this.isProxySend = resposne.data;
    });
  };

  // 获取平台列表
  private getPlatformList = () => {
    request<BaseData<Platform[]>>({
      url: '/api/baseinfo/rest/thirdPlatform/getDict',
      method: 'GET',
    }).then(({ data }) => {
      this.platformList = data;
    });
  };

  // 根据平台code获取图标链接
  public getPlatformIconByCode = (code: number) => {
    const platform = this.platformList.find((i) => i.platformType === code);
    return platform?.iconUrl;
  };
}

export type IParentStore = Store;
