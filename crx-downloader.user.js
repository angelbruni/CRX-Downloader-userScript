// ==UserScript==
// @name         CRX Downloader
// @description  Allows you to download ".crx" files directly from Chrome Web Store and Microsoft Edge Addons websites.
// @namespace    http://tampermonkey.net/
// @icon         https://www.chromium.org/favicon.ico
// @version      1.0.6
// @author       AngelBruni
// @match        https://chromewebstore.google.com/*
// @match        https://microsoftedge.microsoft.com/*
// @match        https://web.archive.org/web/2011*/https://chrome.google.com/webstore*
// ==/UserScript==

(function() {
	const VERSION = "130.0";

	function waitForElm(selector) {
		return new Promise(resolve => {
			if (document.querySelector(selector))
				return resolve(document.querySelector(selector));
	
			const observer = new MutationObserver(mutations => {
				if (document.querySelector(selector)) {
					observer.disconnect();
					resolve(document.querySelector(selector));
				}
			});
	
			// If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}

	function removePromo() {
		const url = window.location.href;
		if (url.includes("chrome.google.com/webstore")) {
			const promoBannerSelector = '#cx-browser-warning';
			waitForElm(promoBannerSelector).then(() => {
				const promoBannerElm = document.querySelector(promoBannerSelector);
				promoBannerElm.remove();
			});
		} else if (url.includes("chromewebstore.google.com")) {
			const promoCardSelector = '[aria-labelledby="promo-header"]';
			waitForElm(promoCardSelector).then(() => {
				const promoCardElm = document.querySelector(promoCardSelector);
				promoCardElm.remove();
			});

			const promoBannerSelector = '#c6';
			waitForElm(promoBannerSelector).then(() => {
				const promoBannerElm = document.querySelector(promoBannerSelector);
				promoBannerElm.remove();
			});
		} else if (url.includes("microsoftedge.microsoft.com")) {
			const promoBannerSelector = '.BannerRedesigned[role="banner"]';
			waitForElm(promoBannerSelector).then(() => {
				const promoBannerElm = document.querySelector(promoBannerSelector);
				promoBannerElm.remove();
			});
		}
	}

	function extractExtensionId() {
		const urlParts = window.location.href.split("/");
		let extensionId = urlParts.pop();
		return extensionId.includes("?") ? extensionId.split("?")[0] : extensionId;
	}

	function generateCdnUrl(extensionId, isChrome = true) {
		const baseUrl = isChrome
			? `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&prodversion=${VERSION}`
			: "https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect";
		return `${baseUrl}&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;
	}

	function enableChromeGoogleStoreDownload(extensionId) {
		document.querySelector("#cwspage.cx-cannot-install").classList.remove("cx-cannot-install");

		const addBtn = document.querySelector("#cx-install-free-btn[disabled]");
		if (!addBtn) return;
		addBtn.removeAttribute("disabled");
		addBtn.addEventListener("click", () => { window.location.href = generateCdnUrl(extensionId); });
	}

	function enableChromeWebStoreDownload(extensionId) {
		const addBtn = document.querySelector(`[data-p*="${extensionId}"] button[jsaction*="click"][disabled]:not([aria-label])`);
		if (!addBtn) return;
		addBtn.removeAttribute("disabled");
		addBtn.addEventListener("click", () => { window.location.href = generateCdnUrl(extensionId); });
	}

	function enableEdgeDownload(extensionId) {
		const getBtn = document.querySelector(`#getOrRemoveButton-${extensionId}[disabled]`);
		if (!getBtn) return;
		getBtn.removeAttribute("disabled");
		getBtn.style.setProperty ("cursor", "pointer", "important");
		getBtn.style.opacity = 1;
		getBtn.addEventListener("click", () => { window.location.href = generateCdnUrl(extensionId, false); });
	}

	function enableAllEdgeButtons() {
		document.querySelectorAll(`
			button[id*="getOrRemoveButton"][disabled],
			button[id*="installButton"][disabled],
			button[name="GetButton"]
		`).forEach(getBtn => {
			const extensionId = getBtn.id.split("-").pop();
			getBtn.removeAttribute("disabled");
			getBtn.style.setProperty ("cursor", "pointer", "important");
			getBtn.style.opacity = 1;
			getBtn.addEventListener("click", () => { window.location.href = generateCdnUrl(extensionId, false); });
		});
	}

	function initDownloader() {
		const url = window.location.href;
		const extensionId = extractExtensionId();

		if (url.includes("chrome.google.com/webstore/detail/"))
			enableChromeGoogleStoreDownload(extensionId);
		else if (url.includes("chromewebstore.google.com/detail/"))
			enableChromeWebStoreDownload(extensionId);
		else if (url.includes("microsoftedge.microsoft.com/addons/detail/"))
			enableEdgeDownload(extensionId);
		else if (url.includes("microsoftedge.microsoft.com/addons/"))
			setInterval(enableAllEdgeButtons, 500); // Yes, this runs every half a second, I am too lazy and the buttons get created on hover which is annoying to keep track of.
	}

	removePromo();
	initDownloader();
	const titleObserver = new MutationObserver(() => { initDownloader(); });
	titleObserver.observe(document.querySelector('title'), { childList: true });
})();