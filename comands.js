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

async function formatObjects(data){
    var output = ""
    var counts = {}
    for(var i = 0; i < data.length; i++){
        if(data[i].team != "Not a Unit" && data[i].team != undefined){
            var nameParts = data[i].name.split(".")
            var tempName = data[i].team + " " + nameParts[2]
            if(counts[tempName]){
                counts[tempName] += 1
            }else{
                counts[tempName] = 1
            }
        }
    }

    for(var k in counts){
        output+=k+": "+counts[k]+"\n"
    }

    return output

}

export function getCommandData(){
    var temp = {
    "getUnits": {
        "description":"Gets a list of all units.",
        "args":""
    },
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
    }}
    return temp
}

export async function getUnits(){
    var output = ""
    await getObjects().then((res)=> {
        //console.log(res)
        formatObjects(res).then((finished) => {
            output = finished
        })
    })
    return defer(() => output)
}

