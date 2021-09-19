import { GetStaticProps } from "next";
import Head from "next/head";
// import Image from "next/image";

import { ImageCard, Footer } from "../components";
import { ImageObj } from "../types";

import JE from "../assets/JE.png";
import { InstagramIcon } from "../assets/icons";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";

interface Props {
	latestImages: ImageObj[];
}

const columnHeight = (columnImages: ImageObj[]) => {
	return columnImages.reduce(
		(height, currentImage) => height + currentImage.size.height,
		0
	);
};

const findSmallImageColumn = (column: ImageObj[][]) => {
	const heights = column.map(columnHeight);

	return column[heights.findIndex((v) => v === Math.min(...heights))];
};

export default function Home(props: Props) {
	const mainElementRef = useRef<HTMLElement>();
	const [imageColumns, setImageColumns] = useState<ImageObj[][]>([
		props.latestImages,
	]);

	const links = [
		{
			icon: InstagramIcon,
			url: "https://instagram.com/je_logaranjan__",
		},
	];

	useEffect(() => {
		let galleryColumnCount = parseInt(
			getComputedStyle(mainElementRef.current).getPropertyValue(
				"--column-count"
			)
		);
		let imageColumnsTemp = new Array<ImageObj[]>(galleryColumnCount)
			.fill(null)
			.map(() => new Array());

		for (const image of props.latestImages) {
			const parentColumn = findSmallImageColumn(imageColumnsTemp);
			parentColumn.push(image);
		}

		setImageColumns(imageColumnsTemp);
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
						<h1 className={styles.profileCard_title}>Gallery Of JE</h1>
						<p className={styles.profileCard_description}>
							High-quality wallpapers
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
									return <ImageCard {...image} key={image.src} />;
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
	// TODO load them from database
	const latestImages: ImageObj[] = [
		{
			src: "/images/1.jpg",
			size: {
				width: 1080,
				height: 2340,
			},
		},
		{
			src: "/images/2.jpg",
			size: {
				width: 1080,
				height: 2340,
			},
		},
		{
			src: "/images/3.jpg",
			size: {
				width: 1639,
				height: 2048,
			},
		},
		{
			src: "/images/4.jpeg",
			size: {
				width: 1319,
				height: 1600,
			},
		},
		{
			src: "/images/5.jpg",
			size: {
				width: 1080,
				height: 1350,
			},
		},
		{
			src: "/images/6.jpg",
			size: {
				width: 752,
				height: 1128,
			},
		},
		{
			src: "/images/7.jpg",
			size: {
				width: 1080,
				height: 1350,
			},
		},
		{
			src: "/images/8.jpg",
			size: {
				width: 1080,
				height: 1354,
			},
		},
		{
			src: "/images/9.jpg",
			size: {
				width: 660,
				height: 1037,
			},
		},
		{
			src: "/images/10.jpg",
			size: {
				width: 1000,
				height: 1500,
			},
		},
	];

	return {
		props: {
			latestImages,
		},
	};
};
