//import TOKEN from "./token.js";
//var CLIENT_ID = "1288520678072647740"
import fs from "fs"

import invokeLLM from "./index.js"

import * as commands from "./comands.js"

var commandData = commands.getCommandData()

var config = JSON.parse(fs.readFileSync("./../config.json"))

var currModel = config.model
var imageModel = config.imageModel

let chatConfig = {}

var memoryLength = config.memoryLength

var knownPeople = []



function getLastElements(arr) {
  // Check if the array has fewer than 10 elements
  var tempVal = arr[1]
  if (arr.length <= memoryLength) {
      return arr;  // Return the whole array if it's length is less than or equal to 10
  } else {
      // Otherwise, return the last 10 elements
      return [tempVal].concat(arr.slice(-9));  // Negative index to count from the end of the array
  }
}

function isEnclosedInAsterisks(str) {
  const regex = /^\*[^*]+\*$/;
  return regex.test(str);
}

function defer(callback) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(callback());
    }, 1000);
  });
}

function containsAny(mainString,substrings) {
    // Loop through each substring in the array
    for (let i = 0; i < substrings.length; i++) {
        // Check if the main string contains the current substring
        if(substrings[i].toLowerCase() == substrings[i]){
          if (mainString.toLowerCase().includes(substrings[i])) {
            return true;  // Return true if a match is found
          }
        }else{
          if (mainString.includes(substrings[i])) {
            return true;  // Return true if a match is found
          }
        }
        
    }
    return false;  // Return false if no match is found after looping through all substrings
}

function parseCommands(inputString) {
  // Regular expression to match the pattern !command(args)
  const commandRegex = /!(\w+)\(([^)]*)\)/g;
  let match;
  const commands = [];

  // Iterate through all matches in the input string
  while ((match = commandRegex.exec(inputString)) !== null) {
    const commandName = match[1]; // The command name (e.g., doTask)
    const argsString = match[2]; // The arguments as a single string (e.g., "arg1, arg2")

    // Split the arguments string by commas, and trim whitespace from each argument
    const args = argsString
      .split(',')
      .map(arg => arg.trim())
      .filter(arg => arg.length > 0); // Remove any empty arguments

    // Store the command name and its arguments
    commands.push({
      command: commandName,
      arguments: args
    });
  }

  return commands;
}

function identifyCommands(str){
  var parsed = parseCommands(str);
  if(parsed.length < 1){
    return false;
  }else{
    return parsed
  }
}

var busy = false

var typing = null

export default async function handleMessage(tprompt,history,persona,imgs){
    if(busy)
      return defer(() => history);

    var temp = null

    if(tprompt == "undo"){
      history.splice(history.length-1,1)
      history.splice(history.length-1,1)
      console.log("\nremoved last message from history\n")
      return defer(() => history);
    }
    if(tprompt == "regen"){
      history.splice(history.length-1,1)
      console.log("\nremoved last message from history\nnew response:\n")
    }

    if(imgs){

      chatConfig = {
        model: imageModel,
        role: "user",
        content: tprompt,//"describe the placement of all pieces on this board",
        images:[imgs]
        }
      history.push(chatConfig)
      busy = true
      var response = await invokeLLM(chatConfig,getLastElements(history))
      console.log("\nscreen description:\n"+response)
      temp = {
        model: imageModel,
        role: "assistant",
        content: response,
        options: {
          keep_alive:-1
        }
      }
    
      history.push(temp)

    }else{
      chatConfig = {
        model: currModel,
        role: "user",
        content: tprompt,//"describe the placement of all pieces on this board",
        }
      history.push(chatConfig)
      busy = true
      var response = await invokeLLM(chatConfig,getLastElements(history))
      console.log("\nresponse: "+response+"\n")
      temp = {
        model: currModel,
        role: "assistant",
        content: response,
        options: {
          keep_alive:-1
        }
      }
    
      history.push(temp)
    }
    busy = false

    if(history.length%config.reminderFrequency == 0){
      chatConfig = {
        model: currModel,
        role: "user",
        content: persona.units ? persona.units : persona.intro
        }
      history.push(chatConfig)
    }

    var identifiedCommands = identifyCommands(response)

    if(identifiedCommands.length > 0){
      persona.selfPrompt = true
      console.log(identifiedCommands)
      for (let i = 0; i < identifiedCommands.length; i++) {
        if(commandData[identifiedCommands[i].command]){
          try{
            await commands[identifiedCommands[i].command](identifiedCommands[i].arguments).then((output) => {
              chatConfig = {
                model: currModel,
                role: "user",
                content: "you ran:"+identifiedCommands[i].command+" and it returned:\n"+output
                }
              history.push(chatConfig)
              console.log("agent used the command: "+identifiedCommands[i].command+" and it returned:\n"+output)
            })
          }catch(err){
            chatConfig = {
              model: currModel,
              role: "user",
              content: "you ran:"+identifiedCommands[i].command+" and it gave you the following error:\n"+err
            }
            history.push(chatConfig)
            console.error(err)
          }
          
        }
        
      }
    }else{
      persona.selfPrompt = false
    }

    return defer(() => history);

    if(history.length%config.reminderFrequency == 0){
      chatConfig = {
        model: currModel,
        role: "user",
        content: persona.intro
        }
      history.push(chatConfig)
    }

    if(!isEnclosedInAsterisks(msg.content)){
      if(!knownPeople.includes(msg.author.username)){
        knownPeople.push(msg.author.username)
        if(!history[0].content.includes("you currently know")){
          history[0].content += "\nyou currently know "
          history[0].content += msg.author.username
        }else{
          history[0].content += ", "+msg.author.username
        }
      }

      chatConfig = {
        model: currModel,
        role: "user",
        content: "the following message is from "+msg.author.username+", in the area of "+msg.channel.name
      }
      
      history.push(chatConfig)
      chatConfig = {
        model: currModel,
        role: "user",
        content: msg.content//.replace("GPT","")
      }
      history.push(chatConfig)
    }else{
      chatConfig = {
        model: currModel,
        role: "user",
        content: msg.content
      }
      
      history.push(chatConfig)
    }


    if(containsAny(msg.content,persona.aliases)){
      history[history.length-1].content += "\n\nYou are responding as "+client.user.username
      if(!busy){
        busy = true
        var chan = msg.channel
        var keepTyping = async () => {
          try {
              await chan.sendTyping();
          } catch (error) {
              console.error('Failed to send typing:', error);
          }
          if(busy)
            setTimeout(keepTyping, 9000);
        };

        keepTyping();
        
        try{
          var response = await invokeLLM(chatConfig,getLastElements(history))
          if(response.toLowerCase().includes("blank response")){
            console.log("didn't respond")
          }else{
            temp = {
              model: currModel,
              role: "assistant",
              content: response,
              options: {
                keep_alive:-1
              }
            }
          
            history.push(temp)
            msg.channel.send(response)
          }
        }catch(err){
          console.log(err)
          busy = false
        }
        busy = false
      }
    }

    return defer(() => history);

    
}
