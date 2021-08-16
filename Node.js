/***
 * Copyright 2021 NaotoMizunuma <n-mizunuma@froide.co.jp>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const path = require("path");
const fs = require('fs-extra');
const Git = require('simple-git/promise');

module.exports = (()=>{
  repo = null;
  root = "";
  current = "";

  // database
  initialize = async (_path="Database")=>{
    _path = ex_path(_path);
    if(!await exist(_path)) await make(_path);
    repo = Git(_path);
    await repo.init();
    await repo.add('.value');
    await repo.addConfig("user.name", "dummy");
    await repo.addConfig("user.email", "dummy");
    await repo.commit("first commit!");
    repo = null;
    return `Completed initialize: ${_path}`;
  };
  clone = async (url, _path="")=>{
    if(!!_path.length) return await Git().clone(url, _path);
    return await Git().clone(url);
  };
  checkin = async (_path="Database")=>{
    repo = null; root = ""; current = "";
    if(!await exist(ex_path(_path))) return null;
    repo = Git(_path);
    root = _path;
    current = "";
    return `Completed checkin: ${_path}`;
  };
  rollback = async ()=>{if(repo) await repo.clean("dfx");}
  commit = async ()=>{
    if(!repo) return null;
    repo.add("./*");
    repo.commit("commit!");
  };
  correct = async callback=>{
    if(!repo) return null;
    await rollback(); try{
      result = await callback();
      await commit();
      return result;
    }catch(e){ await rollback(); }
  };


  // node
  ex_path = (_path="")=>path.resolve(path.join(root, current), _path); // Lorentz
  exist = async _path=>!!await statistics(_path);
  child = async _path=>{
    list = await fs.readdir(ex_path(_path)).catch(()=>[]);
    return list.filter(name=>!/^\./.test(name)); //隠しファイルは非表示
  };
  make = async _path=>{
    if(await exist(_path)) return null;
    await fs.mkdir(ex_path(_path), {recursive:true}).catch(()=>null);
    _path = path.join(ex_path(_path), ".value");
    await fs.writeFile(_path, "");
    return `Completed create: ${_path}`;
  };
  set = async (value="",_path="")=>{
    _path = path.join(ex_path(_path), ".value");
    await fs.writeFile(_path, value).catch(()=>null);
    return `Completed write: ${value} ${_path}`;
  };
  catenate = async _path=>{
    _path = path.join(ex_path(_path), ".value");
    return await fs.readFile(_path, "utf-8").catch(()=>null);
  };
  statistics = async _path=>await fs.stat(ex_path(_path)).catch(()=>null);
  change = async _path=>{
    if(!await exist(_path)) return null;
    return current = path.join(current, _path);
  };
  remove = async _path=>{
    if(!await exist(_path)) return null;
    await fs.remove(ex_path(_path));
  };
  copy = async (_path, dest="")=>{
    if(!await exist(_path)) return null;
    if(await exist(dest)) return null;
    await fs.copy(ex_path(_path), ex_path(dest));
  };
  move = async (_path, dest="")=>{
    if(!await exist(_path)) return null;
    if(await exist(dest)) return null;
    await fs.move(ex_path(_path), ex_path(dest));
  };

  // Commnds
  pwd = ()=>current;
  explor = async _path=>{};
  survey = async _path=>{};
  return this;
})();
