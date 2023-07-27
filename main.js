auto(); // 检测无障碍服务是否启动
const cfg = require("./config");
const { init, exitAll } = require("./utils");
const SignIn_QQSG = require("./signIn-QQSG");

const main = () => {
  init();
  // QQ三国每日签到
  const task1 = new SignIn_QQSG(cfg.QQSG).start();
  task1.then(exitAll);
};

main();
