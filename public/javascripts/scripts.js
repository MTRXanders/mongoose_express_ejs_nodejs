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

/*eslint-disable no-undef */
$(function(){

 //clear styles
$('.post-form input, #post-body').on('focus', function(){
    $('.add-post p.error').remove();
    $('.post-form #post-body, .post-form input').removeClass('error');
 })
 
 //publish
 $('.publish-button, .save-button').on('click', function(e){
    e.preventDefault();
   
     var isDraft = 
     $(this)
     .attr('class')
     .split(' ')[0] === 'save-button';
     
    var data ={
        title:$('#post-title').val(),
        body: $('#post-body').val(),
        isDraft: isDraft,
        postId:$('#post-id').val()
    };
     $.ajax({
         type:'POST',
         data: JSON.stringify(data),
         contentType:'application/json',
         url:'/post/add'
     }).done(function(data){
         console.log(data);
         if(!data.ok){
         $('.post-form h2').after('<p class="error">' + data.error + '</p>');
         if(data.fields){
              data.fields.forEach(function(item){
                  $('#post-'+item).addClass('error');
              })
            }
        } else {
             if(isDraft){
                $(location).attr('href', '/post/edit/'+ data.post.id);
             }else{
                $(location).attr('href','/posts/'+data.post.url);
             }
             // $('.register h2').after('<p class="success">Отлично! </p>');
             // $(location).attr('href', '/');
         }
     });
 });

 //upload
  $('#file').on('change', function(e){
    //  e.preventDefault();
      var formData = new FormData();
      formData.append('postId',$('#post-id').val());
      formData.append('file',$('#file')[0].files[0]);
      console.log(formData)
      
      $.ajax({
          type:'POST',
          url:'/upload/image',
          data: formData,
          processData: false,
          contentType: false,
          success: function(data){
              console.log(data);
              $('#fileinfo').prepend('<div class="img-container"><img src="/uploads'+data.filePath+'" alt=""></div>')
          },
          error: function(e){
              console.log(e);
          }
      })
  })
  //inserting image
  $('.img-container').on('click', function(){
      var imageId = $(this).attr('id');
      var txt = $('#post-body');
      var caretPos= txt[0].selectionStart;
      var textAreaTxt = txt.val();
      var txtToAdd = '![alt text](image'+imageId+')';
      txt.val(textAreaTxt.substring(0, caretPos)+txtToAdd + textAreaTxt.substring(caretPos));
  })

});
/*eslint-unable no-undef */

$(function(){
  var commentForm;
  var parentId;

   function form (isNew, comment){
     $('.reply').show();
     if(commentForm){
         commentForm.remove();
     }
     parentId =null;
     commentForm = $('form.comment').clone(true,true)
     if(isNew){
         commentForm.find('.cancel').hide();
         commentForm.prependTo('.comment-list');
         commentForm.addClass('default');
     }else{
         var parentComment = $(comment).parent();
         parentId =parentComment.attr('id');
         commentForm.addClass('for_reply');
         $(comment).after(commentForm);
     }
     commentForm.css({display:'flex'})
   }
   //load
   form(true);
   //reply
   $('.reply').on('click',function(e){
         form(false,this);
         $(this).hide();
   })  

  // add form
//  $('#new, #reply').on('click', function() {
//     if (commentForm) {
//       commentForm.remove();
//     }
//    parentId = null;
//
//    commentForm = $('.comment').clone(true, true);
//
//    if ($(this).attr('id') === 'new') {
//      commentForm.appendTo('.comment-list');
//    } else {
//      var parentComment = $(this).parent();
//      parentId = parentComment.attr('id');
//      $(this).after(commentForm);
//    }
//
//    commentForm.css({ display: 'flex' });
//  });
//
 
  //cancel
  $('form.comment .cancel').on('click',function(e){
      e.preventDefault();
      commentForm.remove();
      form(true);     
  })
 
  //publish
  $('form.comment .send').on('click',function(e){
     e.preventDefault();
    
    var data ={
        post : $('.comments').attr('id'),
        body:commentForm.find('textarea').val(),
        parent: parentId
    }, el =$(this).closest('form')[0],
    cl=$(el).attr('class').split(' ')[1];
 console.log('.'+cl+' .body')
    $.ajax({
        type:'POST',
        data: JSON.stringify(data),
        contentType:'application/json',
        url:'/comment/add'
    }).done(function(data){
        if(!data.ok){
         $(el).before('<p class="error">' + data.error + '</p>');
         if(data.fields){
             data.fields.forEach(function(item){
                 $('.'+cl+' .'+item).addClass('error');
             })
          }
            //clear styles
           $('.body').on('focus', function(e){
             $(this).closest('form').prev().remove();
             $('.body').removeClass('error');
           });
 
        } else{
           var newComment ='<ul><li style="background-color:#ffffe0;"><div class="head"><a href="/users/'+data.login+'">'+data.login+'</a><span class="date">Только что</span></div><p>'+data.body+'</p></li></ul>';
           $(commentForm).after(newComment);
           form(true);
           
     //  location.reload();
        }
    });
  });
  

   //delete 
   $('button.head-delete').on('click', function(e){
    var a =this.parentNode.parentElement,
      data ={
      commentId : a.getAttribute('id')
    // parent: a.parentNode.parentNode.getAttribute('id')
    };
      $.ajax({
      type:'POST',
      data: JSON.stringify(data),
      contentType:'application/json',
      url:'/comment/delete'
      }).done(function(data){
        if(!data.ok){
          console.log(data)
        }else{
        //  $(location).attr({href: '/'});
        location.reload();
        }
      });
   })
});
//# sourceMappingURL=scripts.js.map
