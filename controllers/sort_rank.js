//a companion to the ranking alg, this helps return the ranked items in order while stripping their ranks

function sort_rank(ranked_objs){
    ranked_objs.sort((a, b)=>{
        return a.rank > b.rank;
    });

    let final_objs = [];

    ranked_objs.forEach((obj)=>{
        final_objs.push(obj.r_obj);
    });
    
    return final_objs;
}

module.exports = sort_rank;