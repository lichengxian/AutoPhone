auto();
const cfg = require("./config");
let { logout } = require("./utils");
const SignIn_QQSG = require("./signIn-QQSG");

const init = () => {
  if (cfg.debug) console.show(); // 调试打开控制台
  events.observeNotification(); // 开启通知栏监听
  const logPath = files.path("./log.txt");
  if (files.exists(logPath)) files.remove(logPath); // 清空日志
  logout("启动成功");
};
const exitAll = () => {
  logout("执行完毕");
  exit();
};

init();
// QQ三国每日签到
const task1 = new SignIn_QQSG(cfg.QQSG).start();
task1.then(exitAll);
