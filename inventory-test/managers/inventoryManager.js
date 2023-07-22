import itemData from "../data/items.json" assert { type: "json" };
import Item from "../objects/Item.js";
import { initializeTooltips } from "./tooltipManager.js";

const items = [];

// Function to initialize the inventory
function initializeInventory() {
	populateItemArray();
	populateButtons();
	initializeSlots();
	initializeTooltips(items);
}

//#region Drag and Drop Functions
function dragStart(e) {
	const item = e.target.closest(".item");
	if (item) {
		e.dataTransfer.setData("text/plain", item.parentNode.dataset.itemid);
	}
	setTimeout(() => {
		e.target.classList.add("hide");
	}, 0);
}

function dragOver(e) {
	e.preventDefault();
	if (e.target.classList.contains("item")) {
		e.target.parentNode.classList.add("dragover");
	} else {
		e.target.classList.add("dragover");
	}
}

function dragEnd(e) {
	if (e.target.classList.contains("hide")) {
		e.target.classList.remove("hide");
	}
}

function dragExit(e) {
	e.target.classList.remove("dragover");
}

function drop(e, slots) {
	e.preventDefault();
	const draggedItemId = e.dataTransfer.getData("text");
	const droppedItemId = e.target.closest(".slot").dataset.itemid;
	if (draggedItemId !== droppedItemId) {
		if (!droppedItemId) {
			moveItemToEmptySlot(draggedItemId, e.target.closest(".slot"), slots);
		} else {
			swapItems(draggedItemId, droppedItemId);
		}
	}

	document.querySelector(`[data-itemid="${draggedItemId}"]`).children[0].classList.remove("hide");

	e.target.classList.remove("dragover");
	e.target.parentNode.classList.remove("dragover");
}
//#endregion

//#region Setup Functions
function populateItemArray() {
	const itemsData = itemData.items;

	itemsData.forEach((item) => {
		let itemObj = new Item(null, item.itemId, item.name, item.description, item.type, item.stats);
		items.push(itemObj);
	});
}

function populateButtons() {
	const buttonContainer = document.querySelector(".buttons");
	let buttons = [];

	items.forEach((item) => {
		let newButton = document.createElement("button");
		newButton.id = `${item.name}Button`;
		newButton.type = "button";
		newButton.innerText = `Collect ${item.name}`;
		buttons.push(newButton);
		buttonContainer.appendChild(newButton);
	});

	buttons.forEach((button, index) => {
		button.addEventListener("click", () => {
			let item = items[index];
			item.slotId = Date.now();
			addItemToInventory(item);
		});
	});
}

function initializeSlots() {
	const slots = document.querySelectorAll(".slot");

	slots.forEach((slot) => {
		slot.addEventListener("dragstart", dragStart);
		slot.addEventListener("dragover", dragOver);
		slot.addEventListener("dragleave", dragExit);
		slot.addEventListener("drop", (event) => drop(event, slots));
	});
}
//#endregion

//#region Inventory Management Functions
function addItemToInventory(itemData) {
	const inventory = getInventoryArray();
	const emptySlotIndex = inventory.findIndex((itemId) => !itemId);

	if (emptySlotIndex === -1) {
		showWarning("Not enough inventory space!");
		return;
	}

	inventory[emptySlotIndex] = itemData.slotId;
	updateInventoryView(inventory, itemData);
}

function moveItemToEmptySlot(itemId, targetSlot, slots) {
	const inventory = getInventoryArray();
	const sourceIndex = inventory.findIndex((item) => item === parseInt(itemId));
	const targetIndex = Array.from(targetSlot.parentNode.children).indexOf(targetSlot);

	inventory[targetIndex] = inventory[sourceIndex];
	inventory[sourceIndex] = "";

	const sourceImg = targetSlot.parentNode.parentNode.querySelector(`[data-itemid="${itemId}"]`).children[0];
	targetSlot.appendChild(sourceImg);

	targetSlot.dataset.itemid = itemId;
	slots[sourceIndex].dataset.itemid = "";
}

function swapItems(itemId1, itemId2) {
	const inventory = getInventoryArray();

	const index1 = inventory.findIndex((item) => item === parseInt(itemId1));
	const index2 = inventory.findIndex((item) => item === parseInt(itemId2));

	[inventory[index1], inventory[index2]] = [inventory[index2], inventory[index1]];

	const inventoryTable = document.querySelector(".inventory");
	const slots = inventoryTable.querySelectorAll(".slot");
	const item1 = slots[index1].querySelector(".item");
	const item2 = slots[index2].querySelector(".item");
	swapItemAttributes(item1, item2);

	[slots[index1].dataset.itemid, slots[index2].dataset.itemid] = [slots[index2].dataset.itemid, slots[index1].dataset.itemid];

	document.querySelector(`[data-itemid="${itemId2}"]`).children[0].classList.remove("hide");
}

function swapItemAttributes(item1, item2) {
	const tempSrc = item1.src;
	const tempId = item1.id;
	const tempTitle = item1.title;

	item1.src = item2.src;
	item1.id = item2.id;
	item1.title = item2.title;

	item2.src = tempSrc;
	item2.id = tempId;
	item2.title = tempTitle;
}

function updateInventoryView(inventory, itemData) {
	const inventoryTable = document.querySelector(".inventory");
	const slots = inventoryTable.querySelectorAll(".slot");

	inventory.forEach((itemId, index) => {
		const slot = slots[index];
		const itemElement = slot.querySelector(".item");

		if (itemId) {
			if (!itemElement) {
				const newItemElement = itemData.getElement();
				newItemElement.addEventListener("dragstart", dragStart);
				newItemElement.addEventListener("dragover", dragOver);
				newItemElement.addEventListener("dragend", dragEnd);
				newItemElement.addEventListener("drop", drop);
				newItemElement.addEventListener("click", (event) => clickItem(event, newItemElement));
				newItemElement.addEventListener("mouseover", (event) => showDeleteCursor(event, newItemElement));
				slot.appendChild(newItemElement);
			}
			slot.dataset.itemid = itemId;
		} else {
			slot.dataset.itemid = "";
			if (itemElement) {
				slot.removeChild(itemElement);
			}
		}
	});
}

function clickItem(e, element) {
	if (e.shiftKey) {
		deleteItem(element);
	}
}

function deleteItem(element) {
	const parent = element.parentNode;
	element.remove();
	parent.dataset.itemid = "";
}
//#endregion

//#region Helper Functions
function showWarning(warningMessage) {
	const warning = document.getElementById("warning");
	warning.innerText = warningMessage;

	warning.style.display = "block";
	setTimeout(() => {
		warning.style.display = "none";
	}, 3500);
}

function showDeleteCursor(e, element) {
	if (e.shiftKey) {
		element.classList.add("delete");
	} else {
		element.classList.remove("delete");
	}
}

function getInventoryArray() {
	const slots = document.querySelectorAll(".slot");
	const inventoryArray = [];

	slots.forEach((slot) => {
		const itemId = slot.dataset.itemid;
		inventoryArray.push(itemId ? parseInt(itemId) : "");
	});

	return inventoryArray;
}
//#endregion

export { initializeInventory };
