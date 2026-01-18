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
  if (pathname.match(/\.(png|jpg|jpeg|svg|css|js|json|xml|ico)$/)) {
    return NextResponse.next()
  }

  // 针对默认语言 (en) 的特殊处理：强制“去前缀” (SEO 优化)
  // 如果用户手动访问 /en 或 /en/about，我们要把他踢回 / 或 /about
  // 假设 fallbackLng 是 'en'
  if (pathname.startsWith(`/${fallbackLng}/`) || pathname === `/${fallbackLng}`) {
    // 去掉 /en
    const newUrl = new URL(
        pathname.replace(`/${fallbackLng}`, '') || '/',
        req.url
    )
    // 308 永久重定向 (SEO 友好)
    return NextResponse.redirect(newUrl)
  }

  // 判断路径中是否已经包含了语言前缀
  const pathnameHasLocale = languages.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return  NextResponse.next()
  }

  // 2. 获取语言偏好逻辑
  let lng;
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  if (!lng) lng = fallbackLng;

  if (lng !== fallbackLng) {
    const redirectUrl = new URL(`/${lng}${pathname}`, req.url);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }

  return NextResponse.rewrite(new URL(`/${fallbackLng}${pathname}`, req.url))
}