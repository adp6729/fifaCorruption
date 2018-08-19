$(document).ready(function(){
//doesn't show on page load
$(".sidebar_about").css('display', 'none');

  $(".toggle_about").click(function(){
    if ($(".sidebar_about").css('display') == 'none') {
      $(".sidebar_about").css('display', 'block');
      $(".sidebar_about").removeClass("hide_about");
      $(".toggle_about").removeClass("opacity_one");
    } else {
      $(".sidebar_about").css('display', 'none');
    }

  });
  $(".fa-times").click(function(){
    $(".sidebar_about").hide();
    $(".toggle_about").addClass("opacity_one");
  });
});
