import Image from "next/image";

import { ImageInfoObjLocal } from "../types";

import downloadIcon from "../assets/icons/tabler-icon-download.svg";
import styles from "../styles/image-card.module.css";

type Props = ImageInfoObjLocal;

export default function ImageCard(props: Props) {
	return (
		<div className={styles.container}>
			<div className={styles.downloadIconContainer}>
				<a download={props.downloadFilename} href={props.downloadUrl}>
					<img
						className={styles.downloadIcon}
						src={downloadIcon.src}
						width={downloadIcon.width}
						height={downloadIcon.height}
					/>
				</a>
			</div>

			<Image
				src={props.imageUrl}
				className={styles.image}
				width={props.width}
				height={props.height}
			/>
		</div>
	);
}
