import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';
import { fallbackLng, languages, cookieName } from '@/i18n/settings';

acceptLanguage.languages(languages);

export const config = {
  // Matcher 排除掉已知的核心静态文件
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|sw.js).*)',
  ],
};


// 函数名可以叫 proxy 也可以叫 middleware，只要是 default 导出即可
export default function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 只要路径里包含“.”，通常说明它是一个文件（如 .png, .txt, .xml）
  // 这种文件不需要经过国际化重定向，直接放行
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // 1. 判断路径中是否已经包含了语言前缀
  const pathnameHasLocale = languages.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 2. 获取语言偏好逻辑
  let lng;
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  if (!lng) lng = fallbackLng;

  // 如果路径没前缀，Rewrite 到默认语言（例如 /en/xxx）
  // URL 保持不变，但内部渲染 /en 路由的内容
  return NextResponse.rewrite(new URL(`/en${pathname}`, req.url));
}