import request from '@/utils/request'

// 查询check列表
export function listRealtime(query) {
  return request({
    url: '/map/realtime/list',
    method: 'get',
    params: query
  })
}

// 查询check详细
export function getRealtime(id) {
  return request({
    url: '/map/realtime/' + id,
    method: 'get'
  })
}

// 新增check
export function addRealtime(data) {
  return request({
    url: '/map/realtime',
    method: 'post',
    data: data
  })
}

// 修改check
export function updateRealtime(data) {
  return request({
    url: '/map/realtime',
    method: 'put',
    data: data
  })
}

// 删除check
export function delRealtime(id) {
  return request({
    url: '/map/realtime/' + id,
    method: 'delete'
  })
}
