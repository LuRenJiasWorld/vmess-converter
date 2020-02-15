<template>
  <div id="app">
    <img id="app-icon" src="./assets/logo.png">

    <h1>vmess链接在线转换</h1>
    <p class="subtitle">将vmess的链接转换为人类可读的配置</p>
    <p class="subtitle">便于不支持vmess链接的v2Ray客户端使用</p>
    <p class="subtitle">版本号：v0.6.5</p>

    <hr class="line" />

    <div id="steps-container">
      <div class="steps-block" id="vmess-input">
        <h2 class="step-title">粘贴vmess地址</h2>
        <Input id="vmess-input-textarea" @on-change="updateVmessData()" v-model="vmessData" type="textarea" placeholder="在这里粘贴vmess://开头的vmess链接" :autosize="{minRows: 4,maxRows: 7}" />
        <Alert type="error" v-bind:style="{ display: error.vmessFormatError === true ? 'block' : 'none' }"> 错误：不是有效的vmess地址 <span slot="desc"> 请确保地址由vmess://开头</span></Alert>
        <Alert type="error" v-bind:style="{ display: error.base64DecodingError === true ? 'block' : 'none' }"> 错误：vmess地址无法解码 <span slot="desc"> 请确保粘贴的vmess地址完整且可用</span></Alert>
      </div>

      <div class="steps-block" id="config-table">
        <h2 class="step-title">查看配置</h2>
        <p v-if="parsedData.length === 0">请先粘贴vmess地址</p>
        <div v-else v-for="(each, idx) in parsedData" v-bind:key="idx" class="config-list">
          <span>{{each.name}}</span>
          <Input class="config-text" readonly="readonly" v-model="each.data" />
          <Button class="config-copy-button" type="primary" v-bind:data-content="each.data" v-on:click="copyToClipboard">复制</Button>
        </div>
      </div>

      <div class="steps-block" id="json-display">
        <h2 class="step-title">查看解码出的Json（可选）</h2>
        <p v-if="parsedJsonHTML === ''">请先粘贴vmess地址</p>
        <div v-else class="json-display-container">
          <pre><code v-html="parsedJsonHTML" /></pre>
          <Button long type="primary" v-bind:data-content="JSON.stringify(parsedJsonObject)" v-on:click="copyToClipboard">复制</Button>
        </div>
      </div>

      <div class="steps-block" id="qr-display">
        <h2 class="step-title">查看二维码（可选）</h2>
        <img v-if="qrData" v-bind:src="qrData" />
        <p v-else>请先粘贴vmess地址</p>
      </div>
    </div>

    <hr class="line" />

    <div id="footer">
      <img src="./assets/logo.png" style="width: 60px;">
      <p>vmess链接在线转换</p>
      <p>Author: <a href="https://github.com/LuRenJiasWorld/">LuRenJiasWorld</a></p>
      <p>Email: <a href="mailto:loli@lurenjia.in">loli@lurenjia.in</a></p>
    </div>
  </div>
</template>

<script>
  import formatHighlight from 'json-format-highlight'
  import { Base64 } from 'js-base64';
  import QRCode from 'qrcode';
  import copy from 'copy-to-clipboard';

  export default {
    name: 'App',
    components: {

    },
    data: function() {
      return {
        vmessData: "",
        parsedJsonObject: {},
        parsedJsonHTML: "",
        parsedData: [],
        qrData: "",
        error: {
          vmessFormatError: false,
          base64DecodingError: false
        }
      }
    },
    methods: {
      updateVmessData() {
        this.initializer();

        let vmessData = this.vmessData;

        if (vmessData === "") {
          return false;
        }

        if (vmessData.indexOf("vmess://") === -1) {
          this.error.vmessFormatError = true;
          return false;
        } else {
          let base64Data = this.vmessData.replace("vmess://", "");
          try {
            let jsonTextData = Base64.decode(base64Data);
            this.parsedJsonObject = JSON.parse(jsonTextData);
          } catch (e) {
            this.error.base64DecodingError = true;
            return false;
          }

          this.generateHighlightJsonText();

          this.generateConfigTable();

          this.generateQrCode();
        }
      },

      initializer() {
        this.error.vmessFormatError = false;
        this.error.base64DecodingError = false;

        this.parsedJsonHTML = "";
        this.parsedJsonObject = {};
        this.parsedData = [];
        this.qrData = "";
      },

      generateHighlightJsonText() {
        this.parsedJsonHTML = formatHighlight(this.parsedJsonObject);
      },

      generateConfigTable() {
        let keys = Object.keys(this.parsedJsonObject);

        const conversion = [
          {"v": "链接版本"},
          {"ps": "备注信息"},
          {"add": "IP地址"},
          {"port": "连接端口"},
          {"id": "连接ID"},
          {"aid": "额外ID"},
          {"net": "传输协议"},
          {"type": "伪装类型"},
          {"host": "伪装域名"},
          {"path": "伪装路径"},
          {"tls": "启用TLS"}
        ];

        for (let i = 0; i < keys.length; i++) {
          let data = this.parsedJsonObject[keys[i]];

          for (let j = 0; j < conversion.length; j++) {
            let currentKey = Object.keys(conversion[j])[0];
            if (currentKey === keys[i]) {
              this.appendParsedData(conversion[j][currentKey], data);
            }
          }
        }
      },

      appendParsedData(name, data) {
        this.parsedData = this.parsedData.concat([{name: name, data: data}]);
      },

      generateQrCode() {
        var that = this;
        QRCode.toDataURL(this.vmessData, function (err, url) {
          that.qrData = url;
        })
      },

      copyToClipboard(event) {
        const content = event.currentTarget.dataset.content;

        const copyStep = new Promise(function(resolve, reject) {
          try {
            if (copy(content)) {
              resolve();
            }
          } catch(e) {
            reject();
          }
        });

        var that = this;

        copyStep.then(function() {
          that.$Message.success({
            content: "复制成功！",
            background: true
          })
        })
      }
    }
  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  .line {
    margin: 40px 20vw;
    border-bottom: 1px solid #c7c7c7;
  }

  #app-icon {
    width: 200px;
    height: 200px;
  }

  .subtitle {
    font-size: 14px;
    line-height: 20px;
  }

  .subtitle:before, .subtitle:after {
    content: "";
    width: 20px;
    height: 2px;
    background-color: #DB0E82;
    display: inline-block;
    margin: 9px 4px;
    vertical-align: bottom;
  }

  #steps-container {
    width: calc(100vw - 2 * 20px);
    max-width: 500px;
    left: 0;
    right: 0;
    margin: auto;
  }

  .steps-block {
    margin: 40px 0;
  }

  .step-title {
    margin: 20px 10px;
  }

  #vmess-input-textarea {
    margin-bottom: 10px;
  }

  .config-list {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 10px 0;
  }

  .config-list > span {
    width: 60px;
    line-height: 32px;
    text-align: right;
  }

  .config-list .config-text {
    margin: 0 10px;
    flex: 1;
  }

  .config-list .config-copy-button {
    width: 70px;
  }

  .json-display-container {
    min-height: 100px;
    background-color: #eaeaea;
    border-radius: 10px;
    border: 1px solid #d0d0d0;
    text-align: left;
    padding: 10px 24px;
  }

  #qr-display img {
    width: 260px;
    height: 260px;
  }

  #footer {
    margin-bottom: 60px;
  }
</style>
