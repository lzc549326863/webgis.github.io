<template>
  <div class="home-container">
    <div id="map-container"></div>
    <div class="map-tools">
      <div
        v-for="(item, idx) in tools"
        :key="idx"
        :class="item.checked ? 'btn active' : 'btn'"
        @click="toolsClick(item)"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="fire-tools">
      <div class="fire-tools-item">
        <el-checkbox v-model="FireChecked" @change="FirecheckedChange">展示火点</el-checkbox>
      </div>
      <div class="fire-tools-item">
        <el-checkbox v-model="StationChecked" @change="StationcheckedChange">展示消防站</el-checkbox>
      </div>
    </div>
    <div class="info-content" v-show="infoShow">
      <div class="info-item">规划距离：{{ infoDetail.dis }}</div>
      <div class="info-item">估计耗时：{{ infoDetail.time }}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Home',
  components: {},
  data() {
    return {
      tools: [
        {
          label: '消防救援路径',
          key: 'rescue',
          checked: true
        },
        {
          label: '消防疏散路径',
          key: 'evacuate',
          checked: false
        }
      ],
      activeKey: 'rescue',
      driving: null,
      FireChecked: true,
      firePoint: {
        lng: 106.3298813755877,
        lat: 29.595673180090362
      },
      StationChecked: true,
      stationPoint: {
        lng: 106.33809249712208,
        lat: 29.605262859068656
      },
      infoShow: false,
      infoDetail: {
        time: '',
        dis: ''
      }
    };
  },
  mounted() {
    this.initBMap();
  },
  methods: {
    initBMap() {
      // 初始化地图
      window.Bmap = new BMap.Map('map-container', {
        minZoom: 4,
        maxZoom: 24
      });
      // 启用鼠标滚轮缩放地图
      Bmap.enableScrollWheelZoom();
      // 创建交通流量图层实例
      let traffic = new BMap.TrafficLayer();
      window.trafficLry = traffic;
      Bmap.addTileLayer(traffic);
      // Bmap.removeTileLayer(trafficLry);
      // 监听地图点击事件
      Bmap.addEventListener('click', evt => {
        console.log(evt);
      });
      this.loadFireMarker();
      this.loadStationMarker();
      this.initDrivingRoute();
      this.routeControl();
    },
    /** 按钮控制 */
    toolsClick(el) {
      if (this.activeKey === el.key) return;
      this.tools.map(item => {
        item.key === el.key ? (item.checked = !el.checked) : (item.checked = false);
      });
      this.activeKey = el.key;
      this.routeControl();
    },
    /** 导航规划 */
    routeControl() {
      // 根据当前激活的工具key值，调用对应的路径导航
      switch (this.activeKey) {
        case 'rescue': // 消防救援路径规划
          this.loadRescueRoute();
          break;
        case 'evacuate': // 消防疏散路径规划
          this.loadEvacuateRoute();
          break;
      }
    },
    /** 初始化导航组件 */
    initDrivingRoute() {
      // 驾车导航
      this.driving = new BMap.DrivingRoute(Bmap, {
        renderOptions: { map: Bmap, autoViewport: true },
        onSearchComplete: result => {
          // 规划路径结果回调，并将时间和距离进行绑定展示
          const time = result.getPlan(0).getDuration(true);
          const dis = result.getPlan(0).getDistance(true);
          this.infoDetail = { time, dis };
          this.infoShow = true;
        }
      });
      // 步行导航
      this.walking = new BMap.WalkingRoute(Bmap, {
        renderOptions: { map: Bmap, autoViewport: true },
        onSearchComplete: result => {
          const time = result.getPlan(0).getDuration(true);
          const dis = result.getPlan(0).getDistance(true);
          this.infoDetail = { time, dis };
          this.infoShow = true;
        }
      });
    },
    /** 加载火点 */
    loadFireMarker() {
      this.FireMarker = new BMap.Marker(new BMap.Point(this.firePoint.lng, this.firePoint.lat), {
        enableDragging: true // 启用拖拽
      });
      this.FireMarker.setZIndex(0); // 至于overlayer最上层，避免被其他overlayer遮盖
      this.FireMarker.addEventListener('dragend', evt => {
        // 监听回调火点位置的变化，并重新进行规划导航
        const {
          point: { lng, lat }
        } = evt;
        this.firePoint = { lng, lat };
        this.routeControl();
      });
      Bmap.addOverlay(this.FireMarker);
    },
    /** 火点的显示隐藏 */
    FirecheckedChange(val) {
      if (val) {
        this.FireMarker && this.FireMarker.show();
      } else {
        this.FireMarker && this.FireMarker.hide();
      }
    },
    /** 加载消防站 */
    loadStationMarker() {
      this.StationMarker = new BMap.Marker(new BMap.Point(this.stationPoint.lng, this.stationPoint.lat), {
        enableDragging: true
      });
      this.StationMarker.setZIndex(0);
      this.StationMarker.addEventListener('dragend', evt => {
        // 监听回调消防站位置的变化，并重新进行规划导航
        const {
          point: { lng, lat }
        } = evt;
        this.stationPoint = { lng, lat };
        this.routeControl();
      });
      Bmap.addOverlay(this.StationMarker);
    },
    /** 消防站显示隐藏 */
    StationcheckedChange(val) {
      if (val) {
        this.StationMarker && this.StationMarker.show();
      } else {
        this.StationMarker && this.StationMarker.hide();
      }
    },
    // 消防救援路径规划(驾车)
    loadRescueRoute() {
      if (!this.driving) return;
      // 每次导航规划前，清除上一次操作
      this.removeRoute();
      // 沙坪呗消防支队
      const start = new BMap.Point(this.stationPoint.lng, this.stationPoint.lat);
      const end = new BMap.Point(this.firePoint.lng, this.firePoint.lat);
      // 根据起点终点进行驾车导航查询
      this.driving.search(start, end);
    },
    // 消防疏散线路规划(步行)
    loadEvacuateRoute() {
      if (!this.walking) return;
      // 每次导航规划前，清除上一次操作
      this.removeRoute();
      const start = new BMap.Point(this.firePoint.lng, this.firePoint.lat);
      // 大田堡体育场
      const end = new BMap.Point(106.32706169169693, 29.597134274789486);
      // 根据起点终点进行步行导航查询
      this.walking.search(start, end);
    },
    /** 清除导航规划，并关闭耗时距离展示框 */
    removeRoute() {
      this.infoShow = false;
      this.driving && this.driving.clearResults();
      this.walking && this.walking.clearResults();
    }
  },
  destroyed() {}
};
</script>
<style lang="less">
.home-container {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  position: relative;
  #map-container {
    width: 100%;
    height: 100%;
  }
  .map-tools {
    position: absolute;
    top: 0.65rem;
    left: 0.65rem;
    display: flex;
    z-index: 99;
    .btn {
      padding: 0.35rem 0.35rem;
      background: #e0dddd;
      color: #000;
      margin: 0 0.15rem;
      cursor: pointer;
      border-radius: 0.41rem;
      font-size: 0.75rem;
    }
    .active {
      background: #1268d8;
      color: #fff;
    }
  }
  .fire-tools {
    position: absolute;
    top: 0.65rem;
    left: 12rem;
    display: flex;
    z-index: 99;
    // height: 2.5rem;
    justify-content: center;
    align-items: center;

    .fire-tools-item {
      padding: 0.2rem 0.3rem;
      margin: 0 0.15rem;
      border-radius: 0.41rem;
      background: #e0dddd;
    }
  }
  .info-content {
    position: absolute;
    right: 1.25rem;
    bottom: 1.25rem;
    display: flex;
    display: inline-block;
    z-index: 99;
    background: #1268d8;
    color: #fff;
    border-radius: 0.41rem;
    padding: 0.625rem;
    .info-item {
    }
  }
}
</style>
