import Image from "next/image";

import { ImageObj } from "../types";

import downloadIcon from "../assets/icons/tabler-icon-download.svg";
import styles from "../styles/image-card.module.css";

type Props = ImageObj;

export default function ImageCard(props: Props) {
	console.log(downloadIcon);
	return (
		<div className={styles.container}>
			<div className={styles.downloadIconContainer}>
				<a download href={props.src}>
				<img className={styles.downloadIcon} src={downloadIcon.src} width={downloadIcon.width} height={downloadIcon.height} />
				</a>
			</div>

			<Image src={props.src} className={styles.image} width={props.size.width} height={props.size.height} />
		</div>
	);
}
