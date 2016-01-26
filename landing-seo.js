(function($) {
	$.landingSeo = function(options) {
		
		var landingSeo = (function() {
			
			/*** Переменные ***/
			
			// Выборки
			var $sel = {};

			// Состояния
			var states = {
				isDefault: false	
			};
			
			// Параметры
			var settings = {};
			
			// SEO-параметры по умолчанию
			var seoDefaults = {
				title: '',
				keywords: '',
				description: '',
				url: '/'
			};
			
			/*** //Переменные ***/
			
			
			
			/*** Вспомогательные функции ***/
			
			// Получение дефолтных SEO-параметров
			var setSeoDefaults = function() {
				seoDefaults.title = document.title;
				seoDefaults.keywords = $("meta[name=keywords]", getObject("head")).attr("content");
				seoDefaults.description = $("meta[name=description]", getObject("head")).attr("content");
			};

			// Получение положений блоков
			var getBlocksPosition = function() {
				var wh = getObject("window").height();
				getObject("[data-seotitle]").each(function() {
					var $block = $(this),
						blockOffset = $block.offset();
					$block
						.data("top", parseInt(blockOffset.top))
						.data("bottom", parseInt(blockOffset.top + $block.outerHeight()));
				});	
			};

			// Определение текущего активного блока
			var checkBlocks = function(sc, wh) {
				var find = false;

				getObject("[data-seotitle]").each(function() {
					var $block = $(this);
					if(sc >= ($block.data("top") - 80 - settings.offsetTop) && sc <= ($block.data("bottom") + 80 - settings.offsetTop)) {
						if(!$block.data("current")) {
							getObject("[data-seotitle]").data("current", false);
							$block.data("current", true);
							setBlock({
								title: $block.data("seotitle"),
								keywords: $block.data("seokeywords"),
								description: $block.data("seodescription"),
								url: $block.data("seourl")
							});
						}
						find = true;
						states.isDefault = false;
						return false;
					}
				});
				if(!find && !states.isDefault) {
					setBlock(seoDefaults);
					states.isDefault = true;
				}
			};
			
			// Применение SEO-параметров
			var setBlock = function(params) { console.log(params);
				if(params.title) {
					document.title = params.title;
				}
				if(params.description) {
					$("meta[name=description]").remove();
					$("head").append('<meta name="description" content="' + params.description + '">');
				}
				if(params.keywords) {
					$("meta[name=keywords]").remove();
					$("head").append('<meta name="keywords" content="' + params.keywords + '">');
				}
				if(params.url && window.history.pushState !== undefined) {
					window.history.pushState({}, params.title, params.url);
				}
				// Отправка хита в Яндекс.Метрику
				if(settings.yaCounter) {
					if(window["yaCounter" + settings.yaCounter] !== undefined) {
						window["yaCounter" + settings.yaCounter].hit(params.url, {
							title: params.title
						});
					}
				}
				
				// Отправка отчета в Google Analytics
				if(window.ga !== undefined) {
					ga("send", {
						hitType: "pageview",
						page: params.url,
						title: params.title
					});
				}
				
				// Отправка хита в Google Analytics
				if(settings.addGoogleAnalytics && window.ga !== undefined) {
					ga("send", "pageview", window.location.hash);
				}
				
				settings.onBlockChange();
			};
			
			// Получение DOM объекта
			function getObject(selector, parent) {
				if(!$sel[selector] || $sel[selector].length == 0) {
					if(!parent) {
						parent = false;
					}
					if(selector == "window") {
						$sel[selector] = $(window);
					} else {
						$sel[selector] = $(selector, $sel[parent]);
					}
				}
				
				return $sel[selector];
			}
			
			/*** // ***/

			return {
				
				getObject: getObject,
				
				getBlocksPosition: getBlocksPosition,
				
				checkBlocks: checkBlocks,
				
				// Инициализация плагина
				init: function(options) {
					
					settings = $.extend({
						offsetTop: 0, // Отступ сверху
						
						yaCounter: null, // Код счетчика Яндекс.Метрики
						addGoogleAnalytics: false, // Код GA
						
						onBlockChange: function() {} // После смены блока
					}, options);
					
					// Установка SEO параметров
					setSeoDefaults();
					
					// Получение позиций блоков
					getBlocksPosition();
					
					// Расположение текущего блока
					checkBlocks(parseInt(getObject("window").scrollTop()), parseInt(getObject("window").height()));
				},
				
				goToBlock: function(url) {
					getObject("[data-seotitle]").each(function() {
						var $block = $(this);
						
						if($block.data("seourl") && $block.data("seourl") == url) {
							getObject("window").scrollTop($block.data("top") - settings.offsetTop);
							return false;
						}
					});
				}
				
			}
			
		})();
		
		landingSeo.init(options);
		
		// Скроллирование к нужному блоку (если содержится в аресной строке)
		landingSeo.goToBlock(window.location.pathname);

		// Получение размеров в начале и при смене размера браузера
		landingSeo.getObject("window").on("resize", function() {
			landingSeo.getBlocksPosition();
		});

		// Проверка блоков при скроллирование и в начале
		landingSeo.getObject("window").on("scroll", function() {
			var sc = parseInt(landingSeo.getObject("window").scrollTop()),
				wh = parseInt(landingSeo.getObject("window").height());

			landingSeo.checkBlocks(sc, wh);
		});
		 

	};
	
})(jQuery);