import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'uc-config': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      'uc-upload-ctx-provider': DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >
      'uc-file-uploader-regular': DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >
      'uc-data-input': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

export {}
