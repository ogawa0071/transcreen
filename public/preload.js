import { desktopCapturer, contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld(
  'electronApi', {
    async requestDesktopCapture () {
      const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 512, height: 512 } })
      sources.map((src) => {
        src.thumbnail = src.thumbnail.toDataURL()
      })
      return sources
    },
    startMainApp () {
      ipcRenderer.send('start-main-app')
    }
  }
)
