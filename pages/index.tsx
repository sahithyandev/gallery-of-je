import { GetStaticProps } from "next";
import Head from "next/head";
// import Image from "next/image";

import { ImageCard, Footer } from "../components";
import { ImageObj } from "../types";

import JE from "../assets/JE.png";
import { InstagramIcon } from "../assets/icons";
import styles from "../styles/Home.module.css";

interface Props {
	latestImages: ImageObj[];
}

export default function Home(props: Props) {
	const links = [
		{
			icon: InstagramIcon,
			url: "https://instagram.com/je_logaranjan__",
		},
	];

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
					<h1 className={styles.profileCard_title}>Gallery Of JE</h1>
					<div className={styles.profileCard_socialLinks}>
						{links.map((link) => {
							return (
								<a href={link.url}>
									<img src={link.icon.src} />
								</a>
							);
						})}
					</div>
				</div>

				<div className={styles.imagesContainer}>
					{props.latestImages.map((imageObj) => {
						return <ImageCard key={imageObj.src} {...imageObj} />;
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
	];

	return {
		props: {
			latestImages,
		},
	};
};
