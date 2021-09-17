import Head from "next/head";
import { Fragment } from "react";
// import styles from "../styles/Home.module.css";

export default function Home() {
	const latestImages = [
		"/images/1.jpg",
		"/images/2.jpg",
		"/images/3.jpg",
		"/images/4.jpg",
	];

	return (
		<Fragment>
			<Head>
				<title>Gallery Of JE</title>
			</Head>

			{/* <span>Hii</span> */}
			<div className="image-container">
				{latestImages.map((image) => {
					return <img src={image} key={image} />;
				})}
			</div>
		</Fragment>
	);
	// return <div className={styles.container}></div>;
}
