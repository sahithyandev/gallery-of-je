import { ImageCategoryLocal, ImageInfoObjLocal } from "../types";
import { ImageGalleryColumn } from "./image-gallery-column";

export class ImageGallery {
	private items: ImageInfoObjLocal[];
	private itemsToShow: ImageInfoObjLocal[];

	constructor(items?: ImageInfoObjLocal[]) {
		this.items = [];
		this.itemsToShow = [];

		items.forEach((item) => {
			this.add(item);
		});
		this.filterCategory("all");
	}

	add(item: ImageInfoObjLocal) {
		this.items.push(item);
	}

	filterCategory(category: ImageCategoryLocal) {
		this.itemsToShow = this.items.filter((item) => {
			if (category === "all") return true;

			return item.category === category;
		});

		return this;
	}

	createColumns(columnCount: number, columnSize: number): ImageGalleryColumn[] {
		const columns = new Array(columnCount)
			.fill(0)
			.map(() => new ImageGalleryColumn());

		let smallestColumnIndex = 0;
		for (const item of this.itemsToShow) {
			const smallestColumn = columns[smallestColumnIndex];

			smallestColumn.add({
				...item,
				displayHeight: parseInt(
					(columnSize * (item.height / item.width)).toFixed(2)
				),
				displayWidth: columnSize,
			});

			// update smallestColumnIndex
			const columnHeights = columns.map((c) => c.height);
			const newSmallestHeight = Math.min(...columnHeights);
			smallestColumnIndex = columns
				.map((c) => c.height)
				.findIndex((height) => height === newSmallestHeight);
		}

		return columns;
	}
}
