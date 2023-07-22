export default class Item {
	constructor(itemId, name, description, type, stats) {
		this.slotId = null;
		this.itemId = itemId;
		this.name = name;
		this.description = description;
		this.type = type;
		this.count = 1;
		this.stats = stats;
	}

	getElement() {
		const element = document.createElement("div");
		const icon = document.createElement("img");
		const count = document.createElement("div");
		element.classList.add("item");
		element.classList.add("tooltipped");
		element.id = this.itemId;
		element.setAttribute("draggable", "true");
		icon.classList.add("icon");
		icon.setAttribute("title", "");
		icon.setAttribute("src", this.getImageSrc());
		count.classList.add("count");
		count.innerText = this.count;

		element.appendChild(icon);
		element.appendChild(count);

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
