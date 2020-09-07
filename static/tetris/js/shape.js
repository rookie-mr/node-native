function Cell(r,c,src){
  this.r=r; this.c=c; this.src=src;
}
function State(){
  for(var i=0;i<4;i++){
    this["r"+i]=arguments[i*2];
    this["c"+i]=arguments[i*2+1];
  }
}
function Shape(cells,src,states,orgi){
  this.cells=cells;
  for(var i=0;i<this.cells.length;i++){
    this.cells[i].src=src;
  }
  this.orgCell=this.cells[orgi];//获得参照格对象
  this.states=states;
  this.statei=0;//所有图形的初始状态都为0
}
Shape.prototype={
  IMGS:{
    T:"img/T.png", O:"img/O.png", I:"img/I.png",
  },
  moveDown:function(){//this->当前图形
    //遍历当前图形的每个cell
    for(var i=0;i<this.cells.length;i++){
      this.cells[i].r++;//将当前cell的r+1
    }
  },
  moveLeft:function(){
    //遍历当前图形的每个cell
    for(var i=0;i<this.cells.length;i++){
      this.cells[i].c--;//将当前cell的c-1
    }
  },
  moveRight:function(){
    //遍历当前图形的每个cell
    for(var i=0;i<this.cells.length;i++){
      this.cells[i].c++;//将当前cell的c+1
    }
  },
  rotateR:function(){
    this.statei++;//将statei+1
    //如果statei等于states的个数，就改回0
    this.statei==this.states.length
      &&(this.statei=0);
    this.rotate();//调用旋转方法
  },
  rotate:function(){
    //获得states中statei位置的状态，保存在state
    var state=this.states[this.statei];
    //遍历当前图形的cells中每个cell
    for(var i=0;i<this.cells.length;i++){
      //当前cell的r=orgCell的r+state["r"+i]
      this.cells[i].r=this.orgCell.r+state["r"+i];
      //当前cell的c=orgCell的c+state["c"+i]
      this.cells[i].c=this.orgCell.c+state["c"+i];
    }
  },
  rotateL:function(){
    this.statei--;//将statei-1
    //如果statei<0，就改回states的个数-1
    this.statei<0
      &&(this.statei=this.states.length-1);
    this.rotate();//调用旋转方法
  }
}
function T(){
  Shape.call(this,
    [new Cell(0,3),new Cell(0,4),
     new Cell(0,5),new Cell(1,4)   ],//p1
    this.IMGS.T,//p2
    [new State(0,-1,  0,0,     0,+1,  +1,0),
     new State(-1,0,  0,0,    +1,0,    0,-1),
     new State(0,+1,  0,0,     0,-1,  -1,0),
     new State(+1,0,  0,0,    -1,0,    0,+1) ],//p3
    1//p4
  );
}
Object.setPrototypeOf(T.prototype, Shape.prototype);
function I(){
  Shape.call(this,
    [new Cell(0,3),new Cell(0,4),
     new Cell(0,5),new Cell(0,6)],//p1
    this.IMGS.I,//p2
    [new State(0,-1,  0,0,     0,+1,  0,2),
     new State(-1,0,  0,0,    +1,0,   2,0) ],//p3
    1//p4
  );
}
Object.setPrototypeOf(I.prototype, Shape.prototype);
function O(){
  Shape.call(this,
    [new Cell(0,4),new Cell(0,5),
     new Cell(1,4),new Cell(1,5)],//p1
    this.IMGS.O,//p2
    [new State(0,-1,  0,0,     +1,-1,  +1,0 )],//p3
    1//p4
  );
}
Object.setPrototypeOf(
  O.prototype, Shape.prototype
);

