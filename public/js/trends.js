function displayTrendErr() {
    document.getElementById('tr-err').innerHTML =
        `<span>An error occured in retrieving trends. Click <a href = 'javascript:reqTrends();'>here</a> to retry</span>`;
}
function reqTrends() {
    document.getElementById('tr-err').innerHTML = 'Retrieving Trends...';
    setTimeout(() => {
        $.ajax({
            url: '/request-trends',
            method: 'POST',
            error: (err)=>{
                displayTrendErr()
            },
            success: (data) => {
                renderTrends(data.trends);
            }
        });
    }, 2000);

}

function renderTrends(trends) {
    if (!trends || trends.length == 0) {
        document.getElementById('tr-err').innerHTML =
            `<span>There are currently no trending topics</span>`;
    }
    else {
        document.getElementById('tr-err').innerHTML = '';
        let trendDiv = document.getElementById('trends');
        trends.forEach(trend => {
            let trText = trend.tag;
            let trNum = trend.mentions;

            let trTextNode = document.createTextNode('#' + trText);
            let trNumNode = '';
            if (trNum == 1){
                trNumNode = document.createTextNode(trNum + " Post on this");
            }
            else {
                trNumNode = document.createTextNode(trNum + " Posts on this");
            }

            let trDiv = document.createElement('div');
            trDiv.setAttribute('class', 'trend br left');

            let trTextP = document.createElement('p');

            let trTextA = document.createElement('a');
            trTextA.setAttribute('href', '/search/tag/' + trText);

            let trNumP = document.createElement('p');
            trNumP.setAttribute('class', 'small grey-text center');

            trTextA.appendChild(trTextNode);
            trNumP.appendChild(trNumNode);
            trTextP.appendChild(trTextA);

            trDiv.appendChild(trTextP);
            trDiv.appendChild(trNumP);

            trendDiv.appendChild(trDiv);
        });
    }
}