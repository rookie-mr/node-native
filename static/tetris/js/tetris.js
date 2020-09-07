var tetris={
  OFFSET:15,//盛放格子的区域距边框的边距
  CSIZE:26,//每个格子的大小
  shape:null,//保存正在下落的主角图形
  nextShape:null,//保存备胎图形
  pg:null,//保存游戏的容器元素
  interval:200,//保存方块下落速度
  timer:null,//保存定时器序号
  RN:20,CN:10,//保存总行数和总列数
  wall:null,//保存停止下落的图形中方块的墙
  ln:0,//保存删除的总行数
  score:0,//保存得分
  SCORES:[0,10,30,50,100],
        //0 1  2  3  4
  state:1,//保存状态
  GAMEOVER:0,
  RUNNING:1,
  PAUSE:2,
  start:function(){
    this.score=0;
    this.ln=0;
    this.state=this.RUNNING;
    //创建空数组保存在wall中
    this.wall=[];
    //r从0开始，到<RN结束
    for(var r=0;r<this.RN;r++){
      //创建一个CN个元素的空数组，保存到wall中r行
      this.wall[r]=new Array(this.CN);
    }
    //找到class为playground的一个元素保存在pg中
    this.pg=
   document.getElementsByClassName("playground")[0];
    this.shape=this.randomShape();
    this.nextShape=this.randomShape();
    this.paint();//绘制主角图形
    //启动周期性定时器:
    this.timer=setInterval(
      this.moveDown.bind(this),this.interval
    );
    //为当前页面绑定键盘按下事件
    document.onkeydown=function(e){
      switch(e.keyCode){//判断键盘号
        //如果是37:就调用moveLeft
        case 37: 
          this.state==this.RUNNING&&
            this.moveLeft(); break;
        //如果是39:就调用moveRight
        case 39: 
          this.state==this.RUNNING&&
            this.moveRight(); break;
        //如果是40:就调用moveDown
        case 40: 
          this.state==this.RUNNING&&
            this.moveDown(); break;
        //如果是38:就顺时针旋转
        case 38: 
          this.state==this.RUNNING&&
            this.rotateR(); break;
        //如果是90:就逆时针旋转
        case 90: 
          this.state==this.RUNNING&&
            this.rotateL(); break;
        //如果是83:就重新启动游戏:
        case 83: 
          this.state==this.GAMEOVER&&
            this.start(); break;
        //如果是80:就暂停游戏:
        case 80: 
          this.state==this.RUNNING&&
            this.pause(); break;
        //如果是67:就从暂停继续游戏:
        case 67: 
          this.state==this.PAUSE&&
            this.myContinue(); break;
        //如果是81:就退出游戏
        case 81:
          this.gameover(); break;
        //如果是32:就硬着陆
        case 32:
          this.state==this.RUNNING&&
            this.hardDrop(); break;
      }
    }.bind(this);
  },
  hardDrop:function(){
    //只要可以下落
    while(this.canDown()){
      this.moveDown();//调用moveDown
    }
  },
  gameover:function(){
    //修改游戏状态为GAMEOVER
    this.state=this.GAMEOVER;
    //停止定时器，清除timer
    clearInterval(this.timer); this.timer=null;
    this.paint();//重绘一切
  },
  pause:function(){
    this.state=this.PAUSE;//将游戏状态改为PAUSE
    //停止定时器，清除timer
    clearInterval(this.timer); this.timer=null;
    this.paint();//重绘一切
  },
  myContinue:function(){
    //将游戏状态改为RUNNING
    this.state=this.RUNNING;
    //启动定时器
    this.timer=setInterval(
      this.moveDown.bind(this),this.interval
    );
    this.paint();//重绘一切
  },
  canRotate:function(){
    //遍历主角图形中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      var cell=this.shape.cells[i];//临时保存cell
      //如果:
        //cell的c<0或>=CN
        //或cell的r<0或>=RN
        //或wall中和cell相同位置有格
      if(cell.c<0||cell.c>=this.CN
         ||cell.r<0||cell.r>=this.RN
          ||this.wall[cell.r][cell.c]!==undefined){
        return false;//返回false
      }
    }//(遍历结束)
    return true;//返回true
  },
  rotateR:function(){
    this.shape.rotateR();
    if(!this.canRotate()){
      this.shape.rotateL();
    }
    this.paint();
  },
  rotateL:function(){
    this.shape.rotateL();
    if(!this.canRotate()){
      this.shape.rotateR();
    }
    this.paint();
  },
  canLeft:function(){
    //遍历主角图形中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      //临时保存在cell中
      var cell=this.shape.cells[i];
      //如果cell的c等于0或wall中cell左侧有格
      if(cell.c==0||this.wall[cell.r][cell.c-1]){
        return false;//返回false
      }
    }//(遍历结束)
    return true;//返回true
  },
  moveLeft:function(){
    //如果可以左移
    if(this.canLeft()){
      this.shape.moveLeft();//就让主角左移
      this.paint();//重绘一切
    }
  },
  canRight:function(){
    //遍历主角图形中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      //临时保存在cell中
      var cell=this.shape.cells[i];
      //如果cell的c等于CN-1或wall中cell右侧有格
      if(cell.c==this.CN-1
          ||this.wall[cell.r][cell.c+1]){
        return false;//返回false
      }
    }//(遍历结束)
    return true;//返回true
  },
  moveRight:function(){
    if(this.canRight()){//如果可以右移
      this.shape.moveRight();//就让主角右移
      this.paint();//重绘一切
    }
  },
  randomShape:function(){
    //在0~2之间取一个随机数r
    //判断r
    switch(parseInt(Math.random()*3)){
      //如果是0: 返回一个新创建的O对象
      case 0: return new O();
      //如果是1: 返回一个新创建的I对象
      case 1: return new I();
      //如果是2: 返回一个新创建的T对象
      case 2: return new T();
    }
  },
  paintNext:function(){//绘制备胎图形
    //创建frag
    var frag=document.createDocumentFragment();
    //遍历备胎图形中每个cell
    for(var i=0;i<this.nextShape.cells.length;i++){
      //调用paintCell方法绘制一个格子，传入当前cell和frag作为参数
      this.paintCell(this.nextShape.cells[i],frag);
      var img=frag.lastChild;
      //修改img的left,再加11*CSIZE
      img.style.left=parseFloat(img.style.left)
                      +10*this.CSIZE+"px";
      //修改img的top,再加1*CSIZE
      img.style.top=parseFloat(img.style.top)
                      +1*this.CSIZE+"px";
    }//(遍历结束)
    this.pg.appendChild(frag);//将frag追加到pg中
  },
  moveDown:function(){//下落一次
    if(this.canDown()){//如果canDown
      //调用shape的moveDown方法
      this.shape.moveDown();
    }else{//否则
      this.landIntoWall();//落入墙中
      var ln=this.deleteRows();//删除行
      this.ln+=ln;//累加本次删除的行数
      this.score+=this.SCORES[ln];//累加得分
      if(!this.isGameOver()){//如果游戏没有结束
        this.shape=this.nextShape;
        this.nextShape=this.randomShape();
      }else{//否则
        //修改游戏状态为GAMEOVER
        this.state=this.GAMEOVER;
        //停止定时器，清除timer
        clearInterval(this.timer);
        this.timer=null;
      }
    }
    this.paint();//重绘主角图形
  },
  isGameOver:function(){
    //遍历备胎图形中每个cell
    for(var i=0;i<this.nextShape.cells.length;i++){
      var cell=this.nextShape.cells[i];
      //如果在墙中相同位置有格，就返回true
      if(this.wall[cell.r][cell.c]!==undefined){
        return true;
      }
    }
    return false;//返回false
  },
  paintState:function(){
    //如果游戏状态不是RUNNING
    if(this.state!=this.RUNNING){
      var img=new Image();//创建img
      //设置img的src为:
        //如果是GAMEOVER,为game-over.png
        //否则，为pause.png
      img.src=this.state==this.GAMEOVER?
              "img/game-over.png":"img/pause.png";
      //将img追加到pg中
      this.pg.appendChild(img);
    }
  },
  paintScore:function(){
    //找到class为playground下的第一个p元素下的span,设置其内容为score
    //找到class为playground下IDE第2个p元素下的span，设置其内容为ln
    var spans=document.querySelectorAll(
      ".playground>p>span"
    );
    spans[0].innerHTML=this.score;
    spans[1].innerHTML=this.ln;
  },
  deleteRows:function(){
    //自底向上遍历wall中每一行
    for(var r=this.RN-1,ln=0;
        r>=0&&this.wall[r].join("")!=""&&ln<4;
        r--){
      if(this.isFullRow(r)){//如果当前行是满格行
        this.deleteRow(r);//就删除当前行
        ln++;
        r++;//r留在原地
      }
    }
    return ln;
  },
  isFullRow:function(r){
    //定义正则reg: 开头的,或,,或末尾的,
    //如果将wall中r行拍照后，包含符合reg要求的内容
      //就返回false
    //否则
      //返回true
    return String(this.wall[r])
              .search(/^,|,,|,$/)==-1;
  },
  deleteRow:function(r){
    //从r开始，自下向上遍历每一行
    for(;r>0;r--){
      //用wall中r-1行代替r行
      this.wall[r]=this.wall[r-1];
      //将r-1行置为CN个元素的空数组
      this.wall[r-1]=new Array(this.CN);
      //遍历r行中每个cell
      for(var c=0;c<this.CN;c++){
        //如果当前cell有格,就将当前cell的r+1
        this.wall[r][c]!==undefined
          &&this.wall[r][c].r++;
      }
      if(this.wall[r-2].join("")==""){
        break;
      }
    }
  },
  //将主角图形的cell落到墙中
  landIntoWall:function(){
    //遍历主角图形中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      var cell=this.shape.cells[i];
      //将cell保存到wall中相同位置
      this.wall[cell.r][cell.c]=cell;
    }
  },
  canDown:function(){//判断能否下落
    //遍历主角图形中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      //将当前cell临时保存在cell中
      var cell=this.shape.cells[i];
      //如果cell的r是RN-1或在wall中和cell相同列的下方的元素不为undefined
      if(cell.r==this.RN-1
         ||this.wall[cell.r+1][cell.c]!==undefined){
        return false;//返回false
      }
    }//(遍历结束)
    return true;//返回true
  },
  paint:function(){//重绘一切
    this.pg.innerHTML=//删除pg内容中所有img元素
      this.pg.innerHTML.replace(/<img[^>]*>/g,"")
    this.paintShape();//重绘主角图形
    this.paintWall();//重绘墙
    this.paintNext();//重绘备胎
    this.paintScore();//重绘分数
    this.paintState();//重绘游戏状态
  },
  paintCell:function(cell,frag){
    var img=new Image();//新建img
    //设置img的left为cell的c*CSIZE+OFFSET
    img.style.left=
      cell.c*this.CSIZE+this.OFFSET+"px";
    //设置img的top为cell的r*CSIZE+OFFSET
    img.style.top=
      cell.r*this.CSIZE+this.OFFSET+"px";
    //设置img的src为cell的src
    img.src=cell.src;
      frag.appendChild(img);//将img追加到frag下
  },
  paintWall:function(){//绘制墙
    //创建frag
    var frag=document.createDocumentFragment();
    //自底向上遍历wall中每一行,条件:r>=0且wall中r行无缝拼接后不等于""
    for(var r=this.RN-1;
        r>=0&&this.wall[r].join("")!="";
        r--){
      //遍历wall中当前行的每个cell
      for(var c=0;c<this.CN;c++){
        //如果wall中r行c列不是undefined
          //调用paintCell，传入wall中当前格和frag
        this.wall[r][c]!==undefined&&
          this.paintCell(this.wall[r][c],frag);
      }
    }//(遍历结束)
    this.pg.appendChild(frag);//将frag追加到pg中
  },
  paintShape:function(){//绘制主角图形
    //创建文档片段frag
    var frag=document.createDocumentFragment();
    //遍历主角图形的cells数组中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      //将当前格子临时保存在变量cell中
      this.paintCell(this.shape.cells[i],frag);  
    }//(遍历结束)
    this.pg.appendChild(frag);//将frag追加到pg下
  }
}
tetris.start();