import type { Metadata } from 'next'
import './globals.css'
import { Poppins } from 'next/font/google'
import { Toaster } from '@/app/components/ui/sonner'

const poppins = Poppins({
	display: 'swap',
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Fedex Webapp',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<body className={` ${poppins.className} antialiased`}>
				<main>{children}</main>
				<Toaster />
			</body>
		</html>
	)
}
