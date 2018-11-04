//a ranking algorithm to rank search results

function rank(r_obj, r_crit, r_ranks){
    //r_obj gives the object itself
    //r_crit informs the rank against what it is searching for
    //r_ranks informs the rank of what to search for.
    //that is r_crit is the actual item being searched for
    //while r_ranks contains values we seek a hit against

    let rank = 0;

    //assign ranking values
    r_ranks.forEach(r_rank => {
        if(r_obj[r_rank] == r_crit){
            rank++;
        }
    });
    
    return {
        r_obj: r_obj,
        rank: rank
    }
}

module.exports = rank;