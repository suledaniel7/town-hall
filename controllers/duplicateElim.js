//refactored module specifically for object based arrays
function duplicateElim(arr){
    let fin_arr = [];
    for(let i=0; i<arr.length; i++){
        let element = arr[i];
        let username = element.username;
        let inside = false;
        fin_arr.forEach(elem =>{
            if(elem.username == username){
                inside = true;
            }
        });
        if(!inside){
            fin_arr.push(element);
        }
    }

    return fin_arr;
}


module.exports = duplicateElim;