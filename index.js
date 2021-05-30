const Node = require('./Node.js');
const Nodefile = require('./Nodefile.json');


(async ()=>{
  // TestDatabase
  await initialize("TestDatabase");
  await checkout("TestDatabase");
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
    console.log("initialize TestDatabase", (await repo.log()).latest);
    // throw "rollback test!";
  });

  // clone nodes(Nodefile.json)
  result = await Promise.all(Nodefile.map(async node=>{
    if(!node.name) return `  name error 「${node.name}」`;
    if(!!node.git){
      await clone(node.git, node.name);
      return `  clone ${node.git} -> ${node.name}`;
    }else{
      await initialize(node.name);
      return `  initialize ${node.name}`;
    }
  }));
  console.log("Nodefile.json\n", result.join("\n"));
}).bind(Node)();
