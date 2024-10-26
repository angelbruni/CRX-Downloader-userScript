// ==UserScript==
// @name         CRX Downloader
// @description  Allows you to download ".crx" files directly from Chrome Web Store and Microsoft Edge Addons websites.
// @namespace    http://tampermonkey.net/
// @icon         https://www.chromium.org/favicon.ico
// @version      1.0.3
// @author       AngelBruni
// @match        https://chromewebstore.google.com/*
// @match        https://microsoftedge.microsoft.com/*
// @match        https://web.archive.org/web/2011*/https://chrome.google.com/webstore/*
// ==/UserScript==

function enableInstallBtn() {
    let version;
	let extensionId;
	let cdnurl;

	let getBtn;

    if (window.location.href.includes("https://chrome.google.com/webstore/detail/")) {
        extensionId = window.location.href.split("/").pop();

		if (extensionId.includes = "?")
            extensionId = extensionId.split("?")[0];

        document.querySelector("#cwspage.cx-cannot-install").classList.remove("cx-cannot-install");

        getBtn = document.querySelector("#cx-install-free-btn");
        getBtn.removeAttribute("href");

        version = "130.0";
        cdnurl = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&prodversion=${version}&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;
        getBtn.addEventListener("click", () => {
            window.location.href = cdnurl;
        });
    } else if (window.location.href.includes("https://chromewebstore.google.com/detail/")) {
		extensionId = window.location.href.split("/").pop();

		if (extensionId.includes = "?")
            extensionId = extensionId.split("?")[0];

		getBtn = document.querySelector(`[data-p*="${extensionId}"] button[jsaction*="click"][jsaction*="clickmod"][jsaction*="pointerdown"][jsaction*="pointerup"][jsaction*="pointerenter"][jsaction*="pointerleave"][jsaction*="pointercancel"][jsaction*="contextmenu"][jsaction*="focus"][jsaction*="blur"][disabled=""]`);
		getBtn.removeAttribute("disabled");

        version = "130.0";
        cdnurl = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&prodversion=${version}&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;

		getBtn.addEventListener("click", () => {
			window.location.href = cdnurl;
		});
	} else if (window.location.href.includes("https://microsoftedge.microsoft.com/addons/")) {
		if (window.location.href.includes("https://microsoftedge.microsoft.com/addons/detail/")) {
			extensionId = window.location.href.split("/").pop();

			if (extensionId.includes = "?")
				extensionId = extensionId.split("?")[0];

			setTimeout(() => {
				getBtn = document.querySelector(`#getOrRemoveButton-${extensionId}`);

				getBtn.removeAttribute("disabled");
				getBtn.style.setProperty ("cursor", "pointer", "important");
				getBtn.style.opacity = 1;

				cdnurl = `https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;

				getBtn.addEventListener("click", () => {
					window.location.href = cdnurl;
				});
			}, 1500);
		} else {
			// Yes, this runs every half a second, I am too lazy and the buttons get created on hover which is annoying to keep track of.
			setInterval(function() {
				getBtn = document.querySelectorAll(`button[id*="getOrRemoveButton"]`);
				getBtn.forEach(btn => {
					btn.removeAttribute("disabled");
					btn.style.setProperty ("cursor", "pointer", "important");
					btn.style.opacity = 1;

					extensionId = btn.id.split("-").pop();
					cdnurl = `https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;

					btn.addEventListener("click", () => {
						window.location.href = cdnurl;
					});
				});
			}, 500);
		}
	}
}
enableInstallBtn();

const titleObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if (mutation.type === 'childList')
			enableInstallBtn();
	});
});
titleObserver.observe(document.querySelector('title'), { childList: true });