
$(document).ready(function() {

	//체크박스, 라디오버튼 스킨
	comm_radioCheckboxSkin(".checkbox");
	comm_radioCheckboxSkin(".radio");

	//팝업 - 매장 DP 설정 미리보기
	$('.btn_preview').on('click', function(e) {
		e.preventDefault();
		comm_Layerpop('.ly_preview','.layerPop_wrap'); // (2022.07.11) 수정
	});//

	//팝업 - 관리자 관리
	$('.lybtn_admin_setting').on('click', function(e) {
		e.preventDefault();
		comm_Layerpop('.ly_admin_setting','.layerPop_wrap');
	});

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

//(start)로그인 인풋 엑스버튼
function input_textDel(selector) {
	var $input = $(selector).find("input"),
		$inputDel = $(selector).find(".input_del");

	$input.on("propertychange change keyup paste input", function(){
		var data = $(this).val();

		if (data != "undefined" && data != null && data != "") {
			// [데이터가 널이 아닌 경우]
			$(this).closest(".input_sty").addClass("on");
		}
		else {
			// [데이터가 널인 경우]
			$(this).closest(".input_sty").removeClass("on");
		}
	});

	$inputDel.on('click', function(e) {
		e.preventDefault();

		$(this).closest(".input_sty").find("input").val("");
		$(this).closest(".input_sty").removeClass("on");

	});
}//(end)로그인 인풋 엑스버튼

//(start)매장 유형 조회 토글 버튼
function shop_type_btn(selector) {
	var $btns = $(selector).find(".shop_type_txt");

	$btns.on('click', function(e) {
		e.preventDefault();

		$(this).closest("li").addClass("on").siblings().removeClass("on");
	});
}//(end)로그인 인풋 엑스버튼

//(start)팝업 열기
function comm_Layerpop(selector1,selector2) {
	var $container = $(selector1).closest('.layerPop_container'),
		$contents = $container.find(selector1),
		$contentWrap = $container.find(selector2);

	$container.addClass('on');
	$contentWrap.addClass('on');
	$contents.addClass('on').siblings('.layerpop_contents').removeClass('on');
}//(end)팝업 열기

//(start) 팝업 닫기1
$('.layerPop_wrap .btn_popClose').on('click', function(e) {
	e.preventDefault();

	var $container = $(this).closest('.layerPop_container');

	$container.removeClass('on');
	$container.find('.layerPop_wrap').removeClass('on');
	$container.find('.layerpop_contents').removeClass('on').siblings().removeClass('on');
});//(end)팝업 닫기1

//(start) 팝업 닫기2
$('.alert_layerPop_wrap .btn_popClose').on('click', function(e) {
	e.preventDefault();

	var $container = $(this).closest('.layerPop_container');

	$container.removeClass('on');
	$container.find('.alert_layerPop_wrap').removeClass('on');
	$container.find('.layerpop_contents').removeClass('on').siblings().removeClass('on');
});//(end)팝업 닫기2
