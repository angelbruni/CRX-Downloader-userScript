// ==UserScript==
// @name         CRX Downloader
// @description  Allows for downloading ".crx" files directly from Chrome Web Store and Microsoft Edge Addons websites.
// @namespace    http://tampermonkey.net/
// @icon         https://www.chromium.org/favicon.ico
// @version      1.0.4
// @author       AngelBruni
// @match        https://chromewebstore.google.com/*
// @match        https://microsoftedge.microsoft.com/*
// @match        https://web.archive.org/web/2011*/https://chrome.google.com/webstore/*
// ==/UserScript==

(function() {
	const VERSION = "130.0";

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

		const addBtn = document.querySelector("#cx-install-free-btn");
		if (!addBtn) return;

		addBtn.removeAttribute("disabled");
		addBtn.addEventListener("click", () => { window.location.href = generateCdnUrl(extensionId); });
	}

	function enableChromeWebStoreDownload(extensionId) {
		const addBtn = document.querySelector(`[data-p*="${extensionId}"] button[jsaction*="click"]`);
		if (!addBtn) return;

		addBtn.removeAttribute("disabled");
		addBtn.addEventListener("click", () => { window.location.href = generateCdnUrl(extensionId); });
	}

	function enableEdgeDownload(extensionId) {
		const getBtn = document.querySelector(`#getOrRemoveButton-${extensionId}`);
		if (!getBtn) return;
		
		getBtn.removeAttribute("disabled");
		getBtn.style.setProperty ("cursor", "pointer", "important");
		getBtn.style.opacity = 1;
		getBtn.addEventListener("click", () => { window.location.href = generateCdnUrl(extensionId, false); });
	}

	function enableAllEdgeButtons() {
		document.querySelectorAll(`button[id*="getOrRemoveButton"]`).forEach(getBtn => {
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

	initDownloader();
	const titleObserver = new MutationObserver(() => { initDownloader(); });
	titleObserver.observe(document.querySelector('title'), { childList: true });
})();