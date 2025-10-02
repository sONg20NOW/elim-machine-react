import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      // 기본적으로 캘린더로 가도록
      {
        source: '/',
        destination: '/calendar',
        permanent: true,
        locale: false
      }

      // {
      //   source: '/:lang(en|fr|ar)',
      //   destination: '/:lang(en|fr|ar)/calendar',
      //   permanent: true,
      //   locale: false
      // },
      // {
      //   source: '/:path((?!en|fr|ar|front-pages|favicon\\.ico|api|images|fonts|_next|public).*)',
      //   destination: '/en/:path',
      //   permanent: true,
      //   locale: false
      // }
    ]
  }
}

export default nextConfig
