import Document, { Html, Head, NextScript, Main } from "next/document";

export default class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<meta
						name="description"
						content="Retouched photos using Lightroom CC & Photoshop by Janoshan (JE)"
					/>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossOrigin=""
					/>
					<link
						href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
						rel="stylesheet"
					/>
					<link
						rel="apple-touch-icon"
						sizes="180x180"
						href="/apple-touch-icon.png"
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="32x32"
						href="/favicon-32x32.png"
					/>
					<link
						rel="icon"
						type="image/png"
						sizes="16x16"
						href="/favicon-16x16.png"
					/>
					<script
						data-host="https://microanalytics.io"
						data-dnt="false"
						src="https://microanalytics.io/js/script.js"
						id="ZwSg9rf6GA"
						async
						defer
					></script>

					{/* OG tags */}
					<meta property="og:title" content="Gallery Of JE" />
					<meta property="og:type" content="website" />
					<meta property="og:url" content="https://gallery-of-je.vercel.app" />
					{/*
					<meta
						property="og:image"
						content="https://ia.media-imdb.com/images/rock.jpg"
					/>*/}
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
