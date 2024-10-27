import curl from "curl"

import fs from "fs"

var config = JSON.parse(fs.readFileSync("./../config.json"))

function curlPost(url, data, options = {}) {
    return new Promise((resolve, reject) => {
        curl.post(url, data, options, (err, response, body) => {
            if (err) {
                return reject(err);
            }
            resolve({ response, body });
        });
    });
}

export default async function invokeLLM(props,history) {
    //console.log(`--[PROMPT]--`)
    //console.log(`[${props.model}]: ${props.content}`)
    //console.log(`------------`)
    try {
      //console.log(`Running prompt...`)
      var preparedPrompt = ""
      if(props.images){
        preparedPrompt = `{"model":"${props.model}"
        , "messages":${JSON.stringify(history)}
        , "stream":false, "keep_alive":"30m"
        , "num_ctx":4096
        , "images":${JSON.stringify(props.images)}
        , "options": {
          "temperature": ${config.temperature}
          }
        }`
      }else{
        preparedPrompt = `{"model":"${history[0].model}"
        , "messages":${JSON.stringify(history)}
        , "stream":false, "keep_alive":"30m"
        , "num_ctx":4096
        , "options": {
          "temperature": ${config.temperature}
          }
        }`
      }
     

      var url = "http://localhost:11434/api/chat"

      //console.log(preparedPrompt)
      var {response, body} = await curlPost(url, preparedPrompt)
      //console.log(body)
      var rawBody = JSON.parse(body)
      //console.log(rawBody)
      return rawBody.message.content

    }
    catch(error) {
      console.log(`Query failed!`)
      console.log(error)
    }
  }