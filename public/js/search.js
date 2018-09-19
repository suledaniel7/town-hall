function fullSearch() {
    let searchBar = document.getElementById('searchBox');
    let bars = document.getElementsByClassName('tabBar');
    let active = 1;
    let bar1 = bars[0];
    let bar2 = bars[1];

    //for suggestions
    let sActive = false;
    searchBar.addEventListener('blur', () => {
        if (!sActive) {
            document.getElementById('suggs').classList += ' hidden';
        }
        if (bar2) {
            if (active !== 1) {
                bar1.className = 'tabBar';
                bar2.classList += ' hidden';
                active = 1;
            }
        }

    });
    searchBar.addEventListener('focus', () => {
        document.getElementById('suggs').className = 'searchSuggs';
        if (bar2) {
            if (active !== 2) {
                bar2.className = 'tabBar';
                bar1.classList += ' hidden';
                active = 2;
            }
        }

    });

    document.getElementById('suggs').addEventListener('mouseover', () => {
        sActive = true;
    });
    document.getElementById('suggs').addEventListener('mouseout', () => {
        sActive = false;
    });

    //search suggestions
    document.getElementById('searchBox').addEventListener('input', () => {
        let text = $('#searchBox').val();
        $.ajax({
            url: '/autofill/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                term: text
            }),
            success: (data) => {
                autofill(data.data);
            }
        });
    });

    function autofill(data) {
        let searchSugg = document.getElementById('searchSugg');
        searchSugg.innerHTML = '';
        data.forEach(datum => {
            let dataA = document.createElement('a');
            dataA.setAttribute('href', datum.href);
            dataA.setAttribute('class', 'sugg');
            let d_type = datum.type;
            let dataText = document.createTextNode(datum.name);
            if (d_type == 'tag') {
                dataText = document.createTextNode('#' + datum.name);
            }
            else if (d_type == 'people') {
                dataText = document.createTextNode('@' + datum.name);
            }

            dataA.appendChild(dataText);
            searchSugg.appendChild(dataA);
            activeSugg = -1;
        });
    }

    function search() {
        let terms = document.getElementById('searchBox').value;
        terms = terms.split('');
        let fin_terms = [];
        terms.forEach(term => {
            fin_terms.push(mapChar(term));
        });
        terms = fin_terms.join('');
        location.assign('/search/general/' + terms);
    }


    function getSuggs() {
        let suggArr = document.getElementsByClassName('sugg');
        return suggArr;
    }

    let activeSugg = -1;
    document.getElementById('searchBox').addEventListener('keydown', (ev) => {
        if (ev.which == 40) {
            //down arrow
            let suggs = getSuggs();
            if (suggs.length > 0) {
                activeSugg++;
                if (suggs[activeSugg]) {
                    for (let i = 0; i < suggs.length; i++) {
                        suggs[i].className = 'sugg';
                    }
                    suggs[activeSugg].classList += ' activeSugg';
                }
                else {
                    activeSugg--;
                }
            }
        }
        else if (ev.which == 38) {
            //up arrow
            let suggs = getSuggs();
            if (suggs.length > 0) {
                activeSugg--;
                if (suggs[activeSugg]) {
                    for (let i = 0; i < suggs.length; i++) {
                        suggs[i].className = 'sugg';
                    }
                    suggs[activeSugg].classList += ' activeSugg';
                }
                else {
                    activeSugg++;
                }
            }
        }
        else if (ev.which == 13) {
            //enter key
            ev.preventDefault();
            let suggs = getSuggs();
            if (suggs.length > 0 && suggs[activeSugg]) {
                document.getElementById('searchBox').value = suggs[activeSugg].textContent;
                location.assign(suggs[activeSugg].href);
            }
            else {
                search();
            }
        }
        else if (ev.which == 27) {
            //escape key
            ev.preventDefault();
            document.getElementById('searchSugg').classList += ' hidden';
        }
    });
}