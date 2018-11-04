function timeFn(d){
    let hour = d.getHours();
    let minute = d.getMinutes();
    
    var suffix;

    //now, to get an AM or PM value for hour
    if(hour < 12){
        suffix = 'AM';
    }
    else {
        hour = hour - 12;
        suffix = 'PM';
    }

    //here to get an 0 value for minute
    if(minute < 10){
        minute = '0'+minute;
    }
    if(hour == 0){
        hour = '12';
    }

    var fullTime = hour + ":" + minute + " " + suffix;

    return fullTime;
}

module.exports = timeFn;