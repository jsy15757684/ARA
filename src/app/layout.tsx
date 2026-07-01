import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/layout/Header";
import BottomTabBar from "@/components/layout/BottomTabBar";
import AIChatbot from "@/components/chat/AIChatbot";

export const metadata: Metadata = {
  title: "Les choses du monde | 프리미엄 종합 쇼핑몰",
  description: "패션, 가전, 뷰티, 식품, 홈리빙, 스포츠까지. 엄선된 프리미엄 상품을 한 곳에서 만나보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-warm-beige">
        <CartProvider>
          <Header />
          <main className="flex-1 pb-24 md:pb-8">
            {children}
          </main>
          <BottomTabBar />
          <AIChatbot />
        </CartProvider>
      </body>
    </html>
  );
}
