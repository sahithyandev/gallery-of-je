import Image from "next/image";

import { ImageInfoObjLocal } from "../types";

import downloadIcon from "../assets/icons/tabler-icon-download.svg";
import styles from "../styles/image-card.module.css";

declare const pa;
type Props = ImageInfoObjLocal;

const imgixLoader = ({ src, width, quality }): string => {
	return `https://gallery-of-je.imgix.net/${src}?w=${width}&fit=clip&q=${
		quality || 75
	}`;
};

export default function ImageCard(props: Props) {
	const down = () => {
		pa.track({ name: "Image Download", value: props.downloadFilename });
	};

	return (
		<div className={styles.container}>
			<div className={styles.downloadIconContainer}>
				<a
					onClick={() => down()}
					download={props.downloadFilename}
					href={props.downloadUrl}
				>
					<img
						className={styles.downloadIcon}
						src={downloadIcon.src}
						width={downloadIcon.width}
						height={downloadIcon.height}
					/>
				</a>
			</div>

			<Image
				loader={imgixLoader}
				src={props.downloadFilename}
				className={styles.image}
				width={props.width}
				height={props.height}
				placeholder="blur"
				blurDataURL={props.thumbnailUrl}
				layout="responsive"
			/>
		</div>
	);
}
