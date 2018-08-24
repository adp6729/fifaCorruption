$(document).ready(function(){
//sidebar attribute panel
//doesn't show on page load
$(".sidebar_attribute").css('display', 'none');

  $(".toggle_attribute").click(function(){
  if ($(".sidebar_attribute").css('display') == 'none') {
    $(".sidebar_attribute").css('display', 'block');
    $(".sidebar_attribute").removeClass("hide_attribute");
    $(".toggle_attribute").removeClass("opacity_one");
    $(".sidebar_about").hide();
    $(".toggle_about").addClass("opacity_one");
  } else {
      $(".sidebar_attribute").hide();
      $(".toggle_attribute").addClass("opacity_one");
    }
  });

  $(".fa-times").click(function(){
    $(".sidebar_attribute").hide();
    $(".toggle_attribute").addClass("opacity_one");
  });
    
  //hide attribute panel when click on hamburger icon
  $("#navbarButton").click(function(){
    $(".sidebar_attribute").hide();
    $(".toggle_attribute").addClass("opacity_one");
  });

  //sidebar about panel
  $(".sidebar_about").css('display', 'none');

    $(".toggle_about").click(function(){
    if ($(".sidebar_about").css('display') == 'none') {
      $(".sidebar_about").css('display', 'block');
      $(".sidebar_about").removeClass("hide_about");
      $(".toggle_about").removeClass("opacity_one");
      $(".sidebar_attribute").hide();
      $(".toggle_attribute").addClass("opacity_one");
    } else {
        $(".sidebar_about").hide();
        $(".toggle_about").addClass("opacity_one");
      }
    });

    $(".fa-times").click(function(){
      $(".sidebar_about").hide();
      $(".toggle_about").addClass("opacity_one");
    });

    //hide about panel when click on hamburger icon
    $("#navbarButton").click(function(){
        $(".sidebar_about").hide();
        $(".toggle_about").addClass("opacity_one");
    });
    
});
