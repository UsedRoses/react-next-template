import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';
import { fallbackLng, languages, cookieName } from '@/i18n/settings';

acceptLanguage.languages(languages);

export const config = {
  // 匹配所有路径，除了 api, _next, static, images, favicon 等
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
};

// 函数名可以叫 proxy 也可以叫 middleware，只要是 default 导出即可
export default function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. 判断路径中是否已经包含了语言前缀
  const pathnameHasLocale = languages.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 2. 路径没有前缀
  let lng;

  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  if (!lng) lng = fallbackLng;


  // 情况 B: 英文/默认 -> 内部 Rewrite 到 /en (URL保持不变)
  return NextResponse.rewrite(new URL(`/en${pathname}`, req.url));
}