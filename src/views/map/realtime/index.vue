
<template>
<div>
  <div class="baidumap" id="container"></div>
  <div id="result">
    <input v-model="address"></input>{{address}}
  </div>
</div>


</template>



<script>



import { listRealtime, getRealtime, delRealtime, addRealtime, updateRealtime } from "@/api/map/realtime";
export default {

  mounted() {
    this.baiduMap()
  },
  data(){
    return{
      realtimeList: [],
      map: null,
      address: '45',
    }
  },
  watch: {
    address(newVal) {
      this.$refs.input.$el.querySelector('input').value = newVal;
    },
  },
  methods: {
    baiduMap() {

      this.map = new BMap.Map('container', {coordsType: 5});
      let point = new BMap.Point(115.043096, 38.592132); //创建点坐标
      this.map.centerAndZoom(point, 15); //初始化地图，设置中心点坐标和地图级别
      this.map.enableScrollWheelZoom(true);//开启鼠标滚轮缩放
      var opts = {anchor: BMAP_ANCHOR_TOP_RIGHT};
      this.map.addControl(new BMap.NavigationControl()) ;//地图控柄
      this.map.addControl(new BMap.ScaleControl());  //实际距离显示
      this.map.addControl(new BMap.OverviewMapControl());
      // // this.map.setMapStyle({ style: 'midnight' }) //地图主题
      // let marker = new window.BMap.Marker(point); //创建柱标
      // this.map.addOverlay(marker) //将标注添加到地图中
      this.map.addControl(new BMap.CityListControl(opts));
      var traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例
      this.map.addTileLayer(traffic);                    // 将图层添加到地图上

      var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});
      this.map.addControl(top_left_control);

      var geoc = new BMap.Geocoder();
      this.map.addEventListener("click", function(e){
        var pt = e.point;
        geoc.getLocation(pt, result => {
          if (result) {
            this.address = result.address; // 将逆地址解析结果赋值给address属性
          }
          console.log(this.address);
        });
        geoc.getLocation(pt, function(rs) {
          var addComp = rs.addressComponents;
          // $('#result').text(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
          // alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
        })
      });
    },

    list() {
      listRealtime().then(response => {
        this.realtimeList = response.rows;
        console.log(this.realtimeList)
        for(let key in this.realtimeList){
          console.log(this.realtimeList[key])
          this.uploadmap(this.realtimeList[key].longitude, this.realtimeList[key].latitude, this.realtimeList[key].address)
        }
      });

    },

    uploadmap(lng, lat, str) {
      const point = new BMap.Point(lng, lat)
      const marker = new window.BMap.Marker(point);
      this.map.addOverlay(marker);
      const infoWindow = new BMap.InfoWindow(str);
      marker.addEventListener('mouseover', function() {
        this.openInfoWindow(infoWindow)
      });
      // 鼠标移开标注点要发生的事
      marker.addEventListener('mouseout', function() {
        this.closeInfoWindow(infoWindow)
      });
    },
  },

  created() {
    this.list();
  },


}





</script>


<style>
#result{
  position: fixed;
  top: 100px;
  left: 250px;
  padding: 0px 7px;
  min-width: 350px;
  height: 70px;
  line-height: 35px;
  background: #fff;
  box-shadow: 0 2px 6px 0 rgba(27, 142, 236, 0.5);
  border-radius: 7px;
  z-index: 99;
}
.baidumap {
  width: 100%;
  height: 100%;
  border: 1px solid red;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}


/* 删除百度地图版权字 与 百度logo */
.baidumap>.BMap_cpyCtrl {
  display: none !important;
}

.baidumap>.anchorBL {
  display: none !important;
}

</style>

