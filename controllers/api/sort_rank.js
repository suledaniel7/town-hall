//a companion to the ranking alg, this helps return the ranked items in order while stripping their ranks

function sort_rank(ranked_objs){
    ranked_objs.sort((a, b)=>{
        return a.user.rank > b.user.rank;
    });

    let final_objs = [];

    ranked_objs.forEach((obj)=>{
        let t_obj = obj;
        t_obj.user = obj.user.r_obj;
        final_objs.push(t_obj);
    });
    
    return final_objs;
}

module.exports = sort_rank;