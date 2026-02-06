import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <Header />
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-10 lg:px-8">
        {children}
      </div>
      <Footer />
    </div>
  );
}
