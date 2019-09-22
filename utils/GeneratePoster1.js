// 生成海报
/**
 * @param {CanvasList} canvas上下文
 * @param {Array} InforList 渲染数据，下面是各个类型的传参方法
 * 
 * @param {Object} Images//图片格式数据
 * @param {String}  type: 'image'
 * @param {String} src//图片路径
 * @param {Number} x//图片路径
 * @param {Number} y//y轴起始位置
 * @param {Number} width//宽度
 * @param {Number} height//高度
 * @param {Boolean} radius://是否圆角
 * @param {Boolean} local,//是否是本地图片,false会下载到本地(网络图片真机无法加载)
 * @param {Number} zIndex//图片显示权级,
 * @param {Boolean} TextAlign//图片是否居中(根据设置的Background为父级计算,使用时x无效)
 * 
 * @param {Object} Texts
 * @param {String} text//文字文本
 * @param {Number} x//x轴起始位置
 * @param {Number} y//y轴起始位置
 * @param {Number} width//文本宽度
 * @param {String} font//字体大小与字体，默认14px 微软雅黑
 * @param {String} color//颜色
 * @param {Number} LineHeight//文字换行高度设置
 * @param {String} type: 'text'
 * @param {Boolean} TextAlign//文字是否居中(根据设置的Background为父级计算,使用时x无效)
 * @param {Number} Ellipsis//省略号，传参为行数
 * @param {Number} Relation={//关联文字，后面的文字将计算前面关联的高度,y轴失效
 *   @param {Number}id:关联ID
 *   @param {Number}height//下段文字间距
 * }
 * @param {Number} zIndex//优先级
 * 
 * @param {Object} view//矩形模块
 * @param {String} type: 'view'
 * @param {String} x//x轴起始位置
 * @param {String} y//y轴起始位置
 * @param {Number} width//width宽度
 * @param {Number} height//height高度
 * @param {String} color//背景颜色
 * @param {Boolean} radius//是否圆角
 * @param {Number} radiusSize//圆角大小
 * @param {Number} zIndex//优先级
 * @param {Boolean} TextAlign//矩形是否居中(根据设置的Background为父级计算,使用时x无效)
 * 
 * @param {Object} Background//背景模块，设定了最终图片的大小
 * @param {String} type:'background'
 * @param {Number} x//x轴起始位置
 * @param {Number} y//y轴起始位置
 * @param {Number} width//width宽度
 * @param {Number} height//height高度
 * @param {String} color//背景颜色
 * @param {String} id//canvas的canvas-id
 * 
 */
class poster {
  constructor(context, InforList) {
    this.context = context
    this.InforList = this.Initialization(InforList)
    this.BackgroundStyle = InforList.find(res => res.type === 'background');
    this.NetworkPicture = []
    this.Relation = new Object();
  }

  async Synthesis() {
    //开始合成图片
    return new Promise(async(resolve, reject) => {
      if (!this.context) {
        reject('未获取到canvas实例');
        return;
      }
      if (!this.InforList) {
        reject('未获取到合成数据');
        return;
      }
      //设置背景
      let BackgroundStyle = this.InforList.find(res => res.type === 'background');
      this.BackgroundStyle = BackgroundStyle
      if (!BackgroundStyle.id) {
        reject('请输入canvas的canvas-id')
        return
      }
      if (!BackgroundStyle) {
        reject('请设置canvas大小')
      }
      this.InforList.map(res => {
        if (res.type === 'image' && !res.local) {
          this.NetworkPicture.push(res)
        }
      })
      let _this = this
      Promise.all([
          await this.GetImageInfo()
        ])
        .then(AllRes => {
          //设置背景
          console.log('设置背景')
          this.context.fillStyle = BackgroundStyle.color || '#FFFFFF';
          this.context.fillRect(BackgroundStyle.x, BackgroundStyle.y, BackgroundStyle.width, BackgroundStyle.height);
          console.log('合并下载的网络图片和本地同步数据')
          //合并下载的网络图片和本地同步数据
          AllRes = AllRes[0]
          AllRes.map(items => items.local = true)
          let List = AllRes.concat(this.InforList).filter(item => (item.type !== 'image' && item.type !== 'background') || item.local).sort((a, b) => a.zIndex - b.zIndex)
          console.log(List)
          console.log('开始合并canvas')
          List.map(res => {
            if (res.type === 'image') {
              this.ImageSynthesis(res)
            } else if (res.type === 'text') {
              this.TextSynthesis(res)
            } else if (res.type === 'view') {
              this.ViewSynthesis(res)
            }
          })

          console.log('合并完成，开始下载图片')
          this.NetworkPicture = []
          this.context.draw(false, function(e) {
            //生成图片
            console.log('生成图片')
            wx.canvasToTempFilePath({
              x: _this.BackgroundStyle.x,
              y: _this.BackgroundStyle.y,
              width: _this.BackgroundStyle.width,
              height: _this.BackgroundStyle.height,
              canvasId: _this.BackgroundStyle.id,
              success: function(res) {
                console.log('生成海报图片')
                console.log(res.tempFilePath)
                resolve(res.tempFilePath);
              }
            });
          });

        })
    });
  }

  /**
   * @param {TextSynthesis}绘制文字至canvas
   * @param {Object}format:文字数据
   */
  TextSynthesis(format) {
    this.context.save();
    this.context.font = format.font;
    this.context.fillStyle = format.color;
    let LineHeight = format.LineHeight
    let result = this.breakLinesForCanvas(format.text, format.width, format.Ellipsis)
    //获取关联上级高度
    if (format.Relation && typeof this.Relation[format.Relation.id] !== 'undefined') {
      format.y = this.Relation[format.Relation.id]
    }
    if (format.TextAlign) { //文字居中
      let width = this.context.measureText(result[0]).width
      format.x = (this.BackgroundStyle.width - width) / 2
    }
    result.map((item, index) => {
      this.context.fillText(item, format.x, format.y + index * LineHeight);
    })
    this.context.restore();
    //设置关联本级高度
    if (format.Relation) {
      format.Relation.height = format.Relation.height ? format.Relation.height : 40
      let height = result.length * LineHeight + format.Relation.height + format.y - LineHeight
      this.Relation[format.Relation.id] = height
    }
  }

  /**
   * @param {ImageSynthesis}绘制图片至canvas
   * @param {Object}format:图片数据
   */
  async ImageSynthesis(format) {
    if (format.TextAlign) { //图片居中
      format.x = (this.BackgroundStyle.width - format.width) / 2
    }
    if (format.radius) { //设置圆角
      this.context.save();
      this.context.beginPath();
      this.context.arc(format.width / 2 + format.x, format.width / 2 + format.y, format.width / 2, 0, Math.PI * 2, false);
      this.context.stroke();
      this.context.clip();
      this.context.drawImage(img, format.x, format.y, format.width, format.height);
      this.context.restore();
    } else {
      this.context.save();
      this.context.drawImage(format.src, format.x, format.y, format.width, format.height);
      this.context.restore();
    }
  }

  /**
   * @param {GetImageInfo}图片下载到本地(canvas图片只能使用本地的图片)
   */
  GetImageInfo() {
    return new Promise((resolve, reject) => {
      let Picture = JSON.parse(JSON.stringify(this.NetworkPicture))
      if (~Picture.length) {
        resolve(Picture)
      } else {
        Picture.map((item, index) => {
          wx.getImageInfo({
            src: item.src,
            success: function(res) {
              //下载图片，改变数据后再次渲染
              Picture[index].src = res.path
              Picture[index].local = true
              console.log(res.path)
              if (index == Picture.length - 1) {
                resolve(Picture)
              }
            }
          });
        })
      }
    })
  }

  /**
   * @param {ViewSynthesis}处理矩形模块至canvas
   * @param {Object}format:矩形数据
   */
  ViewSynthesis(format) {
    if (format.TextAlign) { //文字居中
      format.x = (this.BackgroundStyle.width - format.width) / 2
    }
    if (format.radius) { //绘制圆角的矩形
      this.context.save();
      this.context.beginPath() //开始绘制
      this.context.fill('transparent') //填充颜色
      this.context.setFillStyle(format.color)
      let x = format.x,
        y = format.y,
        w = format.width,
        h = format.height,
        r = format.radiusSize
      //绘制top直线
      this.context.fillRect(x + r, y, w - 2 * r, r)
      //开始绘制左上角半圆
      this.context.arc(x + r, y + r, r, 0, 2 * Math.PI)
      //绘制bottom直线
      this.context.fillRect(x + r, y + h - r, w - 2 * r, r)
      //开始绘制右上角半圆
      this.context.arc(x + w - r, y + r, r, 0, 2 * Math.PI)
      //绘制left直线
      this.context.fillRect(x, y + r, r, h - 2 * r)
      //开始绘制左下角半圆
      this.context.arc(x + r, y + h - r, r, 0, 2 * Math.PI)
      //绘制right直线
      this.context.fillRect(x + w - r, y + r, r, h - 2 * r)
      //开始绘制右下角半圆
      this.context.arc(x + w - r, y + h - r, r, 0, 2 * Math.PI)
      //绘制中间层
      this.context.fillRect(x + r, y + r, w - 2 * r, h - 2 * r)
      this.context.fill()
      this.context.closePath()
      this.context.clip()
      this.context.restore();
    } else {
      this.context.setFillStyle(format.color)
      this.context.fillRect(format.x, format.y, format.width, format.height)
    }
  }

  /**
   * @param {Initialization}初始化绘制数据
   * @param {Object}format:图片数据
   */
  Initialization(InforList) {
    let InforList1 = JSON.parse(JSON.stringify(InforList))
    InforList1.map(item => {
      if (item.type === "background") {
        item.color = item.color ? item.color : '#fff'
        item.x = item.x ? item.x : 0
        item.y = item.y ? item.y : 0
        item.width = item.width ? item.width : 0
        item.height = item.height ? item.height : 0
      } else if (item.type === "text") {
        item.text = item.text ? item.text : '' //文字文本
        item.x = item.x ? item.x : 0
        item.y = item.y ? item.y : 0
        item.width = item.width ? item.width : 0
        item.font = item.font ? item.font : '14px 微软雅黑'
        item.color = item.color ? item.color : '#000000'
        item.TextAlign = item.TextAlign ? true : false
        item.LineHeight = item.LineHeight ? item.LineHeight : 20
        item.Ellipsis = item.Ellipsis ? item.Ellipsis : false
        item.Relation = item.Relation ? item.Relation : false
        item.TextSub = item.TextSub ? item.TextSub : false
        item.zIndex = item.zIndex || item.zIndex === 0 ? item.zIndex : 1
      } else if (item.type === "image") {
        item.src = item.src ? item.src : ''
        item.x = item.x ? item.x : 0
        item.y = item.y ? item.y : 0
        item.width = item.width ? item.width : 0
        item.height = item.height ? item.height : 0
        item.color = item.color ? item.color : '#000000'
        item.radius = item.radius ? true : false
        item.zIndex = item.zIndex || item.zIndex === 0 ? item.zIndex : 1
        item.local = item.local ? true : false
        item.TextAlign = item.TextAlign ? true : false
      } else if (item.type === "view") {
        item.x = item.x ? item.x : 0
        item.y = item.y ? item.y : 0
        item.width = item.width ? item.width : 0
        item.height = item.height ? item.height : 0
        item.color = item.color ? item.color : '#fff'
        item.radius = item.radius ? true : false
        item.radiusSize = item.radiusSize ? item.radiusSize : 0
        item.zIndex = item.zIndex || item.zIndex === 0 ? item.zIndex : 1
        item.TextAlign = item.TextAlign ? true : false
      }
    })
    InforList1.sort((a, b) => a.zIndex - b.zIndex);
    return InforList1
  }

  /** 
   * @param {breakLinesForCanvas}进行分割文字
   * @param {String}text：文字
   * @param {Number}width:文字每行宽度
   */
  breakLinesForCanvas(text, width, Ellipsis) {
    let result = [],
      breakPoint = 0;
    //进行文字换行分割
    //breakPoint获取到分割的文字数量
    while ((breakPoint = this.findBreakPoint(text, width)) !== -1) {
      //保存分割的文字
      result.push(text.substr(0, breakPoint));
      //去除分割的文字
      text = text.substr(breakPoint);
    }
    if (text) {
      result.push(text);
    }
    if (Ellipsis && result.length >= Ellipsis) {
      result[Ellipsis - 1] += '...'
      result = this.breakLinesForCanvas(result.join(''), width, false)
      result.length = Ellipsis
    }
    return result;
  }

  /**
   * @param {findBreakPoint}进行二分法查找
   * @param {String}text:文字
   * @param {Number}width:宽度
   */
  findBreakPoint(text, width) {
    var min = 0;
    var max = text.length - 1;

    while (min <= max) {
      let middle = Math.floor((min + max) / 2);
      //使用measureText测量一半text的宽度
      let middleWidth = this.context.measureText(text.substr(0, middle)).width;
      //使用measureText测量一半 + 1text的宽度
      let oneCharWiderThanMiddleWidth = this.context.measureText(text.substr(0, middle + 1)).width;
      //获取width能获取的最大文字数量
      if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
        return middle;
      }
      //一半文字的宽度大于文字的宽度时递减文字数量，小于时递增文字数量
      if (middleWidth < width) {
        min = middle + 1;
      } else {
        max = middle - 1;
      }
    }
    return -1;
  }

}

module.exports = {
  poster: poster
}