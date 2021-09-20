import { GetStaticProps } from "next";
import Head from "next/head";

import { ImageCard, Footer } from "../components";
import { ImageInfoObjLocal } from "../types";

import JE from "../assets/JE.png";
import GalleryOfJE from "../assets/gallery-of-je.png";
import { InstagramIcon } from "../assets/icons";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";

import supabase from "../models/supabase-connection";

interface Props {
	latestImages: ImageInfoObjLocal[];
}

const columnHeight = (columnImages: ImageInfoObjLocal[]) => {
	return columnImages.reduce(
		(height, currentImage) => height + currentImage.height,
		0
	);
};

const findSmallImageColumn = (column: ImageInfoObjLocal[][]) => {
	const heights = column.map(columnHeight);

	return column[heights.findIndex((v) => v === Math.min(...heights))];
};

export default function Home(props: Props) {
	const mainElementRef = useRef<HTMLElement>();
	const [imageColumns, setImageColumns] = useState<ImageInfoObjLocal[][]>([
		props.latestImages,
	]);

	const links = [
		{
			icon: InstagramIcon,
			url: "https://instagram.com/je_logaranjan__",
		},
	];

	const _columnResize = () => {
		let oldGalleryColumnCount = 1;
		return () => {
			let galleryColumnCount = parseInt(
				getComputedStyle(mainElementRef.current).getPropertyValue(
					"--column-count"
				)
			);

			if (galleryColumnCount === oldGalleryColumnCount) return;

			let imageColumnsTemp = new Array<ImageInfoObjLocal[]>(galleryColumnCount)
				.fill(null)
				.map(() => new Array());

			for (const image of props.latestImages) {
				const parentColumn = findSmallImageColumn(imageColumnsTemp);
				parentColumn.push(image);
			}

			oldGalleryColumnCount = galleryColumnCount;
			setImageColumns(imageColumnsTemp);
		};
	};

	useEffect(() => {
		const columnResize = _columnResize();
		columnResize();
		console.log("effect");
		window.addEventListener("resize", () => {
			columnResize();
		});
	}, [mainElementRef]);

	return (
		<div className={styles.homePageContainer}>
			<Head>
				<title>Gallery Of JE</title>
			</Head>

			<main className={styles.main} ref={mainElementRef}>
				<div className={styles.profileCard}>
					<img
						src={JE.src}
						width={JE.width}
						height={JE.height}
						className={styles.profileCard_image}
					/>
					<div className={styles.profileCard_secondColumn}>
						<img
							src={GalleryOfJE.src}
							width={GalleryOfJE.width}
							height={GalleryOfJE.height}
							className={styles.profileCard_titleImage}
						/>
						<p className={styles.profileCard_description}>
							Retouched photos using Lightroom CC & Photoshop. Reach me out on
							Instagram for the Presets Dngs used in these images.
						</p>
						<div className={styles.profileCard_socialLinks}>
							{links.map((link) => {
								return (
									<a key={link.url} href={link.url}>
										<img src={link.icon.src} />
									</a>
								);
							})}
						</div>
					</div>
				</div>

				<div className={styles.imagesContainer}>
					{imageColumns.map((imageColumn, i) => {
						return (
							<div key={i} className={styles.imagesContainer_column}>
								{imageColumn.map((image) => {
									return <ImageCard {...image} key={image.downloadUrl} />;
								})}
							</div>
						);
					})}
				</div>
			</main>

			<Footer />
		</div>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const latestImages = await supabase.getAllImages();

	return {
		props: {
			latestImages: latestImages.map((imageInfo) => {
				const downloadUrl = `/api/download-image?filename=${imageInfo.downloadFilename}`;
				const imageUrl = supabase.imageUrl(imageInfo.downloadFilename);

				return {
					width: imageInfo.width,
					height: imageInfo.height,
					downloadFilename: imageInfo.downloadFilename,
					downloadUrl,
					imageUrl,
				};
			}) as ImageInfoObjLocal[],
		},
	};
};
