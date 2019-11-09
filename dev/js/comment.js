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