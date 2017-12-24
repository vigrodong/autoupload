const fs  = require('fs');
const  { spawn } = require('child_process');
const  {resolve} = require('path');

function Watch(config){
	this.dir = config.dir || './';
	this.exceptType = config.exceptType || [];
	this.command = config.command;
	this.dirTree = [];
	this.init();
}

//判断文件或者文件夹式否还存在，返回的是一个promise对象
Watch.prototype.isExists=function(dir){
	var dir = dir || '';
	return new Promise(function(resolve,reject){
		fs.exists(dir,function(bool){
			if(bool){
				resolve(bool)
			}
			else{
				reject(bool)
			}
		})
	})
}

Watch.prototype.watchfile=function(dir){
	var that = this;
	//当前根目录进行监听
	fs.watch(dir,function(eventType,filname){
		that.commandexe(eventType,resolve(dir,filname))
	})
	//递归监听各个子文件夹以及文件夹里面的夹夹夹。。。。
	function _opendir(dir){
		fs.readdir(dir,function(err,files){
			files.forEach(function(file){
				if(file.indexOf('.') ==-1){
					fs.watch(resolve(dir,file),function(eventType,filname){
						that.commandexe(eventType,resolve(dir,file,filname))
					})
					_opendir(resolve(dir,file));
				}
			})
		})	
	}
	_opendir(dir);
}

Watch.prototype.commandexe=function(type,dir){
	var  that = this;
	if(type == 'change' && dir.indexOf('.') != -1){
		console.log(dir);
		if(that.command.length == 0) return false;
		spawn(this.command[0],[...this.command.shift(),dir])
	}
	else if(type == 'rename' && dir.indexOf('.') != -1){
		console.log(dir);
		this.isExists(dir).then(function(value){
			if(that.command.length == 0) return false;
			spawn(that.command[0],[...that.command.shift(),dir])
		},function(value){
			console.log(此文件被删除);
		})
	}
	else if(type == 'rename' && dir.indexOf('.') == -1){
		console.log(dir);
		var  that = this;
		this.isExists(dir).then(function(value){
			that.watchfile(dir);
			if(that.command.length == 0) return false;
			spawn(that.command[0],[...that.command.shift(),dir])
		},function(value){
			console.log(此文件夹被删除);
		})
	}
}

Watch.prototype.init=function(){
//初始化监测文件夹
	this.watchfile(this.dir);
}
















