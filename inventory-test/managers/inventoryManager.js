import itemData from "../data/items.json" assert { type: "json" };
import Item from "../objects/Item.js";
import { globals } from "../globals.js";
import { initializeTooltips } from "./tooltipManager.js";

//#region Debug Functions - Should Be Deleted Later

function populateButtons() {
	const buttonContainer = document.querySelector(".buttons");
	let buttons = [];

	itemData.items.forEach((item) => {
		let newButton = document.createElement("button");
		newButton.id = `${item.name}Button`;
		newButton.type = "button";
		newButton.innerText = `Collect ${item.name}`;
		buttons.push(newButton);
		buttonContainer.appendChild(newButton);
	});

	buttons.forEach((button, index) => {
		button.addEventListener("click", () => {
			let item = itemData.items[index];
			addItemToInventory(item);
		});
	});
}

//#endregion

//#region Inventory Management Functions

function addItemToInventory(itemData) {
	// Get result of current item that is not max stack size
	let result = globals.inventory.content.filter((i) => i?.itemId === itemData.itemId && i?.count < i?.maxCount);

	if (result[0]) {
		// Increase count of first item that is of type but not max count
		result[0].count++;
	} else {
		// Item is not in inventory or is max count, create and add it
		createAndAddItemToInventory(itemData);
	}

	console.log("inventory: ", globals.inventory.content);
	redrawInventory();
}

function createAndAddItemToInventory(itemData) {
	// Prevent items being added to full inventory
	if (globals.inventory.content.length + 1 > globals.inventory.unlockedSlots) return;

	// Create and add item to globals inventory array
	let newItem = new Item(itemData.itemId, itemData.name, itemData.description, itemData.type, itemData.stats, itemData.maxCount);
	newItem.slotId = Date.now();

	// Get first empty or undefined slot in the inventory array and place new item there
	globals.inventory.content[getEmptySlots()[0]] = newItem;
}

function moveItemsInInventory(start, end) {
	// Gets the index of the start slot and end slot by slotId
	// End slot depending on type, which depends on whether it is a swap or an empty slot
	let startIndex = getItemIndexBySlotId(parseInt(start));
	let endIndex = typeof end === "string" ? getItemIndexBySlotId(parseInt(end)) : [...getSlotElements()].indexOf(end);

	// Move to the new inventory spot
	let temp = globals.inventory.content[startIndex];
	globals.inventory.content[startIndex] = globals.inventory.content[endIndex];
	globals.inventory.content[endIndex] = temp;
}

function addItemElement(item, slot) {
	// If the item doesn't exist or is undefined, reset the slotId and return
	if (!item) {
		slot.dataset.slotId = "";
		return;
	}

	// Creates a new element, appends it and sets the slotId
	const newItemElement = item.getElement();
	addItemEventListeners(newItemElement);
	slot.appendChild(newItemElement);
	slot.dataset.slotId = item.slotId;
}

function redrawInventory() {
	// Get global inventory
	const inventoryItems = globals.inventory.content;
	// Get inventory elements
	const inventorySlots = [...getSlotElements()];

	// For each non-empty global inventory slot, draw new element for item in slot
	inventoryItems.forEach((item, index) => {
		wipeChildren(inventorySlots[index]); // Wipe existing item element
		addItemElement(item, inventorySlots[index]); // Create and append new item element with updated info
	});
}

//#endregion

//#region Helper Functions

function getEmptySlots() {
	let emptySlots = [];

	// Populate emptySlots array with indexes where inventory array has an empty or undefined value
	for (let i = 0; i < globals.inventory.unlockedSlots; i++) {
		if (globals.inventory.content[i] != undefined) {
		} else {
			emptySlots.push(i);
		}
	}
	return emptySlots;
}

function wipeChildren(element) {
	// Get rid of all the children of the given element
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

function deleteItem(element) {
	// Gets the global inventory index by element slotId, sets it to undefined, and redraws the inventory
	let index = getItemIndexBySlotId(parseInt(element.parentNode.dataset.slotId));
	globals.inventory.content[index] = undefined;
	redrawInventory();
}

function addItemEventListeners(itemElement) {
	// Adds all the required event listners to given element
	itemElement.addEventListener("dragstart", dragStart);
	itemElement.addEventListener("dragover", dragOver);
	itemElement.addEventListener("dragend", dragEnd);
	itemElement.addEventListener("drop", drop);
	itemElement.addEventListener("click", clickItem);
	itemElement.addEventListener("mouseover", showDeleteCursor);
}

function getItemIndexBySlotId(slotId) {
	return globals.inventory.content.findIndex((item) => item?.slotId === slotId);
}

function getSlotElements() {
	return document.querySelectorAll(".slot");
}

//#endregion

//#region EventListener Functions

function clickItem(e) {
	// Delete the item when shift clicked
	if (e.shiftKey) {
		deleteItem(e.target);
	}
}

function showDeleteCursor(e) {
	if (e.shiftKey) {
		e.target.classList.add("delete");
	} else {
		e.target.classList.remove("delete");
	}
}

function dragStart(e) {
	// Get the closest element with the class "item" from target
	const nearestItemElement = e.target.closest(".item");

	// If the nearest element exists, pack in the slotId for the dataTransfer on drop
	if (nearestItemElement) {
		e.dataTransfer.setData("text/plain", nearestItemElement.parentNode.dataset.slotId);
	}

	// Some trickery to make the item in the cell that we started the drag disappear
	setTimeout(() => {
		e.target.classList.add("hide");
	}, 0);
}

function dragOver(e) {
	e.preventDefault();
	// Makes sure slot element is being given the dragover class and not the item element
	if (e.target.classList.contains("item")) {
		e.target.parentNode.classList.add("dragover");
	} else {
		e.target.classList.add("dragover");
	}
}

function dragEnd(e) {
	// Removes the hide class if the element has it, prevents unwanted hidden items
	if (e.target.classList.contains("hide")) {
		e.target.classList.remove("hide");
	}
}

function dragExit(e) {
	// Removes dragover from both all targets, prevents dragover from persisting when mouse exits at weird angles
	e.target.classList.remove("dragover");
	e.target.parentNode.classList.remove("dragover");
}

function drop(e) {
	e.preventDefault();
	e.stopImmediatePropagation(); // This fixes the drop event being called multiple times and breaking shit

	const startSlotId = e.dataTransfer.getData("text/plain");
	const endSlotId = e.target.closest(".slot").dataset.slotId;

	if (startSlotId !== endSlotId) {
		if (!endSlotId) {
			moveItemsInInventory(startSlotId, e.target.closest(".slot"));
		} else {
			moveItemsInInventory(startSlotId, endSlotId);
		}
	}
	e.target.classList.remove("dragover");
	e.target.parentNode.classList.remove("dragover");
	redrawInventory();
}

//#endregion

//#region Initialization Functions

function initializeSlots() {
	const slots = document.querySelectorAll(".slot");

	slots.forEach((slot) => {
		slot.addEventListener("dragstart", dragStart);
		slot.addEventListener("dragover", dragOver);
		slot.addEventListener("dragleave", dragExit);
		slot.addEventListener("drop", drop);
	});
}

function initializeInventory() {
	populateButtons();
	initializeSlots();
}

//#endregion

export { initializeInventory };
