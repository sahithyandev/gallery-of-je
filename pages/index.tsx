import { GetStaticProps } from "next";
import Head from "next/head";
import sharp from "sharp";

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
			url: "https://instagram.com/gallery_of_je",
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
							placeholder="blur"
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
	require("isomorphic-fetch");
	const REVALIDATION_TIME = 1 * 60 * 60; // 1 hour
	const THUMBNAIL_QUALITY = 8; //40;

	const latestImages = await supabase.getAllImages();

	const thumbFunc = async (imageUrl: string) => {
		const imageResponse = await fetch(imageUrl);
		const imageArrBuffer = await imageResponse.arrayBuffer();
		const imageBuffer = Buffer.from(imageArrBuffer);

		const dominantColor = (await sharp(imageBuffer).stats()).dominant;

		const thumb = await sharp(imageBuffer)
			.resize(THUMBNAIL_QUALITY, undefined)
			.tint(dominantColor)
			.png()
			.toBuffer();

		const thumbUrl = `data:image/png;base64,${thumb.toString("base64")}`;
		return thumbUrl;
	};

	const latestImagesLocal: ImageInfoObjLocal[] = await Promise.all(
		latestImages.map(async (imageInfo) => {
			const downloadUrl = `/api/download-image?filename=${imageInfo.downloadFilename}`;
			const imageUrl = supabase.imageUrl(imageInfo.downloadFilename);
			const thumbnailUrl = await thumbFunc(imageUrl);

			return {
				width: imageInfo.width,
				height: imageInfo.height,
				downloadFilename: imageInfo.downloadFilename,
				downloadUrl,
				imageUrl,
				thumbnailUrl,
			} as ImageInfoObjLocal;
		})
	);

	return {
		props: {
			latestImages: latestImagesLocal,
		},
		revalidate: REVALIDATION_TIME,
	};
};
