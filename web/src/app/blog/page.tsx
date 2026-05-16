"use client";

import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { BLOG_POSTS } from "@/lib/blog-data";

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container px-4 py-24 mx-auto max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 text-primary">
            Nosso Blog
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Educação Jurídica <span className="text-primary italic">Descomplicada</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dicas, análises e guias para ajudar você a entender seus contratos sem precisar de um dicionário jurídico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col rounded-3xl overflow-hidden border-border/50 hover:border-primary/30 transition-all hover:shadow-xl group">
                <CardHeader className="p-0 overflow-hidden aspect-video bg-muted flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-4xl">📄</span>
                </CardHeader>
                <CardContent className="p-6 flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                    <Badge variant="secondary" className="ml-auto rounded-lg font-bold">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <p className="text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary font-bold group">
                    <Link href={`/blog/${post.slug}`} className="flex items-center">
                      Ler artigo completo
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
