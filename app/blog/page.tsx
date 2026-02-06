import Link from "next/link";
import { getAllPosts } from "@/lib/blog/utils";
import { createMetadata } from "@/lib/seo/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "Blog | SBETUTOR",
    description:
      "Tips, guides, and insights on online tutoring, AI-powered learning, and getting the most from SBETUTOR.",
    path: "/blog",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="space-y-10 py-8">
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Blog
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
          Insights &amp; Guides
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Learn how to get the most from SBETUTOR with tips on tutoring, AI
          features, and study strategies.
        </p>
      </section>

      {posts.length === 0 && (
        <p className="text-center text-slate-400">
          No posts yet. Check back soon!
        </p>
      )}

      <section className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-sky-400/40 hover:bg-white/10"
          >
            <Link href={`/blog/${post.slug}`} className="block space-y-3">
              <h2 className="text-2xl font-semibold text-white">
                {post.frontmatter.title}
              </h2>
              <p className="text-sm text-slate-300">
                {post.frontmatter.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <time dateTime={post.frontmatter.date}>
                  {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>&middot;</span>
                <span>{post.readingTime}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
