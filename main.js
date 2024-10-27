
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

setInterval(() => {
    getObjects().then((res)=> {
        //console.log(res)
        formatObjects(res).then((finished) => {
            console.log(finished)
        })
    })
} , 5000);