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
      window.Bmap = new BMapGL.Map('map-container', {
        minZoom: 4,
        maxZoom: 24
      });
      Bmap.enableScrollWheelZoom();
      Bmap.on('click', evt => {
        console.log(evt);
      });
      this.loadFireMarker();
      this.loadStationMarker();
      this.initDrivingRoute();
      this.routeControl();
    },
    toolsClick(el) {
      if (this.activeKey === el.key) return;
      this.tools.map(item => {
        item.key === el.key ? (item.checked = !el.checked) : (item.checked = false);
      });
      this.activeKey = el.key;
      this.routeControl();
    },
    routeControl() {
      switch (this.activeKey) {
        case 'rescue':
          this.loadRescueRoute();
          break;
        case 'evacuate':
          this.loadEvacuateRoute();
          break;
      }
    },
    initDrivingRoute() {
      // 驾车 0.4km/min
      this.driving = new BMapGL.DrivingRoute(Bmap, {
        renderOptions: { map: Bmap, autoViewport: true },
        onSearchComplete: result => {
          const time = result.getPlan(0).getDuration(true);
          const dis = result.getPlan(0).getDistance(true);
          this.infoDetail = { time, dis };
          this.infoShow = true;
        }
      });
      // 步行 63m/min
      this.walking = new BMapGL.WalkingRoute(Bmap, {
        renderOptions: { map: Bmap, autoViewport: true },
        onSearchComplete: result => {
          const time = result.getPlan(0).getDuration(true);
          const dis = result.getPlan(0).getDistance(true);
          this.infoDetail = { time, dis };
          this.infoShow = true;
        }
      });
    },
    FirecheckedChange(val) {
      if (val) {
        this.FireMarker && this.FireMarker.show();
      } else {
        this.FireMarker && this.FireMarker.hide();
      }
    },
    loadFireMarker() {
      // var icon = new BMapGL.Icon(require('../assets/images/map/fire.png'), new BMapGL.Size(70, 70));
      this.FireMarker = new BMapGL.Marker(new BMapGL.Point(this.firePoint.lng, this.firePoint.lat), {
        enableDragging: true
      });
      this.FireMarker.setZIndex(0);
      this.FireMarker.on('dragend', evt => {
        const {
          latLng: { lng, lat }
        } = evt;
        this.firePoint = { lng, lat };
        this.routeControl();
      });
      Bmap.addOverlay(this.FireMarker);
    },
    StationcheckedChange(val) {
      if (val) {
        this.StationMarker && this.StationMarker.show();
      } else {
        this.StationMarker && this.StationMarker.hide();
      }
    },
    loadStationMarker() {
      this.StationMarker = new BMapGL.Marker(new BMapGL.Point(this.stationPoint.lng, this.stationPoint.lat), {
        enableDragging: true
      });
      this.StationMarker.setZIndex(0);
      this.StationMarker.on('dragend', evt => {
        const {
          latLng: { lng, lat }
        } = evt;
        this.stationPoint = { lng, lat };
        this.routeControl();
      });
      Bmap.addOverlay(this.StationMarker);
    },
    // 消防救援路径规划(驾车)
    loadRescueRoute() {
      if (!this.driving) return;
      this.removeRoute();
      // 沙坪呗消防支队
      const start = new BMapGL.Point(this.stationPoint.lng, this.stationPoint.lat);
      const end = new BMapGL.Point(this.firePoint.lng, this.firePoint.lat);
      // Bmap.centerAndZoom(end, 16);
      this.driving.search(start, end);
    },
    // 消防疏散线路规划(步行)
    loadEvacuateRoute() {
      if (!this.walking) return;
      this.removeRoute();
      const start = new BMapGL.Point(this.firePoint.lng, this.firePoint.lat);
      // 大田堡体育场
      const end = new BMapGL.Point(106.32706169169693, 29.597134274789486);
      this.walking.search(start, end);
    },
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
