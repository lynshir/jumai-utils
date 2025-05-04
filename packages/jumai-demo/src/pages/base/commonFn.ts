
// 计算剩余发货时间
export const updateTime = (rows, init, context) => {
  console.log('开始执行剩余发货时间计算！！！');
  if (!init) {
    rows = context.programme.gridModel.gridModel.rows;
  }

  // _rows = rows.filter(el => el.is_platform_logistics_code !== 1 && el.deadline_logistics_time)
  const _rows = rows.map((el) => {
    // 后端没传截止时间或者平台已发货不做处理
    if (el.platformLogisticsCode || !el.deadlineLogisticsTime) {
      el.surplusProcessTime = '';
      el.jiCode = false;

      return { ...el };
    }
  
    return remainingTime(el);
  });
  if (!init) {
    context.programme.gridModel.gridModel.rows = _rows;
  }
  if (context.timer) {
    clearTimeout(context.timer);
  }
  context.timer = setTimeout(context.updateTime, 60000); // 每5分钟跑一次
  return _rows;
};

// 剩余时间处理
export const remainingTime = (row) => {
  const [deadline] = [
    row.deadlineLogisticsTime,
    row.saleOrderId,
  ]; // 截止时间
  const early_now = Date.parse(deadline) - Date.now(); // 截止时间和现在的时间间隔
  const three_day = 1000 * 60 * 60 * 24 * 3;
  const six_hour = 1000 * 60 * 60 * 6;
  const twelve_hour = 1000 * 60 * 60 * 12;
  const pms = {
    sec: '00',
    mini: '00',
    hour: '00',
    day: '00',
    month: '00',
    year: '0',
  };

  // 三天之内做判断
  const dur = early_now / 1000;

  function zero(n) {
    n = parseInt(n, 10);
    if (n > 0) {
      if (n <= 9) {
        // 个位数时间前面补0
        n = `0${ n}`;
      }
      return String(n);
    } else {
      return '00';
    }
  }

  pms.mini = Math.floor(dur / 60) > 0 ? zero(Math.floor(dur / 60) % 60) : '00'; // 剩余分钟
  pms.hour = Math.floor(dur / 3600) > 0 ? zero(Math.floor(dur / 3600) % 24) : '00'; // 剩余小时
  pms.day = Math.floor(dur / 86400) > 0 ? zero(Math.floor(dur / 86400) % 30) : '0'; // 剩余天数

  if (early_now <= three_day && early_now >= 0) {
    row.surplusProcessTime = `${pms.day}天${pms.hour}时${pms.mini}分`;
    if (early_now <= twelve_hour) {
      row.jiCode = 1;
    }
  }
  if (early_now < 0) {
    // 平台发货仍未发货 return '已逾期'
    // temp = ((+plat_code === 1) ? '' : showMark() && '已逾期')
    row.surplusProcessTime = '已逾期';
    row.jiCode = 1;
  }
  return { ...row };
};
