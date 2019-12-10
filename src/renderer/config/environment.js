import { common } from '../util/common';
import ElCookie from '../util/elcookie'
import {baseConfig} from './baseconfig'


const defaultAddress = baseConfig.host;
let cookieHost = common.getLocstorage('serverAddress');
// ElCookie.getCookies('_serverAddress').then(res=>{
//     cookieHost = res
// })
const _serverAddress = cookieHost || defaultAddress;
export const environment = {
    apiBase:  _serverAddress,
    port: baseConfig.port
}
