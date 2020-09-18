(function () {
    function formatPrice(price) {
        var ranges = [
            { divider: 1e15, suffix: 'Q' },
            { divider: 1e12, suffix: 'T' },
            { divider: 1e9, suffix: 'B' },
            { divider: 1e6, suffix: 'M' },
            { divider: 1e3, suffix: 'K' }
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
    function updateBadgeText(price) {
        var badgeText = formatPrice(price);
        chrome.browserAction.setBadgeText({
            text: badgeText
        });
        chrome.browserAction.setTitle({
            title: String(price)
        });
    }
    function updateBadge() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                var price = response.bitcoin.usd;
                updateBadgeText(price);
            }
        };
        xhr.send();
    }
    function setupInterval() {
        window.setInterval(function () {
            updateBadge();
        }, 600000);
    }
    function setupBadge() {
        chrome.browserAction.setBadgeBackgroundColor({
            color: "#F7931A"
        });

        chrome.browserAction.setBadgeText({
            text: "0"
        });
		chrome.browserAction.onClicked.addListener(function(){
		setupInterval();}
		);
    }
    setupBadge();
	updateBadge();
    setupInterval();
})();
