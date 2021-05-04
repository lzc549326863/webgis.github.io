<template>
  <div class="login-container">
    <div class="login-box">
      <el-form label-width="80px" :model="loginForm">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" @keydown.enter.native="onSubmit"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">登录</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import UserService from '@/service/user';
import { Message } from 'element-ui';
export default {
  name: 'login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      }
    };
  },
  mounted() {},
  methods: {
    onSubmit() {}
  }
};
</script>
<style lang="less">
.login-container {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-content: center;
  .login-box {
    width: 360px;
    height: 240px;
    background: #fff;
    padding: 20px;
    display: flex;
    position: absolute;
    top: 200px;
  }
}
</style>
