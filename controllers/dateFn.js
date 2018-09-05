//con for contracted ;)

function dateFn(d, con){
    let day = d.getDay();
    let month = d.getMonth();
    let date = d.getDate();
    let year = d.getFullYear();

    var daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var conDaysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var conMonthsArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    con = Boolean(con);

    if(con){
        //use contracted forms
        day = conDaysArr[day];
        month = conMonthsArr[month];
    }
    else {
        //use long forms
        day = daysArr[day];
        month = monthsArr[month];
    }

    var fullDate = day + ", " + date + " " + month + " " + year;
    return fullDate;
}

module.exports = dateFn;