//a fairly straightforward but much needed module for stripping objects of properties
function strip(objs, props){
    

    objs.forEach(obj => {
        props.forEach(prop => {
            obj[prop] = null;
        });
    });

    return objs;
}

module.exports = strip;