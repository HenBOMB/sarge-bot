function defer(callback) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(callback());
      }, 1000);
    });
  }

async function getObjects()
{
    let data;
    try
    {
        const response = await fetch('http://127.0.0.1:8080/GetObjects');
        data = await response.json();
    }
    catch (error)
    {
        
        console.log(error);
    }
    return data
}

async function formatUnits(data){
    var output = ""
    var counts = {}
    var hp = {}
    for(var i = 0; i < data.length; i++){
        if(data[i].team != "Not a Unit" && data[i].team != undefined){
            var nameParts = data[i].name.split(".")
            if(nameParts[1] == "unit"){
                var tempName = data[i].team + " " + nameParts[2]
                if(data[i].hitpoints < data[i].totalhp){
                    tempName = data[i].team + " " + nameParts[2] + " (" + Math.floor((data[i].hitpoints / data[i].totalhp)*100) + "% hp)"
                }
                if(counts[tempName]){
                    counts[tempName] += 1
                }else{
                    counts[tempName] = 1
                }
            }
        }
        //if(data[i].hitpoints < if(data[i].
        
    }

    for(var k in counts){
        output+=k+": "+counts[k]+"\n"
    }

    return output

}

var buildingTypes = [
    "garage","barraks","hq","depot"
]

function isBuilding(str){
    for(var i = 0; i < buildingTypes.length; i++){
        if(str.includes(buildingTypes[i])){
            return true
        }
    }

    return false
}

async function formatBuildings(data){
    var output = ""
    var counts = {}
    var hp = {}
    for(var i = 0; i < data.length; i++){
        if(data[i].team != "Not a Unit" && data[i].team != undefined){
            var nameParts = data[i].name.split(".")
            var tempName = data[i].team + " " + nameParts[2]
            if(nameParts[1] == "building" && isBuilding(nameParts[2])){
                var tempName = data[i].team + " " + nameParts[2]+" id: "+data[i].id
                if(data[i].hitpoints < data[i].totalhp){
                    tempName = data[i].team + " " + nameParts[2] + " (" + Math.floor((data[i].hitpoints / data[i].totalhp)*100) + "% hp)"
                }
                if(counts[tempName]){
                    counts[tempName] += 1
                }else{
                    counts[tempName] = 1
                }
            }
        }
        //if(data[i].hitpoints < if(data[i].
        
    }

    for(var k in counts){
        output+=k+"\n"
    }

    return output

}

async function formatTowers(data){
    var output = ""
    var counts = {}
    var hp = {}
    for(var i = 0; i < data.length; i++){
        if(data[i].team != "Not a Unit" && data[i].team != undefined){
            var nameParts = data[i].name.split(".")
            var tempName = data[i].team + " " + nameParts[2]
            if(nameParts[1] == "building" && !isBuilding(nameParts[2])){
                var tempName = data[i].team + " " + nameParts[2]+" ("+data[i].position.x+", "+data[i].position.z+")"
                if(data[i].hitpoints < data[i].totalhp){
                    tempName = data[i].team + " " + nameParts[2] + " (" + Math.floor((data[i].hitpoints / data[i].totalhp)*100) + "% hp)"
                }
                if(counts[tempName]){
                    counts[tempName] += 1
                }else{
                    counts[tempName] = 1
                }
            }
        }
        //if(data[i].hitpoints < if(data[i].
        
    }

    for(var k in counts){
        output+=k+"\n"
    }

    return output

}

export function getCommandData(){
    var temp = {
    "getUnits": {
        "description":"Gets a list of all units.",
        "args":""
    },

    "getBuildings": {
        "description":"Gets a list of all buildings, including ids.",
        "args":""
    },
    "getTowers": {
        "description":"Gets a list of all towers, including their x and y position.",
        "args":""
    },


    "sendMessage": {
        "description":"Sends a message in chat.",
        "args":"message"
    },

    /*
    "getResources": {
        "description":"Gets your current plastic and electricity.",
        "args":""
    },
    "buildUnits": {
        "description":"tells a building to produce units, can not be used for buildings.",
        "args":"unitType, quantity"
    },
    "buildBuilding": {
        "description":"Places a blueprint for a building that your bulldozer will build.",
        "args":"buildingType, x, y"
    }*/
    }
    return temp
}

export async function getUnits(){
    var output = ""
    await getObjects().then((res)=> {
        //console.log(res)
        formatUnits(res).then((finished) => {
            output = finished
        })
    })
    return defer(() => output)
}

export async function getBuildings(){
    var output = ""
    await getObjects().then((res)=> {
        //console.log(res)
        formatBuildings(res).then((finished) => {
            output = finished
        })
    })
    return defer(() => output)
}

export async function getTowers(){
    var output = ""
    await getObjects().then((res)=> {
        //console.log(res)
        formatTowers(res).then((finished) => {
            output = finished
        })
    })
    return defer(() => output)
}

export async function sendMessage(message){

    try
    {
        const response = await fetch(`http://127.0.0.1:8080/SendMessage?msg=${encodeURIComponent(message)}`);
        var data = await response.json();
        return "message sent."
    }
    catch (error)
    {
        
        console.log(error);
        return "message failed to send: "+error
    }

    
}

