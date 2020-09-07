//滚动页面，返回顶部效果
$(window).scroll(function () {
	var top = $(document).scrollTop();
	$('#shade').css('top', document.body.scrollTop);
	if (top != 0) {
		$("#totop").fadeIn(500);
		$('div.top_nav p').removeClass('animated bounce');
	} else {
		$("#totop").fadeOut(500);
		$('div.top_nav p').addClass('animated bounce');
	}
});

//背景音乐控制效果
$("#bgm_btn").click(function () {
	if (bgm.paused) {
		bgm.play();
		$('#bgm_btn').css({
			"background": "url(images/music.png) no-repeat center center",
			"background-size": "60%",
			'animation-iteration-count': 'infinite',
		});
	} else {
		bgm.pause();
		$('#bgm_btn').css({
			"background": "url(images/music_pause.png) no-repeat center center",
			"background-size": "60%",
			'animation-iteration-count': '1',
		});
	}
})

//平滑滚动效果
$(".intro").click(function (e) {
	e.preventDefault();
	$('html,body').animate({ scrollTop: $("#self_intro").offset().top }, 500);
})
$(".opus").click(function (e) {
	e.preventDefault();
	$('html,body').animate({ scrollTop: $("#opus").offset().top }, 800);
})
$(".services").click(function (e) {
	e.preventDefault();
	$('html,body').animate({ scrollTop: $("#services").offset().top }, 1000);
})
$(".contact").click(function (e) {
	e.preventDefault();
	$('html,body').animate({ scrollTop: $("#contact").offset().top }, 1200);
})

//随机色函数
function changeColor(min, max) {
	var r = Math.floor(Math.random() * (max - min) + min);
	var g = Math.floor(Math.random() * (max - min) + min);
	var b = Math.floor(Math.random() * (max - min) + min);
	var rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
	return rgb;
}

$('#totop').click(function () {
	$('html,body').animate({ scrollTop: 0 }, 1000, 'swing');
	$('div.top_nav p').css('color', changeColor(0, 255));
});

//姓名文本效果
$(function () {
	$('div.top_nav p').addClass('animated bounce');
});

//导航条效果
$('.top_nav li a').hover(function () {
	$(this).addClass('animated swing');
}, function () { $(this).removeClass('animated swing') });

//我的技能canvas绘图
c1.width = 380; c1.height = 300;
var ctx = c1.getContext('2d');
ctx.beginPath();
ctx.strokeStyle = '#fff';
ctx.lineWidth = 10;
ctx.arc(190, 100, 70, 0, 2 * Math.PI);
ctx.stroke();

ctx.baseline = 'alphabetic';
ctx.font = '50px sans-serif';
ctx.fillStyle = '#fff';
ctx.fillText('5%', 190 - ctx.measureText('5%').width / 2, 110);
ctx.font = '20px sans-serif';
ctx.fillText('web design', 190 - ctx.measureText('web design').width / 2, 250);

ctx.beginPath();
ctx.strokeStyle = '#76B852';
ctx.arc(190, 100, 70, -Math.PI / 2, Math.PI / 2);
ctx.stroke();

c2.width = 380; c2.height = 300;
var ctx = c2.getContext('2d');
ctx.beginPath();
ctx.strokeStyle = '#fff';
ctx.lineWidth = 10;
ctx.arc(190, 100, 70, 0, 2 * Math.PI);
ctx.stroke();

ctx.baseline = 'alphabetic';
ctx.font = '50px sans-serif';
ctx.fillStyle = '#fff';
ctx.fillText('8%', 190 - ctx.measureText('8%').width / 2, 110);
ctx.font = '20px sans-serif';
ctx.fillText('HTML/CSS/JS/PHP', 190 - ctx.measureText('HTML/CSS/JS/PHP').width / 2, 250);

ctx.beginPath();
ctx.strokeStyle = '#76B852';
ctx.arc(190, 100, 70, -Math.PI / 2, 11 * Math.PI / 10);
ctx.stroke();

c3.width = 380; c3.height = 300;
var ctx = c3.getContext('2d');
ctx.beginPath();
ctx.strokeStyle = '#fff';
ctx.lineWidth = 10;
ctx.arc(190, 100, 70, 0, 2 * Math.PI);
ctx.stroke();

ctx.baseline = 'alphabetic';
ctx.font = '50px sans-serif';
ctx.fillStyle = '#fff';
ctx.fillText('7%', 190 - ctx.measureText('7%').width / 2, 110);
ctx.font = '20px sans-serif';
ctx.fillText('Chart(canvas/svg)', 190 - ctx.measureText('chart(canvas/svg)').width / 2, 250);

ctx.beginPath();
ctx.strokeStyle = '#76B852';
ctx.arc(190, 100, 70, -Math.PI / 2, 9 * Math.PI / 10);
ctx.stroke();

//作品展示区域点击效果
$('#opus ul li a').click(function (e) {
	if (($(this).attr('href') == '#')) {
		e.preventDefault();
	}
	$('#shade').fadeIn('slow');
	var src = $(this).children('img').attr('src');
	$('#detail>img').attr('src', src);
	$('#bt-close').click(function () {
		$('#shade').slideUp('slow');
	})
})
