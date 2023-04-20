
<template>
<div>

  <div class="baidumap" id="container">
  </div>
  <div>
    <el-dialog title="收货地址" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="50px">
        <el-form-item label="经度" prop="longitude">
          <el-input v-model="form.longitude" placeholder="请输入经度" />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input  v-model="form.latitude" placeholder="请输入纬度" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input id="address" v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="事件" prop="city">
          <el-input v-model="form.city" placeholder="请输入事件" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :disabled="isFormInvalid">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</div>

</template>



<script>


import {listRealtime, getAddress, updateRealtime, addRealtime,} from "@/api/map/realtime";
export default {

  mounted() {
    this.baiduMap();
  },
  data(){
    return{
      realtimeList: [],
      map: null,
      dialogVisible: false,
      point: {},
      form : {},
    }
  },
  created() {
    this.list();
  },
  computed: {
    isFormInvalid() {
      return !this.form.city;
    }
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    baiduMap() {
      this.map = new BMap.Map('container', {coordsType: 5});
      this.getaddress()
      // let point = new BMap.Point(0, 0); //创建点坐标
      // this.map.centerAndZoom(point, 15); //初始化地图，设置中心点坐标和地图级别
      this.map.enableScrollWheelZoom(true);//开启鼠标滚轮缩放
      this.map.addControl(new BMap.NavigationControl()) ;//地图控柄
      this.map.addControl(new BMap.ScaleControl());  //实际距离显示
      this.map.addControl(new BMap.OverviewMapControl());
      // this.map.addControl(new BMap.CityListControl(opts));
      var traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例
      this.map.addTileLayer(traffic);                    // 将图层添加到地图上

      var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});
      this.map.addControl(top_left_control);


      // var contextMenu = new BMap.ContextMenu();
      // contextMenu.addItem(new BMap.MenuItem("关闭信息窗口",function () { },120));
      // contextMenu.addItem(new BMap.MenuItem('添加标注 ', function () {
      //   this.dialog();
      // }))
      // this.map.addContextMenu(contextMenu);
      // var markerMenu=new BMap.ContextMenu();
      // markerMenu.addItem(new BMap.MenuItem('新建站点',createMarker.bind(this.map)));
      // this.map.addContextMenu(markerMenu);//给标记添加右键菜单
      let vm = this;
      this.map.addEventListener('rightclick',function(e){
        let hasRole = vm.$auth.hasRole("palceAdmin");
        if(!hasRole){
          return;
        }
        if(e.overlay){//判断右键单击的是否是marker
          alert("请在别处创建哦！")
          return;
        }
        vm.dialogVisible=true;
        // document.getElementById("lng").value=e.point.lng;
        // document.getElementById("lat").value=e.point.lat;
        vm.form.longitude = e.point.lng;
        vm.form.latitude = e.point.lat;
        var geoc = new BMap.Geocoder();
        geoc.getLocation(e.point, result => {
          document.getElementById("address").value=result.address;
          vm.form.address=result.address;
          console.log(result.address)
        });
        console.log( vm.form)
      })



    },


    list() {
      listRealtime().then(response => {
        this.realtimeList = response.rows;
        // console.log(this.realtimeList)
        for(let key in this.realtimeList){
          // console.log(this.realtimeList[key])
          this.uploadmap(this.realtimeList[key].longitude, this.realtimeList[key].latitude,
            this.realtimeList[key].address,this.realtimeList[key].city);
        }
      });
    },
    getaddress(){
      getAddress().then(response => {
        let point = new BMap.Point(response.data.lng, response.data.lat); //创建点坐标
        this.map.centerAndZoom(point, 12); //初始化地图，设置中心点坐标和地图级别
        this.map.enableScrollWheelZoom(true);
        var marker = this.uploadmap(response.data.lng,response.data.lat,response.data.seat,"您当前位置是")
        marker.setAnimation(BMAP_ANIMATION_BOUNCE);
      })
      return this.map;
    },

    uploadmap(lng, lat, str, city) {
      const point = new BMap.Point(lng, lat)
      var marker = new BMap.Marker(point);
      this.map.addOverlay(marker);
      var opts = {
        width : 200,     // 信息窗口宽度
        height: 100,     // 信息窗口高度
        title : city , // 信息窗口标题
        enableMessage:true,//设置允许信息窗发送短息
        // message:"亲耐滴，晚上一起吃个饭吧？戳下面的链接看下地址喔~"
      }
      var infoWindow = new BMap.InfoWindow("地址："+str, opts);  // 创建信息窗口对象
      // const infoWindow = new BMap.InfoWindow(str);
      marker.addEventListener('mouseover', function() {
        this.openInfoWindow(infoWindow)
      });
      // 鼠标移开标注点要发生的事
      marker.addEventListener('mouseout', function() {
        this.closeInfoWindow(infoWindow)
      });
      // marker.setAnimation(BMAP_ANIMATION_BOUNCE);
      return marker;
    },


    dialog(){
      this.dialogVisible=true;
      console.log(this.dialogVisible);
    },


    locationNow(){
      var geolocation = new BMap.Geolocation();
      geolocation.getCurrentPosition(function(position) {
        const point = position.point;
        console.log(position);
        var marker = new BMap.Marker(point);

      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
            addRealtime(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.dialogVisible = false;
              this.list();
            });
          }
      });

    },

    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        longitude: null,
        latitude: null,
        address: null,
        city: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
  },






}





</script>


<style>
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

#btn-con{
  /*width:300px;*/
  /*height:400px;*/
  width:300px;
  height:50px;
  top:40px;
  right:40px;
  position:absolute;
  z-index:9999;
  border:2px solid yellow;
  -webkit-border-radius:20px;
  -moz-border-radius:20px;
  -ms-border-radius:20px;
  -o-border-radius:20px;
  border-radius: 20px;
  background-color:#FFFFFF;
  box-shadow:5px 5px 10px rgba(0,0,0,0.2);
  opacity:0.5;
  transition: opacity 0.4s ease-out,height 0.4s ease-out,opacity 0.4s ease,transform 0.4s ease;
  text-align:center;
  overflow: hidden;
}
#btn-con:hover{
  width:300px;
  height:400px;
  opacity:1;
  transform: translateY(4px);
  box-shadow:5px 5px 10px rgba(0,0,0,0.5);
}
#div-move{
  font-weight: bold;
  font-size: 35px;
  font-family: miranafont,"Hiragino Sans GB",STXihei,"Microsoft YaHei",SimSun,sans-serif;
  cursor: move;
}
#btn-con:hover{
  width:300px;
  height:400px;
  opacity:1;
  transform: translateY(4px);
  box-shadow:5px 5px 10px rgba(0,0,0,0.5);
}
.btn{
  width:80px;
  height:30px;
  border: 0;
  background: #b117c4;
  -webkit-border-radius:20px;
  -moz-border-radius:20px;
  -ms-border-radius:20px;
  -o-border-radius:20px;
  border-radius: 20px;
  color: white;
  margin-top: 8px;

  outline:none;
  position: relative; /** 相对布局 **/
}
.btn:active{
  top: 2px; /**向下偏移2px **/
}
#div-move{
  height: 50px;
}
#div-move>p{
  position: relative;
  margin-top: -60px;
  margin-right: 60px;
}
#div-move>img{
  margin-top: 5px;
  position: relative;
  margin-right: -110px;
}
#btn-search{
  width:35px;
}
#btn-now-location{
  width:60px;
}
.inp{
  width:150px;
  height:25px;
  -webkit-border-radius:20px;
  -moz-border-radius:20px;
  -ms-border-radius:20px;
  -o-border-radius:20px;
  border-radius: 20px;
  border: 1px solid #DBDBDB;
  text-align:center;
  outline:none;
}
#search{
  width: 135px;
}
#changetype-sel,
#chooseRoad-sel{
  width:150px;
  height:30px;
  margin-bottom: 10px;
  -webkit-border-radius:20px;
  -moz-border-radius:20px;
  -ms-border-radius:20px;
  -o-border-radius:20px;
  border-radius: 20px;
  text-align: center;
  outline:none;
}
</style>

