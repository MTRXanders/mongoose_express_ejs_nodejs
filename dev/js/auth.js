/*eslint-disable no-undef */
$(function(){
var flag = true;
$('.switch-button').on('click',function(e){
    e.preventDefault();
    removeSuccess();
    $('.auth input').val('');
    if(flag){
        flag =false;
        $('.register').show('slow');
        $('.login').hide();
    }else{
        flag = true;
        $('.login').show('slow');
        $('.register').hide();
    }
});
 
//clear styles
$('form.login input, form.register input').on('focus', function(){
   removeError();
})

//register
$('.register-button').on('click',function(e){
    e.preventDefault();
    removeSuccess();
    var data ={
        login:$('#register-login').val(),
        name:$('#register-name').val(),
        password:$('#register-password').val(),
        passwordConfirm: $('#register-password-confirm').val()
    };
    console.log(data)

    $.ajax({
        type:'POST',
        data: JSON.stringify(data),
        contentType:'application/json',
        url:'/api/auth/register'
    }).done(function(data){
        if(!data.ok){
            $('.register h2').after('<p class="error">' + data.error + '</p>');
            if(data.fields){
                data.fields.forEach(function(item){
                    $('input[name='+item+']').addClass('error');
                })
            }
        } else{
            $('.register h2').after('<p class="success">Отлично! </p>');
            $(location).attr('href', '/');
        }
    });
});

//login
$('.login-button').on('click',function(e){
    e.preventDefault();
    var data ={
        login:$('#login-login').val(),
        password:$('#login-password').val(),
    };
    $.ajax({
        type:'POST',
        data: JSON.stringify(data),
        contentType:'application/json',
        url:'/api/auth/login'
    }).done(function(data){
        if(!data.ok){
            $('.login h2').after('<p class="error">' + data.error + '</p>');
            if(data.fields){
                data.fields.forEach(function(item){
                    $('input[name='+item+']').addClass('error');
                })
            }
        } else{
            $('.login h2').after('<p class="success">Отлично! </p>');
            $(location).attr('href', '/');

        }
    });
});

function removeSuccess(){
    if($('.register').has('p.success')){
        $('p.success').remove();
    }
    if($('.register').has('p.error')){
        $('p.error').remove();
        $('input').removeClass('error');
    }
}
function removeError(){
    $('.auth p.error').remove();
    $('.register input, .login input').removeClass('error');
}
});
/*eslint-unable no-undef */
