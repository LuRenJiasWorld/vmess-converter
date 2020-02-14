import Vue from 'vue'
import App from './App.vue'
import {Button, Input, Alert, Message} from 'view-design';
import 'view-design/dist/styles/iview.css';

Vue.config.productionTip = false;

Vue.component("Button", Button);
Vue.component("Input", Input);
Vue.component("Alert", Alert);

Vue.prototype.$Message = Message;

new Vue({
  render: h => h(App),
}).$mount('#app');
