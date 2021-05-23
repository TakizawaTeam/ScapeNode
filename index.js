const Node = require('./Node.js');

(async ()=>{
  await initialize();
  await checkout();
  await correct(async function(){
    if(await exist("user")) await remove("user");
    await make("user");
    await change("user");
    await make("n-mizunuma@froide.co.jp/name");
    await set("HelloWorld!", "n-mizunuma@froide.co.jp/name");
    await make("seresonn_no9@yahoo.co.jp");
    await copy("n-mizunuma@froide.co.jp/name", "seresonn_no9@yahoo.co.jp/name");
    await move("seresonn_no9@yahoo.co.jp/name", "seresonn_no9@yahoo.co.jp/echo");
    await remove("n-mizunuma@froide.co.jp/name");
    // throw "rollback test!";
  });
  console.log(await repo.log());
}).bind(Node)();

