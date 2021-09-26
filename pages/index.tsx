import { GetStaticProps } from "next";
import Head from "next/head";
import sharp from "sharp";

import { ImageCard, Footer } from "../components";
import { ImageInfoObjLocal } from "../types";
import { ImageGallery } from "../models/image-gallery";

import JE from "../assets/JE.png";
import GalleryOfJE from "../assets/gallery-of-je.png";
import { InstagramIcon } from "../assets/icons";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";

import supabase from "../models/supabase-connection";

interface Props {
	latestImages: ImageInfoObjLocal[];
	totalDownloadCount: number;
}

export default function Home(props: Props) {
	const imageContainerRef = useRef<HTMLDivElement>();
	const imageGallery = new ImageGallery(props.latestImages);
	const [imageColumns, setImageColumns] = useState<ImageInfoObjLocal[][]>([
		props.latestImages,
	]);

	const links = [
		{
			icon: InstagramIcon,
			url: "https://instagram.com/gallery_of_je",
			text: "Gallery Of JE",
		},
		{
			icon: InstagramIcon,
			url: "https://instagram.com/je_logaranjan",
			text: "JE Logaranjan",
		},
	];

	const _columnResize = () => {
		let oldGalleryColumnCount = 1;

		return () => {
			const imageContainerStyles = getComputedStyle(imageContainerRef.current);
			let galleryColumnCount = parseInt(
				imageContainerStyles.getPropertyValue("--column-count")
			);

			const columnWidth = (() => {
				const parentWidth = imageContainerRef.current.offsetWidth;
				// TODO keep an eye on it
				const columnGap = parseInt(
					imageContainerStyles.getPropertyValue("--column-gap")
				);

				return Math.floor(
					(parentWidth - (galleryColumnCount - 1) * columnGap) /
						galleryColumnCount
				);
			})();

			if (galleryColumnCount === oldGalleryColumnCount) return;

			setImageColumns(
				imageGallery
					.createColumns(galleryColumnCount, columnWidth)
					.map((v) => v.images)
			);
		};
	};

	useEffect(() => {
		const columnResize = _columnResize();
		columnResize();
		window.addEventListener("resize", () => {
			columnResize();
		});
	}, [imageContainerRef]);

	return (
		<div className={styles.homePageContainer}>
			<Head>
				<title>Gallery Of JE</title>
			</Head>

			<main className={styles.main}>
				<div className={styles.profileCard}>
					<img
						src={JE.src}
						width={JE.width}
						height={JE.height}
						className={styles.profileCard_image}
					/>
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
					<div className={styles.profileCard_totalDownloads}>
						{props.totalDownloadCount} downloads
					</div>
					<div className={styles.profileCard_socialLinks}>
						{links.map((link) => {
							return (
								<a key={link.url} href={link.url}>
									<div className={styles.profileCard_socialLinkDiv}>
										<img src={link.icon.src} />
										<span>{link.text}</span>
									</div>
								</a>
							);
						})}
					</div>
				</div>

				<div className={styles.imagesContainer} ref={imageContainerRef}>
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

export const getStaticProps: GetStaticProps<Props> = async () => {
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

	const totalDownloadCount = await supabase.totalDownloadCount();

	return {
		props: {
			latestImages: latestImagesLocal,
			totalDownloadCount,
		},
		revalidate: REVALIDATION_TIME,
	};
};
