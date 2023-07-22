const tooltipContainer = document.getElementById("tooltip");
let showTooltipTimeout;
let itemArray;

function initializeTooltips(items) {
	itemArray = items;

	document.body.addEventListener("mouseover", (event) => {
		if (event.target.classList.contains("tooltipped")) {
			handleMouseOver(event);
		} else {
			hideTooltip();
		}
	});

	document.body.addEventListener("mouseout", (event) => {
		if (event.target.classList.contains("tooltipped")) {
			handleMouseOut();
		}
	});

	document.body.addEventListener("mousemove", (event) => {
		if (event.target.classList.contains("tooltipped")) {
			handleMouseMove(event);
		} else {
			hideTooltip();
		}
	});
}

//#region Tooltip Management Functions
function createTooltipElement(itemId) {
	let item = itemArray.find((item) => parseInt(itemId) === item.itemId);

	let itemDetails = document.createElement("div");
	itemDetails.classList.add("itemDetails");

	let topSection = document.createElement("div");
	topSection.classList.add("top");

	let itemIcon = document.createElement("img");
	itemIcon.classList.add("icon");
	itemIcon.setAttribute("title", "Item icon");
	itemIcon.setAttribute("src", item.getImageSrc());

	let titleTypeContainer = document.createElement("div");

	let itemName = document.createElement("div");
	itemName.classList.add("name");
	itemName.innerText = item.name;

	let itemType = document.createElement("div");
	itemType.classList.add("type");
	itemType.innerText = format(item.type);

	let topHorizontalRule = document.createElement("hr");

	let itemDescription = document.createElement("div");
	itemDescription.classList.add("description");
	itemDescription.innerText = item.description;

	let bottomHorizontalRule = document.createElement("hr");

	let itemStats = document.createElement("div");
	let statTitle = Object.keys(item.stats)[0];
	itemStats.classList.add("stats");
	itemStats.innerText = `${format(statTitle)}: ${item.stats[statTitle]}`;

	itemDetails.appendChild(topSection);
	itemDetails.appendChild(topHorizontalRule);
	itemDetails.appendChild(itemDescription);
	itemDetails.appendChild(bottomHorizontalRule);
	itemDetails.appendChild(itemStats);

	topSection.appendChild(itemIcon);
	topSection.appendChild(titleTypeContainer);

	titleTypeContainer.appendChild(itemName);
	titleTypeContainer.appendChild(itemType);

	return itemDetails;
}

function showTooltip(element, x, y) {
	tooltipContainer.innerHTML = "";
	tooltipContainer.appendChild(element);
	tooltipContainer.style.display = "block";
	tooltipContainer.style.left = `${x + 15}px`;
	tooltipContainer.style.top = `${y + 15}px`;
}

function hideTooltip() {
	tooltipContainer.style.display = "none";
}

function updateTooltipPosition(x, y) {
	const tooltipWidth = tooltipContainer.clientWidth;
	const tooltipHeight = tooltipContainer.clientHeight;
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	if (x + tooltipWidth > viewportWidth) {
		x = viewportWidth - tooltipWidth;
	}

	if (y + tooltipHeight > viewportHeight) {
		y = viewportHeight - tooltipHeight;
	}

	tooltipContainer.style.left = `${x + 15}px`;
	tooltipContainer.style.top = `${y + 15}px`;
}
//#endregion

//#region Mouse Event Functions
function handleMouseOver(event) {
	let id = event.target.id;
	let element = createTooltipElement(id);
	const delay = 0;

	showTooltipTimeout = setTimeout(() => {
		const x = event.clientX;
		const y = event.clientY;
		showTooltip(element, x, y);
	}, delay);
}

function handleMouseOut() {
	clearTimeout(showTooltipTimeout);
	hideTooltip();
}

function handleMouseMove(event) {
	const x = event.clientX;
	const y = event.clientY;
	updateTooltipPosition(x, y);
}
//#endregion

//#region Helper Functions
function format(string) {
	string = string.toLowerCase();
	let splitString = string.split(" ");

	for (let i = 0; i < splitString.length; i++) {
		splitString[i] = splitString[i].charAt(0).toUpperCase() + splitString[i].slice(1);
	}

	return splitString.join(" ");
}
//#endregion

export { initializeTooltips };
