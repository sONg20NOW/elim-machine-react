'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import { ThemeProvider, lighten, darken, createTheme } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import type {} from '@mui/material/themeCssVarsAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build
import type {} from '@mui/lab/themeAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build

// Third-party Imports
import { useMedia } from 'react-use'
import stylisRTLPlugin from 'stylis-plugin-rtl'

// Type Imports
import type { ChildrenType, Direction, SystemMode } from '@core/types'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

type Props = ChildrenType & {
  direction: Direction
  systemMode: SystemMode
}

const CustomThemeProvider = (props: Props) => {
  // Props
  const { children, direction, systemMode } = props

  // Hooks
  const { settings } = useSettings()
  const isDark = useMedia('(prefers-color-scheme: dark)', systemMode === 'dark')

  // Vars
  const isServer = typeof window === 'undefined'
  let currentMode: SystemMode

  if (isServer) {
    currentMode = systemMode
  } else {
    if (settings.mode === 'system') {
      currentMode = isDark ? 'dark' : 'light'
    } else {
      currentMode = settings.mode as SystemMode
    }
  }

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    const newTheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor as string, 0.2),
              dark: darken(settings.primaryColor as string, 0.1)
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: settings.primaryColor,
              light: lighten(settings.primaryColor as string, 0.2),
              dark: darken(settings.primaryColor as string, 0.1)
            }
          }
        }
      },
      cssVariables: {
        colorSchemeSelector: 'data'
      },

      // 컴포넌트 설정
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              whiteSpace: 'nowrap', // ✅ 모든 버튼 줄바꿈 방지
              fontSize: '16px',
              px: 0
            }
          }
        }

        // MuiCardHeader: {
        //   styleOverrides: {
        //     root: {
        //       padding: '25px',
        //       '@media (max-width:600px)': {
        //         padding: '15px !important',
        //         paddingBottom: '10px !important'
        //       }
        //     },
        //     title: {
        //       fontSize: '25px',
        //       '@media (max-width:600px)': {
        //         fontSize: '18px'
        //       }
        //     }
        //   }
        // },

        // // 테이블 관련
        // MuiTable: {
        //   styleOverrides: {
        //     root: {
        //       '@media (max-width:600px)': {
        //         minWidth: 0
        //       }
        //     }
        //   }
        // },
        // MuiTableCell: {
        //   styleOverrides: {
        //     root: {
        //       whiteSpace: 'nowrap',
        //       fontSize: '16px',
        //       '@media (max-width:600px)': {
        //         fontSize: '12px',
        //         paddingLeft: '8px !important',
        //         paddingRight: '8px !important',
        //         paddingTop: '8px !important',
        //         paddingBottom: '8px !important',
        //         width: 'fit-content',
        //         border: 'solid 1px silver !important',
        //         overflowWrap: 'break-word'
        //       }
        //     },
        //     head: {
        //       '@media (max-width:600px)': { backgroundColor: '#f3f4f6' }
        //     }
        //   }
        // },

        // // 페이지네이션 관련
        // MuiToolbar: {
        //   styleOverrides: {
        //     root: {
        //       '@media (max-width:600px)': {
        //         margin: '0px !important'
        //       },
        //       '& .MuiTablePagination-actions': {
        //         '.MuiIconButton-root': {
        //           '@media (max-width:600px)': {
        //             padding: 0
        //           }
        //         }
        //       },
        //       '& .MuiInputBase-root.MuiSelect-root': {
        //         '@media (max-width:600px)': { marginLeft: '0px !important', marginRight: '5px !important' }
        //       }
        //     }
        //   }
        // }, // Dialog 관련
        // MuiDialogTitle: {
        //   styleOverrides: {
        //     root: {
        //       '@media (max-width:600px)': {
        //         padding: 12 // 모바일에서는 작게
        //       }
        //     }
        //   }
        // },

        // // TextField - Select 관련
        // MuiMenu: {
        //   styleOverrides: {
        //     list: {
        //       '& .MuiButtonBase-root': {
        //         '@media (max-width:600px)': {
        //           fontSize: '13px'
        //         }
        //       }
        //     }
        //   }
        // }
      }
    }

    const coreTheme = deepmerge(defaultCoreTheme(settings, currentMode, direction), newTheme)

    return createTheme(coreTheme)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.primaryColor, settings.skin, currentMode])

  return (
    <AppRouterCacheProvider
      options={{
        prepend: true,
        ...(direction === 'rtl' && {
          key: 'rtl',
          stylisPlugins: [stylisRTLPlugin]
        })
      }}
    >
      <ThemeProvider
        theme={theme}
        defaultMode={systemMode}
        modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
      >
        <>
          <ModeChanger systemMode={systemMode} />
          <CssBaseline />
          {children}
        </>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default CustomThemeProvider
