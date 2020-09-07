$('#opus ul li').hover(
  function (e) {
    var target = e.target;
    var w = this.clientWidth;
    var h = this.clientHeight;
    var y = e.offsetX;
    var x = e.offsetY;
    //y=k*x
    //y=-k*x+w
    var k=w/h;
    var $slider=$(this).children('a').children('div');
    if (-(k*x)+w<y&&k*x>y){
      //console.log('从下方进入');
      $slider.css('display','block');
      $slider.css({'top':'100%','left':0});
      $slider.animate({
        top:0,
        left:0
      },300);
    }else if (-(k*x)+w>y&&k*x<y){
      //console.log('从上方进入');
      $slider.css('display','block');
      $slider.css({'top':'-100%','left':0});
      $slider.animate({
        top:0,
        left:0
      },300);
    }else if (-(k*x)+w<y&&k*x<y){
      //console.log('从右方进入');
      $slider.css('display','block');
      $slider.css({'top':'0','left':'100%'});
      $slider.animate({
        top:0,
        left:0
      },300);
    }else if (-(k*x)+w>y&&k*x>y){
      //console.log('从左方进入');
      $slider.css('display','block');
      $slider.css({'top':'0','left':'-100%'});
      $slider.animate({
        top:0,
        left:0
      },300);
    }
  }, function (e) {
      var target = e.target;
      var w = this.clientWidth;
      var h = this.clientHeight;
      var y = e.offsetX;
      var x = e.offsetY;
      //y=k*x
      //y=-k*x+w
      var k=w/h;
      var $slider=$(this).children('a').children('div');
      if (-(k*x)+w<y&&k*x>y){
        //console.log('从下方离开');
        $slider.animate({
          top:'100%'
        },300);
        $slider.css('display','none');
      }else if (-(k*x)+w>y&&k*x<y){
        //console.log('从上方离开');
        $slider.animate({
          top:'-100%'
        },300);
        $slider.css('display','none');
      }else if (-(k*x)+w<y&&k*x<y){
        //console.log('从右方离开');
        $slider.animate({
          left:'100%'
        },300);
        $slider.css('display','none');
      }else if (-(k*x)+w>y&&k*x>y){
        //console.log('从左方离开');
        $slider.animate({
          left:'-100%'
        },300);
        $slider.css('display','none');
      }
  })
