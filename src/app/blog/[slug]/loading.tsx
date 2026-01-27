export default function BlogArticleLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ECE1CF]">
      <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
      </div>
      <p className="mt-4 font-medium text-lg font-sans">
        Loading blog...
      </p>
    </div>
  );
}