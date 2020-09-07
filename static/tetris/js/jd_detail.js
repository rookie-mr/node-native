window.$=HTMLElement.prototype.$=
  function(selector){//this->parent
    var r=(this==window?document:this)
                    .querySelectorAll(selector);
    return r.length==0?null:
           r.length==1?r[0]:
                       r;
  }
HTMLElement.prototype.on=function(ename,fun){
  this.addEventListener(ename,fun);
}
NodeList.prototype.each=function(callback){
  //遍历当前nodeList中每个元素，对每个元素调用相同的callback函数
  for(var i=0;i<this.length;i++){
    callback(this[i]);
  }
}
/*顶部菜单*/
//为class为app_jd的元素，绑定鼠标进入事件showSub
//为class为app_jd的元素，绑定鼠标移出事件hideSub
//为class为service的元素，绑定鼠标进入事件showSub
//为class为service的元素，绑定鼠标移出事件hideSub
$(".app_jd,.service").each(function(elem){
  elem.on("mouseover",showSub);
  elem.on("mouseout",hideSub);
})
function showSub(){//定义函数showSub
  //在当前元素下，找到id以_items结尾的元素，设置其显示
  this.$("[id$='_items']").style.display="block";
  //查找当前元素下的b元素旁边的a，设置其class为hover
  this.$("b+a").className="hover";
}
function hideSub(){//定义函数hideSub
  //在当前元素下，找到id以_items结尾的元素，设置其隐藏
  this.$("[id$='_items']").style.display="none";
  //查找当前元素下的b元素旁边的a，清除其class
  this.$("b+a").className="";
}

/*全部商品分类*/
//为id为category的元素绑定鼠标进入事件:
$("#category").on("mouseover",function(){
  //查找id为cate_box的元素，设置其显示
  $("#cate_box").style.display="block";
})
//为id为category的元素绑定鼠标移出事件:
$("#category").on("mouseout",function(){
  //查找id为cate_box的元素，设置其隐藏
  $("#cate_box").style.display="none";
})
//为id为cate_box的元素绑定鼠标进入事件:
$("#cate_box").on("mouseover",function(e){
  //this->cate_box
  var target=e.target;//获得target
  if(target!=this){//如果target!=this
    //只要target的父元素不是当前元素
    while(target.parentNode!=this){
      //将target赋值为其父元素
      target=target.parentNode; 
    }
    //在target下选择class为sub_cate_box的元素，设置其显示
    target.$(".sub_cate_box")
          .style.display="block";
    //找到target下第一个子元素，设置其class为hover
    target.firstElementChild.className="hover";
  }
});
//为id为cate_box的元素绑定鼠标移出事件:
$("#cate_box").on("mouseout",function(e){
  //this->cate_box
  var target=e.target;//获得target
  if(target!=this){//如果target!=this
    //只要target的父元素不是当前元素
    while(target.parentNode!=this){
      //将target赋值为其父元素
      target=target.parentNode;
    }
    //在target下选择class为sub_cate_box的元素，设置其隐藏
    target.$(".sub_cate_box")
          .style.display="none";
    //找到target下第一个子元素，清除其class
    target.firstElementChild.className="";
  }
});

/*标签页*/
//为id为product_detail下的class为main_tabs的元素绑定单击事件:
$("#product_detail>.main_tabs").on("click",
  function(e){
  var target=e.target;//获得target
  if(target!=this){//如果target不是this
    //如果target是a，就换成其父元素
    target.nodeName=="A"&&
              (target=target.parentNode);
    //如果target的class不是current
    if(target.className!="current"){
      //找到id为product_detail下的class为main_tabs下的class为current的元素，清除其class
      $("#product_detail>.main_tabs>.current")
        .className="";
      //设置target的class为current
      target.className="current";

      //找到id为product_detail下的class为show的直接子元素,保存在变量show中
      var show=$("#product_detail>.show");
      //如果show不为null，才清除其class
      show!=null&&(show.className="");
      var i=target.dataset.i;
      //如果target的i属性不是-1
      if(i!=-1){
        //找到id为product_detail下的id以product_开头的元素，取第i个，设置其class为show
        $("#product_detail>[id^='product_']")[i]
          .className="show";
      }
    }
  }
})
      