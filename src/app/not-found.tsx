import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-10 mb-20">
      {/* Top image */}
      <Image
        src="/assets/images/404.svg"          // <-- place your image in /public/images/404.png
        alt="Not found illustration"
        width={500}
        height={400}
        className="mb-6"
        priority
      />

      <h1 className="text-3xl font-bold mb-4">404</h1>
      <p className="mb-6">Oops! The page you are looking for does not exist.</p>

   <Link href="/" className="inline-block">
        <button
            className="bg-[#805E2D] text-white mt-2 text-[18px] px-8 py-3 rounded-[30px] hover:bg-[#6B4D23] transition-colors flex items-center justify-center hover:scale-105"
        >  
            <span className="translate-y-[1.5px]"> Go back home</span>
        </button>
    </Link>

    </div>
  );
}
