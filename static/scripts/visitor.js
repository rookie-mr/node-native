function fade (){
  setTimeout(function () {
    $('#result').css('display', 'none');
    $('#result').html('');
  }, 1500);
}
$('#sendbtn').click(function (e) {
  e.preventDefault();
  if (vname.value == ''){
    $('#result').css('display', 'block');
    $('#result').html('姓名不能为空！');
    fade();
  }else if(vmail.value ==''){
    $('#result').css('display', 'block');
    $('#result').html('请输入合法邮箱地址！');
    fade();
  }else if(subject.value ==''){
    $('#result').css('display', 'block');
    $('#result').html('邮件主题不能为空！');
    fade();
  }else if(content.value ==''){
    $('#result').css('display', 'block');
    $('#result').html('内容区域不能为空！');
    fade();
  }else{
    $.ajax({
      type: 'POST',
      url: '/api/index/message',
      data: {vname: vname.value, vmail: vmail.value, subject: subject.value, content: content.value},
      success: function (txt) { 
        if (txt == 'succ') {
          $('#result').css('display', 'block');
          $('#result').html('邮件发送成功！');
          vname.value='';
          vmail.value='';
          subject.value='';
          content.value='';
        } else if (txt == 'err') {
          $('#result').css('display', 'block');
          $('#result').html('邮件发送失败，请验证格式后重新发送！');
        } else {
          $('#result').css('display', 'block');
          $('#result').html('抱歉！系统异常');
        }
        fade();
      }
    })
  }
});