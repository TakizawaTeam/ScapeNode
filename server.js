const vm = require('vm');
const fs = require('fs');
const http = require('http');
const ws = require('ws');
const net = require('net');
const repl = require('repl');
const { processTopLevelAwait } = require("node-repl-await");

(async function(config){
  const Node = await require('./Node.js');

  // REPL Server
  const isRecoverableError = function(error) {
    if(error.name === 'SyntaxError'){
      return /^(Unexpected end of input|Unexpected token)/.test(error.message);
    }else{ return false; }
  }
  const repl_eval = async function(cmd, context, filename, callback){
    cmd = processTopLevelAwait(cmd) || cmd;
    try { // TODO 汚いのでtryじゃなくcatch使いたい
      let result = await vm.runInNewContext(cmd, context);
      callback(null, result);
    } catch (e) {
      if(isRecoverableError(e)){
        callback(new repl.Recoverable(e));
      }else{ console.log(e); }
    }
  };
  let repl_server = null;
  net.createServer(function (socket) {
    repl_server = repl.start({prompt: config.repl.prefix, input: socket, output: socket, eval: repl_eval});
    repl_server.context.Node = Node;
  }).listen(config.repl.port, config.repl.server);


  // HTTP, WebSocket Server
  const server = http.createServer(function(req, res){});
  new ws.Server({server: server}).on('connection', function(wso, req){
    let set_result = async function(m){ wso.send(`${m} 404not found!`); };
    let set_close = async function(m){ wso.send(`${m} connection closed!`); };

    if(req.url=='/'){}
    else if(req.url=='/echo'){ set_result = async function(m){ wso.send(m); }; }
    else if(req.url=='/repl'){
      const client = net.connect(config.repl.port, config.repl.server, function(){});
      client.on('data', function(data){ wso.send(''+data); });
      set_result = async function(m){ client.write(m+"\n"); };
      set_close = async function(){};
    }
    wso.on('message', async function(m){ await set_result(m); });
    wso.on('close', async function(){ await set_close(); });
  });
  server.listen(config.http.port, function(){
    console.log(`run server localhost:${config.http.port}/[echo,repl]`);
  });
})({
  http: {port: 5001},
  repl: {port: 5002, server: 'localhost', prefix: '> '}
});

