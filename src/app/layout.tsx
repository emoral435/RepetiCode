import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
	variable: "--font-roboto-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "RepetiCode",
	description: "Reminding application to get you to study more software engineering related topics.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${robotoMono.variable} ${robotoMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
