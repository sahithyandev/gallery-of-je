import { ImageInfoObjLocal } from "../types";
import { ImageGalleryColumn } from "./image-gallery-column";

export class ImageGallery {
	private items: ImageInfoObjLocal[];

	constructor(items?: ImageInfoObjLocal[]) {
		this.items = [];

		items.forEach((item) => this.add(item));
	}

	add(item: ImageInfoObjLocal) {
		this.items.push(item);
	}

	createColumns(columnCount: number, columnSize: number): ImageGalleryColumn[] {
		const columns = new Array(columnCount)
			.fill(0)
			.map(() => new ImageGalleryColumn());

		let smallestColumnIndex = 0;

		for (const item of this.items) {
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
