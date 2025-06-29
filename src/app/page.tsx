import { UrlShortenerForm } from "@/components/urls/url-shortener-form";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-24">
      <div className="w-full max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Shorten Your Links
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Paste your long URL and get a shortened one. It&apos;s free and easy to
          use.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/login"
            className="rounded-md border border-primary px-4 py-2 text-red-600 hover:bg-primary/10"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-primary px-4 py-2 text-blue-500 hover:bg-primary/10"
          >
            Sign Up
          </Link>
        </div>

        <UrlShortenerForm />
      </div>
    </div>
  );
}
