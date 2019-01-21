//a ranking algorithm to rank search results

function rank(r_obj, r_crit, r_ranks){
    //r_obj gives the object itself
    //r_crit informs the rank against what it is searching for
    //r_ranks informs the rank of what to search for.
    //that is r_crit is the actual item being searched for
    //while r_ranks contains values we seek a hit against

    let rank = 0;
    let bare_crit = r_crit;
    let crit_l = bare_crit.length;
    r_crit = RegExp(r_crit);

    //assign ranking values
    r_ranks.forEach(r_rank => {
        if(r_crit.test(r_obj[r_rank])){
            rank++;
        }
        if(r_obj[r_rank].slice(0, crit_l) === bare_crit){
            rank++;
            rank++;
        }
        if(r_obj[r_rank] === bare_crit){
            rank++;
            rank++;
        }
    });
    
    return {
        r_obj: r_obj,
        rank: rank
    }
}

module.exports = rank;