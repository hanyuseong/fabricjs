
$(document).ready(function() {

	//체크박스, 라디오버튼 스킨
	comm_radioCheckboxSkin(".checkbox");
	comm_radioCheckboxSkin(".radio");

	
	
});

/* ====================== detail ========================== */

//(start)체크박스, 라디오버튼 스킨
function comm_radioCheckboxSkin(selector) {
	var hasItem = $("body").find(selector);

	if( hasItem.length > 0 ) {
		$(selector).each(function() {
			var $container = $(this),
				$chkbox = $container.find("input"),
				$others = $("input[name=" + $chkbox.attr('name') + "]").not($chkbox),
				currentStatus = $chkbox.prop("checked");

			//초기 상태 체크
			isChecked(currentStatus);
	
			$chkbox.on("change", function() {
				var currentStatus = $(this).prop("checked");
				isChecked(currentStatus);
			});

			function isChecked(status) {
				if(status == true) {
					if( $chkbox.attr("type") == "checkbox" ) {
						$container.addClass("on");
					} else {
						$container.addClass("on");
						$others.closest(".radio").removeClass("on");
					}
				} else if(status == false) {
					$container.removeClass("on");
				}
			}
			
		});
	}
}//(end)체크박스, 라디오버튼 스킨

//(start)로그인 사용자별 로그인 박스 보이기
function user_loginBox(selector) {
	var $container = $(selector),
		$radio = $container.find("input:radio[name=login_usertype]");

	//초기 상태 체크
	if( $radio.is(":checked") == true ) {
		var $chk_radio = $container.find("input:radio[name=login_usertype]:checked").attr("id");
		$container.find( ".usertype_cont." + $chk_radio ).addClass("on").siblings().removeClass("on");
	} else {
		$container.find(".usertype_cont").removeClass("on");
	}

	//변화 체크
	$radio.on("change", function() {
		$container.find( ".usertype_cont." + $(this).attr("id") ).addClass("on").siblings().removeClass("on");
	});

}//(end)로그인 사용자별 로그인 박스 보이기

//(start)로그인 인풋 엑스버튼
function input_textDel(selector) {
	var $input = $(selector).find("input"),
		$inputDel = $(selector).find(".input_del");

	$input.on("propertychange change keyup paste input", function(){
		var data = $(this).val();

		if (data != "undefined" && data != null && data != "") {
			// [데이터가 널이 아닌 경우]
			$(this).closest(".input_sty1").addClass("on");
		}
		else {
			// [데이터가 널인 경우]
			$(this).closest(".input_sty1").removeClass("on");
		}
	});

	$inputDel.on('click', function(e) {
		e.preventDefault();

		$(this).closest(".input_sty1").find("input").val("");
		$(this).closest(".input_sty1").removeClass("on");

	});
}//(end)로그인 인풋 엑스버튼


//(start)팝업 열기
function comm_Layerpop(selector) {
	var $container = $(selector).closest('.layerPop_container'),
		$contentWrap = $container.find(selector);

	$container.addClass('on');
	$contentWrap.addClass('on').siblings(".layerpop_contents").removeClass('on');
}//(end)팝업 열기

//(start) 팝업 닫기
$('.layerPop_container .btn_popClose').on('click', function(e) {
	e.preventDefault();

	var $container = $(this).closest('.layerPop_container');

	$container.removeClass('on');
	$container.find('.layerpop_contents').removeClass('on');
});//(end)팝업 닫기


//(start) 레이어팝업 - 도면 크게 보기
$('.sb_planimg_wrap .btn_zoom').on('click', function(e) {
	e.preventDefault();
	$('.lypop_planimg_zoom').addClass('on');
});//(end) 레이어팝업 - 도면 크게 보기

//(start) 레이어팝업 - 도면 크게 보기 닫기
$('.lypop_planimg_zoom .btn_close').on('click', function(e) {
	e.preventDefault();
	$('.lypop_planimg_zoom').removeClass('on');
});//(end) 레이어팝업 - 도면 크게 보기 닫기


//(start)매장 검색 조건창 열기
function fn_shop_search() {
	var $upper_container = $('.up_lypop_container');

	//매장명 선택하기
	$('.dm_wrap, .sb_shopinfo_wrap .lybtn_shop_select').on('click', function() {
		upperUp();
		$upper_container.find('.search_condition.ly_shop_select').addClass('on').siblings('.search_condition').removeClass('on');
	});

	//매장명 검색하기
	$('.adm_wrap, .sb_shopinfo_wrap .lybtn_shop_search').on('click', function() {
		upperUp();
		$upper_container.find('.search_condition.ly_shop_search').addClass('on').siblings('.search_condition').removeClass('on');
	});

	//근무일자 설정하기
	$('.box_wrap2, .sb_shopinfo_wrap .lybtn_work_day').on('click', function() {
		upperUp();
		$upper_container.find('.search_condition.ly_work_day').addClass('on').siblings('.search_condition').removeClass('on');
	});

	//근무시간 설정하기
	$('.box_wrap3, .sb_shopinfo_wrap .lybtn_work_time').on('click', function() {
		upperUp();
		$upper_container.find('.search_condition.ly_work_time').addClass('on').siblings('.search_condition').removeClass('on');
	});

	//근무인원 설정하기
	$('.box_wrap4, .sb_shopinfo_wrap .lybtn_work_man').on('click', function() {
		upperUp();
		$upper_container.find('.search_condition.ly_work_man').addClass('on').siblings('.search_condition').removeClass('on');
	});


	//레이어팝업 닫기
	$('.up_lypop_container .btn_close').on('click', function(e) {
		e.preventDefault();
		upperDown();
		//이하 활성화 상태 모두 초기화
		$('.search_condition .has_on').find('li').removeClass('on');
		$('.search_condition.ly_work_time').find('.min').removeClass('on');
	});

	function upperUp() {
		$upper_container.find('.dimmed').fadeIn( 300 );
		$upper_container.stop().animate({"bottom" : 0 }, 400);
	}

	function upperDown() {
		$upper_container.find('.dimmed').fadeOut( 300 );
		$upper_container.stop().animate({"bottom" : "-100%" }, 400);
	}
}//(end)매장 검색 조건창 열기

//(start)올라오는 팝업의 리스트 활성화 표시
$(document).on('click', '.comm_list_sty1.has_on a', function(e) {
	e.preventDefault();
	$(this).closest('li').addClass('on').siblings().removeClass('on');
});

$(document).on('click', '.comm_list_sty2 .txt.time', function(e) {
	e.preventDefault();
	$(this).closest('li').addClass('on').siblings().removeClass('on');
});

$(document).on('click', '.comm_list_sty2 .txt.min', function(e) {
	e.preventDefault();
	$(this).addClass('on').siblings('.min').removeClass('on');
});
//(end)올라오는 팝업의 리스트 활성화 표시