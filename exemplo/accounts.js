import express from "express";
const routes = express.Router();
import {promises as fs} from "fs";
import cors from "cors";

const {readFile, writeFile} = fs; 

routes.post("/",async (req,res,next)=>{
  let account = req.body;
  try{
    if(!account.name || !account.balance==null){
      throw new Error("Name and Balance are mandatories");
    }    
    const data = JSON.parse(await readFile(global.fileName));
    account = {id: data.nextId++,
      name: account.name,
      balance: account.balance};
    data.accounts.push(account); 
    await writeFile(global.fileName,JSON.stringify(data,null,2));
    res.send(account);
    logger.info(`POST /account - ${JSON.stringify(account)}`)
  }catch(err){
    next(err)
  }  
  res.end();
});

routes.get("/", async (req, res,next) =>{
  try{
    const data = JSON.parse(await readFile(global.fileName));
    res.send(data.accounts);
    logger.info("GET /account");
  }catch(err){
    next(err);
  }
});

routes.get("/:id",  async (req, res,next) =>{
  try{
    const id = req.params;
    const data = JSON.parse(await readFile(global.fileName));    
    res.send(data.accounts.find(account => account.id === parseInt(req.params.id)));
    logger.info("GET /account/:id");
  }catch(err){
    next(err);
  }
});

routes.delete("/:id",async(req, res,next )=>{
  try{
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts = data.accounts.filter(
      account => account.id !== parseInt(req.params.id)
    ); 
    await writeFile(global.fileName, JSON.stringify(data,null,2));
    res.end();
    logger.info("DELETE /account/:id");
  }catch(err){
    next(err);
  }
});

routes.put("/",async(req, res,next)=>{
 
  try{
    let account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(a => a.id === account.id);
    if(!account.index || !account.name || !account.balance){
      throw new Error("ID,Name and Balance are mandatories");
    }
    if(index === -1){
      throw new Error("Registry Not Founded!")
    }
    data.accounts[index].name = account.name;
    data.accounts[index].balance = account.balance;
    await writeFile(global.fileName,JSON.stringify(data,null,2));
    res.send(account);
    logger.info(`PUT /account - ${JSON.stringify(account)}`)
  }catch(err){
    next(err);
  }
});

routes.patch("/updateBalance", async (req,res,next)=>{
  try{
    let account = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(a => a.id === account.id);
    if(!account.index || !account.name || !account.balance){
      throw new Error("ID,Name and Balance are mandatories");
    }
    if(index === -1){
      throw new Error("Registry Not Founded!")
    }
    data.accounts[index].balance = account.balance;
    await writeFile(global.fileName,JSON.stringify(data,null,2));
    res.send(account);
    logger.info(`PATCH /account - ${JSON.stringify(account)}`)
  }catch(err){
    next(err)
  }
});

routes.use((err,req,res,next)=>{
  logger.error(`${req.method} ${req.method} - ${err.message}`);
  res.status(400).send({error: err.message})
});



export default routes;