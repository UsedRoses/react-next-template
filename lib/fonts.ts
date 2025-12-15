import localFont from 'next/font/local'

// Configure Inter font to match exactly what Next.js optimizes for
export const inter = localFont({
    src: '../fonts/Inter-Variable.woff2',

    display: 'swap',
    variable: '--font-inter',

    // 2. 依然加上 weight 范围，告诉 Next.js 这是一个可变字体
    weight: '100 900',
})
