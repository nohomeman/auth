
/**
 * 封装ajax请求
 */
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import qs from 'qs'
import router from 'umi/router';
import Cookies from 'js-cookie';

function axiosRequest(config: AxiosRequestConfig) {
  return axios(config)
    .then((res: AxiosResponse) => {
      if(res.data.code === 401){
        if(location.hash !== '#/user/login'){
          Cookies.set('redirct',location.hash)
        }
        router.push('/user/login')
      }
      return res.data
    }) // 从Response摘取实际返回值
    .catch((err: AxiosError) => { // 组装错误消息数据为前端识别格式
      if (err.response) {
        return err.response.data || {
          code: 0,
          status: err.response.status,
          message: err.response.statusText
        }
      } else {
        return {
          code: 0,
          message: err.message
        }
      }
    })
}

export function get(url: string, params?: object, config?: AxiosRequestConfig) {
  return axiosRequest({
    ...config,
    url,
    method: 'GET',
    params: {
      // _: Date.now(), // 防止IE在GET请求时缓存
      ...params
    }
  })
}

export function post(url: string, data?: object, config?: AxiosRequestConfig) {
  return axiosRequest({
    ...config,
    url,
    method: 'POST',
    data: qs.stringify(data)
  })
}
