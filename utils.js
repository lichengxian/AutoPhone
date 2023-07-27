const cfg = require("./config");
const logPath = files.path("./log.txt");

// 控件的各种操作
const options = {
  click: (widget) => {
    click(widget.bounds().centerX(), widget.bounds().centerY());
  },
  setText: (widget, str) => {
    widget.setText(str);
  },
};

const utils = {
  // 日志输出
  logout: function (string) {
    if (!files.exists(logPath)) files.create(logPath);
    let context = files.read(logPath);
    const str = `[${new Date().toLocaleString()}]: ${string}\n`;
    files.write(logPath, str + context);
    if (cfg.debug) console.log(string);
  },
  // 脚本启动初始化
  init: function () {
    if (cfg.debug) console.show(); // 调试打开控制台
    events.observeNotification(); // 开启通知栏监听
    if (files.exists(logPath)) files.remove(logPath); // 清空日志
    this.logout("启动成功");
  },
  // 脚本执行完毕
  exitAll: function () {
    this.logout("执行完毕");
    exit();
  },
  // 确保找到控件，否则中断程序
  widgetEnsure: function (widget) {
    const ensure = widget.findOne(cfg.timeout);
    if (!ensure) {
      this.logout("未找到控件，程序中断");
      exit();
      return;
    }
    return ensure;
  },
  // 操作控件
  widgetOpt: function (widget, optDesc, opt, arg) {
    if (cfg.debug) console.hide();
    this.logout(optDesc);
    options[opt](widget, arg);
    if (cfg.debug) console.show();
    sleep(cfg.delayTime);
    return Boolean(widget);
  },
  // 手势滑动操作
  gestureOpt: function () {
    const arg = Array.prototype.slice.call(arguments);
    for (let i = 1; i < arg.length; i++) {
      arg[i][0] *= device.width;
      arg[i][1] *= device.height;
    }
    gesture.apply(null, arg);
    sleep(cfg.delayTime);
  },
  // 复制短信验证码
  getVerificationCode: function () {
    return new Promise((resolve) => {
      const getNotification = (n) => {
        const context = n.getText();
        if (
          n.getPackageName() === "com.android.mms" &&
          Math.abs(new Date().getTime() - n.when) < 20000 &&
          context
        ) {
          const res = context.match(/\d{6}/g);
          if (!res) {
            this.logout("未匹配到验证码");
            exit();
          } else {
            this.logout("验证码为：" + res[0]);
            events.removeAllListeners(["notification"]);
            resolve(res[0]);
          }
        }
      };
      events.on("notification", getNotification);
    });
  },
  // 关闭当前应用
  killApp: function () {
    home();
    sleep(cfg.delayTime);
    recents();
    sleep(cfg.delayTime);
    gestureOpt(500, [1 / 2, 2 / 3], [1 / 2, 1 / 4]);
    home();
  },
}

// 绑定this
for (let key of Object.keys(utils)) {
  utils[key] = utils[key].bind(utils);
}

module.exports = utils;
