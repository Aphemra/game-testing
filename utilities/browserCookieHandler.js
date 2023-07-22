function setCookie(cname, cvalue) {
	const d = new Date();
	d.setTime(d.getTime() + 400 * 24 * 60 * 60 * 1000);
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function deleteCookie(cname) {
	const d = new Date();
	d.setTime(d.getTime() - 400 * 24 * 60 * 60 * 1000);
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + "" + ";" + expires + ";path=/";
}

function getCookie() {
	let name = "savedgame=";
	let ca = document.cookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function doesSavedGameExist(savedGame) {
	return getCookie() != "";
}

export { setCookie, getCookie, deleteCookie, doesSavedGameExist };
