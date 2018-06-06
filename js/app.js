(function($, owner) {
	owner.RECORD_LIMIT_TIME = 30;
	owner.RECORD_TEMP_NAME = '_downloads/audio/temp.amr'; // 录音临时文件
	owner.PIC_TEMP_NAME = '_downloads/camera/temp.jpg'; // 录音临时文件
	owner.RES_HOST = 'http://172.23.15.15:9876/marker_files/';

	var server = 'http://172.23.15.15:9876';
	var identity = "9I0IpqmCA39FfhblcZ42RA=="; //9I0IpqmCA39FfhblcZ42RA==   eGq1tKHWRySKCNT7X8Yy2A==

	const config = {
		upload_timeout: 5000, // 毫秒
	}

	owner.urls = {
		//上传音频文件
		upload_audio: server + "/api/upload_audio",
		upload_tatoo: server + "/api/upload_tatoo",
		// 调整音频
		adjust_audio: server + "/api/adjust_audio",
		// 生成模板
		create_template: server + "/api/create_template",
		// 我的声波
		mysoundwaves: server + "/api/mysoundwaves",
		// 我的订单  （纹身师）
		myorders: server + "/api/myorders",
		// 我的预约   （用户）
		mypreorders: server + "/api/mypreorders",
		// 纹身师 列表
		artist_list: server + "/api/artist_list",
		// 纹身师 详情
		get_artist: server + "/api/get_artist",
		// 预约
		preorder: server +  "/api/preorder",
	}

	//上传任务(音波) 
	owner.uploadAudio = function(url,uploadInfo, callback) {
		console.log("上传url：" + url)
		var wt = plus.nativeUI.showWaiting();
		var task = plus.uploader.createUpload(url, {
				method: 'POST',
				timeout: 10000
			},
			function(t, status) {
				if(status == 200) {
					console.log("上传返回数据  " + t.responseText);
					mui.toast("上传成功");
					wt.close();

					var response = JSON.parse(t.responseText);
					if(response.code == 0) {
						var result = response.result;
						owner.setUser(result.user_obj);
						owner.setMarker(result.marker_obj);
						if(result.res_host) {
							owner.RES_HOST = result.res_host;
						}
						callback(result)
					} else {
						mui.toast(response.msg)
						wt.close();
					}
				} else {
					mui.toast('上传失败，请重试：' + status)
					wt.close();
				}
			}
		);

		task.addFile(uploadInfo.file_name, {
			key: "myfile"
		});
		task.addData("audio_name", uploadInfo.audio_name);
		task.addData("identity", identity);
		task.start();
	};

	//上传任务(图片) 
	owner.uploadPic = function(url,uploadInfo, callback) {
		var wt = plus.nativeUI.showWaiting("上传中");
		var task = plus.uploader.createUpload(url, {
				method: 'POST',
				timeout: 10000
			},
			function(t, status) {
				if(status == 200) {
					console.log("上传返回数据  " + t.responseText);
					mui.toast("上传成功");
					wt.close();

					var response = JSON.parse(t.responseText);
					if(response.code == 0) {
						var result = response.result;
						owner.setUser(result.user_obj);
						owner.setOrder(result.orders_obj);
						if(result.res_host) {
							owner.RES_HOST = result.res_host;
						}
						callback(result)
					} else {
						mui.toast(response.msg)
						wt.close();
					}
				} else {
					mui.toast('上传失败，请重试：' + status)
					wt.close();
				}
			}
		);
		// 监听上传任务状态
		function onStateChanged(upload, status) {
			console.log("上传状态:" + upload.state + "  " + status)
		}
		task.addEventListener("statechanged", onStateChanged, false);
		task.addFile(uploadInfo.file_name, {
			key: "myfile"
		});
		task.addData("orders_id", uploadInfo.orders_id + "");
		task.addData("identity", identity);
		task.start();
	};

	//下载任务，下载图片，声音，二进制等文件。
	owner.downloadTask = function(url, filename, callback) {
		var options = {
			filename: filename
		};
		console.log('下载的url: ' + url);
		console.log("下载的文件名：" + filename)
		var dtask = plus.downloader.createDownload(url, options, function(d, status) {
			// 下载完成
			if(status == 200) {
				callback(d);
			} else {
				mui.toast("下载文件失败：" + url)
			}
		});
		dtask.start();
	}
	// 调整声音文件
	owner.ajustAuidoData = function(url,data, callback) {
		data.identity = identity;
		mui.getJSON(url, data, function(data) {
			if(data.code == 0) {
				mui.toast("操作成功");
				callback(data);
			} else {
				mui.toast(data.msg);
			}
		});
	}
	// 生成模板
	owner.createTempate = function(url,data, callback) {
		data.identity = identity;
		mui.getJSON(urls, data, function(data) {
			if(data.code == 0) {
				mui.toast("操作成功");
				callback(data.result);
			} else {
				mui.toast(data.msg);
			}
		});
	}
	// 通用请求
	owner.commonRequest = function(url, data, callback) {
		data.identity = identity;
		$.ajax({
			url: url,
			dataType: 'json', //服务器返回json格式数据  
			data: data,
			type: 'get', //HTTP请求类型 
//			headers:{'Content-Type':'application/json'},
			timeout: 10000, //超时时间设置为10秒；  
			beforeSend: function() {
				plus.nativeUI.showWaiting();
			},
			complete: function() {
				plus.nativeUI.closeWaiting();
			},
			success: function(data) {
				console.log(JSON.stringify(data))
				if(data.code == 0) {
					mui.toast("操作成功");
					callback(data.result);
				} else {
					mui.toast(data.msg);
				}
			},
			error: function(xhr,type,errorThrown) {
				mui.toast("请求数据失败:"+type);
			}
		})
	}



	// 获取调整的音频数据
	// cropData  裁剪数据
	// audio_total_time 声音总时间

	// 打开新页面
	owner.openNewPage = function(pageName, data) {
		$.openWindow({
			url: pageName + '.html',
			id: pageName,
			preload: true,
			show: {
				aniShow: 'slide-in-right'
			},
			styles: {
				popGesture: 'close'
			},
			waiting: {
				autoShow: true
			},
			extras: {
				pageData: data
			}
		});
	}

	owner.setUser = function(user) {
		user = user || {};
		localStorage.setItem('_user_', JSON.stringify(user));
	}
	owner.getUser = function() {
		var userText = localStorage.getItem('_user_') || "{}";
		return JSON.parse(userText);
	}

	// 设置marker
	owner.setMarker = function(marker) {
		marker = marker || {};
		localStorage.setItem('_marker_', JSON.stringify(marker));
	}
	// 获取marker
	owner.getMarker = function() {
		var marker_obj = localStorage.getItem('_marker_') || "{}";
		return JSON.parse(marker_obj);
	}
	// 设置订单
	owner.setOrder = function(order) {
		order = order || {};
		localStorage.setItem('_order_', JSON.stringify(order));
	}
	// 获取订单
	owner.getOrder = function() {
		var order_obj = localStorage.getItem('_order_') || "{}";
		return JSON.parse(order_obj);
	}
	
	// 设置艺术家
	owner.setArtist = function(artist_obj) {
		artist_obj = artist_obj || {};
		localStorage.setItem('_artist_', JSON.stringify(artist_obj));
	}
	// 获取艺术家
	owner.getArtist = function() {
		var artist_obj = localStorage.getItem('_artist_') || "{}";
		return JSON.parse(artist_obj);
	}

	//发布新任务
	owner.pushNewTask = function(vueData, callback) {
		$.ajax({
			url: owner.server + '/film/pushNewTask',
			dataType: 'json',
			data: vueData,
			beforeSend: function(request) {
				request.setRequestHeader('Authorization', token);
			},
			type: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			complete: function(XMLHttpRequest, textStatus) {
				var sessionstatus = XMLHttpRequest.getResponseHeader("sessionstatus"); //通过XMLHttpRequest取得响应头，sessionstatus， 
				toLogin(sessionstatus);
			},
			success: function(data) {
				return callback(data);
			},
			error: function(message) {
				errFunction(message)
			}
		})
	}

	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if(loginInfo.account.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if(loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		var authed = users.some(function(user) {
			return loginInfo.account == user.account && loginInfo.password == user.password;
		});
		if(authed) {
			return owner.createState(loginInfo.account, callback);
		} else {
			return callback('用户名或密码错误');
		}
	};

	/**
	 * 获取当前目录下的文件和目录 
	 * @param {Object} pathName
	 */
	owner.getCurrentPathFiles = function(pathName = "_downloads/audio/") {
		plus.io.resolveLocalFileSystemURL(pathName, function(entry) {
			//			entry.remove(function(entry) {
			//				plus.console.log("Remove succeeded");
			//			}, function(e) {
			//				alert(e.message);
			//			});
			console.log("-----当前文件夹:", pathName)
			var directoryReader = entry.createReader();
			directoryReader.readEntries(function(entries) {
				var i;
				for(i = 0; i < entries.length; i++) {
					if(entries.isDirectory) {
						console.log("当前目录名：" + entries[i].name);
					} else {
						var entry = entries[i];
						updateInfo(entry);
					}
				}
			}, function(e) {
				alert("Read entries failed: " + e.message);
			});
		}, function(e) {
			outLine("Get metadata " + entry.name + " failed: " + e.message);
		}, false);

		function updateInfo(entry) {
			entry.getMetadata(function(metadata) {
				console.log("当前文件名：" + entry.name + "  文件大小：" + metadata.size + "  修改时间" + metadata.modificationTime);
			}, function() {
				alert(e.message);
			});
		}
	}

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if(regInfo.account.length < 5) {
			return callback('用户名最短需要 5 个字符');
		}
		if(regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if(!checkEmail(regInfo.email)) {
			return callback('邮箱地址不合法');
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		users.push(regInfo);
		localStorage.setItem('$users', JSON.stringify(users));
		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return(email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if(!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}
	/**
	 * 获取本地是否安装客户端
	 **/
	owner.isInstalled = function(id) {
		if(id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch(e) {}
		} else {
			switch(id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));