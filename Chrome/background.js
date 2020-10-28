var localStore = chrome.storage.sync;
(function() {
    var price = 0;
    var prevPrice = 0;
    var up = true;

    var toggle = false;


    function formatPrice(price) {
        var ranges = [{
                divider: 1e15,
                suffix: 'Q'
            },
            {
                divider: 1e12,
                suffix: 'T'
            },
            {
                divider: 1e9,
                suffix: 'B'
            },
            {
                divider: 1e6,
                suffix: 'M'
            },
            {
                divider: 1e3,
                suffix: 'K'
            }
        ];
        for (var i = 0; i < ranges.length; i++) {
            if (price >= ranges[i].divider) {
                var result = price / ranges[i].divider;
                var intResult = parseInt(result, 10);
                var integerDigits = Math.floor(Math.log(intResult) * Math.LOG10E + 1);
                switch (integerDigits) {
                    case 1:
                        return (Math.floor(10 * result) / 10).toFixed(1) + ranges[i].suffix;
                    case 2:
                    case 3:
                    default:
                        return Math.round(result) + ranges[i].suffix;
                }
            }
        }
        return price.toString();
    }



    function changeMode() {
        console.log(toggle);
        switch (toggle) {
            case true:
                localStore.set({
                    ["toggle"]: false
                });
                toggle = false;
                break;
            case false:
                localStore.set({
                    ["toggle"]: true
                });
                toggle = true;
                break;
            default:
                localStore.set({
                    ["toggle"]: true
                });
                toggle = true;
                break;
        }

        updateBadgeText(price);

    }

    function updateBadgeText(price) {
        var badgeText;
        if (toggle) {
            badgeText = String(price);
        } else {
            badgeText = formatPrice(price);
        }
        chrome.browserAction.setBadgeText({
            text: badgeText
        });
        chrome.browserAction.setTitle({
            title: String(price)
        });
    }


    function updateBadge() {
        //get toggle state
        localStore.get(['toggle'], function (item) { console.log(item); toggle = item.toggle; });

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                price = response.bitcoin.usd;
                updateBadgeText(price);
            }
            if (price >= prevPrice) {
                setupBadge(up);
            } else {
                setupBadge(!up);
            }
            prevPrice = price;
        };
        xhr.send();
    }

    function setupInterval() {
        window.setInterval(function() {
            updateBadge();
        }, 10000);
    }

    function setupBadge(up) {
        if (up) {
            setTimeout(function() {
                chrome.browserAction.setBadgeBackgroundColor({
                    color: "#009E73"
                });
            }, 1000);
        } else {
            setTimeout(function() {
                chrome.browserAction.setBadgeBackgroundColor({
                    color: "#ff0000"
                });
            }, 1000);
        }
        chrome.browserAction.setBadgeBackgroundColor({
            color: "#f9a43f"
        });

    }

    chrome.browserAction.onClicked.addListener(function(tab) {
        changeMode();
    });
    updateBadge();
    setupInterval();
})();
