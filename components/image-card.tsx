import Image from "next/image";

import { ImageInfoObj } from "../types";

import downloadIcon from "../assets/icons/tabler-icon-download.svg";
import styles from "../styles/image-card.module.css";

type Props = ImageInfoObj;

export default function ImageCard(props: Props) {
	return (
		<div className={styles.container}>
			<div className={styles.downloadIconContainer}>
				<a download href={props.downloadUrl}>
					<img
						className={styles.downloadIcon}
						src={downloadIcon.src}
						width={downloadIcon.width}
						height={downloadIcon.height}
					/>
				</a>
			</div>

			<Image
				src={props.downloadUrl}
				className={styles.image}
				width={props.width}
				height={props.height}
			/>
		</div>
	);
}
