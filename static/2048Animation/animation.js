    	//动画效果工具对象
    	var animation = {
    		tasks:[], //动画任务数据
    		timer:null,//动画定时器
			times:10, //定时器次数
			interval:1000/60,//定时器间隔
			add:function(obj, top, left){
				
				//动画已经开始了，不能添加任务了！
				if(this.timer){
					return false;
				}
				if(! obj){
					return false;
				}
				
				//计算移动步伐
				var t = (top - obj.offsetTop)/this.times;
				var l = (left - obj.offsetLeft)/this.times;
				
				//添加动画任务，其中obj是被移动到对象，top， left是移动以后的位置
				var task = {
					topStep:t,
					leftStep:l,
					element:obj,	
					step:function(){
						var t = this.element.offsetTop;
						this.element.style.top = (t+ this.topStep )+"px";
						var l = this.element.offsetLeft;
						this.element.style.left = (l+ this.leftStep )+"px";		
					},
					clear:function(){
						this.element.style.top = "";
						this.element.style.left = "";
					}
				};
				this.tasks[this.tasks.length]=task; 
				return true;
			},
    		start:function(callback){
    			//如果定时器已经启动，就不能再启动定时器了
    			if(this.timer){
    				return false;
    			}

				console.log("STATRING");
				if(this.tasks.length==0){
					if(callback){
						callback();
					}
					return false;	
				}
				
				//如果有callback就交给this.callback
				if(callback){
					this.callback = callback;
				}
				this.timer = setInterval(function(){
					//console.log("timeOut");
					//console.log(animation.times);
					
					for(var i=0; i<animation.tasks.length; i++){
						var task = animation.tasks[i];
						task.step();
					}
					
					animation.times--;
					if(animation.times < 0){
						animation.stop();
					}
				}, this.interval);
				return true;
    		},
    		stop: function(){
    			if(this.timer){
    				window.clearInterval(this.timer);
    				this.timer=null;
    				this.times=10;
    				
    			}
    			
    			//结束以后执行callback()
    			if(this.callback){
    				this.callback();
    			}
				for(var i=0; i<this.tasks.length; i++){
					var task = this.tasks[i];
					task.clear();
				}    			
				this.tasks = [];//清空动画任务
    		},
    		callback:null //动画结束时候执行的方法
    	};
