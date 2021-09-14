export default Tailor = (function(){
    var _tailor = null; //裁剪实例
    var c;//canvas对象
    var ctx;//画笔对象
    var lineWidth = 1; //选框指示线宽度
    var fillColor = "#ddd"; //选框指示线颜色
    var strokeColor = "#ddd"; //抓取点颜色
    var lineDash = [4,2]; //虚线指示线
    var lineDashOffset = 0;//虚线指示线起始偏移量
    var r = 4;//抓取点半径
    var lockScale;//{x:4,y:3} 锁定比例(使用锁定比例，必须锁定X，或Y轴其中一个，如果lockX,lockY,都传入，则优先锁定X轴)；
    var lockX = false; //锁定X轴，裁剪框由Y轴移动距离决定
    var lockY = false; //锁定Y轴，裁剪框由X轴移动距离决定
    var img; //需要裁剪的img元素对象
    var controlPointList = [];//裁剪框控制点列表 顺序['左上','左中','左下','上中','右上','下中','右中','右下',]
    var catchType = '';//当前抓取点位置
    var startPos = null;//裁剪框绘制起始点
    var startMove = false;
    var catchEvent = { //抓取事件策略
        'leftTop':function(pos){//左上，一般为起始点
            var startPos = controlPointList[controlPointList.length - 1];
            if(Math.abs(startPos.x - pos.x) < 20 || Math.abs(startPos.y - pos.y) < 20){
                return 
            }
            this['rightBottom-leftTop'](startPos,pos);
        },
        'leftBottom':function(pos){//左下
            var startPos;
            if(controlPointList.length == 4){
                startPos = controlPointList[2];
            }else if(controlPointList.length == 8){
                startPos = controlPointList[4];
            }
            if(startPos){
                if(Math.abs(startPos.x - pos.x) < 20 || Math.abs(startPos.y - pos.y) < 20){
                    return 
                }
                this['rightTop-leftBottom'](startPos,pos);
            }
        },
        'rightTop':function(pos){ //右上
            var startPos;
            if(controlPointList.length == 4){
                startPos = controlPointList[1];
            }else if(controlPointList.length == 8){
                startPos = controlPointList[2];
            }
            if(Math.abs(startPos.x - pos.x) < 20 || Math.abs(startPos.y - pos.y) < 20){
                return 
            }
            this['leftBottom-rightTop'](startPos,pos);
        },
        'rightBottom':function(pos){//右下
            var startPos = controlPointList[0];
            if(Math.abs(startPos.x - pos.x) < 20 || Math.abs(startPos.y - pos.y) < 20){
                return 
            }
            this['leftTop-rightBottom'](startPos,pos);
        },
        'leftTop-rightBottom':function(startPos,endPos){//左上到右下
            controlPointList = [];
            if(lockX){
                endPos.x = Math.floor(startPos.x + Math.abs(startPos.y - endPos.y)*lockScale.x / lockScale.y);
            }else if(lockY){
                endPos.y = Math.floor(startPos.y + Math.abs(startPos.x - endPos.x)*lockScale.y / lockScale.x);
            }
            if(endPos.x >= c.width || endPos.y >= c.height){
                return
            }
            var xlen = Math.abs(startPos.x - endPos.x);
            var ylen = Math.abs(startPos.y - endPos.y);

            controlPointList.push(startPos);//左上
            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:startPos.x,y:Math.floor( startPos.y + ylen/2 )}) //左中
            }
            
            controlPointList.push({x:startPos.x,y:endPos.y}); //左下

            
            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:Math.floor( startPos.x + xlen/2 ),y:startPos.y}) //上中
            }

            controlPointList.push({x:endPos.x,y:startPos.y}); //右上

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:Math.floor( startPos.x + xlen/2 ),y:endPos.y}) //下中
            }

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:endPos.x,y:Math.floor( startPos.y + ylen/2 )}) //右中
            }

            controlPointList.push(endPos);//右下

            drawAll()
        },
        'leftBottom-rightTop':function(startPos,endPos){//左下到右上
            controlPointList = [];
            if(lockX){
                endPos.x = Math.floor(startPos.x + Math.abs(startPos.y - endPos.y)*lockScale.x / lockScale.y);
            }else if(lockY){
                endPos.y = Math.floor(startPos.y - Math.abs(startPos.x - endPos.x)*lockScale.y / lockScale.x);
            }
            if(endPos.x >= c.width || endPos.y <= 0){
                return
            }
            var xlen = Math.abs(startPos.x - endPos.x);
            var ylen = Math.abs(startPos.y - endPos.y);

            controlPointList.push({x:startPos.x,y:endPos.y})//左上
            
            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:startPos.x,y:Math.floor( endPos.y + ylen/2 )}) //左中
            }

            controlPointList.push(startPos); //左下

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:Math.floor( startPos.x + xlen/2 ),y:endPos.y}) //上中
            }

            controlPointList.push(endPos); //右上

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:Math.floor( startPos.x + xlen/2 ),y:startPos.y}) //下中
            }

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:endPos.x,y:Math.floor( endPos.y + ylen/2 )}) //右中
            }

            controlPointList.push({x:endPos.x,y:startPos.y});//右下

            drawAll()
        },
        'rightTop-leftBottom':function(startPos,endPos){//右上到左下
            controlPointList = [];
            if(lockX){
                endPos.x = Math.floor(startPos.x - Math.abs(startPos.y - endPos.y)*lockScale.x / lockScale.y);
            }else if(lockY){
                endPos.y = Math.floor(startPos.y + Math.abs(startPos.x - endPos.x)*lockScale.y / lockScale.x);
            }
            if(endPos.x <= 0 || endPos.y >= c.height){
                return
            }
            var xlen = Math.abs(startPos.x - endPos.x);
            var ylen = Math.abs(startPos.y - endPos.y);

            controlPointList.push({x:endPos.x,y:startPos.y})//左上
            
            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:endPos.x,y:Math.floor( startPos.y + ylen/2 )}) //左中
            }

            controlPointList.push(endPos); //左下

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:Math.floor( endPos.x + xlen/2 ),y:startPos.y}) //上中
            }

            controlPointList.push(startPos); //右上

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:Math.floor( endPos.x + xlen/2 ),y:endPos.y}) //下中
            }

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:startPos.x,y:Math.floor( startPos.y + ylen/2 )}) //右中
            }

            controlPointList.push({x:startPos.x,y:endPos.y});//右下

            drawAll()

        },
        'rightBottom-leftTop':function(startPos,endPos){//右下到左上
            controlPointList = [];
            if(lockX){
                endPos.x = Math.floor(startPos.x - Math.abs(startPos.y - endPos.y)*lockScale.x / lockScale.y);
            }else if(lockY){
                endPos.y = Math.floor(startPos.y - Math.abs(startPos.x - endPos.x)*lockScale.y / lockScale.x);
            }
            if(endPos.x <= 0 || endPos.y <= 0){
                return
            }
            var xlen = Math.abs(startPos.x - endPos.x);
            var ylen = Math.abs(startPos.y - endPos.y);

            controlPointList.push(endPos)//左上
            
            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:endPos.x,y:Math.floor( endPos.y + ylen/2 )}) //左中
            }

            controlPointList.push({x:endPos.x,y:startPos.y}); //左下

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:Math.floor( endPos.x + xlen/2 ),y:endPos.y}) //上中
            }

            controlPointList.push({x:startPos.x,y:endPos.y}); //右上

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:Math.floor( endPos.x + xlen/2 ),y:startPos.y}) //下中
            }

            if(ylen > 60 && xlen > 60 && !lockX && !lockY){
                controlPointList.push({x:startPos.x,y:Math.floor( endPos.y + ylen/2 )}) //右中
            }

            controlPointList.push(startPos);//右下

            drawAll()

        },
        'leftCenter':function(pos){ //左中
            var xlen = Math.abs(pos.x - controlPointList[7].x);
            if(xlen < 100 || pos.x > controlPointList[7].x){
                return
            }
            controlPointList[0].x = pos.x;
            controlPointList[1].x = pos.x;
            controlPointList[2].x = pos.x;
            controlPointList[3].x = Math.floor(pos.x + xlen/2);
            controlPointList[5].x = Math.floor(pos.x + xlen/2);
            drawAll()
        },
        'topCenter':function(pos){ //上中
            var ylen = Math.abs(pos.y - controlPointList[7].y);
            if(ylen < 100 || pos.y > controlPointList[7].y){
                return
            }
            controlPointList[0].y = pos.y;
            controlPointList[3].y = pos.y;
            controlPointList[4].y = pos.y;
            controlPointList[1].y = Math.floor(pos.y + ylen/2);
            controlPointList[6].y = Math.floor(pos.y + ylen/2);
            drawAll()
        }, 
        'rightCenter':function(pos){ //右中
            var xlen = Math.abs(pos.x - controlPointList[0].x);
            if(xlen < 100 || pos.x < controlPointList[0].x){
                return
            }
            controlPointList[4].x = pos.x;
            controlPointList[6].x = pos.x;
            controlPointList[7].x = pos.x;
            controlPointList[3].x = Math.floor(pos.x - xlen/2);
            controlPointList[5].x = Math.floor(pos.x - xlen/2);
            drawAll()
        },
        'bottomCenter':function(pos){ //下中
            var ylen = Math.abs(pos.y - controlPointList[0].y);
            if(ylen < 100 || pos.y < controlPointList[0].y){
                return
            }
            controlPointList[2].y = pos.y;
            controlPointList[5].y = pos.y;
            controlPointList[7].y = pos.y;
            controlPointList[1].y = Math.floor(pos.y - ylen/2);
            controlPointList[6].y = Math.floor(pos.y - ylen/2);
            drawAll()
        }
    }

    function Tailor(option){ //裁剪类
        this.init(option);
    }

    /**
     * init 设置参数
     * @param {*} option {el:画布容器元素, img:文件对象/url, lockScale:{x:4,y:3},lockX:true,lockY:true }
     */
    Tailor.prototype.init = function(option){
        if(!option){
            throw new Error('需要相关参数才能初始化裁剪工具')
        }
        if(!_tailor && !option.el){
            throw new Error('初始化裁剪工具时，须提供一个容器元素')
        }
        if(option.lockScale && !option.lockX && !option.lockY){
            throw new Error('锁定裁剪比例时，须设置锁定x,或y轴')
        }
        if(!_tailor){//第一次创建时，创建canvas画布，ctx画笔
            c = document.createElement('canvas');
            c.width = option.el.offsetWidth;
            c.height = option.el.offsetHeight;
            option.el.appendChild(c);
            ctx = c.getContext('2d');
            registerEvent();//注册鼠标事件
        }
        reset();//重置画布
        if(option.lockY){ //锁定Y轴方向
            lockY = option.lockY;
            lockX = false
        }
        if(option.lockX){ //锁定X轴方向
            lockX = option.lockX;
            lockY = false
        }
        if(option.lockScale){ //设置锁定比例
            lockScale = option.lockScale
        }else {
            lockScale = null;
            lockX = false;
            lockY = false;
        }
        if(option.img){//原图像
            if(typeof option.img === 'string'){//传入图片地址
                createBaseImg(option.img);
            }else {//传入图片文件对象
                var url = window.URL.createObjectURL(option.img);
                createBaseImg(url);
            }
        }
    }

    Tailor.prototype.getTailorBase64Img = function(){ //获取裁剪后的base64格式图片
        if(!img){
            return null
        }
        var size = calcFinalCsize();
        var scale = Math.floor(size.width / c.width * 1000) / 1000; //精确到三位小数
        var startPos = {
            x:Math.round(controlPointList[0].x*scale),
            y:Math.round(controlPointList[0].y*scale),
        }
        var xlen = Math.round((controlPointList[controlPointList.length - 1].x - controlPointList[0].x)*scale);
        var ylen = Math.round((controlPointList[controlPointList.length - 1].y - controlPointList[0].y)*scale);

        var finalC = document.createElement('canvas');
    
        finalC.width = size.width;
        finalC.height = size.height;
        var finalCtx = finalC.getContext('2d');
        drawBg(finalC,finalCtx);
        drawImg(finalC,finalCtx);
        var imgData = finalCtx.getImageData(startPos.x,startPos.y,xlen,ylen);
        var finalC1 = document.createElement('canvas');
        finalC1.width = imgData.width;
        finalC1.height = imgData.height;
        var finalCtx1 = finalC1.getContext('2d');
        finalCtx1.putImageData(imgData,0,0);
        finalC = null;
        // finalC1 = null;
        finalCtx = null;
        // finalCtx1 = null;
        return finalC1.toDataURL();
    }
    Tailor.prototype.getTailorImg = function(){ //获取裁剪图片的文件对象
        if(!img){
            return null
        }
        var base64 = this.getTailorBase64Img();
        var name = +new Date() + '.png';
        var file = dataURLtoFile(base64,name);
        return file
    } 

    function dataURLtoFile(dataurl, filename) {//将base64转换为文件
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }
    function reset(){//重置画布
        controlPointList = [];
        catchType = '';
        startPos = null;
        startMove = false;
        img = null;
        drawBg(c,ctx);
    }
    function drawBg(c,ctx){ //绘制底色
        ctx.clearRect(0,0,c.width,c.height);
        changeFillColor('black');//黑底填充色
        ctx.fillRect(0,0,c.width,c.height);
        resetFillColor();//重置填充色
    }
    
    function createBaseImg(url){//创建原始图片
        if(!img){
            img = document.createElement('img');
            img.crossOrigin = 'anonymous';
        }
        img.src = url;
        img.onload= function(){
            drawImg(c,ctx);
        }
    }
    function drawImg(c,ctx){ //将原始图片绘制到canvas画布
        if(!img){
            return
        }
        var pos = calcImgPos(c);
        ctx.drawImage(img,pos.x,pos.y,pos.width,pos.height);
    }
    function calcImgPos(c){ //计算原始图片的显示大小，以及在画布中的位置
        var imgscale = Math.floor(img.width / img.height * 100) /100;
        var cScale = Math.floor(c.width / c.height * 100) / 100;
        if(imgscale == cScale){ //比例相同
            return {
                x:0,
                y:0,
                width:c.width,
                height:c.height
            }
        }else if(imgscale > cScale){ //图片宽高比大于画布宽高比
            var width = c.width;
            var height = Math.floor(c.width * img.height / img.width);
            var y = Math.floor((c.height - height) / 2);
            return {
                x:0,
                y,
                width,
                height
            }
        }else if(imgscale < cScale) { //图片宽高比小于画布宽高比
            var width = Math.floor(c.height * img.width / img.height);
            var height = c.height;
            var x = Math.floor((c.width - width) / 2);
            return {
                x,
                y:0,
                width,
                height
            }
        }
    }
    function calcFinalCsize(){//计算最终截图的画布尺寸
        var imgscale = Math.floor(img.width / img.height * 100) /100;
        var cScale = Math.floor(c.width / c.height * 100) / 100;
        if(imgscale == cScale){//比例相同
            return {
                width:img.width,
                height:img.height
            }
        }else if(imgscale > cScale){ //图片宽高比大于画布宽高比
                return {
                    width:img.width,
                    height:Math.floor(img.width * c.height / c.width)
                }
        }else if(imgscale < cScale){ //图片宽高比小于画布宽高比
            return {
                height:img.height,
                width:Math.floor(c.width * img.height / c.height)
            }
        }
    }


    function changeFillColor(color){ //切换填充色
        fillColor = color;
        ctx.fillStyle = fillColor;
    }
    function resetFillColor(){ //重置填充色
        changeFillColor('#ddd')
    }
    function changeSrokeColor(color){ //切换描边色
        strokeColor = color;
        ctx.strokeStyle = strokeColor;
    }
    function resetStrokeColor(){ //重置描边色
        changeSrokeColor('#ddd')
    }
    function checkIn(pos){ //判断鼠标坐标点是否在控制的内
        let flag = -1;
        for(var i = 0, len = controlPointList.length; i < len; i++){
            let x = Math.abs(controlPointList[i].x - pos.x);
            let y = Math.abs(controlPointList[i].y - pos.y);
            if(x*x + y*y <= r*r){
                flag = i;
                break;
            }
        }
        return flag;
    }
    function getMousePos(canvas,event){ //获取鼠标坐标点
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left*(canvas.width / rect.width);
        var y = event.clientY - rect.top*(canvas.height / rect.height);
        return {x,y}
    }
    function drawTailor(){//绘制裁剪框
        resetStrokeColor();
        resetFillColor();
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(lineDash);
        ctx.lineDashOffset = lineDashOffset;
        var len = controlPointList.length;
        ctx.strokeRect(controlPointList[0].x,controlPointList[0].y,Math.floor(controlPointList[len-1].x - controlPointList[0].x),Math.floor(controlPointList[len-1].y - controlPointList[0].y));
        for(var i = 0; i < len ; i++){
            ctx.beginPath();
            ctx.arc(controlPointList[i].x,controlPointList[i].y,r,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
        }
    }
    function drawAll(){//绘制所有动作
        drawBg(c,ctx);
        drawImg(c,ctx);
        drawTailor();
    }

    function registerEvent(){ //注册画布事件
        c.addEventListener('mousedown',mouseDown)
        c.addEventListener('mousemove',mouseMove)
        c.addEventListener('mouseup',mouseUp)
        c.addEventListener('mouseout',mouseOut)
    }

    function mouseDown(e){ //鼠标按下事件
        startMove = true;

        var pos = getMousePos(c,e);
        var index = checkIn(pos);
        
        if(index == -1){ //鼠标坐标没有在控制点内；重新创建裁剪框
            startPos = pos;
            catchType = '';
        }else{ //鼠标坐标点在控制点内；动态计算裁剪框大小
            startPos = null;
            if(controlPointList.length == 4){ //只有四个抓取点时
                switch(index){
                    case 0://左上
                        catchType = 'leftTop';
                        break;
                    case 1://左下
                        catchType = 'leftBottom';
                        break;
                    case 2://右上
                        catchType = 'rightTop';
                        break;
                    case 3://右下
                        catchType = 'rightBottom';
                        break;
                }
            }else {
                switch(index){
                    case 0://左上
                        catchType = 'leftTop';
                        break;
                    case 1://左中
                        catchType = 'leftCenter';
                        break;
                    case 2://左下
                        catchType = 'leftBottom';
                        break;
                    case 3://上中
                        catchType = 'topCenter';
                        break;
                    case 4://右上
                        catchType = 'rightTop';
                        break;
                    case 5://下中
                        catchType = 'bottomCenter';
                        break;
                    case 6://右中
                        catchType = 'rightCenter';
                        break;
                    case 7://右下
                        catchType = 'rightBottom';
                        break;
                }
            }
            
        }
    }

    function mouseMove(e){ //鼠标移动事件
        var pos = getMousePos(c,e);
        changeCursor(pos);
        if(!startMove){
            return
        }
        if(!catchType){//非抓取点绘制
            if(pos.x > startPos.x && pos.y > startPos.y){//左上到右下
                catchEvent['leftTop-rightBottom'](startPos,pos);
            }else if(pos.x > startPos.x && pos.y < startPos.y){ //左下到右上
                catchEvent['leftBottom-rightTop'](startPos,pos);
            }else if(pos.x < startPos.x && pos.y > startPos.y){//右上到左下
                catchEvent['rightTop-leftBottom'](startPos,pos);
            }else if(pos.x < startPos.x && pos.y < startPos.y){//右下到左上
                catchEvent['rightBottom-leftTop'](startPos,pos);
            }
        }else { //抓取某点绘制
            catchEvent[catchType](pos);
        }
    }
    function mouseUp(){ //鼠标抬起事件
        startMove = false;
    }
    function mouseOut(){//鼠标移出事件
        startMove = false;
    }

    function changeCursor(pos){ //修改鼠标样式
        var index = checkIn(pos);
        if(index != -1){
            if(controlPointList.length == 4){
                switch(index){
                    case 0:
                    case 3:
                        c.style.cursor = 'nw-resize'
                        break;
                    case 1:
                    case 2:
                        c.style.cursor = 'ne-resize'
                        break;
                }
            }else {
                switch(index){
                    case 0:
                    case 7:
                        c.style.cursor = 'nw-resize'
                        break;
                    case 2:
                    case 4:
                        c.style.cursor = 'ne-resize'
                        break;
                    case 1:
                    case 6:
                        c.style.cursor = 'w-resize'
                        break;
                    case 3:
                    case 5:
                        c.style.cursor = 's-resize'
                        break; 
                }
            }
        }else {
            c.style.cursor = 'default'
        }
    }
    function SingleTailor(option){ //裁剪单例创建器
        if(_tailor){
            return _tailor
        }else {
            _tailor =  new Tailor(option);
            return _tailor
        }
    }
    return SingleTailor
})()

