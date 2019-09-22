//index.js
//获取应用实例
const app = getApp()
let poster = require('../../utils/GeneratePoster1.js')
Page({
  data: {

  },
  onLoad: function() {
    this.GetList()
  },
  GetList() {
    let context = wx.createCanvasContext('poster', this)
    let List = [{
        type: 'background',
        color: '#26B2AF', //背景颜色
        x: 0, //x轴起始位置
        y: 0, //y轴起始位置
        width: 375, //width宽度
        height: 597, //height高度
        id: 'poster'
      },
      {
        x: 26,
        y: 250,
        width: 323,
        height: 300,
        type: 'view',
        color: '#fff',
        radius: true,
        radiusSize: 10
      },
      {
        src: 'https://docs.alibabagroup.com/assets2/images/cn/home/home_banner_1.png', //图片路径
        x: 0,
        y: 0,
        width: 375,
        height: 190,
        type: 'image',
        local: false,
        zIndex: 10
      },
      {
        src: '../../images/canvas_1.png',
        x: 26,
        y: 500,
        width: 100,
        height: 30,
        type: 'image',
        local: true,
        TextAlign: true,
      },
      {
        src: '../../images/canvas_2.png',
        x: 30,
        y: 270,
        width: 100,
        height: 30,
        type: 'image',
        local: true,
        TextAlign: true,
      }, {
        text: '555555', //文字文本
        x: 50, //x轴起始位置
        y: 400, //y轴起始位置
        width: 300, //文本宽度
        font: 'bold 20px 微软雅黑', //字体大小与字体，默认14px 微软雅黑
        color: '#26B2AF', //颜色
        LineHeight: 0, //文字换行高度设置
        TextAlign: true,
        type: 'text',
      },
      {
        text: '232323232', //文字文本
        x: 50, //x轴起始位置
        y: 380, //y轴起始位置
        width: 300, //文本宽度
        font: 'bold 20px 微软雅黑', //字体大小与字体，默认14px 微软雅黑
        color: '#26B2AF', //颜色
        LineHeight: 0, //文字换行高度设置
        TextAlign: true,
        type: 'text',
        Relation: {
          id: 1,
          height: 30
        }
      }, {
        text: '232323232', //文字文本
        x: 50, //x轴起始位置
        y: 380, //y轴起始位置
        width: 300, //文本宽度
        font: 'bold 20px 微软雅黑', //字体大小与字体，默认14px 微软雅黑
        color: '#26B2AF', //颜色
        LineHeight: 0, //文字换行高度设置
        TextAlign: true,
        type: 'text',
        Relation: {
          id: 1,
          height: 30
        }
      },
      {
        text: '232323232', //文字文本
        x: 50, //x轴起始位置
        y: 380, //y轴起始位置
        width: 300, //文本宽度
        font: 'bold 20px 微软雅黑', //字体大小与字体，默认14px 微软雅黑
        color: '#26B2AF', //颜色
        LineHeight: 0, //文字换行高度设置
        TextAlign: true,
        type: 'text',
        Relation: {
          id: 1,
          height: 30
        }
      }
    ];
    console.log(poster)
    let SynPoster = new poster.poster(context, List)
    SynPoster.Synthesis()
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  }
})