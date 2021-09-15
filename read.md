#### 裁剪工具使用：

```javascript
import Tailor from "./tailot.js"; //引入

var tailor = new Tailor(option);//创建裁剪实体对象

// 对象方法：
tailor.init(option); //动态设置裁剪工具参数
tailor.getTailorBase64Img(); //获取裁剪后的base64格式的图片文件
tailor.getTailorImg();//获取裁剪后的图片文件对像

eg: 
var tailor = new Tailor({
  el:body,
  img:'http:baidu.com',
  lockScale:{x:4,y:3},
  lockY:true
})
```

#### option配置对象说明:

| 参数名       | 类型                  | 描述                                       | 默认值   |
| --------- | ------------------- | ---------------------------------------- | ----- |
| el        | documentObject      | 裁剪画布的容器元素，该元素须设置宽高(new时传入有效)             | null  |
| img       | [String,fileObject] | 所需裁剪的图片地址或图片文件对象                         | null  |
| lockScale | Object              | 裁剪框大小比例锁定值 eg: { x:4, y:3 }; 设置了裁剪框比例锁定，必须同时锁定x或y的某一个方向 | null  |
| lockX     | Boolean             | 锁定X轴方向，裁剪框大小由Y轴跟裁剪框比例控制                  | false |
| lockY     | Boolean             | 锁定Y轴方向，裁剪框大小由X轴跟裁剪框比例控制                  | false |

#### 一些静态属性：

| 参数名         | 类型     | 描述          | 默认值       |
| ----------- | ------ | ----------- | --------- |
| lineWidth   | Number | 裁剪框虚线框宽度    | 1         |
| strokeColor | String | 裁剪框虚线颜色     | #ddd      |
| fillColor   | String | 画布背景色/抓取点颜色 | #000/#ddd |
| r           | Number | 抓取点半径       | 4         |