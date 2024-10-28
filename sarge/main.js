
import fs from "fs"

import handleMessage from "./../common.js"

import {GlobalKeyboardListener} from "node-global-key-listener";
const v = new GlobalKeyboardListener();

import screenshot from 'screenshot-desktop'

import * as commands from "./../comands.js"

import prompts from "prompts";
//const prompt = PromptSync()

var config = JSON.parse(fs.readFileSync("./../config.json"))
var persona = JSON.parse(fs.readFileSync("./persona.json"))

var currModel = config.model
var imageModel = config.imageModel

// Theology is solved! :troll:
var gods = ["246589957165023232","216465467806580737"]

var history = []

console.log(await commands.sendMessage("sarge"))
console.log(await commands.sendMessage("sarge is here"))
console.log(await commands.sendMessage("sarge is really here now"))
console.log(await commands.sendMessage("sarge is really here now, and he is ready for memes and stuff, im just trying to make this message long for the test but idk what to do or say omg"))


persona.selfPrompt = false

function base64_encode(raw) {
  // read binary data
  var bitmap = raw;
  // convert binary data to base64 encoded string
  return new Buffer.from(bitmap).toString('base64');
}

function defer(callback) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(callback());
    }, 1000);
  });
}

function save(){
  try{
    fs.writeFileSync(persona.aliases[0]+"history.json",JSON.stringify(history));
  }catch(err){
    console.log(err)
  }
}

function load(){
  if(fs.existsSync(persona.aliases[0]+"history.json"))
    history = JSON.parse(fs.readFileSync(persona.aliases[0]+"history.json"));
}

chatConfig = {
    model: currModel,
    role: "system",
    content: config.defaultIntro
}
history.push(chatConfig)

var commandDocs = ""
var commandData = commands.getCommandData()
for(var k in commandData){
  commandDocs +="!"+k+"("+commandData[k].args+"): "+commandData[k].description+"\n"
}

var chatConfig = {
  model: currModel,
  role: "user",
  content: config.defaultIntro+"\n\n"+persona.intro+"\n\nalways use the following commands to get information about what is happening:\n"+commandDocs
}
history.push(chatConfig)
console.log(chatConfig.content)

var imgHistory = []

chatConfig = {
  model: currModel,
  role: "user",
  content: persona.units ? persona.units : persona.intro
  }
history.push(chatConfig)

var busy = false

var imgPrompt = "you are looking at a screenshot of the game of Rimworld, name any visible people and animals, and describe any important buildings and other landmarks. ignore the ui."
var helpPrompt = "given the situation, what is the best move to take next?"
var defaultHelpPrompt = helpPrompt

var chatConfig = {
  model: currModel,
  role: "user",
  content: imgPrompt
}
imgHistory.push(chatConfig)



load()


/*
async function mainLoop(){
  helpPrompt = prompt("\nprompt:")
  if(helpPrompt == ""){
    history = await handleMessage(defaultHelpPrompt,history,persona)
  }else{
    history = await handleMessage(helpPrompt,history,persona)
  }

  save()
}
  */

async function mainLoop(){
  (async () => {
    if(!persona.selfPrompt){
      const response = await prompts({
        type: 'text',
        name: 'prompt',
        message: 'prompt: '
      });

      helpPrompt = response.prompt
    }else{
      helpPrompt = "you are self prompting, continue to use commands to win the game. use the format !commandName(arg1,arg2,etc)."
    }
    if(helpPrompt == ""){
      history = await handleMessage(defaultHelpPrompt,history,persona)
    }else{
      history = await handleMessage(helpPrompt,history,persona)
    }
    save()
    mainLoop()
  })();
}

mainLoop()



/*

v.addListener(async function (e, down) {
  
  if (e.state == "DOWN" && e.name == "O" && (down["LEFT SHIFT"] || down["RIGHT SHIFT"])) {
      //call your function
      busy = true
      console.log("analyzing image")
      var image = await screenshot.listDisplays().then((displays) => {
        // displays: [{ id, name }, { id, name }]
        screenshot({ screen: displays[displays.length - 1].id })
          .then( async (img) => {
            img = base64_encode(img)
            //console.log(img)
            
            history = await handleMessage(imgPrompt,history,persona,img)
            busy = false
          });
      })
      
      return true;
  }


  if (e.state == "DOWN" && e.name == "P" && (down["LEFT SHIFT"] || down["RIGHT SHIFT"])) {
    //call your function
    busy = true
    console.log("analyzing situation")

    helpPrompt = prompt("\nprompt:")
    if(helpPrompt == ""){
      history = await handleMessage(defaultHelpPrompt,history,persona)
    }else{
      history = await handleMessage(helpPrompt,history,persona)
    }

    save()
    

    
    return true;
}
});

/*
client.on('messageCreate', async (msg) => {
    history = await handleMessage(msg,client,history,persona)
})

client.on('ready',()=>{
    console.log(client.user.username+" is now online")
})

client.login(TOKEN);
*/