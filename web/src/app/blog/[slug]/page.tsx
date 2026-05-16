"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import { BLOG_POSTS } from "@/lib/blog-data";

export default function BlogPostPage() {
  const { slug } = useParams();

  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <article className="flex-1 container px-4 py-24 mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button asChild variant="ghost" size="sm" className="rounded-xl group">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar ao blog
            </Link>
          </Button>
        </motion.div>

        <header className="space-y-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border/50 py-4">
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {post.date}</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {post.readTime} de leitura</span>
            <Button variant="ghost" size="sm" className="ml-auto rounded-xl gap-2">
              <Share2 className="h-4 w-4" /> Compartilhar
            </Button>
          </div>
        </header>

        {/* nosec: Blog content is currently static and trusted */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none text-foreground/90"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="mt-16 pt-8 border-t border-border/50 text-center">
            <div className="bg-primary/5 rounded-[2.5rem] p-8 md:p-12 space-y-6">
                <h3 className="text-2xl font-bold">Proteja sua empresa agora</h3>
                <p className="text-muted-foreground">Não deixe para descobrir riscos quando for tarde demais. Use o Contract Lens para analisar seus documentos em segundos.</p>
                <Button asChild size="lg" className="rounded-2xl px-8 font-black">
                    <Link href="/register">Começar análise gratuita</Link>
                </Button>
            </div>
        </footer>
      </article>
    </div>
  );
}
