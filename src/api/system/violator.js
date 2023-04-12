import request from '@/utils/request'

// 查询违法记录列表
export function listViolator(query) {
  return request({
    url: '/system/violator/list',
    method: 'get',
    params: query
  })
}

export function handlingListViolator(query) {
  return request({
    url: '/system/violator/handlingList',
    method: 'get',
    params: query
  })
}

// 查询违法记录详细
export function getViolator(id) {
  return request({
    url: '/system/violator/' + id,
    method: 'get'
  })
}

// 新增违法记录
export function addViolator(data) {
  return request({
    url: '/system/violator',
    method: 'post',
    data: data
  })
}

// 修改违法记录
export function updateViolator(data) {
  return request({
    url: '/system/violator',
    method: 'put',
    data: data
  })
}

// 删除违法记录
export function delViolator(id) {
  return request({
    url: '/system/violator/' + id,
    method: 'delete'
  })
}
