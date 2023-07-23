const globals = {
	inventory: {
		columns: 10,
		rows: 5,
		totalSlots: 0,
		unlockedSlots: 0,
		lockedSlots: 0,
		content: [],
	},
};

let totalSlots = globals.inventory.columns * globals.inventory.rows;
globals.inventory.totalSlots = totalSlots;
globals.inventory.unlockedSlots = totalSlots;
globals.inventory.lockedSlots = totalSlots - globals.inventory.unlockedSlots;

export { globals };
