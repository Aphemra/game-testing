export default class Item {
	constructor(slotId, itemId, name, description, type, stats) {
		this.slotId = slotId;
		this.itemId = itemId;
		this.name = name;
		this.description = description;
		this.type = type;
		this.stats = stats;
	}

	getElement() {
		const element = document.createElement("img");
		element.classList.add("item");
		element.classList.add("tooltipped");
		element.id = this.itemId;
		element.setAttribute("draggable", "true");
		element.setAttribute("title", "");
		element.setAttribute("src", this.getImageSrc());

		return element;
	}

	getImageSrc() {
		switch (this.itemId) {
			case 1:
				return "./assets/items/food.png";
			case 2:
				return "./assets/items/weapon.png";
			case 3:
				return "./assets/items/armor.png";
		}
	}
}
