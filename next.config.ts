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
  },

  // IP주소로 접속 가능
  allowedDevOrigins: ['http://192.168.0.50', '192.168.0.50']
}

export default nextConfig
