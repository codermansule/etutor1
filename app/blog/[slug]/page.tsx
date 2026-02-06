import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog/utils";
import { createMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return createMetadata({
    title: `${post.frontmatter.title} | SBETUTOR Blog`,
    description: post.frontmatter.description,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.frontmatter.title,
            description: post.frontmatter.description,
            datePublished: post.frontmatter.date,
            author: {
              "@type": "Person",
              name: post.frontmatter.author,
            },
            publisher: {
              "@type": "Organization",
              name: "SBETUTOR",
              url: "https://sb-e-tutor.example.com",
            },
          }),
        }}
      />

      <header className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Blog
        </p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          {post.frontmatter.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span>{post.frontmatter.author}</span>
          <span>&middot;</span>
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
      </header>

      <div className="prose prose-invert prose-slate max-w-none prose-headings:font-semibold prose-headings:text-white prose-p:text-slate-300 prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-li:text-slate-300">
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}
