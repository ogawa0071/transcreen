<template lang="pug">
  div
    #app(v-if="visible")
      #app-inner
        h2 TranScreen 使い方

        p キーボードショートカットを覚えてください。
        h3 Cmd+Shift+T
        p このショートカットを使用することで翻訳が浮かび上がります。
        hr
        p この半透明のウィンドウを翻訳したい領域に合わせてください。
        hr
        p 領域設定が完了したら、下記のボタンを押してください。
        p 半透明の画面が消え、利用が開始できます。
        p 領域を変更したい場合は
        h3 Cmd+Shift+R
        hr
        button(@click="start") 利用開始
    Sentence(v-for="data in sentences", :data="data")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'
import axios from 'axios'
import Sentence from './components/Sentence.vue'
@Component({
  components: {
    Sentence
  }
})
export default class App extends Vue {
  public visible = true;
  public sentences = [];
  async mounted () {
    ipcRenderer.on('translate', async (event, args) => {
      const source = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'screen',
            chromeMediaSourceId: `screen:${args.id}:0`
          }
        } as MediaTrackConstraints
      })
      const imageCapture = new ImageCapture(source.getTracks()[0])
      const photo = await imageCapture.grabFrame()
      const canvas: HTMLCanvasElement = document.createElement('canvas')
      canvas.width = args.targetBounds.width
      canvas.height = args.targetBounds.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // eslint-disable-next-line no-console
        console.log(args.targetBounds)
        ctx.drawImage(
          photo,
          args.targetBounds.x,
          args.targetBounds.y,
          args.targetBounds.width,
          args.targetBounds.height,
          0,
          0,
          args.targetBounds.width,
          args.targetBounds.height
        )
        const dataurl = canvas.toDataURL('jpg')
        const bin = atob(dataurl.split(',')[1])
        const buffer = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i)
        }
        const blob = new Blob([buffer.buffer], { type: 'image/jpg' })
        const data = new FormData()
        data.append('image', blob, 'image.jpg')
        this.sentences = (
          await axios.post('/ TODO Please Replace Your API/', data)
        ).data
      }
    })

    ipcRenderer.on('wakeup', () => {
      this.visible = true
    })
  }

  public start (): void {
    ipcRenderer.send('click-thru')
    this.visible = false
  }
}
</script>

<style>
#app {
  background: rgba(0, 0, 0, 0.1);
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}
#app-inner {
  -webkit-app-region: no-drag;
  text-align: center;
  position: absolute;
  top: 5%;
  left: 5%;
  right: 5%;
  bottom: 5%;

  background: rgba(255, 255, 255, 1);
}
</style>
