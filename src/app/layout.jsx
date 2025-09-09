import "./styles/index.css";
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'], // pick weights you need
});

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={cinzel.className}>{children}</body>
        </html>
    );
}
