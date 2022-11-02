let {
  widgetOpt,
  widgetEnsure,
  killApp,
  getVerificationCode,
  logout,
} = require("./utils");

function SignInQQSG(user) {
  this.widget;
  this.user = user;
}
// 打开浏览器访问登录网页
SignInQQSG.prototype.openLoginPage = function () {
  return new Promise((resolve) => {
    app.openUrl("https://sg.qq.com/cp/a20200228signin/index.html");
    this.widget = text("确认").findOne(cfg.timeout); // 登录时间过长弹窗
    if (this.widget) {
      widgetOpt(this.widget, "弹窗确认", "click");
      this.widget = widgetEnsure(text("[登录]"));
      widgetOpt(this.widget, "跳转登录", "click");
    }
    resolve();
  });
};
// 登录账号
SignInQQSG.prototype.login = function (username, password) {
  return new Promise((resolve) => {
    this.widget = widgetEnsure(
      className("android.view.View").depth(8).indexInParent(1)
    ); // 确保界面正确
    this.widget = className("android.widget.EditText")
      .depth(11)
      .clickable(true)
      .untilFind();
    widgetOpt(this.widget[0], "账号输入", "setText", username);
    widgetOpt(this.widget[1], "密码输入", "setText", password);
    this.widget = widgetEnsure(text("登录"));
    widgetOpt(this.widget, "点击登录", "click");
    resolve();
  });
};
// 点击签到
SignInQQSG.prototype.signIn = function () {
  return new Promise((resolve) => {
    this.widget = widgetEnsure(text("立即签到")); // 确保界面正确
    widgetOpt(this.widget, "点击签到", "click"); // 签到
    this.widget = text("javascript:closeDialog();").findOne(cfg.timeout);
    if (this.widget) widgetOpt(this.widget, "关闭签到", "click"); // 确认签到
    else {
      this.widget = widgetEnsure(text("确定").depth(1).clickable(true));
      widgetOpt(this.widget, "已经签到", "click"); // 已经签到
    }
    this.widget = widgetEnsure(text("注销"));
    widgetOpt(this.widget, "注销", "click"); // 注销账号
    this.widget = widgetEnsure(text("[登录]"));
    widgetOpt(this.widget, "下一个号", "click"); // 登录
    resolve();
  });
};
// 输入验证码
SignInQQSG.prototype.inputVCode = function () {
  return new Promise((resolve) => {
    this.widget = text("发送验证码").findOne(cfg.timeout);
    if (this.widget) {
      widgetOpt(this.widget, "发送验证码", "click");
      getVerificationCode().then((vcode) => {
        this.widget = className("android.widget.EditText")
          .depth(14)
          .clickable(true)
          .untilFind();
        widgetOpt(this.widget[1], "输入验证码", "setText", vcode);
        this.widget = widgetEnsure(text("确定").depth(13));
        widgetOpt(this.widget, "点击确定", "click");
        logout("等待60s");
        sleep(60000);
        logout("计时结束");
        resolve();
      });
    } else resolve();
  });
};
//整体流程
SignInQQSG.prototype.start = function () {
  return new Promise((resolve) => {
    this.openLoginPage()
      .then(() => {
        return new Promise((resolve) => {
          let repeat = Promise.resolve();
          for (let { username, password } of this.user) {
            (function () {
              let [u, p, _this] = Array.prototype.slice.call(arguments);
              repeat = repeat.then(() => {
                return new Promise((resolve) => {
                  _this
                    .login(u, p)
                    .then(_this.inputVCode)
                    .then(_this.signIn)
                    .then(resolve);
                });
              });
            })(username, password, this);
          }
          repeat.then(resolve);
        });
      })
      .then(killApp)
      .then(resolve);
  });
};

module.exports = SignInQQSG;
